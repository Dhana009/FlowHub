/**
 * EmptyState Component
 * 
 * Empty state illustration for when there's no data.
 * 
 * @param {object} props
 * @param {string} props.title - Empty state title
 * @param {string} props.description - Empty state description
 * @param {React.ReactNode} props.icon - Optional icon element
 * @param {React.ReactNode} props.action - Optional action button
 */
export default function EmptyState({ title, description, icon, action }) {
  return (
    <div
      className="text-center py-12"
      role="status"
      aria-live="polite"
      data-testid="empty-state"
    >
      {icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 mb-4 max-w-sm mx-auto">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}


