import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { DashboardSummary, Experiment } from '../types';
import { demoDashboardSummary } from '../utils/demo-data';
import { DataTable } from '../components/DataTable';
import { DemoBanner } from '../components/DemoBanner';
import { formatDate } from '../utils/formatters';
import { 
  History, 
  Download, 
  Layers, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Sliders, 
  Activity,
  GitCompare,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ALL_EXPERIMENTS: Experiment[] = [
  {
    id: 'exp-002',
    name: 'BloodEye-EfficientNetB0-FrangiFusion-v2.5',
    datasetId: 'ds-001',
    modelArchitecture: 'EfficientNetB0',
    status: 'completed',
    createdAt: '2026-11-13T09:30:00Z',
    completedAt: '2026-11-13T11:45:00Z',
    config: {
      epochs: 30,
      batchSize: 32,
      learningRate: 0.0005,
      imageResolution: 224,
      trainSplit: 80,
      valSplit: 10,
      testSplit: 10,
      seed: 42
    },
    metrics: {
      accuracy: 0.986,
      balancedAccuracy: 0.982,
      precision: 0.984,
      recall: 0.981,
      f1Score: 0.982,
      rocAuc: 0.994,
      confusionMatrix: [],
      history: { epoch: [], loss: [], val_loss: [], accuracy: [], val_accuracy: [] },
      perClassMetrics: {} as any
    }
  },
  {
    id: 'exp-003',
    name: 'BloodEye-ResNet50-DeepResidual-Baseline',
    datasetId: 'ds-001',
    modelArchitecture: 'ResNet50',
    status: 'completed',
    createdAt: '2026-11-12T14:15:00Z',
    completedAt: '2026-11-12T18:20:00Z',
    config: {
      epochs: 40,
      batchSize: 32,
      learningRate: 0.001,
      imageResolution: 224,
      trainSplit: 80,
      valSplit: 10,
      testSplit: 10,
      seed: 1337
    },
    metrics: {
      accuracy: 0.892,
      balancedAccuracy: 0.887,
      precision: 0.890,
      recall: 0.885,
      f1Score: 0.887,
      rocAuc: 0.942,
      confusionMatrix: [],
      history: { epoch: [], loss: [], val_loss: [], accuracy: [], val_accuracy: [] },
      perClassMetrics: {} as any
    }
  },
  {
    id: 'exp-001',
    name: 'BloodEye-CustomCNN-5Layer-Ablation',
    datasetId: 'ds-001',
    modelArchitecture: 'CustomCNN',
    status: 'completed',
    createdAt: '2026-11-10T10:00:00Z',
    completedAt: '2026-11-10T12:00:00Z',
    config: {
      epochs: 25,
      batchSize: 64,
      learningRate: 0.002,
      imageResolution: 128,
      trainSplit: 70,
      valSplit: 15,
      testSplit: 15,
      seed: 101
    },
    metrics: {
      accuracy: 0.684,
      balancedAccuracy: 0.672,
      precision: 0.681,
      recall: 0.675,
      f1Score: 0.678,
      rocAuc: 0.795,
      confusionMatrix: [],
      history: { epoch: [], loss: [], val_loss: [], accuracy: [], val_accuracy: [] },
      perClassMetrics: {} as any
    }
  }
];

export const ExperimentHistory: React.FC = () => {
  const { data } = useApi<DashboardSummary>('/dashboard/summary', demoDashboardSummary);
  const [archFilter, setArchFilter] = useState('ALL');
  const [compareIds, setCompareIds] = useState<[string, string]>(['exp-002', 'exp-003']);

  const experiments = ALL_EXPERIMENTS.filter(
    exp => archFilter === 'ALL' || exp.modelArchitecture === archFilter
  );

  const expA = ALL_EXPERIMENTS.find(e => e.id === compareIds[0]) || ALL_EXPERIMENTS[0];
  const expB = ALL_EXPERIMENTS.find(e => e.id === compareIds[1]) || ALL_EXPERIMENTS[1];

  const handleExportLedgerCSV = () => {
    let csv = "experiment_id,name,architecture,status,top1_accuracy,macro_f1,epochs,learning_rate,created_at\n";
    ALL_EXPERIMENTS.forEach(e => {
      csv += `${e.id},"${e.name}",${e.modelArchitecture},${e.status},${e.metrics?.accuracy},${e.metrics?.f1Score},${e.config.epochs},${e.config.learningRate},${e.createdAt}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bloodeye_experiments_ledger.csv`;
    a.click();
  };

  const cols = [
    { 
      header: 'Experiment Run', 
      accessor: (row: Experiment) => (
        <div>
          <span className="font-bold text-navy-950 block text-xs">{row.name}</span>
          <span className="font-mono text-[11px] text-slate-500">ID: {row.id}</span>
        </div>
      ) 
    },
    { 
      header: 'Backbone', 
      accessor: (row: Experiment) => (
        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-mono font-medium">
          {row.modelArchitecture}
        </span>
      ) 
    },
    { 
      header: 'Top-1 Accuracy', 
      accessor: (row: Experiment) => (
        <span className="font-mono text-xs font-bold text-emerald-600">
          {row.metrics ? `${(row.metrics.accuracy * 100).toFixed(1)}%` : 'N/A'}
        </span>
      ) 
    },
    { 
      header: 'Macro F1', 
      accessor: (row: Experiment) => (
        <span className="font-mono text-xs font-bold text-cyan-700">
          {row.metrics ? (row.metrics.f1Score).toFixed(3) : 'N/A'}
        </span>
      ) 
    },
    { 
      header: 'Status', 
      accessor: (row: Experiment) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
          row.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {row.status}
        </span>
      )
    },
    { 
      header: 'Execution Date', 
      accessor: (row: Experiment) => (
        <span className="text-xs text-slate-500">{formatDate(row.createdAt)}</span>
      ) 
    },
    {
      header: 'Action',
      accessor: (row: Experiment) => (
        <Link 
          to={`/evaluation?id=${row.id}`}
          className="text-cyan-600 hover:text-cyan-800 text-xs font-bold flex items-center space-x-1"
        >
          <span>Evaluate</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {data?.isDemoData && <DemoBanner />}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-cyan-600 font-mono text-xs uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>MLOps Registry • Model Provenance</span>
          </div>
          <h2 className="text-3xl font-black text-navy-950 tracking-tight">Experiment Ledger & Lineage</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit trail of training runs, hyperparameters, convergence logs, and benchmark validations.
          </p>
        </div>

        <button
          onClick={handleExportLedgerCSV}
          className="bg-navy-900 hover:bg-navy-950 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2">
        {['ALL', 'EfficientNetB0', 'ResNet50', 'CustomCNN'].map((filter) => (
          <button
            key={filter}
            onClick={() => setArchFilter(filter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              archFilter === filter
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {filter === 'ALL' ? 'All Backbones' : filter}
          </button>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <DataTable<Experiment> data={experiments} columns={cols} keyExtractor={(item) => item.id} />
      </div>

      {/* Side-by-Side Model Comparator */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <GitCompare className="w-5 h-5 text-cyan-600" />
            <h3 className="text-base font-bold text-navy-950">Differential Model Comparator</h3>
          </div>
          
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-slate-500">Run A:</span>
              <select
                value={compareIds[0]}
                onChange={(e) => setCompareIds([e.target.value, compareIds[1]])}
                className="p-1.5 border border-slate-300 rounded-lg font-mono text-xs font-medium"
              >
                {ALL_EXPERIMENTS.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>

            <span className="text-slate-400 font-bold">vs</span>

            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-slate-500">Run B:</span>
              <select
                value={compareIds[1]}
                onChange={(e) => setCompareIds([compareIds[0], e.target.value])}
                className="p-1.5 border border-slate-300 rounded-lg font-mono text-xs font-medium"
              >
                {ALL_EXPERIMENTS.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Comparison Matrix Table */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <p className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">Parameter / Metric</p>
            <div className="space-y-2 font-medium text-slate-700">
              <p>Backbone Architecture</p>
              <p>Top-1 Accuracy</p>
              <p>Macro F1-Score</p>
              <p>Mean ROC-AUC</p>
              <p>Batch Size</p>
              <p>Learning Rate</p>
              <p>Feature Fusion</p>
            </div>
          </div>

          <div className="bg-cyan-50/50 p-4 rounded-xl border border-cyan-200 space-y-3">
            <p className="font-bold text-cyan-900 uppercase tracking-wider text-[10px] truncate">{expA.name}</p>
            <div className="space-y-2 font-mono text-slate-900">
              <p className="font-bold text-cyan-800">{expA.modelArchitecture}</p>
              <p className="font-bold text-emerald-600">{((expA.metrics?.accuracy || 0) * 100).toFixed(1)}%</p>
              <p>{(expA.metrics?.f1Score || 0).toFixed(3)}</p>
              <p>{(expA.metrics?.rocAuc || 0).toFixed(3)}</p>
              <p>{expA.config.batchSize}</p>
              <p>{expA.config.learningRate}</p>
              <p className="text-emerald-700 font-bold">15-Frangi Hessian</p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px] truncate">{expB.name}</p>
            <div className="space-y-2 font-mono text-slate-900">
              <p className="font-bold text-navy-800">{expB.modelArchitecture}</p>
              <p className="font-bold text-blue-600">{((expB.metrics?.accuracy || 0) * 100).toFixed(1)}%</p>
              <p>{(expB.metrics?.f1Score || 0).toFixed(3)}</p>
              <p>{(expB.metrics?.rocAuc || 0).toFixed(3)}</p>
              <p>{expB.config.batchSize}</p>
              <p>{expB.config.learningRate}</p>
              <p className="text-slate-500">None (Ablation)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
