/**
 * Card Component
 * 
 * Reusable card container with shadow, border, and hover effects.
 * Enhanced with modern design patterns.
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.variant - Card variant (default, outlined, elevated, glass)
 * @param {string} props.padding - Padding size (sm, md, lg)
 * @param {boolean} props.hover - Enable hover effects
 * @param {string} props.className - Additional CSS classes
 */
export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  ...rest
}) {
  const variantClasses = {
    default: 'bg-white shadow-sm border border-slate-200/60',
    outlined: 'bg-white border-2 border-slate-300',
    elevated: 'bg-white shadow-md border border-slate-200/60',
    glass: 'bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg',
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverEffect = hover 
    ? 'hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all duration-200 ease-out cursor-pointer' 
    : 'transition-shadow duration-200';

  return (
    <div
      className={`
        rounded-xl
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${hoverEffect}
        ${className}
      `}
      {...rest}
    >
      {children}
    </div>
  );
}

