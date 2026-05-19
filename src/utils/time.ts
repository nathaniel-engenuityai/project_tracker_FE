export const formatMinutes = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const toMinutes = (value: number, unit: 'hours' | 'minutes'): number => {
  return unit === 'hours' ? Math.round(value * 60) : Math.round(value);
};

export const fromMinutes = (minutes: number, unit: 'hours' | 'minutes'): number => {
  return unit === 'hours' ? Math.round((minutes / 60) * 10) / 10 : minutes;
};

export const formatTimer = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
};

export const getDeadlineInfo = (deadline?: string): {
  label: string;
  borderColor: string;
} => {
  if (!deadline) return { label: '', borderColor: '#e0e0e0' };

  const now = new Date();
  const due = new Date(deadline);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: 'Overdue', borderColor: '#e74c3c' };
  if (diffDays === 0) return { label: 'Due today', borderColor: '#e74c3c' };
  if (diffDays <= 3) return { label: `${diffDays}d left`, borderColor: '#e67e22' };
  return { label: `${diffDays}d left`, borderColor: '#2ecc71' };
};