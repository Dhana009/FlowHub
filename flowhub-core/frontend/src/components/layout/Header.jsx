import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Button from '../common/Button';

/**
 * Header Component
 * 
 * Top navigation bar with logo, search, user menu, and notifications.
 * 
 * @param {object} props
 * @param {function} props.onMenuClick - Handler for mobile menu button
 */
export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-50"
      role="banner"
      aria-label="Main navigation"
    >
      <div className="h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Left: Logo and Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle sidebar"
              aria-expanded="false"
              data-testid="mobile-menu-button"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-bold">F</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">
                FlowHub
              </h1>
            </div>
          </div>

          {/* Right: User Menu and Actions */}
          <div className="flex items-center space-x-4">
            {/* Create Item Button (Desktop) */}
            <div className="hidden md:block">
              <Button
                onClick={() => navigate('/items/create')}
                variant="primary"
                dataTestid="header-create-item-button"
                className="text-sm px-4 py-2"
              >
                + Create Item
              </Button>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-label="User menu"
                aria-expanded={userMenuOpen}
                data-testid="user-menu-button"
              >
                {/* Avatar */}
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user?.firstName?.[0]?.toUpperCase() || 'U'}
                </div>
                {/* User Info (Desktop) */}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                {/* Dropdown Icon */}
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
                    role="menu"
                    aria-orientation="vertical"
                    data-testid="user-menu-dropdown"
                  >
                    <div className="px-4 py-2 border-b border-gray-100 md:hidden">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/dashboard');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                      role="menuitem"
                      data-testid="menu-dashboard"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/items');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                      role="menuitem"
                      data-testid="menu-items"
                    >
                      All Items
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 focus:outline-none focus:bg-red-50"
                      role="menuitem"
                      data-testid="menu-logout"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

