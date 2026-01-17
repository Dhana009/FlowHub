/**
 * PageContainer Component
 * 
 * Wrapper for page content with consistent padding and spacing.
 * Includes optional page title.
 * Properly offsets for sidebar on desktop.
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} props.title - Page title (optional)
 */
export default function PageContainer({ children, title }) {
  return (
    <div className="h-full w-full">
      <div className="w-full max-w-none 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8">
        {title && (
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

