import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmationDialog from '../../../src/components/common/ConfirmationDialog';

describe('ConfirmationDialog', () => {
  it('should not render when closed', () => {
    render(
      <ConfirmationDialog
        open={false}
        title="Confirm"
        message="Are you sure?"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    render(
      <ConfirmationDialog
        open={true}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <ConfirmationDialog
        open={true}
        title="Confirm"
        message="Proceed?"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    );

    await user.click(screen.getByRole('button', { name: /confirm/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when cancel button clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <ConfirmationDialog
        open={true}
        title="Confirm"
        message="Proceed?"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('should render custom button labels', () => {
    render(
      <ConfirmationDialog
        open={true}
        title="Remove Item"
        message="Delete this item?"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
        confirmText="Remove"
        cancelText="Keep"
      />
    );
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /keep/i })).toBeInTheDocument();
  });
});
