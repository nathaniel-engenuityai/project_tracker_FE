import { useState, useEffect } from 'react';
import type { Project } from '../api/projects';
import { toMinutes } from '../utils/time';

interface Props {
  onSubmit: (data: {
    name: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    estimatedMinutes: number;
  }) => void;
  existingProject?: Project;
  onCancel?: () => void;
  categories: string[];
}

const ProjectForm = ({ onSubmit, existingProject, onCancel, categories }: Props) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    newCategory: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    timeValue: '',
    timeUnit: 'hours' as 'hours' | 'minutes',
  });

  useEffect(() => {
    if (existingProject) {
      const isHours = existingProject.estimatedMinutes % 60 === 0;
      setForm({
        name: existingProject.name,
        description: existingProject.description || '',
        category: existingProject.category || '',
        newCategory: '',
        priority: existingProject.priority,
        timeValue: isHours
          ? String(existingProject.estimatedMinutes / 60)
          : String(existingProject.estimatedMinutes),
        timeUnit: isHours ? 'hours' : 'minutes',
      });
    }
  }, [existingProject]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = form.category === '__new__' ? form.newCategory.trim() : form.category;
    onSubmit({
      name: form.name,
      description: form.description,
      category: finalCategory,
      priority: form.priority,
      estimatedMinutes: toMinutes(Number(form.timeValue), form.timeUnit),
    });
    setForm({ name: '', description: '', category: '', newCategory: '', priority: 'medium', timeValue: '', timeUnit: 'hours' });
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

      <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
        <option value="">No category</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
        <option value="__new__">+ New category</option>
      </select>

      {form.category === '__new__' && (
        <input
          name="newCategory"
          placeholder="Category name"
          value={form.newCategory}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      )}

      <select name="priority" value={form.priority} onChange={handleChange} style={inputStyle}>
        <option value="low">Low priority</option>
        <option value="medium">Medium priority</option>
        <option value="high">High priority</option>
      </select>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          name="timeValue"
          type="number"
          placeholder={`Estimated ${form.timeUnit}`}
          value={form.timeValue}
          onChange={handleChange}
          required
          min="1"
          step={form.timeUnit === 'hours' ? '0.5' : '1'}
          style={{ ...inputStyle, flex: 1 }}
        />
        <select name="timeUnit" value={form.timeUnit} onChange={handleChange} style={{ ...inputStyle, width: '110px' }}>
          <option value="hours">Hours</option>
          <option value="minutes">Minutes</option>
        </select>
      </div>

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
  width: '100%',
  boxSizing: 'border-box',
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