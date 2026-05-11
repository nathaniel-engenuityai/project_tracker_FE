import { useState, useEffect } from 'react';
import type { Project } from '../api/projects';

type ProjectFormData = Omit<Project, '_id' | 'loggedHours' | 'status' | 'createdAt' | 'updatedAt'>;

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => void;
  existingProject?: Project | null;
  onCancel?: () => void;
}

const ProjectForm = ({ onSubmit, existingProject, onCancel }: ProjectFormProps) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    estimatedHours: '',
  });

  useEffect(() => {
    if (existingProject) {
      setForm({
        name: existingProject.name,
        description: existingProject.description || '',
        estimatedHours: String(existingProject.estimatedHours),
      });
    }
  }, [existingProject]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ ...form, estimatedHours: Number(form.estimatedHours) });
    setForm({ name: '', description: '', estimatedHours: '' });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <input
        name="name"
        placeholder="Project name"
        value={form.name}
        onChange={handleChange}
        required
        style={inputStyle}
      />
      <input
        name="description"
        placeholder="Description (optional)"
        value={form.description}
        onChange={handleChange}
        style={inputStyle}
      />
      <input
        name="estimatedHours"
        type="number"
        placeholder="Estimated hours"
        value={form.estimatedHours}
        onChange={handleChange}
        required
        min="0.5"
        step="0.5"
        style={inputStyle}
      />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="submit" style={primaryBtn}>
          {existingProject ? 'Update' : 'Add Project'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={secondaryBtn}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '14px',
};

const primaryBtn: React.CSSProperties = {
  padding: '8px 16px',
  background: '#4f46e5',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
};

const secondaryBtn: React.CSSProperties = {
  padding: '8px 16px',
  background: '#e0e0e0',
  color: '#333',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
};

export default ProjectForm;
