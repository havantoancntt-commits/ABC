import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Card from './Card';
import Button from './Button';
import Spinner from './Spinner';
import { useLocalization } from '../hooks/useLocalization';
import type { TranslationKey } from '../hooks/useLocalization';
import { analyzeFingerprint } from '../lib/gemini';

interface Props {
  onAnalyze: (counts: { leftHandWhorls: number, rightHandWhorls: number }) => void;
  onBack: () => void;
}

const FINGER_DATA: { hand: 'left' | 'right'; nameKey: TranslationKey }[] = [
    { hand: 'left', nameKey: 'fingerLeftThumb' }, { hand: 'left', nameKey: 'fingerLeftIndex' },
    { hand: 'left', nameKey: 'fingerLeftMiddle' }, { hand: 'left', nameKey: 'fingerLeftRing' },
    { hand: 'left', nameKey: 'fingerLeftPinky' }, { hand: 'right', nameKey: 'fingerRightThumb' },
    { hand: 'right', nameKey: 'fingerRightIndex' }, { hand: 'right', nameKey: 'fingerRightMiddle' },
    { hand: 'right', nameKey: 'fingerRightRing' }, { hand: 'right', nameKey: 'fingerRightPinky' },
];

const HandSVG: React.FC<{ side: 'left' | 'right', fingerprints: ('whorl' | 'loop' | null)[], currentIndex: number }> = React.memo(({ side, fingerprints, currentIndex }) => {
    const startIndex = side === 'left' ? 0 : 5;
    const fingerPositions = [
        { cx: "85", cy: "60" }, { cx: "65", cy: "35" }, { cx: "45", cy: "30" }, { cx: "25", cy: "45" }, { cx: "15", cy: "75" }
    ];

    return (
        <svg viewBox={side === 'left' ? "0 0 100 120" : "-10 0 110 120"} className="w-full h-auto text-rose-400/20 drop-shadow-lg">
            <path transform={side === 'right' ? 'scale(-1, 1) translate(-100, 0)' : ''} stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" d="M 70,60 C 70,90 60,115 50,118 C 40,121 20,110 20,90 L 20,60 C 20,45 25,38 35,38 C 45,38 50,48 50,58 L 50,48 C 50,38 55,28 65,28 C 75,28 80,38 80,48 L 80,65 C 80,75 75,80 70,80 L 70,60" />
            {fingerPositions.map((pos, i) => {
                const index = startIndex + i;
                const isActive = currentIndex === index;
                const pattern = fingerprints[index];
                return (
                    <g key={index} transform={side === 'right' ? `translate(${pos.cx}, ${pos.cy}) scale(-1, 1)` : `translate(${pos.cx}, ${pos.cy})`}>
                        <circle r="12" fill={isActive ? "rgba(251, 113, 133, 0.2)" : "rgba(31, 41, 55, 0.5)"} stroke={isActive ? "#fb7185" : "#4b5563"} strokeWidth="2" className={`transition-all duration-300 ${isActive ? 'animate-pulse' : ''}`} />
                        {pattern && <text fontSize="18" textAnchor="middle" dominantBaseline="central" fill="#fff">{pattern === 'whorl' ? '🌀' : '💧'}</text>}
                    </g>
                );
            })}
        </svg>
    );
});


const HoaTayScan: React.FC<Props> = ({ onAnalyze, onBack }) => {
    const { t, language } = useLocalization();
    const [fingerprints, setFingerprints] = useState<( 'whorl' | 'loop' | null)[]>(Array(10).fill(null));
    const [currentFingerIndex, setCurrentFingerIndex] = useState(0);
    const [status, setStatus] = useState<'idle'|'camera_starting'|'ready'|'scanning'|'analyzing'|'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const leftHandWhorls = useMemo(() => fingerprints.slice(0, 5).filter(f => f === 'whorl').length, [fingerprints]);
    const rightHandWhorls = useMemo(() => fingerprints.slice(5, 10).filter(f => f === 'whorl').length, [fingerprints]);
    const isComplete = currentFingerIndex >= 10;
    
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    const startCamera = useCallback(async () => {
        if (streamRef.current) stopCamera();
        setStatus('camera_starting');
        setErrorMessage('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setStatus('ready');
        } catch (err) {
            console.error("Camera error:", err);
            setStatus('error');
            setErrorMessage(t('errorCameraPermission'));
        }
    }, [stopCamera, t]);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [startCamera, stopCamera]);


    const handleScan = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current) return;
        setStatus('scanning');
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        setTimeout(async () => { // Allow shutter animation to play
            if (context) {
                canvas.width = video.videoWidth / 2;
                canvas.height = video.videoHeight / 2;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const base64Image = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
                
                setStatus('analyzing');
                try {
                    const result = await analyzeFingerprint(base64Image, language);
                    const newFingerprints = [...fingerprints];
                    newFingerprints[currentFingerIndex] = result.pattern;
                    setFingerprints(newFingerprints);
                    setCurrentFingerIndex(i => i + 1);
                    setStatus('ready');
                } catch (err) {
                    console.error("Analysis error:", err);
                    setStatus('error');
                    setErrorMessage(t('hoaTayScanError'));
                }
            }
        }, 300);
    }, [currentFingerIndex, fingerprints, language, t]);
    
    const handleReset = () => {
        setFingerprints(Array(10).fill(null));
        setCurrentFingerIndex(0);
        setStatus('ready');
        setErrorMessage('');
    };

    const currentFingerName = isComplete ? '' : t(FINGER_DATA[currentFingerIndex].nameKey);

    return (
        <Card className="max-w-4xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl font-bold text-center mb-2 text-rose-400 font-serif">{t('hoaTayScanAutoTitle')}</h2>
            <p className="text-center text-gray-400 mb-6 max-w-lg min-h-[48px]">
                {isComplete ? t('hoaTayAllFingersScanned') : t('hoaTayPlaceFingerPrompt', { fingerName: currentFingerName })}
                {status === 'ready' && !isComplete && <span className="block text-sm">{t('hoaTayHoldSteady')}</span>}
            </p>

            <div className="w-full relative aspect-video max-w-xl bg-gray-950 rounded-lg overflow-hidden border-2 border-gray-700 mb-6">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-32 h-48 border-4 border-white/50 rounded-2xl" style={{boxShadow: '0 0 0 2000px rgba(0,0,0,0.7)'}}></div>
                </div>
                {status === 'scanning' && <div className="absolute inset-0 bg-white animate-shutter-flash" />}
                {(status === 'camera_starting' || status === 'analyzing') && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <Spinner initialMessageKey={status === 'analyzing' ? 'hoaTayAnalyzingFinger' : 'spinnerCamera'}/>
                    </div>
                )}
                 {status === 'error' && (
                     <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4">
                        <p className="text-red-400 text-center font-semibold mb-4">{errorMessage}</p>
                        <Button onClick={startCamera} variant="secondary">{t('hoaTayRedo')}</Button>
                    </div>
                 )}
            </div>

            <div className="w-full flex justify-center items-start gap-4 sm:gap-8 mb-6 h-32 sm:h-40">
                <div className="w-32 sm:w-40"><HandSVG side="left" fingerprints={fingerprints} currentIndex={currentFingerIndex} /></div>
                <div className="w-32 sm:w-40"><HandSVG side="right" fingerprints={fingerprints} currentIndex={currentFingerIndex} /></div>
            </div>
            
            <div className="w-full max-w-md">
                {isComplete ? (
                    <Button onClick={() => onAnalyze({ leftHandWhorls, rightHandWhorls })} variant="hoatay" size="lg" className="w-full animate-pulse-button">{t('hoaTayAnalyzePersonalityButton')}</Button>
                ) : (
                    <Button onClick={handleScan} variant="primary" size="lg" className="w-full" disabled={status !== 'ready'}>{t('hoaTayScanButton')}</Button>
                )}
                <div className="mt-4 flex justify-between">
                     <Button onClick={onBack} variant="secondary">{t('back')}</Button>
                     <Button onClick={handleReset} variant="secondary">{t('hoaTayReset')}</Button>
                </div>
            </div>
        </Card>
    );
};

export default HoaTayScan;