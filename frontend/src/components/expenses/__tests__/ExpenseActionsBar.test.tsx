import { render, screen, fireEvent } from '@testing-library/react';
import { ExpenseActionsBar } from '../ExpenseActionsBar';

describe('ExpenseActionsBar', () => {
  it('renders all buttons', () => {
    render(
      <ExpenseActionsBar
        onMarkPaid={() => {}}
        onUnmarkPaid={() => {}}
        onDeleteClick={() => {}}
      />
    );

    expect(screen.getByText('Marcar como Pago')).toBeInTheDocument();
    expect(screen.getByText('Remover Pagamento')).toBeInTheDocument();
    expect(screen.getByText('Excluir')).toBeInTheDocument();
  });

  it('calls onMarkPaid when "Marcar como Pago" button is clicked', () => {
    const onMarkPaid = jest.fn();
    render(
      <ExpenseActionsBar
        onMarkPaid={onMarkPaid}
        onUnmarkPaid={() => {}}
        onDeleteClick={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Marcar como Pago'));
    expect(onMarkPaid).toHaveBeenCalledTimes(1);
  });

  it('calls onUnmarkPaid when "Remover Pagamento" button is clicked', () => {
    const onUnmarkPaid = jest.fn();
    render(
      <ExpenseActionsBar
        onMarkPaid={() => {}}
        onUnmarkPaid={onUnmarkPaid}
        onDeleteClick={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Remover Pagamento'));
    expect(onUnmarkPaid).toHaveBeenCalledTimes(1);
  });

  it('calls onDeleteClick when "Excluir" button is clicked', () => {
    const onDeleteClick = jest.fn();
    render(
      <ExpenseActionsBar
        onMarkPaid={() => {}}
        onUnmarkPaid={() => {}}
        onDeleteClick={onDeleteClick}
      />
    );

    fireEvent.click(screen.getByText('Excluir'));
    expect(onDeleteClick).toHaveBeenCalledTimes(1);
  });
});
