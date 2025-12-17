/**
 * AuthLayout Component
 * 
 * Clean layout for authentication pages (login, signup, forgot password).
 * No sidebar or complex navigation - just centered content.
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children - Page content
 */
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}

