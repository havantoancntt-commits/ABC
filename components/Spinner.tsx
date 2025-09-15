import React, { useState, useEffect } from 'react';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';
import type { TranslationKey } from '../hooks/useLocalization';

interface Props {
  initialMessageKey: TranslationKey;
}

const ThemedSpinner: React.FC = () => (
    <div className="w-24 h-24 mb-6" aria-label="Loading content">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="spinner-grad" gradientTransform="rotate(45)">
                    <stop offset="0%" stopColor="var(--color-primary)" />
                    <stop offset="100%" stopColor="var(--color-secondary)" />
                </linearGradient>
                <filter id="spinner-glow">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <g filter="url(#spinner-glow)" style={{ transformOrigin: '50% 50%' }}>
                <path d="M 50,50 m -45,0 a 45,45 0 1,0 90,0 a 45,45 0 1,0 -90,0" fill="none" stroke="var(--color-card-border)" strokeWidth="2"/>
                <path d="M 50,50 m -35,0 a 35,35 0 1,0 70,0 a 35,35 0 1,0 -70,0" fill="none" stroke="url(#spinner-grad)" strokeWidth="3" strokeDasharray="100 220"
                    style={{ animation: 'spin 2s linear infinite' }} />
                <circle cx="50" cy="15" r="3" fill="url(#spinner-grad)" style={{ animation: 'spin 2s linear infinite' }}/>
                
                <g style={{ animation: 'spin-reverse 10s linear infinite', transformOrigin: '50% 50%' }}>
                    <circle cx="50" cy="50" r="10" fill="none" stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="2 4" />
                    <text x="50" y="55" textAnchor="middle" fontSize="12" fill="var(--color-primary)" className="font-serif">☯</text>
                </g>
            </g>
             <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
            `}</style>
        </svg>
    </div>
);


const Spinner: React.FC<Props> = ({ initialMessageKey }) => {
  const { t, language } = useLocalization();
  const [currentMessage, setCurrentMessage] = useState(t(initialMessageKey));

  useEffect(() => {
    const spinnerMessageKeys: TranslationKey[] = [
        'spinnerMsg1', 'spinnerMsg2', 'spinnerMsg3', 'spinnerMsg4', 'spinnerMsg5'
    ];
    
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