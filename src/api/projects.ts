import axios from 'axios';

export interface Project {
    _id: string;
    name: string;
    description?: string;
    estimatedHours: number;
    loggedHours: number;
    status: 'not started' | 'in progress' | 'completed';
    createdAt: string;
    updatedAt: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://project-tracker-backend-889275799849.us-central1.run.app/api',
});

export const getProjects = () => api.get<Project[]>('/projects');
export const getProject = (id: string) => api.get<Project>(`/projects/${id}`);
export const createProject = (data: Omit<Project, '_id' | 'loggedHours' | 'status' | 'createdAt' | 'updatedAt'>) =>
    api.post<Project>('/projects', data);
export const updateProject = (id: string, data: Partial<Project>) =>
    api.put<Project>(`/projects/${id}`, data);
export const deleteProject = (id: string) => api.delete(`/projects/${id}`);