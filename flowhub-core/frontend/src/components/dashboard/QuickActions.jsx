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
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
      {actionsToShow.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className={`
            group flex flex-col items-center justify-center space-y-2 p-6 rounded-xl border-2 border-dashed
            transition-all duration-200 hover:scale-105 active:scale-95
            ${
              action.variant === 'primary'
                ? 'border-indigo-300 bg-gradient-to-br from-indigo-50 to-indigo-100/50 hover:from-indigo-100 hover:to-indigo-200/50 hover:border-indigo-400 text-indigo-700 hover:shadow-md'
                : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 text-slate-700 hover:shadow-sm'
            }
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
          `}
          data-testid={`quick-action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <div className={`transition-transform duration-200 group-hover:scale-110 ${
            action.variant === 'primary' ? 'text-indigo-600' : 'text-slate-600'
          }`}>
            {action.icon}
          </div>
          <span className="text-sm font-medium">{action.label}</span>
        </button>
      ))}
    </div>
  );
}

