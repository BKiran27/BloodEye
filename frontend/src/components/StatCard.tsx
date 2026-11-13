import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendUp }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
        <div className="p-2 bg-navy-50 rounded-lg text-navy-600">
          <Icon className="w-5 h-5 text-cyan-600" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline space-x-2">
        <p className="text-2xl font-bold text-navy-900">{value}</p>
        {trend && (
          <span className={`text-sm font-medium ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};
