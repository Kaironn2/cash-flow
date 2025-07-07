import { render, screen, fireEvent } from '@testing-library/react';
import { ExpenseCard } from '../ExpenseCard';

const fakeExpense = {
  id: 1,
  name: 'Expense Test',
  amount: 100,
  due_date: new Date().toISOString(),
  paid: false,
  category: { name: 'Category' },
  is_recurring: false,
  is_installment: false,
};

describe('ExpenseCard', () => {
  it('render basic infos', () => {
    render(
      <ExpenseCard
        expense={fakeExpense}
        checked={false}
        onToggle={() => {}}
      />
    );

    expect(screen.getByText('Expense Test')).toBeInTheDocument();
    expect(screen.getByText(/Category/)).toBeInTheDocument();
    expect(screen.getByText(/R\$ *100,00/)).toBeInTheDocument();
  });

  it('call onToggle on checkbox click', () => {
    const toggleMock = jest.fn();
    render(
      <ExpenseCard expense={fakeExpense} checked={false} onToggle={toggleMock} />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(toggleMock).toHaveBeenCalledTimes(1);
  });
});
