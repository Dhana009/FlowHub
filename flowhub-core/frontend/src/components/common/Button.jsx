/**
 * Button Component
 * 
 * Reusable button component with loading state and semantic attributes.
 * 
 * @param {object} props
 * @param {string} props.children - Button text/content
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {function} props.onClick - Click handler
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.dataTestid - Test identifier
 * @param {string} props.variant - Button variant (primary, secondary, danger)
 * @param {string} props.className - Additional CSS classes
 */
export default function Button({
  children,
  type = 'button',
  onClick,
  loading = false,
  disabled = false,
  dataTestid,
  variant = 'primary',
  className = '',
  ...rest
}) {
  const isDisabled = disabled || loading;

  const baseClasses = `
    px-5 py-2.5 rounded-xl font-semibold text-sm
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-all duration-200 ease-in-out
    leading-normal tracking-normal
  `;

  const variantClasses = {
    primary: 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 focus:ring-indigo-500 active:from-indigo-800 active:to-indigo-900 shadow-md hover:shadow-lg',
    secondary: 'bg-white text-slate-700 hover:bg-slate-50 focus:ring-indigo-500 active:bg-slate-100 border border-slate-300 shadow-sm hover:shadow-md',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500 active:from-red-800 active:to-red-900 shadow-md hover:shadow-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      role="button"
      aria-label={typeof children === 'string' ? children : 'Button'}
      aria-busy={loading}
      data-testid={dataTestid}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

