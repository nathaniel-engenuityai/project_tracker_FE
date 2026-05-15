import axios from 'axios';

export interface Project {
  _id: string;
  name: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  estimatedMinutes: number;
  loggedMinutes: number;
  status: 'not started' | 'in progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsResponse {
  projects: Project[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ProjectFilters {
  search?: string;
  category?: string;
  priority?: string;
  status?: string;
  sortBy?: string;
  order?: string;
  page?: number;
  limit?: number;
}

const api = axios.create({
  baseURL: 'https://project-tracker-backend-889275799849.us-central1.run.app/api',
});

export const getProjects = (filters: ProjectFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  return api.get<ProjectsResponse>(`/projects?${params.toString()}`);
};

export const getProject = (id: string) => api.get<Project>(`/projects/${id}`);

export const createProject = (data: Omit<Project, '_id' | 'loggedMinutes' | 'status' | 'createdAt' | 'updatedAt'>) =>
  api.post<Project>('/projects', data);

export const updateProject = (id: string, data: Partial<Project>) =>
  api.put<Project>(`/projects/${id}`, data);

export const deleteProject = (id: string) => api.delete(`/projects/${id}`);

export const getCategories = () => api.get<string[]>('/projects/categories');