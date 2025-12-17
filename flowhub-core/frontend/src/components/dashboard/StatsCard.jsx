/**
 * StatsCard Component
 * 
 * Dashboard stat card with title, value, optional change indicator, and icon.
 * 
 * @param {object} props
 * @param {string} props.title - Stat title
 * @param {string|number} props.value - Stat value
 * @param {object} props.change - Change indicator (optional)
 * @param {number} props.change.value - Change percentage
 * @param {string} props.change.trend - Trend direction (up, down, neutral)
 * @param {React.ReactNode} props.icon - Icon element
 * @param {boolean} props.loading - Loading state
 */
export default function StatsCard({ title, value, change, icon, loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    );
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 sm:p-6 hover:shadow-md hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all duration-200 ease-out">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <dl>
            <dt className="text-sm font-medium text-slate-600 truncate mb-1 leading-normal">
              {title}
            </dt>
            <dd className="flex items-baseline gap-2 mt-2">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight tracking-tight">
                {value}
              </div>
              {change && (
                <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                  change.trend === 'up' 
                    ? 'text-emerald-700 bg-emerald-50' 
                    : change.trend === 'down'
                    ? 'text-red-700 bg-red-50'
                    : 'text-slate-700 bg-slate-50'
                }`}>
                  {getTrendIcon(change.trend)}
                  <span>{Math.abs(change.value)}%</span>
                </div>
              )}
            </dd>
          </dl>
          {change && (
            <p className="text-xs text-slate-500 mt-2">vs last period</p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

