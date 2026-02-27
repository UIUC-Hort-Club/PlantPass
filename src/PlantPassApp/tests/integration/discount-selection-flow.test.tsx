import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import OrderEntry from '../../src/components/core/OrderEntry';
import { NotificationProvider } from '../../src/contexts/NotificationContext';
import { FeatureToggleProvider } from '../../src/contexts/FeatureToggleContext';
import * as productsApi from '../../src/api/products_interface/getAllProducts';
import * as discountsApi from '../../src/api/discounts_interface/getAllDiscounts';

// Mock API modules
vi.mock('../../src/api/products_interface/getAllProducts');
vi.mock('../../src/api/discounts_interface/getAllDiscounts');
vi.mock('../../src/api/transaction_interface/createTransaction');
vi.mock('../../src/api/transaction_interface/updateTransaction');

const mockProducts = [
  { SKU: 'PLANT-001', Name: 'Monstera', Price: 25.99, Category: 'Plants', item: 'Monstera', price_ea: 25.99 },
  { SKU: 'PLANT-002', Name: 'Pothos', Price: 15.99, Category: 'Plants', item: 'Pothos', price_ea: 15.99 },
];

const mockDiscounts = [
  { name: 'Student Discount', type: 'percent' as const, value: 10, sort_order: 1 },
  { name: 'Senior Discount', type: 'percent' as const, value: 15, sort_order: 2 },
  { name: 'Holiday Special', type: 'dollar' as const, value: 5, sort_order: 3 },
];

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <NotificationProvider>
      <FeatureToggleProvider>
        {component}
      </FeatureToggleProvider>
    </NotificationProvider>
  );
};

describe('Discount Selection Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productsApi.getAllProducts).mockResolvedValue(mockProducts);
    vi.mocked(discountsApi.getAllDiscounts).mockResolvedValue(mockDiscounts);
  });

  it('should maintain checkbox state when selecting and deselecting discounts', async () => {
    const user = userEvent.setup();
    renderWithProviders(<OrderEntry />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Student Discount')).toBeInTheDocument();
    });

    // Get all checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    const studentCheckbox = checkboxes[0];
    const seniorCheckbox = checkboxes[1];
    const holidayCheckbox = checkboxes[2];

    // Initially all should be unchecked
    expect(studentCheckbox).not.toBeChecked();
    expect(seniorCheckbox).not.toBeChecked();
    expect(holidayCheckbox).not.toBeChecked();

    // Select Student Discount
    await user.click(studentCheckbox);
    expect(studentCheckbox).toBeChecked();
    expect(seniorCheckbox).not.toBeChecked();
    expect(holidayCheckbox).not.toBeChecked();

    // Select Holiday Special
    await user.click(holidayCheckbox);
    expect(studentCheckbox).toBeChecked();
    expect(seniorCheckbox).not.toBeChecked();
    expect(holidayCheckbox).toBeChecked();

    // Deselect Student Discount
    await user.click(studentCheckbox);
    expect(studentCheckbox).not.toBeChecked();
    expect(seniorCheckbox).not.toBeChecked();
    expect(holidayCheckbox).toBeChecked();

    // Select all discounts
    await user.click(studentCheckbox);
    await user.click(seniorCheckbox);
    expect(studentCheckbox).toBeChecked();
    expect(seniorCheckbox).toBeChecked();
    expect(holidayCheckbox).toBeChecked();
  });

  it('should maintain checkbox visual state after multiple selections', async () => {
    const user = userEvent.setup();
    renderWithProviders(<OrderEntry />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Student Discount')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');

    // Perform multiple selection operations
    await user.click(checkboxes[0]); // Select Student
    await user.click(checkboxes[1]); // Select Senior
    await user.click(checkboxes[0]); // Deselect Student
    await user.click(checkboxes[2]); // Select Holiday
    await user.click(checkboxes[1]); // Deselect Senior

    // Final state: only Holiday should be checked
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).toBeChecked();
  });

  it('should handle rapid checkbox toggling correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<OrderEntry />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Student Discount')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    const studentCheckbox = checkboxes[0];

    // Rapidly toggle the same checkbox
    await user.click(studentCheckbox);
    expect(studentCheckbox).toBeChecked();

    await user.click(studentCheckbox);
    expect(studentCheckbox).not.toBeChecked();

    await user.click(studentCheckbox);
    expect(studentCheckbox).toBeChecked();

    await user.click(studentCheckbox);
    expect(studentCheckbox).not.toBeChecked();
  });

  it('should correctly reflect checkbox state across component re-renders', async () => {
    const user = userEvent.setup();
    renderWithProviders(<OrderEntry />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Student Discount')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');

    // Select multiple discounts
    await user.click(checkboxes[0]); // Student
    await user.click(checkboxes[2]); // Holiday

    // Verify state persists
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).toBeChecked();

    // Interact with other parts of the form to trigger re-renders
    const quantityInputs = screen.getAllByRole('spinbutton');
    await user.clear(quantityInputs[0]);
    await user.type(quantityInputs[0], '5');

    // Checkbox state should still be maintained
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).toBeChecked();
  });

  it('should handle selecting all discounts and then deselecting all', async () => {
    const user = userEvent.setup();
    renderWithProviders(<OrderEntry />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Student Discount')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');

    // Select all
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);
    await user.click(checkboxes[2]);

    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();
    expect(checkboxes[2]).toBeChecked();

    // Deselect all
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);
    await user.click(checkboxes[2]);

    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).not.toBeChecked();
  });
});
