/**
 * Auth Card Component
 * 
 * Professional card container for authentication forms.
 * Provides consistent layout and styling.
 */

export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">F</span>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 text-center">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-600 text-center">
              {subtitle}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

