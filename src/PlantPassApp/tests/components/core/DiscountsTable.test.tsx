import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import DiscountsTable from '../../../src/components/core/SubComponents/DiscountsTable';
import type { Discount } from '../../../src/types';

describe('DiscountsTable', () => {
  const mockDiscounts: Discount[] = [
    { name: 'Student Discount', type: 'percent' as const, value: 10, sort_order: 1 },
    { name: 'Senior Discount', type: 'percent' as const, value: 15, sort_order: 2 },
    { name: 'Holiday Special', type: 'dollar' as const, value: 5, sort_order: 3 },
  ];

  it('should render discount table with all discounts', () => {
    render(
      <DiscountsTable
        discounts={mockDiscounts}
        selectedDiscounts={[]}
        onDiscountToggle={vi.fn()}
      />
    );

    expect(screen.getByText('Student Discount')).toBeInTheDocument();
    expect(screen.getByText('Senior Discount')).toBeInTheDocument();
    expect(screen.getByText('Holiday Special')).toBeInTheDocument();
  });

  it('should display discount values correctly', () => {
    render(
      <DiscountsTable
        discounts={mockDiscounts}
        selectedDiscounts={[]}
        onDiscountToggle={vi.fn()}
      />
    );

    expect(screen.getByText('-10%')).toBeInTheDocument();
    expect(screen.getByText('-15%')).toBeInTheDocument();
    expect(screen.getByText('-$5.00')).toBeInTheDocument();
  });

  it('should show checkboxes as unchecked when no discounts selected', () => {
    render(
      <DiscountsTable
        discounts={mockDiscounts}
        selectedDiscounts={[]}
        onDiscountToggle={vi.fn()}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      expect(checkbox).not.toBeChecked();
    });
  });

  it('should show checkboxes as checked when discounts are selected', () => {
    render(
      <DiscountsTable
        discounts={mockDiscounts}
        selectedDiscounts={['Student Discount', 'Holiday Special']}
        onDiscountToggle={vi.fn()}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked(); // Student Discount
    expect(checkboxes[1]).not.toBeChecked(); // Senior Discount
    expect(checkboxes[2]).toBeChecked(); // Holiday Special
  });

  it('should call onDiscountToggle with updated selection when checkbox clicked', async () => {
    const user = userEvent.setup();
    const onDiscountToggle = vi.fn();

    render(
      <DiscountsTable
        discounts={mockDiscounts}
        selectedDiscounts={[]}
        onDiscountToggle={onDiscountToggle}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]); // Click Student Discount

    expect(onDiscountToggle).toHaveBeenCalledTimes(1);
    expect(onDiscountToggle).toHaveBeenCalledWith(['Student Discount']);
  });

  it('should add discount to selection when unchecked discount is clicked', async () => {
    const user = userEvent.setup();
    const onDiscountToggle = vi.fn();

    render(
      <DiscountsTable
        discounts={mockDiscounts}
        selectedDiscounts={['Student Discount']}
        onDiscountToggle={onDiscountToggle}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]); // Click Senior Discount

    expect(onDiscountToggle).toHaveBeenCalledWith(['Student Discount', 'Senior Discount']);
  });

  it('should remove discount from selection when checked discount is clicked', async () => {
    const user = userEvent.setup();
    const onDiscountToggle = vi.fn();

    render(
      <DiscountsTable
        discounts={mockDiscounts}
        selectedDiscounts={['Student Discount', 'Senior Discount']}
        onDiscountToggle={onDiscountToggle}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]); // Unclick Student Discount

    expect(onDiscountToggle).toHaveBeenCalledWith(['Senior Discount']);
  });

  it('should not call onDiscountToggle when in readOnly mode', () => {
    const onDiscountToggle = vi.fn();

    render(
      <DiscountsTable
        discounts={mockDiscounts}
        selectedDiscounts={[]}
        onDiscountToggle={onDiscountToggle}
        readOnly={true}
      />
    );

    // Verify checkboxes are disabled, which prevents interaction
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeDisabled();
    expect(onDiscountToggle).not.toHaveBeenCalled();
  });

  it('should disable checkboxes in readOnly mode', () => {
    render(
      <DiscountsTable
        discounts={mockDiscounts}
        selectedDiscounts={['Student Discount']}
        onDiscountToggle={vi.fn()}
        readOnly={true}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeDisabled();
    });
  });

  it('should handle empty discounts array gracefully', () => {
    const { container } = render(
      <DiscountsTable
        discounts={[]}
        selectedDiscounts={[]}
        onDiscountToggle={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should handle undefined discounts prop', () => {
    const { container } = render(
      <DiscountsTable
        discounts={undefined}
        selectedDiscounts={[]}
        onDiscountToggle={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should handle undefined selectedDiscounts prop', () => {
    render(
      <DiscountsTable
        discounts={mockDiscounts}
        selectedDiscounts={undefined}
        onDiscountToggle={vi.fn()}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      expect(checkbox).not.toBeChecked();
    });
  });

  it('should maintain checkbox state consistency with selectedDiscounts prop', () => {
    const { rerender } = render(
      <DiscountsTable
        discounts={mockDiscounts}
        selectedDiscounts={[]}
        onDiscountToggle={vi.fn()}
      />
    );

    let checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).not.toBeChecked();

    // Update selectedDiscounts prop
    rerender(
      <DiscountsTable
        discounts={mockDiscounts}
        selectedDiscounts={['Student Discount']}
        onDiscountToggle={vi.fn()}
      />
    );

    checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked();
  });

  it('should show "(View Only)" text when in readOnly mode', () => {
    render(
      <DiscountsTable
        discounts={mockDiscounts}
        selectedDiscounts={[]}
        onDiscountToggle={vi.fn()}
        readOnly={true}
      />
    );

    expect(screen.getByText(/View Only/i)).toBeInTheDocument();
  });
});
