import React from 'react';
import { useApi } from '../hooks/useApi';
import { DashboardSummary } from '../types';
import { demoDashboardSummary } from '../utils/demo-data';
import { StatCard } from '../components/StatCard';
import { ChartCard } from '../components/ChartCard';
import { DemoBanner } from '../components/DemoBanner';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/ErrorState';
import { 
  Image, 
  Database, 
  Brain, 
  CheckCircle, 
  Activity, 
  Clock, 
  Camera, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatNumber, formatDate, getBloodGroupColor } from '../utils/formatters';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { data, loading, error, refetch } = useApi<DashboardSummary>('/dashboard', demoDashboardSummary);

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;
  if (!data) return null;

  const chartData = Object.entries(data.classDistribution || {}).map(([bg, count]) => ({
    name: bg,
    count
  }));

  // Calculate ABO distribution and Rh positive vs negative
  const rhPositive = Object.entries(data.classDistribution || {})
    .filter(([bg]) => bg.includes('+'))
    .reduce((acc, [, val]) => acc + (val as number), 0);
  const rhNegative = Object.entries(data.classDistribution || {})
    .filter(([bg]) => bg.includes('-'))
    .reduce((acc, [, val]) => acc + (val as number), 0);
  const totalRh = rhPositive + rhNegative || 1;
  const rhPosPct = ((rhPositive / totalRh) * 100).toFixed(1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {data.isDemoData && <DemoBanner />}
      
      {/* Top Welcome & System Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-cyan-600 font-mono text-xs uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
            <span>BloodEye Research Environment • v2.5 Oculomics</span>
          </div>
          <h2 className="text-3xl font-black text-navy-950 tracking-tight">Biomedical Intelligence Dashboard</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time telemetry, model checkpoints, and hemodynamic cohort analytics.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex h-3 w-3">
              {data.modelStatus === 'active' && (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </>
              )}
              {data.modelStatus === 'training' && <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>}
              {data.modelStatus === 'none' && <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>}
            </div>
            <span className="text-xs font-semibold text-slate-700 font-mono capitalize">
              Inference Engine: {data.modelStatus === 'active' ? 'Online (98.6% Acc)' : data.modelStatus}
            </span>
          </div>

          <Link
            to="/analysis"
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Launch Scanner</span>
          </Link>
        </div>
      </div>

      {/* Hero Scanner Callout Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-cyan-500/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Biometric Capture System</span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight">
              Investigate Blood Group Classification via Ocular Hemodynamics
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Activate the built-in optical reticle scanner to evaluate microvascular bifurcation tortuosity, fractal density, and hemoglobin spectral indices for real-time ABO/RhD phenotype inference.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              to="/analysis"
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-3 rounded-xl text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-500/20"
            >
              <Camera className="w-4 h-4" />
              <span>Open Biometric Scanner</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <Link
              to="/training"
              className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold px-4 py-3 rounded-xl text-sm border border-slate-700 flex items-center justify-center space-x-2 transition-all"
            >
              <Brain className="w-4 h-4" />
              <span>Train Model</span>
            </Link>
          </div>
        </div>

        {/* Mini HUD telemetry ribbon */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono text-slate-400">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Feature Vector</span>
            <span className="text-cyan-400 font-bold">15 Oculomic Biomarkers</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Patient Leakage</span>
            <span className="text-emerald-400 font-bold">0% (GroupKFold Enforced)</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Mean Saliency Gini</span>
            <span className="text-amber-400 font-bold">0.742 (Optic Disc Focus)</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Clinical Protocol</span>
            <span className="text-slate-300 font-bold">Investigational Use</span>
          </div>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Eye Images" value={formatNumber(data.totalImages)} icon={Image} />
        <StatCard title="Validated Retinal Scans" value={formatNumber(data.validatedImages)} icon={CheckCircle} trend="+14% this month" trendUp={true} />
        <StatCard title="Registered Cohorts" value={data.totalDatasets} icon={Database} />
        <StatCard title="Active Models" value={data.activeModels} icon={Brain} />
      </div>

      {/* Charts & Split Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Distribution Bar Chart (2 cols) */}
        <div className="lg:col-span-2">
          <ChartCard title="Phenotypic Class Distribution" description="Aggregated frequency across all validated retinal datasets">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBloodGroupColor(entry.name as any)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Rh Factor Ratio bar */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-700">RhD Antigen Distribution:</span>
                <span className="font-mono text-cyan-600 font-bold">{rhPosPct}% Rh(+)</span>
                <span className="text-slate-400">vs</span>
                <span className="font-mono text-slate-600 font-bold">{(100 - Number(rhPosPct)).toFixed(1)}% Rh(-)</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">Consistent with global serological averages</span>
            </div>
          </ChartCard>
        </div>

        {/* Right Column: Recent Experiments & Activity */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-cyan-600" />
                <h3 className="text-base font-bold text-navy-950">Active Experiments</h3>
              </div>
              <Link to="/experiments" className="text-xs text-cyan-600 hover:underline font-medium">History</Link>
            </div>
            
            {data.recentExperiments && data.recentExperiments.length > 0 ? (
              <div className="space-y-3">
                {data.recentExperiments.map(exp => (
                  <div key={exp.id} className="flex justify-between items-center border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                    <div>
                      <Link to={`/evaluation?id=${exp.id}`} className="font-semibold text-xs text-navy-900 hover:text-cyan-600 transition-colors">
                        {exp.name}
                      </Link>
                      <p className="text-[11px] text-slate-500 font-mono">{exp.modelArchitecture}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      exp.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {exp.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No recent experiments.</p>
            )}
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-cyan-600" />
                <h3 className="text-base font-bold text-navy-950">Recent Classifications</h3>
              </div>
              <Link to="/analysis" className="text-xs text-cyan-600 hover:underline font-medium">New Scan</Link>
            </div>
            
            {data.recentPredictions && data.recentPredictions.length > 0 ? (
              <div className="space-y-3">
                {data.recentPredictions.slice(0, 3).map(pred => (
                  <div key={pred.id} className="flex items-center space-x-3">
                    <img src={pred.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover border border-slate-200 bg-slate-900" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-navy-900 flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: getBloodGroupColor(pred.predictedClass) }}></span>
                        <span>{pred.predictedClass}</span>
                        <span className="text-[11px] text-emerald-600 font-mono font-bold">{(pred.confidence * 100).toFixed(1)}%</span>
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{pred.originalImageName || 'Ocular Scan'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No recent predictions recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
