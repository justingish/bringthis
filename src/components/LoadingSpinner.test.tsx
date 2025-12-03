import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with default message', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading...')).toBeDefined();
  });

  it('should render with custom message', () => {
    render(<LoadingSpinner message="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeDefined();
  });

  it('should render in full screen mode', () => {
    const { container } = render(<LoadingSpinner fullScreen />);
    expect(container.querySelector('.container')).toBeDefined();
  });

  it('should have loading role', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeDefined();
  });
});
