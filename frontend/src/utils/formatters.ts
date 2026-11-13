import { BloodGroup } from '../types';

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatPercent = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getBloodGroupColor = (bg: BloodGroup): string => {
  const colors: Record<BloodGroup, string> = {
    'A+': '#ef4444', // red-500
    'A-': '#f87171', // red-400
    'B+': '#3b82f6', // blue-500
    'B-': '#60a5fa', // blue-400
    'AB+': '#8b5cf6', // violet-500
    'AB-': '#a78bfa', // violet-400
    'O+': '#10b981', // emerald-500
    'O-': '#34d399', // emerald-400
  };
  return colors[bg] || '#94a3b8';
};
