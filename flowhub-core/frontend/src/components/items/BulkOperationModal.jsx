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
          {error && <ErrorMessage message={error} />}

          {status !== 'completed' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-sm font-medium text-slate-600 mb-2">
                <span data-testid="job-status-label">
                  {status === 'pending' ? 'Initializing...' : 'Processing items...'}
                </span>
                <span data-testid="progress-percentage">{progress}%</span>
              </div>
              
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200 shadow-inner">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ 
                    width: `${progress}%`,
                    minWidth: progress > 0 ? '4px' : '0' 
                  }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  data-testid="progress-bar"
                ></div>
              </div>

              {summary && (
                <p className="text-center text-sm text-slate-500" data-testid="progress-details">
                  Processed {summary.success + summary.failed} of {summary.total} items
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-slate-900">Operation Complete</h4>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 space-y-2" data-testid="summary-report">
                <div className="flex justify-between text-sm border-b border-slate-200 pb-2 mb-2">
                  <span className="text-slate-600 font-semibold">Total Selection:</span>
                  <span className="font-bold text-slate-900" data-testid="total-count">{summary?.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Actually Updated:</span>
                  <span className="font-bold text-emerald-600" data-testid="success-count">{summary?.success}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 text-xs italic">Skipped / Acknowledged:</span>
                  <span className="font-medium text-slate-500 text-xs" data-testid="skipped-count">{skippedCount}</span>
                </div>
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-slate-600">Failed:</span>
                  <span className="font-bold text-red-600" data-testid="failed-count">{summary?.failed}</span>
                </div>
              </div>

              {failures.length > 0 && (
                <div className="max-h-32 overflow-y-auto border border-red-100 rounded-lg p-3 bg-red-50/30">
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">Failure Details</p>
                  <ul className="space-y-1">
                    {failures.map((f, i) => (
                      <li key={i} className="text-xs text-red-600 flex items-start">
                        <span className="mr-1">•</span>
                        <span>Item {f.id}: {f.error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button 
                onClick={onComplete}
                className="w-full"
                dataTestid="close-modal-button"
              >
                Close & Refresh
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

