import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FileText, Sparkles, Download, Clock, AlertCircle, CheckCircle2, RefreshCw
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchReports = async () => {
    try {
      const res = await api.get('/ai/reports');
      setReports(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load performance reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async () => {
    setGenerating(true);
    toast.loading("Generating weekly performance ledger...");
    try {
      const res = await api.post('/ai/report/weekly');
      setReports(prev => [res.data, ...prev]);
      toast.dismiss();
      toast.success("AI Performance Report Generated!");
    } catch (err) {
      toast.dismiss();
      toast.error("Report generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = (type: 'weekly' | 'monthly') => {
    toast.loading("Compiling PDF document...");
    api.get(`/ai/report/download/${type}`, { responseType: 'blob' })
      .then((res) => {
        toast.dismiss();
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `pulse_${type}_report.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        toast.success("PDF Downloaded successfully!");
      })
      .catch((err) => {
        toast.dismiss();
        console.error(err);
        toast.error("PDF export failed");
      });
  };

  if (loading) {
    return <div className="text-text-muted text-xs italic">Loading reports center...</div>;
  }

  const latestReport = reports[0];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-text-heading">Performance Reports</h2>
          <p className="text-sm text-text-muted">Export weekly audits and natural language biomechanics summaries</p>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="pulse-btn-primary flex items-center gap-1.5 disabled:opacity-50"
        >
          {generating ? <RefreshCw className="animate-spin text-white" size={14} /> : <Sparkles size={14} />} 
          Generate Weekly Audit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: PDF export triggers & archives */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick PDF exports */}
          <div className="pulse-card space-y-4">
            <h3 className="text-sm font-bold text-text-heading">PDF Report Center</h3>
            <p className="text-xs text-text-body leading-relaxed">
              Compile your logs, volume stats, and AI recommendations into a high-fidelity formatted PDF document.
            </p>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleDownloadPDF('weekly')}
                className="w-full py-2.5 bg-surface-light border border-border hover:bg-surface-hover text-primary text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Download size={14} className="text-primary" /> Export Weekly Report PDF
              </button>
              <button
                onClick={() => handleDownloadPDF('weekly')}
                className="w-full py-2.5 bg-surface-light border border-border hover:bg-surface-hover text-primary text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Download size={14} className="text-primary" /> Export Monthly Report PDF
              </button>
            </div>
          </div>

          {/* Archived reports list */}
          <div className="pulse-card space-y-4">
            <h3 className="text-sm font-bold text-text-heading">Historical Audits</h3>
            <div className="space-y-2 overflow-y-auto max-h-60 pr-1">
              {reports.length === 0 ? (
                <p className="text-xs text-text-muted italic text-center py-6">No historical audits recorded.</p>
              ) : (
                reports.map((rep, idx) => (
                  <button
                    key={rep._id}
                    onClick={() => {
                      const reordered = [...reports];
                      const chosen = reordered.splice(idx, 1)[0];
                      setReports([chosen, ...reordered]);
                    }}
                    className={`w-full p-3 rounded-xl flex items-center justify-between text-left text-xs transition-all border ${
                      idx === 0 
                        ? 'bg-primary-light text-primary border-primary/20 font-bold shadow-sm' 
                        : 'bg-zinc-50 border-border text-text-muted hover:bg-surface-hover'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate">Weekly performance report</p>
                      <p className="text-[9px] mt-0.5 font-semibold">
                        Generated on: {new Date(rep.generatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <FileText size={14} className="shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column: Report reader display */}
        <div className="lg:col-span-2 space-y-6">
          {latestReport ? (
            <div className="pulse-card space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div>
                  <h3 className="text-base font-bold text-text-heading">Weekly Performance Report</h3>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    Range: {new Date(latestReport.startDate).toLocaleDateString()} - {new Date(latestReport.endDate).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadPDF('weekly')}
                  className="px-3 py-1.5 bg-surface-light border border-border hover:bg-surface-hover text-text-heading text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Download size={12} /> PDF
                </button>
              </div>

              {/* Metrics highlights cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-surface-light rounded-xl border border-border shadow-xs">
                  <p className="text-[9px] text-text-muted font-bold uppercase">Workouts Logged</p>
                  <p className="text-xl font-extrabold text-text-heading mt-1">{latestReport.metrics?.workoutsCompleted}</p>
                </div>
                <div className="p-3 bg-surface-light rounded-xl border border-border shadow-xs">
                  <p className="text-[9px] text-text-muted font-bold uppercase">Consistency Rate</p>
                  <p className="text-xl font-extrabold text-primary mt-1">{latestReport.metrics?.consistencyScore}%</p>
                </div>
                <div className="p-3 bg-surface-light rounded-xl border border-border shadow-xs">
                  <p className="text-[9px] text-text-muted font-bold uppercase">Lifting Volume</p>
                  <p className="text-xl font-extrabold text-text-heading mt-1">{(latestReport.metrics?.totalVolume || 0).toLocaleString()} kg</p>
                </div>
                <div className="p-3 bg-surface-light rounded-xl border border-border shadow-xs">
                  <p className="text-[9px] text-text-muted font-bold uppercase">Mean CNS Recovery</p>
                  <p className="text-xl font-extrabold text-mint mt-1">{latestReport.metrics?.recoveryAverage}%</p>
                </div>
              </div>

              {/* Natural language AI summary block */}
              <div className="p-4 bg-surface-light rounded-xl border border-border space-y-3 text-xs leading-relaxed text-text-body whitespace-pre-wrap shadow-sm">
                {latestReport.content}
              </div>
            </div>
          ) : (
            <div className="h-96 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-text-muted italic text-xs gap-3">
              <p className="font-bold">No performance report generated for this week yet.</p>
              <button
                onClick={handleGenerateReport}
                className="pulse-btn-primary py-2 px-4 not-italic"
              >
                Compile Weekly Audit Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ReportsPage;
