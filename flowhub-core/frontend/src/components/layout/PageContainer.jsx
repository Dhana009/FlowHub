/**
 * PageContainer Component
 * 
 * Wrapper for page content with consistent padding and spacing.
 * Includes optional page title.
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} props.title - Page title (optional)
 */
export default function PageContainer({ children, title }) {
  return (
    <main className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          </div>
        )}
        {children}
      </div>
    </main>
  );
}

