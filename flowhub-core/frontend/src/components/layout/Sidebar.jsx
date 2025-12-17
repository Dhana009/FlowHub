import { NavLink, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

/**
 * Sidebar Component
 * 
 * Navigation sidebar with logo, Create Item button, and main menu items.
 * Dark theme with full-width layout.
 * Collapsible on mobile, always visible on desktop.
 * 
 * @param {object} props
 * @param {boolean} props.isOpen - Whether sidebar is open (mobile)
 * @param {function} props.onClose - Handler to close sidebar (mobile)
 */
export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Items',
      href: '/items',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  const isActive = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar - Dark theme with logo and Create Item button */}
      <aside
        className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-[60] lg:flex"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col w-60 h-full bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700/50">
          {/* Logo Section - Height matched to Header (64px) */}
          <div className="px-4 h-16 flex items-center border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-base font-bold">F</span>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">FlowHub</h1>
            </div>
          </div>

          {/* Create Item Button - Prominent */}
          <div className="px-4 py-4 border-b border-slate-700/50">
            <button
              onClick={() => navigate('/items/create')}
              className="
                w-full flex items-center justify-center gap-2.5 px-4 py-3.5
                bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800
                text-white text-base font-semibold leading-normal
                rounded-xl shadow-md hover:shadow-lg
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800
                transition-all duration-200
              "
              title="Create Item"
              data-testid="sidebar-create-item-button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Item</span>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-1" role="list">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium 
                        transition-all duration-200 leading-normal
                        ${
                          active
                            ? 'bg-white/10 text-white shadow-sm font-semibold'
                            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                        }
                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800
                      `}
                      aria-current={active ? 'page' : undefined}
                      data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <span className={`flex-shrink-0 ${active ? 'text-white' : 'text-slate-400'}`}>
                        {item.icon}
                      </span>
                      <span className="truncate font-medium">{item.name}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar - Slide in overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[65] lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Sidebar Panel */}
          <aside
            className="fixed inset-y-0 left-0 flex flex-col w-72 bg-gradient-to-b from-slate-800 to-slate-900 z-[70] transform transition-transform duration-300 ease-in-out lg:hidden"
            role="navigation"
            aria-label="Main navigation"
            aria-hidden={!isOpen}
          >
            {/* Mobile Logo Section */}
            <div className="px-5 py-6 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-base font-bold">F</span>
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">FlowHub</h1>
              </div>
            </div>

            {/* Mobile Create Item Button */}
            <div className="px-5 py-4 border-b border-slate-700/50">
              <button
                onClick={() => {
                  navigate('/items/create');
                  onClose();
                }}
                className="
                  w-full flex items-center justify-center gap-2 px-4 py-3.5
                  bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800
                  text-white text-sm font-semibold
                  rounded-xl shadow-md hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800
                  transition-all duration-200
                "
                data-testid="mobile-sidebar-create-item-button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Item</span>
              </button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 pt-4 pb-4 overflow-y-auto">
              <nav className="px-3 py-4">
                <ul className="space-y-1" role="list">
                  {navigation.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <li key={item.name}>
                        <NavLink
                          to={item.href}
                          onClick={onClose}
                          className={`
                            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                            ${
                              active
                                ? 'bg-white/10 text-white shadow-sm'
                                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                            }
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800
                          `}
                          aria-current={active ? 'page' : undefined}
                          data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <span className={`flex-shrink-0 w-5 h-5 ${active ? 'text-white' : 'text-slate-400'}`}>
                            {item.icon}
                          </span>
                          <span className="truncate">{item.name}</span>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

