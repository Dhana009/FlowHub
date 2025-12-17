import { NavLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

/**
 * Sidebar Component
 * 
 * Navigation sidebar with main menu items.
 * Collapsible on mobile, always visible on desktop.
 * 
 * @param {object} props
 * @param {boolean} props.isOpen - Whether sidebar is open (mobile)
 * @param {function} props.onClose - Handler to close sidebar (mobile)
 */
export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

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
    {
      name: 'Create Item',
      href: '/items/create',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
      {/* Desktop Sidebar - Always visible */}
      <aside
        className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block lg:w-64 lg:pt-16 bg-white border-r border-gray-200"
        role="navigation"
        aria-label="Main navigation"
      >
        <nav className="h-full px-4 py-6 overflow-y-auto">
          <ul className="space-y-1" role="list">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                      ${
                        active
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    `}
                    aria-current={active ? 'page' : undefined}
                    data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span className={active ? 'text-blue-600' : 'text-gray-400'}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Mobile Sidebar - Slide in overlay */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out pt-16
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:hidden
        `}
        role="navigation"
        aria-label="Main navigation"
        aria-hidden={!isOpen}
      >
        <nav className="h-full px-4 py-6 overflow-y-auto">
          <ul className="space-y-1" role="list">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    onClick={onClose}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                      ${
                        active
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    `}
                    aria-current={active ? 'page' : undefined}
                    data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span className={active ? 'text-blue-600' : 'text-gray-400'}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}

