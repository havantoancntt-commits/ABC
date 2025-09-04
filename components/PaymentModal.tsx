import React from 'react';
import DonationInfo from './DonationInfo';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentModalContent: React.FC<{onClose: () => void}> = ({ onClose }) => {
    return (
        <div 
            className="max-w-md w-full p-8 rounded-xl text-center bg-gradient-to-br from-[#a06b3e] to-[#6b4728] border-4 border-double border-[#f0c040] shadow-[0_15px_30px_rgba(0,0,0,0.6),_inset_0_0_20px_rgba(0,0,0,0.8)] relative"
            onClick={e => e.stopPropagation()}
        >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-4 bg-gradient-to-b from-[#4a2f16] to-[#6b4728] rounded-t-md border-t-2 border-x-2 border-[#f0c040]"></div>
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-28 h-2 bg-gradient-to-b from-black to-[#333] rounded-sm border-2 border-[#b8860b]"></div>

            <h2 className="text-3xl font-bold text-center mt-4 mb-3 text-yellow-300 font-serif">Tùy Hỷ Công Đức</h2>
            <p className="text-center text-amber-100 mb-6 text-sm">
            Sự ủng hộ của bạn, dù lớn hay nhỏ, đều là nguồn động viên quý báu để Huyền Phong Phật Đạo tiếp tục gieo duyên lành tri thức.
            </p>

            <DonationInfo />

            <div className="mt-8">
            <button 
                onClick={onClose} 
                className="w-full bg-black/30 text-amber-100 font-bold py-3 px-6 rounded-lg hover:bg-black/50 transition-all duration-300 border border-yellow-400/30"
            >
                Đóng
            </button>
            </div>
      </div>
    );
};


const DonationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity p-4"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
        <PaymentModalContent onClose={onClose} />
    </div>
  );
};

export default DonationModal;
