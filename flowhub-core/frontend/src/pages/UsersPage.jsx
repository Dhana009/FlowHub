import { useState, useEffect, useCallback } from 'react';
import { getUsers, updateUserRole, updateUserStatus } from '../services/userService';
import Card from '../components/ui/Card';
import Button from '../components/common/Button';
import ErrorMessage from '../components/common/ErrorMessage';
import useAuth from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';

/**
 * User Management Page - Flow 10
 * 
 * Admin-only page to manage user roles and accounts.
 */
export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0
  });

  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers({ page, limit: 20 });
      setUsers(response.data || []);
      setPagination(response.pagination || { page, limit: 20, total: 0, total_pages: 0 });
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingUserId(userId);
      await updateUserRole(userId, newRole);
      showToast(`Role updated to ${newRole}`, 'success');
      await fetchUsers(pagination.page);
    } catch (err) {
      showToast(err.message || 'Update failed', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleToggleStatus = async (user) => {
    const isActivating = user.isActive === false;
    const action = isActivating ? 'activate' : 'deactivate';
    
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }
    
    try {
      setUpdatingUserId(user._id);
      await updateUserStatus(user._id, isActivating);
      showToast(`User ${action}d`, 'success');
      await fetchUsers(pagination.page);
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'EDITOR': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'VIEWER': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <Card variant="elevated">
        {error && <ErrorMessage message={error} onRetry={() => fetchUsers()} />}

        {loading && users.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-slate-600">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Current Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Change Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {users.map((u) => (
                  <tr key={u._id} data-testid={`user-row-${u._id}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900" data-testid={`user-name-${u._id}`}>
                        {u.firstName} {u.lastName}
                        {u._id === currentUser?.id && <span className="ml-2 text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 uppercase font-bold">You</span>}
                      </div>
                      <div className="text-xs text-slate-500" data-testid={`user-email-${u._id}`}>{u.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span data-testid={`user-role-badge-${u._id}`} className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getRoleBadgeColor(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span data-testid={`user-status-${u._id}`} className={`px-2 py-0.5 rounded text-xs font-medium ${u.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {u.isActive !== false ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center min-w-[120px] h-10">
                        <div className="relative flex-1">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            disabled={u._id === currentUser?.id || u._id === currentUser?._id || updatingUserId === u._id}
                            data-testid={`change-role-select-${u._id}`}
                            className={`
                              w-full text-xs font-semibold py-1.5 pl-2 pr-8 border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 
                              disabled:bg-slate-50 disabled:text-slate-400 transition-opacity duration-200
                              ${updatingUserId === u._id ? 'opacity-50' : 'opacity-100'}
                            `}
                          >
                            <option value="VIEWER">VIEWER</option>
                            <option value="EDITOR">EDITOR</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                          
                          {updatingUserId === u._id && (
                            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                              <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-indigo-600"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="min-w-[100px] h-10 flex items-center">
                        <Button
                          variant={u.isActive === false ? "success" : "secondary"}
                          size="sm"
                          dataTestid={`toggle-status-button-${u._id}`}
                          className={u.isActive === false 
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 w-full justify-center" 
                            : "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 w-full justify-center"
                          }
                          onClick={() => handleToggleStatus(u)}
                          disabled={u._id === currentUser?.id || u._id === currentUser?._id || updatingUserId === u._id}
                        >
                          {updatingUserId === u._id ? (
                            <div className="flex items-center space-x-2">
                              <div className={`animate-spin rounded-full h-3 w-3 border-b-2 ${u.isActive === false ? 'border-white' : 'border-red-600'}`}></div>
                              <span>Wait...</span>
                            </div>
                          ) : (
                            u.isActive === false ? 'Activate' : 'Deactivate'
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="mt-6 flex justify-between items-center px-6 pb-4">
            <p className="text-sm text-slate-600">
              Showing page {pagination.page} of {pagination.total_pages}
            </p>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.total_pages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

