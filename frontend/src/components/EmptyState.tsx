import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-300 rounded-xl bg-slate-50 w-full h-full">
      <div className="bg-white p-4 rounded-full shadow-sm mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-navy-900 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-md mb-6">{description}</p>
      {action && (
        <button 
          onClick={action.onClick}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
