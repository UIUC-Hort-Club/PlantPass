import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../../../src/components/common/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render loading spinner', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<LoadingSpinner message="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('should render without message', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector('.MuiCircularProgress-root')).toBeInTheDocument();
  });
});
