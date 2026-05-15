import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import type { Project, ProjectFilters } from '../api/projects';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getCategories,
} from '../api/projects';
import ProjectCard from '../components/ProjectCard';
import ProjectForm from '../components/ProjectForm';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    category: '',
    priority: '',
    status: '',
    sortBy: 'createdAt',
    order: 'desc',
    page: 1,
    limit: 6,
  });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProjects(filters);
      setProjects(res.data.projects);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch {
      console.error('Failed to load categories');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchCategories();
  }, [projects]);

  const updateFilter = (key: keyof ProjectFilters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleCreate = async (data: {
    name: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    estimatedMinutes: number;
  }) => {
    try {
      await createProject(data);
      setShowForm(false);
      fetchProjects();
      fetchCategories();
    } catch {
      setError('Failed to create project');
    }
  };

  const handleUpdate = async (id: string, data: Partial<Project>) => {
    try {
      const res = await updateProject(id, data);
      setProjects((prev) => prev.map((p) => (p._id === id ? res.data : p)));
    } catch {
      setError('Failed to update project');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await deleteProject(id);
      fetchProjects();
    } catch {
      setError('Failed to delete project');
    }
  };

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Project Tracker</h1>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
            {total} project{total !== 1 ? 's' : ''} · {user.displayName}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => setShowForm(!showForm)} style={addBtn}>
            {showForm ? 'Cancel' : '+ New Project'}
          </button>
          <button onClick={onLogout} style={logoutBtn}>
            Sign out
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={errorStyle}>
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* New project form */}
      {showForm && (
        <div style={formCard}>
          <h3 style={{ margin: '0 0 12px' }}>New Project</h3>
          <ProjectForm onSubmit={handleCreate} categories={categories} />
        </div>
      )}

      {/* Search + Filters */}
      <div style={filterBar}>
        <input
          placeholder="Search projects..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          style={{ ...filterInput, flex: 2 }}
        />
        <select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)} style={filterInput}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.priority} onChange={(e) => updateFilter('priority', e.target.value)} style={filterInput}>
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)} style={filterInput}>
          <option value="">All statuses</option>
          <option value="not started">Not started</option>
          <option value="in progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={`${filters.sortBy}__${filters.order}`}
          onChange={(e) => {
            const [sortBy, order] = e.target.value.split('__');
            setFilters((prev) => ({ ...prev, sortBy, order, page: 1 }));
          }}
          style={filterInput}
        >
          <option value="createdAt__desc">Newest first</option>
          <option value="createdAt__asc">Oldest first</option>
          <option value="name__asc">Name A-Z</option>
          <option value="name__desc">Name Z-A</option>
          <option value="priority__desc">Priority high-low</option>
          <option value="priority__asc">Priority low-high</option>
          <option value="estimatedMinutes__desc">Longest first</option>
          <option value="estimatedMinutes__asc">Shortest first</option>
        </select>
      </div>

      {/* Projects grid */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>Loading...</p>
      ) : projects.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999', marginTop: '60px' }}>
          No projects found.
        </p>
      ) : (
        <div style={gridStyle}>
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              categories={categories}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={paginationStyle}>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, page: Number(prev.page) - 1 }))}
            disabled={filters.page === 1}
            style={pageBtn}
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setFilters((prev) => ({ ...prev, page: p }))}
              style={{ ...pageBtn, background: filters.page === p ? '#4f46e5' : '#f0f0f0', color: filters.page === p ? '#fff' : '#333' }}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setFilters((prev) => ({ ...prev, page: Number(prev.page) + 1 }))}
            disabled={filters.page === totalPages}
            style={pageBtn}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

const pageStyle: React.CSSProperties = {
  maxWidth: '960px',
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
  fontWeight: 500,
};

const formCard: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e0e0e0',
  borderRadius: '10px',
  padding: '20px',
  marginBottom: '24px',
};

const filterBar: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  marginBottom: '20px',
  flexWrap: 'wrap',
};

const filterInput: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '13px',
  background: '#fff',
  flex: 1,
  minWidth: '140px',
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

const paginationStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: '8px',
  marginTop: '32px',
  flexWrap: 'wrap',
};

const pageBtn: React.CSSProperties = {
  padding: '8px 14px',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
  background: '#f0f0f0',
  color: '#333',
};


const logoutBtn: React.CSSProperties = {
  padding: '10px 16px',
  background: '#f0f0f0',
  color: '#333',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
};

export default Dashboard;