import Card from '../ui/Card';
import Badge from '../ui/Badge';

/**
 * RecentActivityTable Component
 * 
 * Combined table showing recent activity and items with checkboxes, status badges, and actions.
 * 
 * @param {array} props.items - Array of item objects
 * @param {boolean} props.loading - Loading state
 */
export default function RecentActivityTable({ items = [], loading = false }) {
  const getStatusBadgeVariant = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const getItemIcon = (item) => {
    // Different icon colors based on item type or status
    const colors = ['blue', 'amber', 'emerald', 'red', 'indigo'];
    const colorIndex = item._id ? item._id.charCodeAt(0) % colors.length : 0;
    const color = colors[colorIndex];
    
    return (
      <div className={`w-8 h-8 bg-${color}-100 rounded-lg flex items-center justify-center`}>
        <svg className={`w-4 h-4 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <Card variant="elevated">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Recent Activity & Items</h3>
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4">
              <div className="w-4 h-4 bg-slate-200 rounded"></div>
              <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4"></div>
              </div>
              <div className="w-16 h-6 bg-slate-200 rounded-full"></div>
              <div className="w-24 h-4 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card variant="elevated">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Recent Activity & Items</h3>
        </div>
        <div className="p-12 text-center">
          <p className="text-slate-500">No recent items found.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Recent Activity & Items</h3>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="w-12 px-6 py-3">
                <input 
                  type="checkbox" 
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                  aria-label="Select all"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 group">
                <div className="flex items-center gap-1">
                  Created
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </th>
              <th className="w-12 px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {items.map((item) => (
              <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                    aria-label={`Select ${item.name}`}
                  />
                </td>
                <td className="px-6 py-4">
                  {getItemIcon(item)}
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-slate-900">{item.name}</p>
                    {item.category && (
                      <p className="text-sm text-slate-500 mt-0.5">{item.category}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={getStatusBadgeVariant(item.is_active ? 'active' : 'inactive')} size="sm">
                    {item.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {formatDate(item.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <button 
                    className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition-colors"
                    aria-label={`Actions for ${item.name}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

