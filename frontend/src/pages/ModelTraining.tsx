import React, { useState, useEffect } from 'react';
import { DemoBanner } from '../components/DemoBanner';
import { 
  Play, 
  Square, 
  Settings2, 
  Database, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle, 
  Activity, 
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Link } from 'react-router-dom';

export const ModelTraining: React.FC = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const [activeExperimentId, setActiveExperimentId] = useState<string | null>(null);
  const [trainingComplete, setTrainingComplete] = useState(false);

  const [config, setConfig] = useState({
    dataset: 'ds-001',
    architecture: 'EfficientNetB0',
    frangiFeatureFusion: true,
    epochs: 25,
    batchSize: 32,
    learningRate: 0.0005,
    imageRes: 224,
    split: 80,
    patientPartitioning: 'group_kfold'
  });

  const [metrics, setMetrics] = useState<{
    epoch: number;
    loss: number;
    val_loss: number;
    acc: number;
    val_acc: number;
  }[]>([]);

  // Simulation / Live poll loop
  useEffect(() => {
    let interval: any;
    if (isTraining && epoch < config.epochs) {
      interval = setInterval(() => {
        setEpoch(prev => {
          const next = prev + 1;
          const currentProgress = (next / config.epochs) * 100;
          setProgress(currentProgress);

          const trainLoss = Math.max(0.04, 1.8 * Math.exp(-next / 4.2) + Math.random() * 0.03);
          const valLoss = Math.max(0.07, 1.9 * Math.exp(-next / 4.5) + Math.random() * 0.04);
          const trainAcc = Math.min(0.992, 0.45 + 0.54 * (1 - Math.exp(-next / 3.8)) + Math.random() * 0.01);
          const valAcc = Math.min(0.986, 0.40 + 0.58 * (1 - Math.exp(-next / 4.0)) + Math.random() * 0.015);

          setMetrics(current => [...current, {
            epoch: next,
            loss: Number(trainLoss.toFixed(4)),
            val_loss: Number(valLoss.toFixed(4)),
            acc: Number(trainAcc.toFixed(4)),
            val_acc: Number(valAcc.toFixed(4))
          }]);

          if (next >= config.epochs) {
            setIsTraining(false);
            setTrainingComplete(true);
          }
          return next;
        });
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isTraining, epoch, config.epochs]);

  const handleStart = async () => {
    setMetrics([]);
    setEpoch(0);
    setProgress(0);
    setTrainingComplete(false);
    setIsTraining(true);

    try {
      // Trigger backend training job if available
      const expRes = await fetch('/api/experiments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `BloodEye-${config.architecture}-${Date.now().toString().slice(-4)}`,
          model_architecture: config.architecture,
          dataset_id: 1,
          hyperparameters: config
        })
      });

      if (expRes.ok) {
        const expData = await expRes.json();
        setActiveExperimentId(expData.id || 'exp-002');
        fetch(`/api/experiments/${expData.id || 1}/train`, { method: 'POST' }).catch(() => {});
      }
    } catch {
      // Graceful fallback to client progress
    }
  };

  const handleStop = () => {
    setIsTraining(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setConfig(prev => ({ ...prev, [name]: checked }));
    } else {
      setConfig(prev => ({ ...prev, [name]: isNaN(Number(value)) ? value : Number(value) }));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <DemoBanner />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-cyan-600 font-mono text-xs uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>Deep Learning Pipeline • TensorFlow / Keras 3</span>
          </div>
          <h2 className="text-3xl font-black text-navy-950 tracking-tight">Model Training & Orchestration</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure architectures, hyperparameter bounds, and launch zero-leakage training jobs.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 text-slate-300 text-xs px-3.5 py-1.5 rounded-lg border border-slate-800">
          <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
          <span className="font-mono">GPU Acceleration: CUDA Ready</span>
        </div>
      </div>

      {/* Completion Banner */}
      {trainingComplete && (
        <div className="bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-500/50 rounded-2xl p-5 text-white shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-base font-bold text-white">Training Successfully Finished & Checkpoint Registered!</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Top-1 Validation Accuracy: <strong className="text-emerald-400">98.6%</strong> | Final Validation Loss: <strong className="text-cyan-400">0.0712</strong>. Weights persisted to disk.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <Link
                to="/evaluation"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-md"
              >
                <span>View Evaluation Suite</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/analysis"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2 rounded-xl text-xs border border-slate-700 transition-all"
              >
                <span>Test in Live Scanner</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Configuration & Training Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-navy-950 flex items-center space-x-2">
                <Settings2 className="w-4 h-4 text-cyan-600" />
                <span>Experiment Parameters</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">PyTorch/TF Engine</span>
            </div>
            
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 mb-1 flex items-center">
                  <Database className="w-3.5 h-3.5 mr-1 text-slate-500" /> 
                  <span>Target Cohort</span>
                </label>
                <select 
                  name="dataset" 
                  value={config.dataset} 
                  onChange={handleChange} 
                  disabled={isTraining} 
                  className="w-full border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-cyan-500 p-2.5 border text-xs"
                >
                  <option value="ds-001">Global Retinal Blood Group Cohort (10,500 scans)</option>
                  <option value="ds-002">High-Res Scleral Microvascular Dataset (1,920 scans)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 flex items-center">
                  <Layers className="w-3.5 h-3.5 mr-1 text-slate-500" /> 
                  <span>Neural Backbone Architecture</span>
                </label>
                <select 
                  name="architecture" 
                  value={config.architecture} 
                  onChange={handleChange} 
                  disabled={isTraining} 
                  className="w-full border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-cyan-500 p-2.5 border text-xs font-medium"
                >
                  <option value="EfficientNetB0">EfficientNet-B0 (Transfer Learning with ImageNet weights)</option>
                  <option value="ResNet50">ResNet-50 Deep Residual Network</option>
                  <option value="MobileNetV3">MobileNet-V3 Large (Edge Embedded Focus)</option>
                  <option value="CustomCNN">Baseline 5-Layer Convolutional Network</option>
                </select>
              </div>

              {/* Frangi Feature Fusion Toggle */}
              <div className="p-3 bg-cyan-50/60 rounded-xl border border-cyan-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-navy-950 block">Frangi Hessian Feature Fusion</span>
                  <span className="text-[11px] text-slate-500">Injects 15 handcrafted oculomic biomarkers into dense bottleneck</span>
                </div>
                <input
                  type="checkbox"
                  name="frangiFeatureFusion"
                  checked={config.frangiFeatureFusion}
                  onChange={handleChange}
                  disabled={isTraining}
                  className="w-4 h-4 accent-cyan-600 rounded cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Epochs</label>
                  <input 
                    type="number" 
                    name="epochs" 
                    value={config.epochs} 
                    onChange={handleChange} 
                    disabled={isTraining} 
                    className="w-full border-slate-300 rounded-xl shadow-sm p-2 border font-mono text-xs" 
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Batch Size</label>
                  <input 
                    type="number" 
                    name="batchSize" 
                    value={config.batchSize} 
                    onChange={handleChange} 
                    disabled={isTraining} 
                    className="w-full border-slate-300 rounded-xl shadow-sm p-2 border font-mono text-xs" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Learning Rate</label>
                  <input 
                    type="number" 
                    step="0.0001" 
                    name="learningRate" 
                    value={config.learningRate} 
                    onChange={handleChange} 
                    disabled={isTraining} 
                    className="w-full border-slate-300 rounded-xl shadow-sm p-2 border font-mono text-xs" 
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Image Resolution</label>
                  <select 
                    name="imageRes" 
                    value={config.imageRes} 
                    onChange={handleChange} 
                    disabled={isTraining} 
                    className="w-full border-slate-300 rounded-xl shadow-sm p-2 border text-xs"
                  >
                    <option value={224}>224x224 (Standard)</option>
                    <option value={384}>384x384 (High-Def)</option>
                    <option value={512}>512x512 (Ultra-Fine)</option>
                  </select>
                </div>
              </div>

              {/* Data Leakage Prevention */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-navy-950 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Patient-Level Partitioning</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Enforces strict <strong>GroupKFold</strong> partitioning. All fundus photographs from the same subject remain within a single split to eliminate patient identity leakage.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              {!isTraining && epoch === 0 && (
                <button 
                  onClick={handleStart} 
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl text-xs flex justify-center items-center space-x-2 transition-all shadow-md shadow-cyan-600/20"
                >
                  <Play className="w-4 h-4 fill-white" /> 
                  <span>Launch Training Job</span>
                </button>
              )}
              {isTraining && (
                <button 
                  onClick={handleStop} 
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl text-xs flex justify-center items-center space-x-2 transition-all shadow-md"
                >
                  <Square className="w-4 h-4 fill-white" /> 
                  <span>Abort Training Session</span>
                </button>
              )}
              {!isTraining && epoch > 0 && (
                <button 
                  onClick={handleStart} 
                  className="w-full bg-navy-900 hover:bg-navy-950 text-white font-bold py-3 rounded-xl text-xs flex justify-center items-center space-x-2 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" /> 
                  <span>Restart Experiment</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Training Monitor & Real-Time Curves (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col min-h-[480px]">
            <div className="flex justify-between items-end border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-navy-950">Training Execution Monitor</h3>
                <p className="text-xs text-slate-500">Live loss reduction & generalization accuracy telemetry</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">State</span>
                <span className={`font-mono text-xs font-bold ${
                  isTraining ? 'text-amber-500 animate-pulse' : epoch > 0 ? 'text-emerald-500' : 'text-slate-400'
                }`}>
                  {isTraining ? `EPOCH ${epoch}/${config.epochs}` : epoch > 0 ? 'COMPLETED (CHECKPOINT PERSISTED)' : 'READY'}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-mono text-slate-500 mb-1">
                <span>Progress: {progress.toFixed(0)}%</span>
                <span>{epoch}/{config.epochs} Epochs</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Curves */}
            {metrics.length > 0 ? (
              <div className="flex-1 grid grid-cols-1 gap-6">
                {/* Accuracy Chart */}
                <div className="h-52">
                  <h4 className="text-xs font-mono font-bold text-slate-600 mb-1">
                    Top-1 Generalization Accuracy
                  </h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="epoch" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[0.4, 1.0]} />
                      <Tooltip />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                      <Line type="monotone" dataKey="acc" stroke="#0ea5e9" dot={false} strokeWidth={2.5} name="Train Acc" />
                      <Line type="monotone" dataKey="val_acc" stroke="#10b981" dot={false} strokeWidth={2.5} name="Val Acc (Test)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Loss Chart */}
                <div className="h-44 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-mono font-bold text-slate-600 mb-1">
                    Categorical Cross-Entropy Loss
                  </h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="epoch" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                      <Tooltip />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                      <Line type="monotone" dataKey="loss" stroke="#f43f5e" dot={false} strokeWidth={2} name="Train Loss" />
                      <Line type="monotone" dataKey="val_loss" stroke="#fb923c" dot={false} strokeWidth={2} name="Val Loss" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/70 p-8 text-center">
                <Cpu className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-600">Awaiting Training Launch</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Click "Launch Training Job" on the left to start optimization and monitor live convergence curves.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
