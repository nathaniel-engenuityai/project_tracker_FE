import { useState } from 'react';
import type { Project, Subtask } from '../api/projects';
import { getSubtasks } from '../api/projects';
import { getDeadlineInfo } from '../utils/time';
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
  dragHandleProps?: React.HTMLAttributes<HTMLSpanElement>;
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
  dragHandleProps,
}: Props) => {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loadingSubtasks, setLoadingSubtasks] = useState(false);

  const totalEstimated = subtasks.reduce((sum, s) => sum + s.estimatedMinutes, 0);
  const totalLogged = subtasks.reduce((sum, s) => sum + s.loggedMinutes, 0);

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

  const priority = priorityColors[project.priority];
  const { label: deadlineLabel, borderColor } = getDeadlineInfo(project.deadline);

  return (
    <div
      style={{
        ...cardStyle,
        borderColor: project.deadline ? borderColor : '#e0e0e0',
        borderWidth: project.deadline ? '2px' : '1px',
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
              <span {...dragHandleProps} style={dragHandle} title="Drag to reorder">⠿</span>
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

          {/* Progress — based on subtasks if any exist */}
          <ProgressBar
            estimatedMinutes={totalEstimated || project.estimatedMinutes}
            loggedMinutes={totalLogged || project.loggedMinutes}
          />

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
              <button onClick={() => onDelete(project._id)} style={deleteBtn}>Delete</button>
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
  borderRadius: '10px',
  padding: '16px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
};

const dragHandle: React.CSSProperties = {
  color: '#ccc',
  fontSize: '18px',
  cursor: 'grab',
  userSelect: 'none',
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

const expandBtn: React.CSSProperties = {
  padding: '6px 12px',
  background: '#f5f5f5',
  color: '#555',
  border: '1px solid #e0e0e0',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
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
  padding: '6px 12px',
  background: '#fdecea',
  color: '#e74c3c',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
};

export default ProjectCard;