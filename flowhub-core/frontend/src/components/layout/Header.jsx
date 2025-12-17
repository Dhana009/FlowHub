import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 lg:left-60 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm z-50"
      role="banner"
      aria-label="Main navigation"
    >
      <div className="h-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex items-center justify-between h-full">
          {/* Left: Logo and Menu Button */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
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

            {/* Breadcrumbs - Polished alignment */}
            <nav className="flex items-center gap-2 text-sm font-medium" aria-label="Breadcrumb">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-slate-500 hover:text-slate-700 transition-colors leading-6 h-6 flex items-center"
              >
                Home
              </button>
              <div className="flex items-center h-6 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <span className="text-slate-900 font-bold leading-6 h-6 flex items-center">
                {location.pathname === '/dashboard' ? 'Dashboard' : 
                 location.pathname.startsWith('/items') ? 'Items' : 'FlowHub'}
              </span>
            </nav>
          </div>

          {/* Right: Notifications and User Menu */}
          <div className="flex items-center gap-3">
            {/* User Role Badge - Desktop Prominent */}
            <div className="hidden sm:flex items-center mr-2">
              <span className={`px-3 py-1 rounded-lg text-[10px] font-bold border tracking-wider uppercase shadow-sm ${
                user?.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                user?.role === 'EDITOR' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-slate-50 text-slate-600 border-slate-200'
              }`}>
                {user?.role} Access
              </span>
            </div>

            {/* Notifications */}
            <button
              className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                aria-label="User menu"
                aria-expanded={userMenuOpen}
                data-testid="user-menu-button"
              >
                {/* Avatar */}
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {user?.firstName?.[0]?.toUpperCase() || 'U'}
                </div>
                {/* User Info (Desktop) */}
                <div className="hidden md:flex flex-col text-left mr-1">
                  <p className="text-sm font-bold text-slate-900 leading-none">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-none">{user?.email}</p>
                </div>
                {/* Dropdown Icon */}
                <svg
                  className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
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
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200/60 py-2 z-20"
                    role="menu"
                    aria-orientation="vertical"
                    data-testid="user-menu-dropdown"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 md:hidden">
                      <p className="text-sm font-semibold text-slate-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-slate-500">{user?.email}</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border leading-none uppercase ${
                          user?.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                          user?.role === 'EDITOR' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          'bg-slate-50 text-slate-600 border-slate-100'
                        }`}>
                          {user?.role}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/dashboard');
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 focus:outline-none focus:bg-slate-50 rounded-lg mx-1 transition-colors duration-150"
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
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 focus:outline-none focus:bg-slate-50 rounded-lg mx-1 transition-colors duration-150"
                      role="menuitem"
                      data-testid="menu-items"
                    >
                      All Items
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 focus:outline-none focus:bg-red-50 rounded-lg mx-1 transition-colors duration-150"
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

