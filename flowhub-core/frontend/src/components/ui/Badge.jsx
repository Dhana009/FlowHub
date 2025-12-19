/**
 * Badge Component
 * 
 * Status indicator badge with color variants.
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} props.variant - Badge variant (primary, success, warning, danger, info, gray)
 * @param {string} props.size - Badge size (sm, md, lg)
 * @param {string} props.className - Additional CSS classes
 */
export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...rest
}) {
  const variantClasses = {
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-cyan-100 text-cyan-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-full
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...rest}
    >
      {children}
    </span>
  );
}





