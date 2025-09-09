import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import Card from './Card';
import Button from './Button';

interface Props {
    onCapture: (color: string) => void;
    onBack: () => void;
}

const ENERGY_COLORS = ['Red', 'Green', 'Blue', 'Purple', 'Yellow', 'White', 'Black'];

const BioEnergyCapture: React.FC<Props> = ({ onCapture, onBack }) => {
    const { t } = useLocalization();
    const [status, setStatus] = useState<'idle' | 'holding' | 'captured'>('idle');
    const holdTimeout = useRef<number | null>(null);

    const handleInteractionStart = () => {
        if (status !== 'idle') return;
        setStatus('holding');
        holdTimeout.current = window.setTimeout(() => {
            const randomColor = ENERGY_COLORS[Math.floor(Math.random() * ENERGY_COLORS.length)];
            setStatus('captured');
            setTimeout(() => onCapture(randomColor), 1000); // Wait for capture animation
        }, 2500); // Hold for 2.5 seconds
    };

    const handleInteractionEnd = () => {
        if (holdTimeout.current) {
            clearTimeout(holdTimeout.current);
        }
        if (status === 'holding') {
            setStatus('idle');
        }
    };

    useEffect(() => {
        return () => {
            if (holdTimeout.current) {
                clearTimeout(holdTimeout.current);
            }
        };
    }, []);

    const statusTexts: Record<typeof status, string> = {
        idle: t('bioEnergyCaptureIdle'),
        holding: t('bioEnergyCaptureHolding'),
        captured: t('bioEnergyCaptureCaptured'),
    };

    return (
        <Card className="max-w-xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl font-bold text-center mb-4 text-cyan-300 font-serif">{t('bioEnergyCaptureTitle')}</h2>
            <p className="text-center text-gray-400 mb-8 transition-opacity duration-300">{statusTexts[status]}</p>
            
            <style>{`
                @keyframes pulse-sphere {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(103, 232, 249, 0.3), 0 0 40px rgba(52, 211, 153, 0.2); }
                    50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(103, 232, 249, 0.5), 0 0 80px rgba(52, 211, 153, 0.3); }
                }
                @keyframes scan-effect {
                    0% { transform: scale(1); opacity: 0.6; }
                    100% { transform: scale(2.5); opacity: 0; }
                }
                .sphere-idle { animation: pulse-sphere 4s infinite ease-in-out; }
                .scan-ring { animation: scan-effect 1.5s infinite cubic-bezier(0.25, 0.1, 0.25, 1); }
            `}</style>

            <div 
                className="relative w-64 h-64 rounded-full cursor-pointer select-none"
                onMouseDown={handleInteractionStart}
                onMouseUp={handleInteractionEnd}
                onTouchStart={handleInteractionStart}
                onTouchEnd={handleInteractionEnd}
            >
                {/* Sphere */}
                <div className={`w-full h-full rounded-full bg-gray-900 border-4 border-cyan-500/50 transition-all duration-500 ${status === 'idle' ? 'sphere-idle' : ''} ${status === 'holding' ? 'scale-95' : ''}`}>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/20 via-transparent to-green-500/20"></div>
                </div>

                {/* Scan Rings */}
                {status === 'holding' && (
                    <>
                        <div className="absolute inset-0 rounded-full border-2 border-cyan-400 scan-ring"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-green-400 scan-ring" style={{ animationDelay: '0.75s' }}></div>
                    </>
                )}

                 {/* Captured Flash */}
                 {status === 'captured' && (
                    <div className="absolute inset-0 rounded-full bg-white animate-shutter-flash"></div>
                 )}
            </div>
            
            <div className="mt-12 w-full">
                <Button onClick={onBack} variant="secondary" className="w-full">{t('back')}</Button>
            </div>
        </Card>
    );
};

export default BioEnergyCapture;