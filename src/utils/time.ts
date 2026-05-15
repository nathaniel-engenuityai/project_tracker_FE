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