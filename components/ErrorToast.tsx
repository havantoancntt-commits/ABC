import React, { useEffect, useState } from 'react';

interface Props {
  message: string | null;
  onClose: () => void;
}

const ErrorToast: React.FC<Props> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        handleClose();
      }, 7000); // Auto-dismiss after 7 seconds

      return () => clearTimeout(timer);
    }
  }, [message]);
  
  const handleClose = () => {
      setIsVisible(false);
      // Allow animation to finish before calling onClose
      setTimeout(() => {
          onClose();
      }, 300);
  }

  if (!message) return null;

  return (
    <div 
        className={`fixed top-5 right-5 z-50 transition-all duration-300 ease-in-out ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
        role="alert"
        aria-live="assertive"
    >
        <div className="max-w-md w-full p-4 rounded-xl bg-red-900/80 backdrop-blur-lg border border-red-600/50 shadow-2xl shadow-black/50 flex items-start gap-4">
            <div className="flex-shrink-0 text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="flex-grow text-red-200 text-sm font-semibold">{message}</p>
            <button onClick={handleClose} className="flex-shrink-0 text-red-300 hover:text-white transition-colors" aria-label="Close error message">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    </div>
  );
};

export default ErrorToast;
