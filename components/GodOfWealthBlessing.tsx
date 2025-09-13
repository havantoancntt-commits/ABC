import React, { useState } from 'react';
import type { GodOfWealthInfo } from '../lib/types';
import { useLocalization } from '../hooks/useLocalization';
import Card from './Card';
import Button from './Button';

interface Props {
    onSubmit: (info: GodOfWealthInfo) => void;
}

const GodOfWealthAltar: React.FC<{ isPraying: boolean }> = ({ isPraying }) => {
    return (
        <div className="relative w-full max-w-sm mx-auto mb-8">
            <style>{`
                @keyframes altarGlow {
                    0%, 100% { filter: drop-shadow(0 0 15px rgba(252, 211, 77, 0.3)); }
                    50% { filter: drop-shadow(0 0 30px rgba(252, 211, 77, 0.6)); }
                }
                .altar-glow {
                    animation: altarGlow 5s infinite ease-in-out;
                }
                @keyframes incenseSmoke {
                    0% { transform: translateY(0) scale(1); opacity: 0.8; }
                    100% { transform: translateY(-80px) scale(1.5); opacity: 0; }
                }
                .incense-smoke {
                    animation: incenseSmoke 8s ease-out forwards;
                }
            `}</style>
            {/* God of Wealth SVG */}
            <svg viewBox="0 0 200 200" className="w-full h-auto altar-glow">
                <defs>
                    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FDE68A" />
                        <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                    <radialGradient id="redGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#F87171" />
                        <stop offset="100%" stopColor="#B91C1C" />
                    </radialGradient>
                </defs>
                {/* Body */}
                <path d="M100 50 C 130 50, 140 80, 140 100 L 140 160 C 140 180, 120 180, 100 180 C 80 180, 60 180, 60 160 L 60 100 C 60 80, 70 50, 100 50 Z" fill="url(#redGrad)" />
                {/* Head */}
                <circle cx="100" cy="65" r="30" fill="url(#goldGrad)" stroke="#854d0e" strokeWidth="2" />
                {/* Hat */}
                <path d="M80 40 L 120 40 L 125 50 L 75 50 Z" fill="#262626" />
                <path d="M90 30 L 110 30 L 115 40 L 85 40 Z" fill="#262626" />
                {/* Face */}
                <line x1="90" y1="65" x2="95" y2="65" stroke="#422006" strokeWidth="2" strokeLinecap="round" />
                <line x1="105" y1="65" x2="110" y2="65" stroke="#422006" strokeWidth="2" strokeLinecap="round" />
                <path d="M95 75 Q 100 80, 105 75" stroke="#422006" strokeWidth="2" fill="none" />
                {/* Gold Ingot */}
                <path d="M80 100 L 120 100 L 130 110 L 70 110 Z" fill="url(#goldGrad)" stroke="#854d0e" strokeWidth="1.5" />
            </svg>

            {/* Incense */}
            {isPraying && (
                <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-16 h-16">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-10 bg-gray-600" style={{ transformOrigin: 'bottom' }}>
                         <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_5px_red]"></div>
                         <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 w-10 h-20 opacity-0 incense-smoke"
                            style={{ background: 'radial-gradient(circle, rgba(200,200,200,0.3) 0%, rgba(200,200,200,0) 70%)' }}>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const GodOfWealthBlessing: React.FC<Props> = ({ onSubmit }) => {
    const { t } = useLocalization();
    const [name, setName] = useState('');
    const [wish, setWish] = useState('');
    const [isPraying, setIsPraying] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        if (name.trim() === '') {
            newErrors.name = t('errorFormName');
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsPraying(true);
        // Delay submission to allow animation to play
        setTimeout(() => {
            onSubmit({ name, wish });
        }, 1200);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-bold text-gray-100 font-serif leading-tight">{t('godOfWealthBlessingTitle')}</h2>
                <p className="mt-4 text-lg text-gray-300 leading-relaxed">{t('godOfWealthBlessingSubtitle')}</p>
            </div>
            <Card>
                <GodOfWealthAltar isPraying={isPraying} />
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">{t('formNameLabel')}</label>
                        <input
                            type="text" id="name" value={name} onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(p => ({ ...p, name: '' })); }}
                            className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${errors.name ? 'border-red-500' : 'border-gray-600'}`}
                            placeholder={t('formNamePlaceholder')} required disabled={isPraying}
                        />
                         {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                     <div>
                        <label htmlFor="wish" className="block text-sm font-medium text-gray-300 mb-2">{t('godOfWealthWishLabel')}</label>
                        <textarea
                            id="wish" value={wish} onChange={(e) => setWish(e.target.value)}
                            className="w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 h-24"
                            placeholder={t('godOfWealthWishPlaceholder')} disabled={isPraying}
                        />
                    </div>
                    <div className="pt-2">
                        <Button type="submit" variant="wealth" className="w-full text-lg py-4" disabled={isPraying}>
                            {isPraying ? t('processing') : t('godOfWealthPrayButton')}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default GodOfWealthBlessing;
