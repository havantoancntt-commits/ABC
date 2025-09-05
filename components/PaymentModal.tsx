import React, { useEffect } from 'react';
import DonationInfo from './DonationInfo';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DonationModal: React.FC<Props> = ({ isOpen, onClose }) => {
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
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity p-4 animate-fade-in"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
        <div 
            className="max-w-md w-full p-8 rounded-xl bg-gray-900/70 backdrop-blur-lg border border-yellow-400/30 shadow-2xl shadow-black/50"
            onClick={e => e.stopPropagation()}
        >
            <h2 className="text-3xl font-bold text-center mb-3 text-yellow-300 font-serif">Tùy Hỷ Công Đức</h2>
            <p className="text-center text-amber-100 mb-6 text-sm">
            Sự ủng hộ của bạn, dù lớn hay nhỏ, đều là nguồn động viên quý báu để Huyền Phong Phật Đạo tiếp tục gieo duyên lành tri thức.
            </p>

            <DonationInfo variant="modal" />

            <div className="mt-8">
            <button 
                onClick={onClose} 
                className="w-full bg-black/30 text-amber-100 font-bold py-3 px-6 rounded-lg hover:bg-black/50 transition-all duration-300 border border-yellow-400/30"
            >
                Đóng
            </button>
            </div>
      </div>
    </div>
  );
};

export default DonationModal;