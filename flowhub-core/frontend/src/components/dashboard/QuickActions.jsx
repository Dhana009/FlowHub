import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

/**
 * QuickActions Component
 * 
 * Grid of quick action buttons for common tasks.
 * 
 * @param {array} props.actions - Array of action objects
 */
export default function QuickActions({ actions = [] }) {
  const navigate = useNavigate();

  const defaultActions = [
    {
      label: 'Create Item',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      onClick: () => navigate('/items/create'),
      variant: 'primary',
    },
    {
      label: 'View All Items',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      onClick: () => navigate('/items'),
      variant: 'secondary',
    },
  ];

  const actionsToShow = actions.length > 0 ? actions : defaultActions;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actionsToShow.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className={`
            flex flex-col items-center justify-center space-y-2 p-6 rounded-lg border-2 border-dashed
            transition-all duration-200
            ${
              action.variant === 'primary'
                ? 'border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 text-blue-700'
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 text-gray-700'
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          `}
          data-testid={`quick-action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <div className={action.variant === 'primary' ? 'text-blue-600' : 'text-gray-600'}>
            {action.icon}
          </div>
          <span className="text-sm font-medium">{action.label}</span>
        </button>
      ))}
    </div>
  );
}

