// Date utility functions

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('pl-PL', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString('pl-PL', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const isToday = (date: string | Date): boolean => {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
};

export const isYesterday = (date: string | Date): boolean => {
  const d = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.toDateString() === yesterday.toDateString();
};

export const isTomorrow = (date: string | Date): boolean => {
  const d = new Date(date);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return d.toDateString() === tomorrow.toDateString();
};

export const getRelativeDate = (date: string | Date): string => {
  if (isToday(date)) return 'Dzisiaj';
  if (isYesterday(date)) return 'Wczoraj';
  if (isTomorrow(date)) return 'Jutro';
  return formatDate(date);
};

export const getDayOfWeek = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('pl-PL', { weekday: 'short' });
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const subtractDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};