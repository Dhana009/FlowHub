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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {icon && (
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline space-x-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {change && (
          <div className={`flex items-center space-x-1 ${getTrendColor(change.trend)}`}>
            {getTrendIcon(change.trend)}
            <span className="text-sm font-medium">
              {Math.abs(change.value)}%
            </span>
          </div>
        )}
      </div>
      {change && (
        <p className="text-xs text-gray-500 mt-1">vs last period</p>
      )}
    </div>
  );
}

