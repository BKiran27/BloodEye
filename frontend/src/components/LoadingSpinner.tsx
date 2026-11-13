import React from 'react';

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClass = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  }[size];

  return (
    <div className="flex justify-center items-center p-4">
      <div className={`animate-spin rounded-full border-t-cyan-500 border-navy-100 ${sizeClass}`}></div>
    </div>
  );
};
