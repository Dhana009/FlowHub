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
    <div className="min-h-screen bg-gray-50">
      {/* Header - Fixed at top */}
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Layout Container */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-64">
          <PageContainer title={title}>
            {children}
          </PageContainer>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

