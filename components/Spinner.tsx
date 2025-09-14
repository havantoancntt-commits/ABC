import React, { useState, useEffect } from 'react';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';
import type { TranslationKey } from '../hooks/useLocalization';

interface Props {
  initialMessageKey: TranslationKey;
}

const ThemedSpinner: React.FC = () => (
    <div className="w-20 h-20 mb-6" aria-label="Loading content">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <style>{`
                .yin-yang-path { animation: spin 2.5s linear infinite; transform-origin: center; }
                .yin-dot { animation: pulse-light 2.5s infinite ease-in-out; }
                .yang-dot { animation: pulse-dark 2.5s infinite ease-in-out; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse-light { 50% { fill: var(--color-primary); r: 8; } }
                @keyframes pulse-dark { 50% { fill: var(--color-background); r: 8; } }
            `}</style>
            <defs>
                <linearGradient id="yin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2c2a4a" />
                    <stop offset="100%" stopColor="#0c0a1a" />
                </linearGradient>
                    <linearGradient id="yang-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f0e6ff" />
                    <stop offset="100%" stopColor="#eae6ff" />
                </linearGradient>
            </defs>
            <g className="yin-yang-path">
                <path d="M50,0 A50,50 0 0,0 50,100 Z" fill="url(#yin-grad)" />
                <path d="M50,0 A50,50 0 0,1 50,100 Z" fill="url(#yang-grad)" />
                <circle cx="50" cy="25" r="25" fill="url(#yin-grad)" />
                <circle cx="50" cy="75" r="25" fill="url(#yang-grad)" />
                <circle cx="50" cy="25" r="6" fill="var(--color-text-primary)" className="yang-dot" />
                <circle cx="50" cy="75" r="6" fill="#3c3a5a" className="yin-dot" />
            </g>
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