import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('should render error message', () => {
    render(<ErrorMessage message="Test error message" />);
    expect(screen.getByText('Test error message')).toBeDefined();
    expect(screen.getByText('Error')).toBeDefined();
  });

  it('should render custom title', () => {
    render(<ErrorMessage title="Custom Error" message="Test message" />);
    expect(screen.getByText('Custom Error')).toBeDefined();
  });

  it('should call onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Test error" onRetry={onRetry} />);

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should call onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<ErrorMessage message="Test error" onDismiss={onDismiss} />);

    const dismissButton = screen.getByText('Dismiss');
    fireEvent.click(dismissButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should show home button when showHomeButton is true', () => {
    render(<ErrorMessage message="Test error" showHomeButton />);
    expect(screen.getByText('Go to Home')).toBeDefined();
  });
});
