import React, { useEffect } from 'react';
import Button from './Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, title, message }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="max-w-sm w-full p-8 rounded-xl bg-gray-900 border border-gray-700 shadow-2xl animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-center mb-4 text-yellow-400 font-serif">{title}</h2>
        <p className="text-center text-gray-300 mb-8">{message}</p>
        <div className="flex justify-center gap-4">
          <Button onClick={onClose} variant="secondary" className="w-full">
            Hủy bỏ
          </Button>
          <Button onClick={onConfirm} variant="danger" className="w-full">
            Xác nhận
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;