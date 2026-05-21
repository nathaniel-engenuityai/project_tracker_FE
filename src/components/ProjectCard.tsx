import { useState } from 'react';
import type { Project, Subtask } from '../api/projects';
import { getSubtasks } from '../api/projects';
import { getDeadlineInfo, toMinutes } from '../utils/time';
import ProgressBar from './ProgressBar';
import ProjectForm from './ProjectForm';
import SubtaskList from './SubtaskList';

interface Props {
  project: Project;
  onUpdate: (id: string, data: Partial<Project>) => void;
  onDelete: (id: string) => void;
  categories: string[];
  activeSubtaskId: string | null;
  subtaskElapsed: Record<string, number>;
  onTimerStart: (subtaskId: string) => void;
  onTimerStop: () => void;
  isDragging?: boolean;
  isDropTarget?: boolean;
}

const statusColors: Record<Project['status'], string> = {
  'not started': '#95a5a6',
  'in progress': '#3498db',
  completed: '#2ecc71',
};

const priorityColors: Record<Project['priority'], { bg: string; color: string }> = {
  low: { bg: '#e8f5e9', color: '#2e7d32' },
  medium: { bg: '#fff8e1', color: '#f57f17' },
  high: { bg: '#fdecea', color: '#c62828' },
};

const ProjectCard = ({
  project,
  onUpdate,
  onDelete,
  categories,
  activeSubtaskId,
  subtaskElapsed,
  onTimerStart,
  onTimerStop,
  isDragging = false,
  isDropTarget = false,
}: Props) => {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loadingSubtasks, setLoadingSubtasks] = useState(false);

  // Manual log state (shown when subtasks not expanded)
  const [logInput, setLogInput] = useState('');
  const [logUnit, setLogUnit] = useState<'hours' | 'minutes'>('minutes');

  const handleExpand = async () => {
    if (!expanded && subtasks.length === 0) {
      setLoadingSubtasks(true);
      try {
        const res = await getSubtasks(project._id);
        setSubtasks(res.data);
      } catch {
        console.error('Failed to load subtasks');
      } finally {
        setLoadingSubtasks(false);
      }
    }
    setExpanded(!expanded);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate(project._id, { status: e.target.value as Project['status'] });
  };

  const handleEdit = (formData: {
    name: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    estimatedMinutes: number;
    deadline?: string;
  }) => {
    onUpdate(project._id, formData);
    setEditing(false);
  };

  // Log time manually to project
  const handleManualLog = () => {
    const value = parseFloat(logInput);
    if (!value || value <= 0) return;
    const minutes = toMinutes(value, logUnit);
    onUpdate(project._id, {
      loggedMinutes: project.loggedMinutes + minutes,
      status: 'in progress',
    });
    setLogInput('');
  };

  // When subtask timer stops, log those minutes to the project
  const handleSubtaskTimeLog = (minutes: number) => {
    onUpdate(project._id, {
      loggedMinutes: project.loggedMinutes + minutes,
      status: 'in progress',
    });
  };

  const priority = priorityColors[project.priority];
  const { label: deadlineLabel, borderColor } = getDeadlineInfo(project.deadline);

  return (
    <div
      style={{
        ...cardStyle,
        borderColor: project.deadline ? borderColor : isDropTarget ? '#4f46e5' : '#e0e0e0',
        borderWidth: project.deadline || isDropTarget ? '2px' : '1px',
        borderStyle: isDropTarget ? 'dashed' : 'solid',
        opacity: isDragging ? 0.45 : 1,
        boxShadow: isDragging
          ? '0 8px 32px rgba(79,70,229,0.18)'
          : isDropTarget
          ? '0 0 0 3px rgba(79,70,229,0.15)'
          : '0 1px 4px rgba(0,0,0,0.06)',
        transform: isDragging ? 'scale(0.97) rotate(-1deg)' : 'scale(1) rotate(0deg)',
        transition: 'opacity 0.15s, box-shadow 0.15s, transform 0.15s, border-color 0.15s',
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      {editing ? (
        <ProjectForm
          existingProject={project}
          onSubmit={handleEdit}
          onCancel={() => setEditing(false)}
          categories={categories}
        />
      ) : (
        <>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
              <span style={dragHandle} title="Drag to reorder">⠿</span>
              <h3 style={{ margin: 0, fontSize: '16px' }}>{project.name}</h3>
            </div>
            <span style={{ ...badge, background: statusColors[project.status] }}>
              {project.status}
            </span>
          </div>

          {/* Pills */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
            <span style={{ ...pill, background: priority.bg, color: priority.color }}>
              {project.priority} priority
            </span>
            {project.category && (
              <span style={{ ...pill, background: '#f0f0f0', color: '#555' }}>
                {project.category}
              </span>
            )}
          </div>

          {/* Deadline */}
          {project.deadline && (
            <p style={{ margin: '6px 0 0', fontSize: '12px', color: borderColor, fontWeight: 500 }}>
              📅 {deadlineLabel} · {new Date(project.deadline).toLocaleDateString()}
            </p>
          )}

          {/* Description */}
          {project.description && (
            <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#666' }}>
              {project.description}
            </p>
          )}

          {/* Progress — always uses project's own time */}
          <ProgressBar
            estimatedMinutes={project.estimatedMinutes}
            loggedMinutes={project.loggedMinutes}
          />

          {/* Log time — shown when subtasks not expanded */}
          {!expanded && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Log time"
                value={logInput}
                onChange={(e) => setLogInput(e.target.value)}
                min="1"
                step="1"
                style={{ ...inputStyle, width: '90px' }}
              />
              <select
                value={logUnit}
                onChange={(e) => setLogUnit(e.target.value as 'hours' | 'minutes')}
                style={{ ...inputStyle, width: '100px' }}
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
              </select>
              <button onClick={handleManualLog} style={logBtn}>+ Log</button>
            </div>
          )}

          {/* Status + Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', alignItems: 'center' }}>
            <select value={project.status} onChange={handleStatusChange} style={inputStyle}>
              <option value="not started">Not started</option>
              <option value="in progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
            <div style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
              <button onClick={handleExpand} style={expandBtn}>
                {expanded ? '▲ Hide' : '▼ Subtasks'}
                {subtasks.length > 0 && ` (${subtasks.length})`}
              </button>
              <button onClick={() => setEditing(true)} style={editBtn}>Edit</button>
              <button onClick={() => onDelete(project._id)} style={deleteBtn}>✕</button>
            </div>
          </div>

          {/* Subtasks */}
          {expanded && (
            loadingSubtasks ? (
              <p style={{ fontSize: '13px', color: '#999', marginTop: '8px' }}>Loading...</p>
            ) : (
              <SubtaskList
                projectId={project._id}
                subtasks={subtasks}
                onSubtasksChange={setSubtasks}
                onProjectTimeLog={handleSubtaskTimeLog}
                activeSubtaskId={activeSubtaskId}
                subtaskElapsed={subtaskElapsed}
                onTimerStart={onTimerStart}
                onTimerStop={onTimerStop}
              />
            )
          )}
        </>
      )}
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e0e0e0',
  borderRadius: '12px',
  padding: '16px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
};

const dragHandle: React.CSSProperties = {
  color: '#ccc',
  fontSize: '18px',
  cursor: 'grab',
  userSelect: 'none',
  flexShrink: 0,
};

const badge: React.CSSProperties = {
  fontSize: '11px',
  color: '#fff',
  padding: '3px 8px',
  borderRadius: '999px',
  textTransform: 'capitalize',
  whiteSpace: 'nowrap',
};

const pill: React.CSSProperties = {
  fontSize: '11px',
  padding: '2px 8px',
  borderRadius: '999px',
  textTransform: 'capitalize',
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '13px',
  background: '#fff',
};

const logBtn: React.CSSProperties = {
  padding: '6px 14px',
  background: '#4f46e5',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 500,
};

const expandBtn: React.CSSProperties = {
  padding: '6px 12px',
  background: '#f5f5f5',
  color: '#555',
  border: '1px solid #e0e0e0',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
  whiteSpace: 'nowrap',
};

const editBtn: React.CSSProperties = {
  padding: '6px 12px',
  background: '#f0f0f0',
  color: '#333',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
};

const deleteBtn: React.CSSProperties = {
  padding: '6px 10px',
  background: '#fdecea',
  color: '#e74c3c',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
};

export default ProjectCard;