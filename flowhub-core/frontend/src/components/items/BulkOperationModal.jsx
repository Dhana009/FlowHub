import { useState, useEffect, useCallback, useRef } from 'react';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import { getBulkJobStatus } from '../../services/itemService';

/**
 * Bulk Operation Modal - Flow 7
 * 
 * Handles the polling loop and progress display for bulk operations.
 * Designed for Senior SDET showcase (Polling, Partial Failures, Async Sync).
 */
export default function BulkOperationModal({ isOpen, jobId, initialProgress = 0, onComplete, onCancel }) {
  const [status, setStatus] = useState('pending');
  const [progress, setProgress] = useState(initialProgress);
  const [summary, setSummary] = useState(null);
  const [skippedCount, setSkippedCount] = useState(0);
  const [failures, setFailures] = useState([]);
  const [error, setError] = useState(null);
  const pollingTimeoutRef = useRef(null);

  const pollStatus = useCallback(async () => {
    try {
      const response = await getBulkJobStatus(jobId);
      const { status: jobStatus, progress: jobProgress, summary: jobSummary, failures: jobFailures, skippedIds } = response.data;

      setStatus(jobStatus);
      setProgress(jobProgress);
      setSummary(jobSummary);
      setSkippedCount(skippedIds ? skippedIds.length : 0);
      setFailures(jobFailures || []);

      if (jobStatus === 'completed') {
        // Job is finished
        return;
      }

      // Schedule next poll (2 seconds as per FS)
      pollingTimeoutRef.current = setTimeout(pollStatus, 2000);
    } catch (err) {
      console.error('Polling error:', err);
      setError(err.message || 'Failed to get job status');
      // Don't stop polling on single error, try again after a delay
      pollingTimeoutRef.current = setTimeout(pollStatus, 5000);
    }
  }, [jobId]);

  useEffect(() => {
    if (isOpen && jobId) {
      setError(null);
      // Don't reset to 0 if we have initialProgress
      setStatus('pending');
      setProgress(initialProgress);
      setSummary(null);
      setFailures([]);
      pollStatus();
    }

    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, [isOpen, jobId, pollStatus]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" role="dialog" aria-modal="true" data-testid="bulk-operation-modal">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900" data-testid="modal-title">
            Bulk Operation Status
          </h3>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4">
              <ErrorMessage message={error} />
            </div>
          )}

          {status !== 'completed' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                  <span data-testid="job-status-label">
                    {status === 'pending' ? 'Preparing Job...' : 'Processing Batch...'}
                  </span>
                </div>
                <span className="font-bold text-indigo-600" data-testid="progress-percentage">{progress}%</span>
              </div>
              
              <div className="relative">
                <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                    style={{ 
                      width: `${progress}%`,
                      minWidth: progress > 0 ? '8px' : '0' 
                    }}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    data-testid="progress-bar"
                  ></div>
                </div>
              </div>

              {summary && (
                <p className="text-center text-sm font-medium text-slate-500" data-testid="progress-details">
                  Successfully processed <span className="text-slate-900 font-bold">{summary.success + summary.failed}</span> of <span className="text-slate-900 font-bold">{summary.total}</span> items
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 mb-4 shadow-sm border border-emerald-100">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-slate-900">Operation Finished</h4>
                <p className="text-sm text-slate-500 mt-1">All items have been processed</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 space-y-3 border border-slate-100" data-testid="summary-report">
                <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-3 mb-1">
                  <span className="text-slate-600 font-semibold">Total Selection</span>
                  <span className="px-3 py-1 bg-slate-200 text-slate-900 rounded-lg font-bold" data-testid="total-count">{summary?.total}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-700 font-medium">Successfully Updated</span>
                  <span className="text-emerald-600 font-bold flex items-center" data-testid="success-count">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {summary?.success}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 text-xs italic">Skipped (Already in state)</span>
                  <span className="font-bold text-slate-400 text-xs" data-testid="skipped-count">{skippedCount}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-1 border-t border-slate-100 mt-1">
                  <span className="text-slate-700 font-medium">Failed to Update</span>
                  <span className={`font-bold flex items-center ${summary?.failed > 0 ? 'text-red-600' : 'text-slate-400'}`} data-testid="failed-count">
                    {summary?.failed > 0 && (
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    {summary?.failed}
                  </span>
                </div>
              </div>

              {failures.length > 0 && (
                <div className="max-h-40 overflow-y-auto border border-red-100 rounded-xl p-4 bg-red-50/50">
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Error details
                  </p>
                  <ul className="space-y-2">
                    {failures.map((f, i) => (
                      <li key={i} className="text-xs text-red-600 bg-white/50 p-2 rounded-lg border border-red-100/50">
                        <span className="font-bold">Item {f.id.slice(-6).toUpperCase()}:</span> {f.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button 
                onClick={onComplete}
                className="w-full py-4 shadow-lg shadow-indigo-100"
                dataTestid="close-modal-button"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

