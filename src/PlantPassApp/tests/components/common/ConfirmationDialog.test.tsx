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
        onCancel={vi.fn()}
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
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmationDialog
        open={true}
        title="Confirm"
        message="Proceed?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('should call onCancel when cancel button clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmationDialog
        open={true}
        title="Confirm"
        message="Proceed?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('should render custom button labels', () => {
    render(
      <ConfirmationDialog
        open={true}
        title="Delete"
        message="Delete this item?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        confirmText="Delete"
        cancelText="Keep"
      />
    );
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Keep')).toBeInTheDocument();
  });
});
