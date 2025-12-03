import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Component that throws an error
function ThrowError() {
  throw new Error('Test error');
  return null;
}

// Component that works fine
function NoError() {
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <NoError />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeDefined();
  });

  it('should render error UI when child component throws', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeDefined();
    expect(screen.getByText(/An unexpected error occurred/)).toBeDefined();

    // Restore console.error
    console.error = originalError;
  });
});
