import React from 'react';
import { Info } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-slate-800 text-white p-3 text-center text-sm flex items-center justify-center space-x-2">
      <Info className="w-4 h-4 text-cyan-400" />
      <span>
        <strong>Research Disclaimer:</strong> BloodEye is an experimental research application. Predictions are not clinically validated and must not be used for medical decisions.
      </span>
    </div>
  );
};
