import { render, screen, fireEvent } from '@testing-library/react';
import { ExpenseFilters } from '../ExpenseFilters';

describe('ExpenseFilters', () => {
  const availableMonths = [
    { month: 1, year: 2023 },
    { month: 2, year: 2023 },
    { month: 3, year: 2024 },
  ];

  it('renders month and year selects with correct options', () => {
    render(
      <ExpenseFilters
        selectedMonth={1}
        selectedYear={2023}
        onMonthChange={() => {}}
        onYearChange={() => {}}
        availableMonths={availableMonths}
      />
    );

    expect(screen.getByText('Janeiro')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
  });

  it('calls onMonthChange when a month is selected', () => {
    const onMonthChange = jest.fn();
    render(
      <ExpenseFilters
        selectedMonth={1}
        selectedYear={2023}
        onMonthChange={onMonthChange}
        onYearChange={() => {}}
        availableMonths={availableMonths}
      />
    );

    fireEvent.click(screen.getByText('Janeiro'));

    fireEvent.click(screen.getByText('Fevereiro'));

    expect(onMonthChange).toHaveBeenCalledWith(2);
  });

  it('calls onYearChange when a year is selected', () => {
    const onYearChange = jest.fn();
    render(
      <ExpenseFilters
        selectedMonth={1}
        selectedYear={2023}
        onMonthChange={() => {}}
        onYearChange={onYearChange}
        availableMonths={availableMonths}
      />
    );

    fireEvent.click(screen.getByText('2023'));

    fireEvent.click(screen.getByText('2024'));

    expect(onYearChange).toHaveBeenCalledWith(2024);
  });
});
