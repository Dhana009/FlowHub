/**
 * Card Component
 * 
 * Reusable card container with shadow and border.
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.variant - Card variant (default, outlined, elevated)
 * @param {string} props.padding - Padding size (sm, md, lg)
 * @param {string} props.className - Additional CSS classes
 */
export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...rest
}) {
  const variantClasses = {
    default: 'bg-white shadow-sm border border-gray-200',
    outlined: 'bg-white border-2 border-gray-300',
    elevated: 'bg-white shadow-lg border border-gray-200',
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        rounded-lg transition-shadow
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${className}
      `}
      {...rest}
    >
      {children}
    </div>
  );
}

