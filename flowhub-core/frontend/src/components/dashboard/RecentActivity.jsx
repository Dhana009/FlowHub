import Card from '../ui/Card';
import EmptyState from '../ui/EmptyState';

/**
 * RecentActivity Component
 * 
 * Displays recent activity feed.
 * 
 * @param {array} props.activities - Array of activity objects
 * @param {boolean} props.loading - Loading state
 */
export default function RecentActivity({ activities = [], loading = false }) {
  if (loading) {
    return (
      <Card variant="elevated">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0">
              <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card variant="elevated">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
        <EmptyState
          title="No recent activity"
          description="Your recent actions will appear here"
          icon={
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </Card>
    );
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card variant="elevated">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 leading-tight tracking-tight">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0 hover:bg-slate-50/50 -mx-2 px-2 py-1 rounded-lg transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
              {activity.icon || (
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-normal text-slate-900 leading-relaxed">{activity.message}</p>
              <p className="text-xs text-slate-500 mt-1.5 leading-normal">
                {formatTime(activity.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

