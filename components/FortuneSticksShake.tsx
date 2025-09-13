import React, { useState } from 'react';
import type { FortuneStickInfo } from '../lib/types';
import { useLocalization } from '../hooks/useLocalization';
import Card from './Card';
import Button from './Button';

interface Props {
    onSubmit: (info: FortuneStickInfo) => void;
}

const FortuneStickContainer: React.FC<{ isShaking: boolean }> = ({ isShaking }) => (
    <div className={`relative w-48 h-64 transition-transform duration-300 ${isShaking ? 'animate-shake' : ''}`}>
        <style>{`
            @keyframes shake {
                0%, 100% { transform: translate(0, 0) rotate(0); }
                10%, 30%, 50%, 70%, 90% { transform: translate(-3px, 0) rotate(-2deg); }
                20%, 40%, 60%, 80% { transform: translate(3px, 0) rotate(2deg); }
            }
            .animate-shake {
                animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) 3;
            }
        `}</style>
        {/* Container Body */}
        <div className="absolute bottom-0 left-0 w-full h-[90%] bg-gradient-to-t from-red-800 to-red-600 rounded-t-3xl rounded-b-lg border-b-8 border-amber-800 shadow-inner shadow-black/50">
            <div className="absolute inset-x-0 top-0 h-8 bg-black/20 rounded-t-3xl"></div>
            <div className="absolute inset-x-2 bottom-2 h-8 bg-amber-700/50 rounded-lg"></div>
        </div>
        {/* Sticks */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[95%]">
            {Array.from({ length: 25 }).map((_, i) => (
                <div key={i}
                    className="absolute bottom-0 bg-gradient-to-t from-amber-400 to-amber-200 w-1.5 h-full rounded-t-full"
                    style={{
                        left: `${10 + i * 3.2}%`,
                        transform: `rotate(${(i - 12.5) * 2}deg) translateY(${Math.sin(i / 4) * 5}px)`,
                        height: `${90 + Math.random() * 10}%`
                    }}
                />
            ))}
        </div>
    </div>
);

const FortuneSticksShake: React.FC<Props> = ({ onSubmit }) => {
    const { t } = useLocalization();
    const [question, setQuestion] = useState('');
    const [isShaking, setIsShaking] = useState(false);

    const handleShake = () => {
        if (isShaking) return;
        setIsShaking(true);
        setTimeout(() => {
            const stickNumber = Math.floor(Math.random() * 100) + 1;
            onSubmit({ stickNumber, question });
        }, 1600); // Animation duration is 1.5s
    };

    return (
        <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-bold text-gray-100 font-serif leading-tight">{t('fortuneSticksShakeTitle')}</h2>
                <p className="mt-4 text-lg text-gray-300 leading-relaxed">{t('fortuneSticksShakeSubtitle')}</p>
            </div>
            <Card className="flex flex-col items-center">
                <div className="mb-8">
                    <FortuneStickContainer isShaking={isShaking} />
                </div>
                <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={t('fortuneSticksQuestionPlaceholder')}
                    className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all mb-6 h-28"
                    disabled={isShaking}
                />
                <Button onClick={handleShake} variant="fortune" className="w-full text-lg py-4" disabled={isShaking}>
                    {isShaking ? t('processing') : t('fortuneSticksShakeButton')}
                </Button>
            </Card>
        </div>
    );
};

export default FortuneSticksShake;
