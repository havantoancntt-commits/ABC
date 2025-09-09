import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { BIO_ENERGY_CARDS } from '../lib/bioEnergyData';
import type { BioEnergyCard } from '../lib/types';
import Card from './Card';
import Button from './Button';

interface Props {
    onDraw: (card: BioEnergyCard) => void;
    onBack: () => void;
    energyColor: string;
}

const BioEnergyCardDraw: React.FC<Props> = ({ onDraw, onBack, energyColor }) => {
    const { t, language } = useLocalization();
    const [shuffledCards] = useState(() => [...BIO_ENERGY_CARDS].sort(() => 0.5 - Math.random()));
    const [selectedCard, setSelectedCard] = useState<BioEnergyCard | null>(null);

    const handleCardClick = (card: BioEnergyCard) => {
        if (selectedCard) return;
        setSelectedCard(card);
        setTimeout(() => {
            onDraw(card);
        }, 1500); // Wait for flip and fade animations
    };
    
    const colorStyles: Record<string, { bg: string, text: string }> = {
        Red: { bg: 'bg-red-500', text: 'text-red-300' },
        Green: { bg: 'bg-green-500', text: 'text-green-300' },
        Blue: { bg: 'bg-blue-500', text: 'text-blue-300' },
        Purple: { bg: 'bg-purple-500', text: 'text-purple-300' },
        Yellow: { bg: 'bg-yellow-500', text: 'text-yellow-300' },
        White: { bg: 'bg-white', text: 'text-gray-200' },
        Black: { bg: 'bg-gray-800', text: 'text-gray-400' },
    };
    
    const colorStyle = colorStyles[energyColor] || colorStyles.White;

    return (
        <div className="max-w-5xl mx-auto">
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .card-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                    gap: 1rem;
                }
                @media (min-width: 640px) {
                    .card-grid {
                        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                    }
                }
            `}</style>

            <div className="text-center mb-8 animate-fade-in">
                 <h2 className="text-3xl font-bold font-serif mb-3">{t('bioEnergyCardDrawTitle')}</h2>
                 <div className="flex justify-center items-center gap-3">
                     <span className="text-gray-400">{t('bioEnergyCardDrawSubtitle')}</span>
                     <div className={`w-5 h-5 rounded-full ${colorStyle.bg} border-2 border-white/50`}></div>
                     <span className={`font-bold ${colorStyle.text}`}>{t(`energyColor${energyColor}` as any)}</span>
                 </div>
            </div>

            <Card>
                <div className="card-grid">
                    {shuffledCards.map((card, index) => {
                        const isSelected = selectedCard?.id === card.id;
                        const isFaded = selectedCard && !isSelected;

                        return (
                             <div 
                                key={card.id}
                                className={`perspective-1000 cursor-pointer transition-all duration-500 ${isFaded ? 'opacity-0 scale-90' : 'opacity-100'}`}
                                onClick={() => handleCardClick(card)}
                                style={{ transitionDelay: isFaded ? '0ms' : `${index * 20}ms` }}
                            >
                                <div 
                                    className={`relative w-full aspect-[2.5/3.5] transform-style-3d transition-transform duration-700 ${isSelected ? 'rotate-y-180' : ''}`}
                                >
                                    {/* Card Back */}
                                    <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-cyan-600 to-green-500 rounded-lg border border-cyan-300/50 flex items-center justify-center p-2">
                                        <div className="w-full h-full border border-cyan-300/50 rounded-md flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-cyan-200/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                                        </div>
                                    </div>
                                    {/* Card Front */}
                                    <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gray-900 rounded-lg border-2 border-yellow-400/50 flex flex-col justify-center items-center text-center p-2">
                                        <p className="text-yellow-300 font-serif font-bold text-sm leading-tight">{card.name[language as 'vi' | 'en']}</p>
                                        <p className="text-gray-400 text-xs mt-1">{card.group[language as 'vi' | 'en']}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
            
             <div className="mt-8 text-center">
                <Button onClick={onBack} variant="secondary" disabled={!!selectedCard}>{t('back')}</Button>
            </div>
        </div>
    );
};

export default BioEnergyCardDraw;
