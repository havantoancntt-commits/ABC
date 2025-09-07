import React, { useState, useCallback } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { getTarotReading } from '../lib/gemini';
import { TAROT_CARDS_MAJOR_ARCANA } from '../lib/constants';
import type { TarotCard, TarotReadingData } from '../lib/types';
import Card from './Card';
import Button from './Button';
import Spinner from './Spinner';

interface Props {
  onOpenDonationModal: () => void;
  onBack: () => void;
}

const TarotCardDisplay: React.FC<{ card: TarotCard, isRevealed: boolean, position: string }> = ({ card, isRevealed, position }) => {
    return (
        <div className="w-full flex flex-col items-center">
            <div className="perspective-1000 w-40 h-64 sm:w-48 sm:h-80">
                <div 
                    className={`relative w-full h-full transform-style-3d transition-transform duration-700 ${isRevealed ? 'rotate-y-180' : ''}`}
                >
                    {/* Card Back */}
                    <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl border-2 border-purple-300/50 flex items-center justify-center p-4">
                         <div className="w-full h-full border-2 border-purple-300/50 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-purple-200/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                        </div>
                    </div>
                    {/* Card Front */}
                    <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gray-900 rounded-xl border-2 border-yellow-400/50 flex flex-col justify-center items-center text-center p-4 shadow-2xl shadow-black/50">
                        <p className="text-yellow-300 font-serif font-bold text-lg">{card.name.vi}</p>
                        <p className="text-gray-400 text-xs">{card.name.en}</p>
                    </div>
                </div>
            </div>
            <h3 className="mt-4 text-xl font-bold font-serif text-purple-300">{position}</h3>
        </div>
    );
};

const TarotReading: React.FC<Props> = ({ onOpenDonationModal, onBack }) => {
    const { t, language } = useLocalization();
    const [question, setQuestion] = useState('');
    const [drawnCards, setDrawnCards] = useState<TarotCard[] | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [interpretation, setInterpretation] = useState<TarotReadingData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const drawThreeCards = useCallback(() => {
        const shuffled = [...TAROT_CARDS_MAJOR_ARCANA].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    }, []);

    const handleDraw = useCallback(() => {
        setError(null);
        setInterpretation(null);
        setIsRevealed(false);
        const cards = drawThreeCards();
        setDrawnCards(cards);

        setTimeout(() => setIsRevealed(true), 500);

        setTimeout(async () => {
            setIsLoading(true);
            try {
                const result = await getTarotReading(cards, question, language);
                setInterpretation(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : t('errorUnknown'));
            } finally {
                setIsLoading(false);
            }
        }, 1500); // Wait for reveal animation + a bit
    }, [drawThreeCards, question, language, t]);

    const handleReset = () => {
        setQuestion('');
        setDrawnCards(null);
        setIsRevealed(false);
        setInterpretation(null);
        setIsLoading(false);
        setError(null);
    };

    if (!drawnCards) {
        return (
            <div className="max-w-3xl mx-auto">
                <Card>
                    <h2 className="text-3xl font-bold text-center mb-4 text-purple-300 font-serif">{t('tarotReadingTitle')}</h2>
                    <p className="text-center text-gray-400 mb-8 max-w-lg mx-auto">{t('tarotReadingSubtitle')}</p>
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder={t('iChingQuestionPlaceholder')}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all mb-6 h-28"
                    />
                    <Button onClick={handleDraw} variant="tarot" className="w-full text-lg py-4">
                        {t('tarotDrawButton')}
                    </Button>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="max-w-6xl mx-auto">
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}</style>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
                <TarotCardDisplay card={drawnCards[0]} isRevealed={isRevealed} position={t('tarotPast')} />
                <TarotCardDisplay card={drawnCards[1]} isRevealed={isRevealed} position={t('tarotPresent')} />
                <TarotCardDisplay card={drawnCards[2]} isRevealed={isRevealed} position={t('tarotFuture')} />
            </div>

            {isLoading && <Spinner message={t('spinnerTarot')} />}

            {error && <Card className="text-center text-red-400">{error}</Card>}

            {interpretation && (
                <div className="space-y-6 animate-fade-in">
                    <AnalysisSection title={t('tarotPast')} content={interpretation.past} />
                    <AnalysisSection title={t('tarotPresent')} content={interpretation.present} />
                    <AnalysisSection title={t('tarotFuture')} content={interpretation.future} />
                    <AnalysisSection title={t('tarotSummary')} content={interpretation.summary} />
                </div>
            )}
            
            <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Button onClick={onBack} variant="secondary">
                  {t('home')}
                </Button>
                <Button onClick={handleReset} variant="tarot">
                  {t('tarotDrawAgain')}
                </Button>
                <Button onClick={onOpenDonationModal} variant="special">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {t('donate')}
                </Button>
            </div>
        </div>
    );
};

const AnalysisSection: React.FC<{ title: string; content: string }> = React.memo(({ title, content }) => (
    <Card>
        <h3 className="text-xl font-bold text-purple-300 font-serif mb-3">{title}</h3>
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-justify" style={{lineHeight: 1.8}}>{content}</p>
    </Card>
));

export default TarotReading;
