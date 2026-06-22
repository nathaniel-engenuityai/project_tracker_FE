import axios from 'axios';
import { auth } from '../firebase';

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
  deadline?: string;
}

export interface Subtask {
  _id: string;
  projectId: string;
  userId: string;
  name: string;
  estimatedMinutes: number;
  loggedMinutes: number;
  status: 'not started' | 'in progress' | 'completed';
  order: number;
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

export const uploadAvatar = async (file: File): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const token = await user.getIdToken();
  const formData = new FormData();
  formData.append('avatar', file);
  // Send the userId so the backend can scope the file to users/<uid>/avatar.*
  formData.append('userId', user.uid);

  let res: Response;
  try {
    res = await fetch(
      'https://project-tracker-backend-889275799849.us-central1.run.app/api/upload/avatar',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );
  } catch {
    throw new Error('Network error. Please check your connection.');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Upload failed (${res.status})`);
  }
  if (!data.url) {
    throw new Error('No URL returned from server');
  }
  return data.url;
};

const api = axios.create({
  baseURL: 'https://project-tracker-backend-889275799849.us-central1.run.app/api',
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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

/* Subtasks */
export const getSubtasks = (projectId: string) =>
  api.get<Subtask[]>(`/projects/${projectId}/subtasks`);
export const createSubtask = (projectId: string, data: { name: string; estimatedMinutes: number }) =>
  api.post<Subtask>(`/projects/${projectId}/subtasks`, data);
export const updateSubtask = (projectId: string, subtaskId: string, data: Partial<Subtask>) =>
  api.put<Subtask>(`/projects/${projectId}/subtasks/${subtaskId}`, data);
export const deleteSubtask = (projectId: string, subtaskId: string) =>
  api.delete(`/projects/${projectId}/subtasks/${subtaskId}`);
export const reorderSubtasks = (projectId: string, orderedIds: string[]) =>
  api.put(`/projects/${projectId}/subtasks/reorder`, { orderedIds });
export const reorderProjects = (orderedIds: string[]) =>
  api.put('/projects/reorder', { orderedIds });