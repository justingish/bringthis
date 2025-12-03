interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showHomeButton?: boolean;
}

/**
 * ErrorMessage component displays user-friendly error messages with optional retry and dismiss actions.
 */
export function ErrorMessage({
  title = 'Error',
  message,
  onRetry,
  onDismiss,
  showHomeButton = false,
}: ErrorMessageProps) {
  return (
    <div
      className="bg-red-50 border border-red-200 rounded-lg p-6"
      role="alert"
      aria-live="assertive"
      aria-labelledby="error-title"
    >
      <h2 id="error-title" className="text-xl font-semibold text-red-800 mb-2">
        {title}
      </h2>
      <p className="text-red-700 mb-4">{message}</p>
      <div className="flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Try loading again"
          >
            Try Again
          </button>
        )}
        {showHomeButton && (
          <button
            onClick={() => (window.location.href = '/')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Go to home page"
          >
            Go to Home
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Dismiss error message"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
