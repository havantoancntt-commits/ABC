import React, { useState, useMemo } from 'react';
import Card from './Card';
import Button from './Button';
import { useLocalization } from '../hooks/useLocalization';
import type { TranslationKey } from '../hooks/useLocalization';

interface Props {
  onAnalyze: (counts: { leftHandWhorls: number, rightHandWhorls: number }) => void;
  onBack: () => void;
}

const FINGER_DATA: { hand: 'left' | 'right'; nameKey: TranslationKey; position: React.CSSProperties }[] = [
    { hand: 'left', nameKey: 'fingerLeftThumb', position: { top: '65%', right: '0%' } },
    { hand: 'left', nameKey: 'fingerLeftIndex', position: { top: '30%', right: '32%' } },
    { hand: 'left', nameKey: 'fingerLeftMiddle', position: { top: '18%', right: '58%' } },
    { hand: 'left', nameKey: 'fingerLeftRing', position: { top: '28%', right: '82%' } },
    { hand: 'left', nameKey: 'fingerLeftPinky', position: { top: '48%', right: '100%' } },
    { hand: 'right', nameKey: 'fingerRightThumb', position: { top: '65%', left: '0%' } },
    { hand: 'right', nameKey: 'fingerRightIndex', position: { top: '30%', left: '32%' } },
    { hand: 'right', nameKey: 'fingerRightMiddle', position: { top: '18%', left: '58%' } },
    { hand: 'right', nameKey: 'fingerRightRing', position: { top: '28%', left: '82%' } },
    { hand: 'right', nameKey: 'fingerRightPinky', position: { top: '48%', left: '100%' } },
];

const HandSVG: React.FC<{ side: 'left' | 'right' }> = React.memo(({ side }) => (
    <svg viewBox={side === 'left' ? "-5 0 110 160" : "0 0 110 160"} className={`w-full h-full text-rose-400/20 transition-opacity duration-500`}>
        <path 
            transform={side === 'right' ? 'scale(-1, 1) translate(-100, 0)' : ''}
            stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"
            d="M 60,100 C 60,120 50,150 40,155 C 30,160 10,140 10,120 L 10,80 C 10,60 15,50 25,50 C 35,50 40,60 40,70 L 40,60 C 40,50 45,40 55,40 C 65,40 70,50 70,60 L 70,55 C 70,45 75,35 85,35 C 95,35 100,45 100,55 L 100,80 C 100,90 95,100 85,100 L 60,100"
        />
    </svg>
));

const HoaTayScan: React.FC<Props> = ({ onAnalyze, onBack }) => {
    const { t } = useLocalization();
    const [fingerprints, setFingerprints] = useState<( 'whorl' | 'loop' | null)[]>(Array(10).fill(null));
    const [currentFingerIndex, setCurrentFingerIndex] = useState(0);

    const leftHandWhorls = useMemo(() => fingerprints.slice(0, 5).filter(f => f === 'whorl').length, [fingerprints]);
    const rightHandWhorls = useMemo(() => fingerprints.slice(5, 10).filter(f => f === 'whorl').length, [fingerprints]);
    const totalWhorls = leftHandWhorls + rightHandWhorls;

    const handleSelect = (type: 'whorl' | 'loop') => {
        const newFingerprints = [...fingerprints];
        newFingerprints[currentFingerIndex] = type;
        setFingerprints(newFingerprints);
        setCurrentFingerIndex(i => i + 1);
    };

    const handleAnalyzeClick = () => {
        onAnalyze({ leftHandWhorls, rightHandWhorls });
    };

    const handleReset = () => {
        setFingerprints(Array(10).fill(null));
        setCurrentFingerIndex(0);
    };
    
    const currentFingerData = FINGER_DATA[currentFingerIndex];
    const isLeftHandActive = currentFingerIndex < 5;
    const isRightHandActive = currentFingerIndex >= 5 && currentFingerIndex < 10;
    
    return (
        <Card className="max-w-4xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl font-bold text-center mb-2 text-rose-400 font-serif">{t('hoaTayScanTitle')}</h2>
            <p className="text-center text-gray-400 mb-6 max-w-lg">{currentFingerIndex < 10 ? t('hoaTayScanSubtitle') : t('processing')}</p>
            
            <div className="w-full min-h-[350px] flex flex-col justify-center items-center">
                {currentFingerIndex < 10 ? (
                    <>
                        <p className="text-lg text-center text-white mb-4 h-14">
                           {t('hoaTayPrompt')} <br/>
                           <strong className="text-2xl font-serif text-rose-300">{t('hoaTayPromptFinger', { fingerName: t(currentFingerData.nameKey) })}</strong>
                        </p>
                        <div className="relative w-full max-w-xl h-64 flex justify-center items-center">
                            {/* Left Hand */}
                            <div className={`absolute w-40 h-64 top-0 left-1/2 -translate-x-[110%] transition-transform duration-500 ${isLeftHandActive ? 'scale-110' : 'scale-90 opacity-50'}`}>
                                <HandSVG side="left" />
                                 {FINGER_DATA.slice(0,5).map((finger, i) => (
                                    <div key={i} className="absolute w-6 h-6 rounded-full" style={finger.position}>
                                        {fingerprints[i] === 'whorl' && <span className="text-2xl">🌀</span>}
                                        {fingerprints[i] === 'loop' && <span className="text-2xl">💧</span>}
                                    </div>
                                ))}
                            </div>
                            {/* Right Hand */}
                             <div className={`absolute w-40 h-64 top-0 left-1/2 translate-x-[10%] transition-transform duration-500 ${isRightHandActive ? 'scale-110' : 'scale-90 opacity-50'}`}>
                                <HandSVG side="right" />
                                {FINGER_DATA.slice(5,10).map((finger, i) => (
                                    <div key={i+5} className="absolute w-6 h-6 rounded-full" style={finger.position}>
                                        {fingerprints[i+5] === 'whorl' && <span className="text-2xl">🌀</span>}
                                        {fingerprints[i+5] === 'loop' && <span className="text-2xl">💧</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 flex gap-4">
                            <Button onClick={() => handleSelect('whorl')} variant="primary" size="lg">🌀 {t('hoaTayTypeWhorl')}</Button>
                            <Button onClick={() => handleSelect('loop')} variant="secondary" size="lg">💧 {t('hoaTayTypeLoop')}</Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center animate-fade-in">
                        <h3 className="text-2xl font-bold font-serif text-rose-300 mb-4">{t('hoaTayResultSummary', { leftCount: leftHandWhorls, rightCount: rightHandWhorls, totalCount: totalWhorls })}</h3>
                        <Button onClick={handleAnalyzeClick} variant="hoatay" size="lg" className="animate-pulse-button">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            {t('hoaTayScanAnalyze')}
                        </Button>
                    </div>
                )}
            </div>
            
            <div className="mt-8 w-full flex justify-between items-center">
                 <Button onClick={onBack} variant="secondary">{t('back')}</Button>
                 {currentFingerIndex > 0 && 
                    <Button onClick={handleReset} variant="secondary">{t('hoaTayTryAgain')}</Button>
                 }
            </div>
        </Card>
    );
};

export default HoaTayScan;