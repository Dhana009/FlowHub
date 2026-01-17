/**
 * Auth Card Component
 * 
 * Professional card container for authentication forms.
 * Provides consistent layout and styling.
 */

export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200/60 overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-200/60">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white text-xl font-bold">F</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-slate-600 text-center leading-relaxed">
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
          <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-200/60">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

