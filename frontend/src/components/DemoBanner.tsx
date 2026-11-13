import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  return (
    <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-4 mb-6 shadow-sm flex items-start rounded-r">
      <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-semibold">Demonstration Data</p>
        <p className="text-sm mt-1">
          The information displayed is for demonstration purposes only and does not reflect actual experiments or models.
        </p>
      </div>
    </div>
  );
};
