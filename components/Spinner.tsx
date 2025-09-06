import React from 'react';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
  message: string;
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
            <div className="absolute top-1/2 -left-1 w-2.5 h-2.5 bg-yellow-400 rounded-full transform -translate-y-1/2"></div>
        </div>
        <div className="absolute inset-2 border-2 border-fuchsia-500/30 rounded-full orbit-reverse">
            <div className="absolute -top-1 right-1/2 w-2 h-2 bg-fuchsia-400 rounded-full transform translate-x-1/2"></div>
        </div>
        <div className="absolute inset-5 flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full star shadow-[0_0_10px_white]"></div>
        </div>
    </div>
);


const Spinner: React.FC<Props> = ({ message }) => {
  const { t } = useLocalization();
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="max-w-2xl text-center flex flex-col items-center">
            <ThemedSpinner />
            <h2 className="text-2xl font-bold font-serif mb-2">{t('processing')}</h2>
            <p className="text-gray-300">{message}</p>
        </Card>
    </div>
  );
};

export default Spinner;