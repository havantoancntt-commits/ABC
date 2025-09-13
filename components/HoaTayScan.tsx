import React, { useState, useMemo, useRef, useEffect } from 'react';
import Card from './Card';
import Button from './Button';
import { useLocalization } from '../hooks/useLocalization';
import type { TranslationKey } from '../hooks/useLocalization';

interface Props {
  onAnalyze: (counts: { leftHandWhorls: number, rightHandWhorls: number }) => void;
  onBack: () => void;
}

const FINGER_DATA: { hand: 'left' | 'right'; nameKey: TranslationKey; position: React.CSSProperties }[] = [
    { hand: 'left', nameKey: 'fingerLeftThumb', position: { top: '55%', left: '75%' } },
    { hand: 'left', nameKey: 'fingerLeftIndex', position: { top: '25%', left: '58%' } },
    { hand: 'left', nameKey: 'fingerLeftMiddle', position: { top: '15%', left: '40%' } },
    { hand: 'left', nameKey: 'fingerLeftRing', position: { top: '25%', left: '22%' } },
    { hand: 'left', nameKey: 'fingerLeftPinky', position: { top: '45%', left: '8%' } },
    { hand: 'right', nameKey: 'fingerRightThumb', position: { top: '55%', right: '75%' } },
    { hand: 'right', nameKey: 'fingerRightIndex', position: { top: '25%', right: '58%' } },
    { hand: 'right', nameKey: 'fingerRightMiddle', position: { top: '15%', right: '40%' } },
    { hand: 'right', nameKey: 'fingerRightRing', position: { top: '25%', right: '22%' } },
    { hand: 'right', nameKey: 'fingerRightPinky', position: { top: '45%', right: '8%' } },
];

const HandSVG: React.FC<{ side: 'left' | 'right' }> = React.memo(({ side }) => (
    <svg viewBox={"0 0 110 160"} className={`w-full h-full text-rose-400/20 transition-opacity duration-500`}>
        <path 
            transform={side === 'right' ? 'scale(-1, 1) translate(-110, 0)' : ''}
            stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"
            d="M 60,100 C 60,120 50,150 40,155 C 30,160 10,140 10,120 L 10,80 C 10,60 15,50 25,50 C 35,50 40,60 40,70 L 40,60 C 40,50 45,40 55,40 C 65,40 70,50 70,60 L 70,55 C 70,45 75,35 85,35 C 95,35 100,45 100,55 L 100,80 C 100,90 95,100 85,100 L 60,100"
        />
    </svg>
));

const ProgressBar: React.FC<{ current: number, total: number }> = ({ current, total }) => (
    <div className="w-full bg-gray-700/50 rounded-full h-2.5 mb-6">
        <div 
            className="bg-gradient-to-r from-pink-500 to-rose-500 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${(current / total) * 100}%` }}>
        </div>
    </div>
);


const HoaTayScan: React.FC<Props> = ({ onAnalyze, onBack }) => {
    const { t } = useLocalization();
    const [fingerprints, setFingerprints] = useState<( 'whorl' | 'loop' | null)[]>(Array(10).fill(null));
    const [currentFingerIndex, setCurrentFingerIndex] = useState(0);
    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'scanned'>('idle');
    const scanTimeout = useRef<number | null>(null);

    const leftHandWhorls = useMemo(() => fingerprints.slice(0, 5).filter(f => f === 'whorl').length, [fingerprints]);
    const rightHandWhorls = useMemo(() => fingerprints.slice(5, 10).filter(f => f === 'whorl').length, [fingerprints]);

    useEffect(() => {
        return () => {
            if (scanTimeout.current) clearTimeout(scanTimeout.current);
        };
    }, []);

    const handleScanStart = () => {
        if (scanStatus !== 'idle') return;
        setScanStatus('scanning');
        scanTimeout.current = window.setTimeout(() => {
            setScanStatus('scanned');
        }, 1500);
    };

    const handleSelect = (type: 'whorl' | 'loop') => {
        const newFingerprints = [...fingerprints];
        newFingerprints[currentFingerIndex] = type;
        setFingerprints(newFingerprints);
        
        if (currentFingerIndex < 9) {
            setCurrentFingerIndex(i => i + 1);
            setScanStatus('idle');
        } else {
            setCurrentFingerIndex(10);
        }
    };

    const handleAnalyzeClick = () => {
        onAnalyze({ leftHandWhorls, rightHandWhorls });
    };

    const handleReset = () => {
        setFingerprints(Array(10).fill(null));
        setCurrentFingerIndex(0);
        setScanStatus('idle');
    };
    
    const currentFingerData = FINGER_DATA[currentFingerIndex];
    
    return (
        <Card className="max-w-4xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl font-bold text-center mb-2 text-rose-400 font-serif">{t('hoaTayScanTitle')}</h2>
            <p className="text-center text-gray-400 mb-6 max-w-lg">{currentFingerIndex < 10 ? t('hoaTayScanSubtitle') : t('processing')}</p>
            
            {currentFingerIndex < 10 && <ProgressBar current={currentFingerIndex} total={10} />}

            <div className="w-full flex justify-center items-center gap-8 sm:gap-16 my-4 h-48 sm:h-64">
                {/* Left Hand */}
                <div className={`relative w-32 sm:w-40 h-full transition-all duration-500 ${currentFingerIndex < 5 ? 'opacity-100 scale-105' : 'opacity-50 scale-95'}`}>
                    <HandSVG side="left" />
                     {FINGER_DATA.slice(0,5).map((finger, i) => {
                         const isActive = currentFingerIndex === i;
                         return (
                            <div key={i} className={`absolute w-8 h-8 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${isActive ? 'finger-marker-active bg-yellow-400/30 border-2 border-yellow-400' : 'bg-gray-800/50'}`} style={finger.position}>
                                {fingerprints[i] === 'whorl' && <span className="text-2xl">🌀</span>}
                                {fingerprints[i] === 'loop' && <span className="text-2xl">💧</span>}
                            </div>
                         );
                     })}
                </div>
                 {/* Right Hand */}
                <div className={`relative w-32 sm:w-40 h-full transition-all duration-500 ${currentFingerIndex >= 5 && currentFingerIndex < 10 ? 'opacity-100 scale-105' : 'opacity-50 scale-95'}`}>
                    <HandSVG side="right" />
                     {FINGER_DATA.slice(5,10).map((finger, i) => {
                         const fullIndex = i + 5;
                         const isActive = currentFingerIndex === fullIndex;
                         return (
                            <div key={fullIndex} className={`absolute w-8 h-8 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${isActive ? 'finger-marker-active bg-yellow-400/30 border-2 border-yellow-400' : 'bg-gray-800/50'}`} style={finger.position}>
                                {fingerprints[fullIndex] === 'whorl' && <span className="text-2xl">🌀</span>}
                                {fingerprints[fullIndex] === 'loop' && <span className="text-2xl">💧</span>}
                            </div>
                         );
                     })}
                </div>
            </div>

            <div className="w-full min-h-[220px] flex flex-col justify-center items-center mt-6">
                {currentFingerIndex < 10 && (
                     <>
                        <p className="text-lg text-center text-white mb-4 h-14">
                           {scanStatus === 'idle' && t('hoaTayPlaceFinger', { fingerName: t(currentFingerData.nameKey) })}
                           {scanStatus === 'scanning' && t('hoaTayScanning')}
                           {scanStatus === 'scanned' && t('hoaTaySelectType')}
                        </p>
                        
                        {scanStatus === 'idle' && (
                            <button onClick={handleScanStart} className="relative w-40 h-40 rounded-full bg-gray-900 border-4 border-rose-500/50 animate-pulse-glow flex items-center justify-center text-rose-300/50 transition-transform hover:scale-105 active:scale-95">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                            </button>
                        )}
                        {scanStatus === 'scanning' && (
                            <div className="relative w-40 h-40 rounded-full bg-gray-900 border-4 border-rose-500/50 flex items-center justify-center overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-rose-400/50 to-transparent scanner-line-animation"></div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 text-rose-300/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                            </div>
                        )}
                        {scanStatus === 'scanned' && (
                             <div className="flex gap-4 animate-fade-in">
                                <Button onClick={() => handleSelect('whorl')} variant="primary" size="lg">🌀 {t('hoaTayTypeWhorl')}</Button>
                                <Button onClick={() => handleSelect('loop')} variant="secondary" size="lg">💧 {t('hoaTayTypeLoop')}</Button>
                            </div>
                        )}
                     </>
                )}

                {currentFingerIndex >= 10 && (
                    <div className="text-center animate-fade-in">
                        <h3 className="text-2xl font-bold font-serif text-rose-300 mb-4">{t('hoaTayResultSummary', { leftCount: leftHandWhorls, rightCount: rightHandWhorls, totalCount: leftHandWhorls + rightHandWhorls })}</h3>
                        <Button onClick={handleAnalyzeClick} variant="hoatay" size="lg" className="animate-pulse-button">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            {t('hoaTayScanAnalyze')}
                        </Button>
                    </div>
                )}
            </div>
            
            <div className="mt-8 w-full flex justify-between items-center">
                 <Button onClick={onBack} variant="secondary">{t('back')}</Button>
                 {(currentFingerIndex > 0) && 
                    <Button onClick={handleReset} variant="secondary">{t('hoaTayReset')}</Button>
                 }
            </div>
        </Card>
    );
};

export default HoaTayScan;
