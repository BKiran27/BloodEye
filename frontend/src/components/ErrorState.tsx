import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-rose-50 border border-rose-200 rounded-xl">
      <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
      <h3 className="text-rose-900 font-semibold mb-1">Error Loading Data</h3>
      <p className="text-rose-700 text-sm mb-4 text-center">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
