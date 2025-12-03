interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

/**
 * LoadingSpinner component displays a loading indicator with an optional message.
 * Can be used inline or as a full-screen overlay.
 */
export function LoadingSpinner({
  message = 'Loading...',
  size = 'md',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-b-2',
    lg: 'h-16 w-16 border-b-4',
  };

  const spinner = (
    <div className="text-center" role="status" aria-live="polite">
      <div
        className={`inline-block animate-spin rounded-full border-blue-600 ${sizeClasses[size]} mb-4`}
        aria-hidden="true"
      />
      <span className="sr-only">Loading</span>
      {message && (
        <p className="text-gray-600" aria-label={message}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
}
