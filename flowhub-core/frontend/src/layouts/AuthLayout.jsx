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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      {children}
    </main>
  );
}

