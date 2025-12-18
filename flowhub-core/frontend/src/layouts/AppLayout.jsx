import { useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import PageContainer from '../components/layout/PageContainer';

/**
 * AppLayout Component
 * 
 * Main application layout with header and sidebar navigation.
 * Used for all authenticated pages.
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} props.title - Page title (optional)
 */
export default function AppLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50/50">
      {/* Sidebar - Fixed on left */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header - Fixed at top, offset by sidebar on desktop */}
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Layout Container - Flex row with proper overflow */}
      <div className="flex flex-1 pt-16 lg:ml-60 overflow-hidden">
        {/* Main Content Area - Scrollable */}
        <main 
          className="flex-1 overflow-y-auto focus:outline-none"
          tabIndex="0"
          aria-label="Main content"
        >
          <PageContainer title={title}>
            {children}
          </PageContainer>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

