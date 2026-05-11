import { useState } from 'react';
import ProgressBar from './ProgressBar';
import ProjectForm from './ProjectForm';
import type { Project } from '../api/projects';

type ProjectFormData = Omit<Project, '_id' | 'loggedHours' | 'status' | 'createdAt' | 'updatedAt'>;

interface ProjectCardProps {
  project: Project;
  onUpdate: (id: string, data: Partial<Project>) => void;
  onDelete: (id: string) => void;
}

const statusColors: Record<Project['status'], string> = {
  'not started': '#95a5a6',
  'in progress': '#3498db',
  'completed': '#2ecc71',
};

const ProjectCard = ({ project, onUpdate, onDelete }: ProjectCardProps) => {
  const [editing, setEditing] = useState(false);
  const [logInput, setLogInput] = useState('');

  const handleLog = () => {
    const hours = parseFloat(logInput);
    if (!hours || hours <= 0) return;
    onUpdate(project._id, {
      loggedHours: project.loggedHours + hours,
      status: 'in progress',
    });
    setLogInput('');
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate(project._id, { status: e.target.value as Project['status'] });
  };

  const handleEdit = (formData: ProjectFormData) => {
    onUpdate(project._id, formData);
    setEditing(false);
  };

  return (
    <div style={cardStyle}>
      {editing ? (
        <>
          <ProjectForm
            existingProject={project}
            onSubmit={handleEdit}
            onCancel={() => setEditing(false)}
          />
        </>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>{project.name}</h3>
            <span style={{ ...badge, background: statusColors[project.status] }}>
              {project.status}
            </span>
          </div>

          {project.description && (
            <p style={{ margin: '6px 0', fontSize: '13px', color: '#666' }}>
              {project.description}
            </p>
          )}

          <ProgressBar
            estimatedHours={project.estimatedHours}
            loggedHours={project.loggedHours}
          />

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
            <input
              type="number"
              placeholder="Log hours"
              value={logInput}
              onChange={(e) => setLogInput(e.target.value)}
              min="0.1"
              step="0.5"
              style={{ ...inputStyle, width: '100px' }}
            />
            <button onClick={handleLog} style={logBtn}>+ Log</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', alignItems: 'center' }}>
            <select value={project.status} onChange={handleStatusChange} style={selectStyle}>
              <option value="not started">Not started</option>
              <option value="in progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
            <div style={{ display: 'flex', gap: '8px' }}>
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
};

const inputStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '13px',
};

const selectStyle: React.CSSProperties = {
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
