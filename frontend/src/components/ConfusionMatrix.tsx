import React from 'react';
import { BloodGroup } from '../types';

interface ConfusionMatrixProps {
  matrix: number[][];
  classes: BloodGroup[];
}

export const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({ matrix, classes }) => {
  // Find max value for color scaling
  const maxVal = Math.max(...matrix.flat());

  const getColor = (val: number, isDiagonal: boolean) => {
    if (val === 0) return 'bg-slate-50';
    const intensity = val / maxVal;
    if (isDiagonal) {
      // Greens for correct predictions
      if (intensity > 0.8) return 'bg-emerald-600 text-white';
      if (intensity > 0.5) return 'bg-emerald-400 text-white';
      if (intensity > 0.2) return 'bg-emerald-200';
      return 'bg-emerald-100';
    } else {
      // Reds for errors
      if (intensity > 0.8) return 'bg-rose-600 text-white';
      if (intensity > 0.5) return 'bg-rose-400 text-white';
      if (intensity > 0.2) return 'bg-rose-200';
      return 'bg-rose-100';
    }
  };

  return (
    <div className="overflow-x-auto w-full">
      <div className="flex min-w-max">
        <div className="flex flex-col pt-8 pr-2 justify-center">
          <div className="text-xs font-semibold text-slate-500 -rotate-90 whitespace-nowrap mb-8 text-center h-full w-4">
            True Label
          </div>
        </div>
        <div className="flex flex-col flex-1">
          <div className="text-xs font-semibold text-slate-500 text-center pb-2">
            Predicted Label
          </div>
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="p-2 border border-slate-200 bg-slate-50 text-xs font-medium text-slate-500 w-12 h-12"></th>
                {classes.map((cls, i) => (
                  <th key={i} className="p-2 border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 w-12 h-12 text-center">
                    {cls}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={i}>
                  <td className="p-2 border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 font-bold text-center w-12 h-12">
                    {classes[i]}
                  </td>
                  {row.map((val, j) => {
                    const isDiagonal = i === j;
                    return (
                      <td 
                        key={`${i}-${j}`} 
                        className={`p-2 border border-slate-200 text-xs text-center w-12 h-12 transition-colors hover:opacity-80 cursor-default ${getColor(val, isDiagonal)}`}
                        title={`True: ${classes[i]}, Pred: ${classes[j]}, Count: ${val}`}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
