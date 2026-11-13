import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { Report } from '../types';
import { demoReports } from '../utils/demo-data';
import { 
  FileText, 
  Download, 
  Printer, 
  Sparkles, 
  CheckCircle, 
  Calendar, 
  ShieldAlert, 
  Plus, 
  RefreshCw 
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

export const Reports: React.FC = () => {
  const { data: reports, refetch } = useApi<Report[]>('/reports', demoReports);
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [reportType, setReportType] = useState('evaluation');

  const handleDownload = (reportId: string) => {
    // Direct link to the backend download streaming endpoint
    window.open(`/api/reports/${reportId}/download`, '_blank');
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experiment_id: 1,
          report_type: reportType,
          format: 'csv'
        })
      });
      if (res.ok) {
        setShowGenerateModal(false);
        refetch();
        // Also trigger file download directly
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bloodeye_${reportType}_report.csv`;
        a.click();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-cyan-600 font-mono text-xs uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Biomedical Audit & Clinical Documentation</span>
          </div>
          <h2 className="text-3xl font-black text-navy-950 tracking-tight">Reports & Clinical Dossiers</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Generate and export reproducible laboratory evaluation reports, dataset manifests, and audit trails.
          </p>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Report</span>
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports?.map(report => (
          <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-cyan-50 rounded-xl text-cyan-700 border border-cyan-100">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  {report.format.toUpperCase()}
                </span>
              </div>

              <h3 className="font-bold text-navy-950 text-base mb-1">{report.title}</h3>
              <p className="text-xs text-slate-500 mb-4 capitalize">
                Category: <strong className="text-slate-700">{report.type} analysis</strong>
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 space-y-1 mb-6">
                <div className="flex justify-between">
                  <span>Report ID:</span>
                  <span className="font-mono text-slate-800 font-semibold">{report.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date Generated:</span>
                  <span className="font-mono text-slate-800">{formatDate(report.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Validated</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
              <button 
                onClick={() => handleDownload(report.id)}
                className="flex-1 bg-navy-900 hover:bg-navy-950 text-white font-medium py-2 rounded-xl text-xs flex justify-center items-center space-x-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Download Report</span>
              </button>
              <button
                onClick={() => window.print()}
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
                title="Print Report"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Clinical Integrity Footer */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 text-amber-900 flex items-start space-x-3.5 text-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <p className="font-bold text-amber-950">Clinical Research Use Disclaimer</p>
          <p>
            All generated reports and exported datasets are provided strictly for investigational purposes. These documents do not constitute an official transfusion medicine laboratory crossmatch certificate or blood transfusion release authorization.
          </p>
        </div>
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-navy-950 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <FileText className="w-5 h-5 text-cyan-600" />
              <span>Generate Research Dossier</span>
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Report Focus</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 font-medium"
                >
                  <option value="evaluation">Model Generalization & 8x8 Confusion Matrix</option>
                  <option value="dataset">Cohort Manifest & GroupKFold Validation</option>
                  <option value="summary">Comprehensive Transfusion Feasibility Summary</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Output Format</label>
                <select className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 font-medium">
                  <option value="csv">Standard Delimited CSV (Spreadsheet / R / Python)</option>
                  <option value="pdf">Formatted Clinical PDF Document</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 rounded-xl font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-5 py-2 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-700 text-white flex items-center space-x-2 shadow-sm disabled:opacity-50"
                >
                  {generating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{generating ? 'Compiling Dossier...' : 'Generate & Download'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
