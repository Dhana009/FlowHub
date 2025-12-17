import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getItems } from '../services/itemService';
import StatsCard from '../components/dashboard/StatsCard';
import QuickActions from '../components/dashboard/QuickActions';
import RecentActivity from '../components/dashboard/RecentActivity';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';

/**
 * Dashboard Page
 * 
 * Welcome dashboard with stats, quick actions, and recent activity.
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalItems: 0,
    activeItems: 0,
    inactiveItems: 0,
    loading: true,
  });
  const [recentItems, setRecentItems] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch items for stats
      const itemsResponse = await getItems({ limit: 1000, page: 1 });
      const items = itemsResponse.items || [];

      // Calculate stats
      const totalItems = items.length;
      const activeItems = items.filter((item) => item.is_active).length;
      const inactiveItems = totalItems - activeItems;

      setStats({
        totalItems,
        activeItems,
        inactiveItems,
        loading: false,
      });

      // Get recent items (last 5)
      const sortedItems = [...items]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentItems(sortedItems);

      // Generate activity feed from recent items
      const recentActivities = sortedItems.slice(0, 5).map((item) => ({
        message: `Item "${item.name}" was ${item.is_active ? 'created' : 'deactivated'}`,
        timestamp: item.createdAt || item.updatedAt,
        icon: item.is_active ? (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
      }));

      setActivities(recentActivities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats((prev) => ({ ...prev, loading: false }));
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {user?.firstName || 'User'}! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          Welcome to FlowHub. Here's what's happening with your items.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Items"
          value={stats.totalItems}
          loading={stats.loading}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatsCard
          title="Active Items"
          value={stats.activeItems}
          loading={stats.loading}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Inactive Items"
          value={stats.inactiveItems}
          loading={stats.loading}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Recent Additions"
          value={recentItems.length}
          loading={loading}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <QuickActions />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <RecentActivity activities={activities} loading={loading} />

        {/* Recent Items */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Items</h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height="h-16" />
              ))}
            </div>
          ) : recentItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No items yet. Create your first item to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/items`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      navigate(`/items`);
                    }
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.category} • {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
              {recentItems.length > 0 && (
                <button
                  onClick={() => navigate('/items')}
                  className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all items →
                </button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

