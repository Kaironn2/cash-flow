import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteModal } from '../DeleteModal';

describe('DeleteModal', () => {
  it('renders when isOpen is true', () => {
    render(
      <DeleteModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        selectedCount={2}
      />,
    );

    expect(screen.getByText('Confirmar exclusão')).toBeInTheDocument();
    expect(
      screen.getByText(/Tem certeza que deseja excluir 2 despesas\?/),
    ).toBeInTheDocument();
  });

  it('calls onClose when clicking outside the modal', () => {
    const onClose = jest.fn();
    render(
      <DeleteModal
        isOpen={true}
        onClose={onClose}
        onConfirm={() => {}}
        selectedCount={1}
      />,
    );

    const modalContent = screen.getByTestId('modal-content');
    modalContent.getBoundingClientRect = jest.fn(() => ({
      left: 100,
      right: 200,
      top: 100,
      bottom: 200,
      width: 100,
      height: 100,
      x: 100,
      y: 100,
      toJSON: () => {},
    }));

    const backdrop = screen.getByTestId('modal-backdrop');

    fireEvent.click(backdrop, { clientX: 50, clientY: 50 });

    expect(onClose).toHaveBeenCalled();
  });

  it('doesnt call onClose when clicking inside the modal', () => {
    const onClose = jest.fn();
    render(
      <DeleteModal
        isOpen={true}
        onClose={onClose}
        onConfirm={() => {}}
        selectedCount={1}
      />,
    );

    fireEvent.click(screen.getByTestId('modal-content'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when clicking the "Cancelar" button', () => {
    const onClose = jest.fn();
    render(
      <DeleteModal
        isOpen={true}
        onClose={onClose}
        onConfirm={() => {}}
        selectedCount={1}
      />,
    );

    fireEvent.click(screen.getByText('Cancelar'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onConfirm and onClose when clicking the "Excluir" button', () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    render(
      <DeleteModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        selectedCount={1}
      />,
    );

    fireEvent.click(screen.getByText('Excluir'));
    expect(onConfirm).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
