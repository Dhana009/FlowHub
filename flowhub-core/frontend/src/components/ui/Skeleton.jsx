/**
 * Skeleton Component
 * 
 * Loading placeholder with shimmer effect.
 * 
 * @param {object} props
 * @param {string} props.variant - Skeleton variant (text, circular, rectangular)
 * @param {string} props.width - Width (e.g., 'w-32', 'w-full')
 * @param {string} props.height - Height (e.g., 'h-4', 'h-12')
 * @param {string} props.className - Additional CSS classes
 */
export default function Skeleton({
  variant = 'rectangular',
  width = 'w-full',
  height = 'h-4',
  className = '',
  ...rest
}) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      role="progressbar"
      className={`
        ${width} ${height}
        ${variantClasses[variant]}
        bg-gray-200 animate-pulse
        ${className}
      `}
      aria-busy="true"
      aria-label="Loading content"
      {...rest}
    />
  );
}



