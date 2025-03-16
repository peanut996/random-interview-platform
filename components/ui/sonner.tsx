'use client';

import { toast as sonnerToast } from 'sonner';

interface AppleToastProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'success' | 'error' | 'warning';
  duration?: number;
}

// Get the icon based on variant
const getIcon = (variant: AppleToastProps['variant']) => {
  switch (variant) {
    case 'success':
      return (
        <svg
          className="w-5 h-5 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'default':
      return (
        <svg
          className="w-5 h-5 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'error':
      return (
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      );
    case 'warning':
      return (
        <svg
          className="w-5 h-5 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      );
    default:
      return (
        <svg
          className="w-5 h-5 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
  }
};

// Apple-style toast component
function AppleToast({
  id,
  title,
  description,
  action,
  variant = 'default',
}: AppleToastProps & { id: string | number }) {
  // Variant-specific styling
  const variantStyles = {
    default: 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700',
    success: 'bg-white dark:bg-zinc-800 border-green-500',
    error: 'bg-white dark:bg-zinc-800 border-red-500',
    warning: 'bg-white dark:bg-zinc-800 border-amber-500',
  };

  const variantIconColors = {
    default: 'text-blue-500',
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-amber-500',
  };

  return (
    <div
      className={`flex w-full max-w-sm rounded-lg border-l-4 shadow-md backdrop-blur-sm ${variantStyles[variant]}`}
      style={{
        WebkitBackdropFilter: 'blur(8px)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="flex w-full items-center p-4">
        <div className={`flex-shrink-0 mr-3 ${variantIconColors[variant]}`}>{getIcon(variant)}</div>

        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>

        {action && (
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => {
                action.onClick();
                sonnerToast.dismiss(id);
              }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                variant === 'default'
                  ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/40'
                  : variant === 'success'
                    ? 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/40'
                    : variant === 'error'
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40'
                      : 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/40'
              }`}
            >
              {action.label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function toast(toastOptions: Omit<AppleToastProps, 'id'>) {
  return sonnerToast.custom(
    id => (
      <AppleToast
        id={id}
        title={toastOptions.title}
        description={toastOptions.description}
        variant={toastOptions.variant}
      />
    ),
    {
      duration: toastOptions.duration,
      position: 'top-center',
      richColors: true,
    }
  );
}

export { toast };
