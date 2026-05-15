import { useState } from 'react';
import type { Project } from '../api/projects';
import { toMinutes } from '../utils/time';
import ProgressBar from './ProgressBar';
import ProjectForm from './ProjectForm';

interface Props {
  project: Project;
  onUpdate: (id: string, data: Partial<Project>) => void;
  onDelete: (id: string) => void;
  categories: string[];
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

const ProjectCard = ({ project, onUpdate, onDelete, categories }: Props) => {
  const [editing, setEditing] = useState(false);
  const [logInput, setLogInput] = useState('');
  const [logUnit, setLogUnit] = useState<'hours' | 'minutes'>('minutes');

  const handleLog = () => {
    const value = parseFloat(logInput);
    if (!value || value <= 0) return;
    const minutesToAdd = toMinutes(value, logUnit);
    onUpdate(project._id, {
      loggedMinutes: project.loggedMinutes + minutesToAdd,
      status: 'in progress',
    });
    setLogInput('');
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
  }) => {
    onUpdate(project._id, formData);
    setEditing(false);
  };

  const priority = priorityColors[project.priority];

  return (
    <div style={cardStyle}>
      {editing ? (
        <ProjectForm
          existingProject={project}
          onSubmit={handleEdit}
          onCancel={() => setEditing(false)}
          categories={categories}
        />
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', flex: 1 }}>{project.name}</h3>
            <span style={{ ...badge, background: statusColors[project.status] }}>
              {project.status}
            </span>
          </div>

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

          {project.description && (
            <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#666' }}>
              {project.description}
            </p>
          )}

          <ProgressBar
            estimatedMinutes={project.estimatedMinutes}
            loggedMinutes={project.loggedMinutes}
          />

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
            <button onClick={handleLog} style={logBtn}>+ Log</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', alignItems: 'center' }}>
            <select value={project.status} onChange={handleStatusChange} style={inputStyle}>
              <option value="not started">Not started</option>
              <option value="in progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
            <div style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
              <button onClick={() => setEditing(true)} style={editBtn}>Edit</button>
              <button onClick={() => onDelete(project._id)} style={deleteBtn}>Delete</button>
            </div>
          </div>
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
  padding: '6px 12px',
  background: '#4f46e5',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
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