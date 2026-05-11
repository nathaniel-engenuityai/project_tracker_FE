import { useState, useEffect } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../api/projects';
import type { Project } from '../api/projects';
import ProjectCard from '../components/ProjectCard';
import ProjectForm from '../components/ProjectForm';

type ProjectFormData = Omit<Project, '_id' | 'loggedHours' | 'status' | 'createdAt' | 'updatedAt'>;

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const res = await getProjects();
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (data: ProjectFormData) => {
    try {
      const res = await createProject(data);
      setProjects([res.data, ...projects]);
      setShowForm(false);
    } catch {
      setError('Failed to create project');
    }
  };

  const handleUpdate = async (id: string, data: Partial<Project>) => {
    try {
      const res = await updateProject(id, data);
      setProjects(projects.map((p) => (p._id === id ? res.data : p)));
    } catch {
      setError('Failed to update project');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await deleteProject(id);
      setProjects(projects.filter((p) => p._id !== id));
    } catch {
      setError('Failed to delete project');
    }
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Project Tracker</h1>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={addBtn}>
          {showForm ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {error && (
        <div style={errorStyle}>
          {error}
          <button
            onClick={() => setError(null)}
            style={{ marginLeft: '12px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {showForm && (
        <div style={formCard}>
          <h3 style={{ margin: '0 0 12px' }}>New Project</h3>
          <ProjectForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: '#999' }}>Loading...</p>
      ) : projects.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999', marginTop: '60px' }}>
          No projects yet. Add one above!
        </p>
      ) : (
        <div style={gridStyle}>
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const pageStyle: React.CSSProperties = {
  maxWidth: '900px',
  margin: '0 auto',
  padding: '32px 20px',
  fontFamily: 'system-ui, sans-serif',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
};

const addBtn: React.CSSProperties = {
  padding: '10px 18px',
  background: '#4f46e5',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
};

const formCard: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e0e0e0',
  borderRadius: '10px',
  padding: '20px',
  marginBottom: '24px',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '16px',
};

const errorStyle: React.CSSProperties = {
  background: '#fdecea',
  color: '#e74c3c',
  padding: '10px 16px',
  borderRadius: '8px',
  marginBottom: '16px',
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
};

export default Dashboard;
