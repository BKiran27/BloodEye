import React from 'react';

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, description, children }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col w-full h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        {children}
      </div>
    </div>
  );
};
