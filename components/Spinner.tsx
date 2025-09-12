import React, { useState, useEffect } from 'react';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';
import type { TranslationKey } from '../hooks/useLocalization';

interface Props {
  initialMessageKey: TranslationKey;
}

const ThemedSpinner: React.FC = () => (
    <div className="relative w-20 h-20 mb-6">
        <style>{`
            @keyframes spin-orbit { to { transform: rotate(360deg); } }
            @keyframes pulse-star { 50% { transform: scale(0.8); } }
            .orbit { animation: spin-orbit 4s linear infinite; }
            .orbit-reverse { animation: spin-orbit 6s linear infinite reverse; }
            .star { animation: pulse-star 2s infinite ease-in-out; }
        `}</style>
        <div className="absolute inset-0 border-2 border-yellow-500/30 rounded-full orbit">
            <div className="absolute top-1/2 -left-1 w-2.5 h-2.5 bg-[var(--color-primary)] rounded-full transform -translate-y-1/2"></div>
        </div>
        <div className="absolute inset-2 border-2 border-fuchsia-500/30 rounded-full orbit-reverse">
            <div className="absolute -top-1 right-1/2 w-2 h-2 bg-[var(--color-secondary)] rounded-full transform translate-x-1/2"></div>
        </div>
        <div className="absolute inset-5 flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full star shadow-[0_0_10px_white]"></div>
        </div>
    </div>
);


const Spinner: React.FC<Props> = ({ initialMessageKey }) => {
  const { t, language } = useLocalization();
  const [currentMessage, setCurrentMessage] = useState(t(initialMessageKey));

  useEffect(() => {
    const spinnerMessageKeys: TranslationKey[] = [
        'spinnerMsg1', 'spinnerMsg2', 'spinnerMsg3', 'spinnerMsg4', 'spinnerMsg5'
    ];
    
    // Set initial message right away
    setCurrentMessage(t(initialMessageKey));

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * spinnerMessageKeys.length);
      setCurrentMessage(t(spinnerMessageKeys[randomIndex]));
    }, 3500);

    return () => clearInterval(interval);
  }, [initialMessageKey, language, t]);


  return (
    <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="max-w-2xl text-center flex flex-col items-center">
            <ThemedSpinner />
            <h2 className="text-2xl font-bold font-serif mb-2">{t('processing')}</h2>
            <p className="text-gray-300 transition-opacity duration-500" key={currentMessage}>{currentMessage}</p>
        </Card>
    </div>
  );
};

export default Spinner;