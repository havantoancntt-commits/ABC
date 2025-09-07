import React, { useState, useCallback, useEffect } from 'react';
import type { IChingLine, CastResult, IChingInterpretation } from '../lib/types';
import { useLocalization } from '../hooks/useLocalization';
import { getCastResultFromLines } from '../lib/iching';
import { getIChingInterpretation } from '../lib/gemini';
import Card from './Card';
import Button from './Button';
import Spinner from './Spinner';

interface Props {
  onOpenDonationModal: () => void;
}

const HexagramLine: React.FC<{ line: IChingLine }> = React.memo(({ line }) => {
    const baseClasses = "w-full h-2 my-1 transition-all duration-300 rounded-full";
    const changingClasses = "relative before:content-[''] before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-2 before:h-2 before:rounded-full before:bg-gray-900";

    if (line.isYang) {
        return <div className={`${baseClasses} bg-gray-300 ${line.isChanging ? changingClasses : ''}`}></div>;
    } else {
        return (
            <div className={`flex justify-between items-center ${line.isChanging ? 'relative' : ''}`}>
                <div className={`${baseClasses} bg-gray-300`}></div>
                <div className="w-4 flex-shrink-0"></div>
                <div className={`${baseClasses} bg-gray-300`}></div>
                 {line.isChanging && <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-900"></div>}
            </div>
        );
    }
});

const HexagramDisplay: React.FC<{ lines: IChingLine[] }> = ({ lines }) => (
    <div className="w-20 mx-auto flex flex-col-reverse h-32">
        {lines.map((line, index) => (
            <div key={index} className="animate-fade-in" style={{ animationDelay: `0ms` }}>
                <HexagramLine line={line} />
            </div>
        ))}
    </div>
);

const tossCoins = (): number => {
    let sum = 0;
    // A standard I Ching cast uses 3 coins. Heads = 3 (Yang), Tails = 2 (Yin).
    for (let i = 0; i < 3; i++) {
        sum += Math.floor(Math.random() * 2) + 2; 
    }
    // Sum can be 6 (Changing Yin), 7 (Static Yang), 8 (Static Yin), or 9 (Changing Yang).
    return sum;
};

const getLineFromTossValue = (value: number): IChingLine => {
    switch (value) {
        case 6: return { value, isChanging: true, isYang: false };
        case 7: return { value, isChanging: false, isYang: true };
        case 8: return { value, isChanging: false, isYang: false };
        case 9: return { value, isChanging: true, isYang: true };
        default: throw new Error('Invalid coin toss value');
    }
};


const IChingDivination: React.FC<Props> = ({ onOpenDonationModal }) => {
    const { t, language } = useLocalization();
    const [question, setQuestion] = useState('');
    const [castResult, setCastResult] = useState<CastResult | null>(null);
    const [interpretation, setInterpretation] = useState<IChingInterpretation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCasting, setIsCasting] = useState(false);
    const [castLines, setCastLines] = useState<IChingLine[]>([]);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        if (!isCasting) return;
    
        if (castLines.length >= 6) {
            const fetchInterpretation = async () => {
                const result = getCastResultFromLines(castLines);
                setCastResult(result);
                setIsLoading(true);
                setIsCasting(false); 
                try {
                    const interpretationData = await getIChingInterpretation(result, question, language);
                    setInterpretation(interpretationData);
                } catch (err) {
                    setError(err instanceof Error ? err.message : t('errorUnknown'));
                } finally {
                    setIsLoading(false);
                }
            };
            // A short delay after the last line appears for dramatic effect
            const finalTimer = setTimeout(fetchInterpretation, 500);
            return () => clearTimeout(finalTimer);
        }
    
        const timer = setTimeout(() => {
            const line = getLineFromTossValue(tossCoins());
            setCastLines(prev => [...prev, line]);
        }, 400); // Delay between each line appearing
    
        return () => clearTimeout(timer);
    }, [isCasting, castLines, question, language, t]);


    const handleCast = () => {
        if (isCasting || isLoading) return;
        setError(null);
        setInterpretation(null);
        setCastResult(null);
        setCastLines([]);
        setIsCasting(true);
    };

    const handleReset = () => {
        setQuestion('');
        setCastResult(null);
        setInterpretation(null);
        setIsLoading(false);
        setIsCasting(false);
        setCastLines([]);
        setError(null);
    };

    const renderInitialState = () => (
        <Card>
            <h2 className="text-3xl font-bold text-center mb-4 text-yellow-400 font-serif">{t('iChingDivinationTitle')}</h2>
            <p className="text-center text-gray-400 mb-8 max-w-lg mx-auto">{t('iChingDivinationSubtitle')}</p>
            <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t('iChingQuestionPlaceholder')}
                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all mb-6 h-28"
            />
            <Button onClick={handleCast} variant="iching" className="w-full text-lg py-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                {t('iChingCastButton')}
            </Button>
        </Card>
    );

    const renderCastingState = () => (
        <Card className="text-center">
             <h2 className="text-3xl font-bold font-serif mb-4 text-emerald-300">
                {t('iChingCastingMessage', {count: Math.min(castLines.length + 1, 6)})}
             </h2>
             <p className="text-gray-400 mb-6">{t('spinnerIChing')}</p>
             <HexagramDisplay lines={castLines} />
        </Card>
    );
    
    const renderResultState = () => (
        <div>
             <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-yellow-400 font-serif mb-4">{t('iChingResultTitle')}</h2>
                {question && (
                    <>
                        <p className="text-gray-400 text-lg font-semibold">{t('iChingYourQuestion')}</p>
                        <p className="text-white text-xl italic">"{question}"</p>
                    </>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
                <div className="md:col-span-2 flex justify-center gap-4">
                    <Card className="flex-1 text-center">
                        <h3 className="font-bold text-lg text-yellow-300 font-serif mb-3">{t('iChingPrimaryHexagram')}</h3>
                        {castResult && <HexagramDisplay lines={castResult.lines} />}
                        <p className="font-semibold mt-3 text-white">{castResult?.primaryHexagram.name[language]}</p>
                        <p className="text-sm text-gray-400">{castResult?.primaryHexagram.name.pinyin}</p>
                    </Card>
                    {castResult?.secondaryHexagram && (
                         <Card className="flex-1 text-center bg-gray-900/40">
                             <h3 className="font-bold text-lg text-emerald-300 font-serif mb-3">{t('iChingSecondaryHexagram')}</h3>
                             <HexagramDisplay lines={castResult.lines.map(l => ({ ...l, isYang: l.isChanging ? !l.isYang : l.isYang, isChanging: false }))} />
                             <p className="font-semibold mt-3 text-white">{castResult.secondaryHexagram.name[language]}</p>
                             <p className="text-sm text-gray-400">{castResult.secondaryHexagram.name.pinyin}</p>
                         </Card>
                    )}
                </div>
                
                <div className="md:col-span-3 space-y-6">
                    {interpretation && (
                        <>
                        <AnalysisSection title={t('iChingSectionOverall')} content={interpretation.tongQuan} />
                        <AnalysisSection title={t('iChingSectionJudgment')} content={interpretation.thoanTu} />
                        <AnalysisSection title={t('iChingSectionImage')} content={interpretation.hinhTuong} />
                        {interpretation.haoDong.length > 0 && (
                             <Card>
                                <h3 className="text-xl font-bold text-yellow-400 font-serif mb-4">{t('iChingSectionChangingLines')}</h3>
                                <div className="space-y-4">
                                {interpretation.haoDong.map(line => (
                                    <div key={line.line} className="border-l-4 border-emerald-500/50 pl-4">
                                        <p className="font-bold text-emerald-300">{t('iChingLine', {line: line.line})}</p>
                                        <p className="text-gray-300 whitespace-pre-wrap">{line.interpretation}</p>
                                    </div>
                                ))}
                                </div>
                            </Card>
                        )}
                        {interpretation.queBienDoi && <AnalysisSection title={t('iChingSectionTransformed')} content={interpretation.queBienDoi} />}
                        </>
                    )}
                </div>
            </div>

            <div className="mt-10 text-center text-amber-100/80 max-w-3xl mx-auto text-sm">
                <p>{t('resultSupportMessage')}</p>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Button onClick={handleReset} variant="secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5m9-1-9 9-9-9" /></svg>
                    {t('iChingCastAgain')}
                </Button>
                <Button onClick={onOpenDonationModal} variant="primary">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {t('donate')}
                </Button>
            </div>
        </div>
    );
    
    if (isLoading) {
        return <Spinner message={t('spinnerIChing')} />;
    }
    
    if (error) {
         return <div className="text-center">
            <Card>
                 <p className="text-red-400">{error}</p>
                 <Button onClick={handleReset} variant="secondary" className="mt-4">{t('back')}</Button>
            </Card>
        </div>;
    }

    const renderContent = () => {
        if (interpretation) return renderResultState();
        if (isCasting) return renderCastingState();
        return renderInitialState();
    }

    return (
        <div className="max-w-6xl mx-auto">
            {renderContent()}
        </div>
    );
};

const AnalysisSection: React.FC<{ title: string; content: string }> = React.memo(({ title, content }) => (
    <Card>
        <h3 className="text-xl font-bold text-yellow-400 font-serif mb-3">{title}</h3>
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-justify" style={{lineHeight: 1.8}}>{content}</p>
    </Card>
));


export default IChingDivination;