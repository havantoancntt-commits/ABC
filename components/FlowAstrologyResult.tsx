import React, { useState } from 'react';
import type { FlowAstrologyData, FlowAstrologyInfo } from '../lib/types';
import Button from './Button';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';
import type { TranslationKey } from '../hooks/useLocalization';

interface Props {
  data: FlowAstrologyData;
  info: FlowAstrologyInfo;
  onReset: () => void;
  onOpenDonationModal: () => void;
}

const SymbolIcon: React.FC<{ symbol: string }> = ({ symbol }) => {
    const iconClass = "w-8 h-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]";
    switch (symbol) {
        case 'goldfish': return <span className={iconClass} title="Tài Lộc">🐠</span>;
        case 'lotus': return <span className={iconClass} title="Bình An">🪷</span>;
        case 'dragon': return <span className={iconClass} title="Cơ Hội Lớn">🐉</span>;
        default: return null;
    }
};

const FlowAstrologyResult: React.FC<Props> = ({ data, info, onReset, onOpenDonationModal }) => {
    const { t } = useLocalization();
    const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '1month' | '6months' | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSegmentClick = (period: '7days' | '1month' | '6months') => {
        setSelectedPeriod(period);
        const element = document.getElementById(`prediction-${period}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handleSaveTalisman = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Could not get canvas context');

            // Use data URI for the image source to handle SVG content directly
            const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data.talisman.svg)}`;
            
            const img = new Image();
            
            img.onload = () => {
                const desiredSize = 512; // Higher resolution for better quality
                canvas.width = desiredSize;
                canvas.height = desiredSize;
                
                // Fill background with app's dark color
                ctx.fillStyle = '#0c0a1a';
                ctx.fillRect(0, 0, desiredSize, desiredSize);
                
                // Draw the SVG image onto the canvas
                ctx.drawImage(img, 0, 0, desiredSize, desiredSize);

                // Create a PNG and trigger download
                const pngUrl = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.href = pngUrl;
                downloadLink.download = `Talisman-${info.name.replace(/\s/g, '_')}.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                
                setIsSaving(false);
            };

            img.onerror = () => {
                console.error("Failed to load SVG into image for saving.");
                alert(t('errorSaveImage'));
                setIsSaving(false);
            };
            
            img.src = svgDataUrl;

        } catch (error) {
            console.error("Error saving talisman:", error);
            alert(t('errorSaveImage'));
            setIsSaving(false);
        }
    };


    const energyStyles: Record<string, { gradient: string; color: string }> = {
        luck: { gradient: 'url(#luckGradient)', color: '#f59e0b' },
        love: { gradient: 'url(#loveGradient)', color: '#3b82f6' },
        challenge: { gradient: 'url(#challengeGradient)', color: '#ef4444' },
        helper: { gradient: 'url(#helperGradient)', color: '#a855f7' },
    };
    
    const birthDate = new Intl.DateTimeFormat(t('locale'), {
        day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(new Date(info.year, info.month - 1, info.day));
    
    // Safer way to display SVG using a data URI in an <img> tag
    const talismanSvgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data.talisman.svg)}`;
    
    return (
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-100 font-serif leading-tight">{t('flowAstrologyResultTitle')}</h2>
                <p className="mt-4 text-xl text-sky-300 font-semibold">{info.name}</p>
                <p className="text-md text-gray-400">{birthDate}</p>
            </div>
            
            <Card className="p-4 sm:p-8">
                <h3 className="text-2xl font-bold font-serif text-sky-300 mb-2 text-center">{t('flowAstrologyChartTitle')}</h3>
                <p className="text-sm text-gray-400 mb-8 text-center max-w-2xl mx-auto">{t('flowAstrologyChartSubtitle')}</p>
                <div className="relative w-full h-48 sm:h-64">
                    <svg width="100%" height="100%" viewBox="0 0 1200 200" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="luckGradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fde68a" /><stop offset="100%" stopColor="#f59e0b" /></linearGradient>
                            <linearGradient id="loveGradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#93c5fd" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient>
                            <linearGradient id="challengeGradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fca5a5" /><stop offset="100%" stopColor="#ef4444" /></linearGradient>
                            <linearGradient id="helperGradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#d8b4fe" /><stop offset="100%" stopColor="#a855f7" /></linearGradient>
                            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        
                        {/* The River Path */}
                        <path id="riverPath" d="M 0,100 C 200,50 400,150 600,100 S 1000,50 1200,100" stroke="none" fill="none" />
                        
                        {data.flow.map((segment, index) => {
                            const { gradient, color } = energyStyles[segment.energyType];
                            const pathLength = 1200;
                            const start = (index / data.flow.length) * pathLength;
                            const end = ((index + 1) / data.flow.length) * pathLength;
                           
                            return (
                                <path 
                                    key={segment.period}
                                    d="M 0,100 C 200,50 400,150 600,100 S 1000,50 1200,100"
                                    stroke={gradient}
                                    strokeWidth={10 + segment.intensity * 2}
                                    strokeLinecap="round"
                                    fill="none"
                                    filter={`drop-shadow(0 0 8px ${color})`}
                                    strokeDasharray={`${pathLength}`}
                                    strokeDashoffset={-start}
                                    className="[clip-path:inset(0_calc(100%-(var(--end-offset)))_0_var(--start-offset))] transition-all duration-300 hover:brightness-125 cursor-pointer"
                                    style={{'--start-offset': `${start}px`, '--end-offset': `${end}px`} as React.CSSProperties}
                                    onClick={() => handleSegmentClick(segment.period)}
                                >
                                    <title>{t(`flowAstrologyPeriod${segment.period}` as TranslationKey)}</title>
                                </path>
                            );
                        })}

                        {/* Symbols */}
                         {data.flow.flatMap((segment, index) => {
                            const segmentCenter = (index + 0.5) * (1200 / data.flow.length);
                            return segment.symbols.filter(s => s !== 'none').map((symbol, sIndex) => {
                                // Position symbols within the segment
                                const x = segmentCenter - 20 + (sIndex * 40);
                                const y = 100 + (Math.sin(x/100) * 50) + (index % 2 === 0 ? -40 : 40) + (segment.intensity);
                                return (
                                    <foreignObject key={`${segment.period}-${symbol}-${sIndex}`} x={x-16} y={y-16} width="32" height="32" className="animate-fade-in" style={{animationDelay: `${500 + index*200}ms`}}>
                                        <SymbolIcon symbol={symbol} />
                                    </foreignObject>
                                );
                            });
                        })}

                    </svg>
                </div>
                 <div className="flex justify-around mt-4">
                    <button className="font-bold text-gray-300" onClick={() => handleSegmentClick('7days')}>{t('flowAstrologyPeriod7days')}</button>
                    <button className="font-bold text-gray-300" onClick={() => handleSegmentClick('1month')}>{t('flowAstrologyPeriod1month')}</button>
                    <button className="font-bold text-gray-300" onClick={() => handleSegmentClick('6months')}>{t('flowAstrologyPeriod6months')}</button>
                 </div>
            </Card>

            <div className="mt-8 space-y-8">
                {data.flow.map((segment) => (
                    <div id={`prediction-${segment.period}`} key={segment.period} className={`transition-all duration-500 rounded-2xl ${selectedPeriod === segment.period ? 'ring-2 ring-sky-400 shadow-2xl shadow-sky-500/20' : ''}`}>
                         <Card>
                            <h3 className="text-2xl font-bold font-serif mb-3" style={{color: energyStyles[segment.energyType].color}}>{t(`flowAstrologyPeriod${segment.period}` as TranslationKey)}</h3>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-justify" style={{lineHeight: 1.8}}>{segment.interpretation}</p>
                            <p className="mt-4 text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-justify" style={{lineHeight: 1.8}}>{data.predictions[segment.period]}</p>
                        </Card>
                    </div>
                ))}
            </div>

            <Card className="mt-12 text-center flex flex-col items-center">
                <h3 className="text-3xl font-bold font-serif text-yellow-300 mb-4">{t('flowAstrologyTalismanTitle')}</h3>
                <p className="text-gray-400 mb-6 max-w-xl mx-auto">{data.talisman.description}</p>
                <div className="w-48 h-48 p-4 bg-gray-950 rounded-2xl border border-yellow-500/30 shadow-lg">
                    <img src={talismanSvgDataUrl} alt={data.talisman.name} className="w-full h-full object-contain" />
                </div>
                <Button onClick={handleSaveTalisman} disabled={isSaving} variant="primary" className="mt-8">
                    {isSaving ? (
                        <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span>{t('creating')}</span>
                        </>
                    ) : (
                       t('flowAstrologySaveTalisman')
                    )}
                </Button>
            </Card>

            <div className="mt-10 text-center text-amber-100/80 max-w-3xl mx-auto text-sm">
                <p>{t('resultSupportMessage')}</p>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Button onClick={onReset} variant="secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5m9-1-9 9-9-9" /></svg>
                    {t('flowAstrologyTryAgain')}
                </Button>
                <Button onClick={onOpenDonationModal} variant="primary">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {t('donate')}
                </Button>
            </div>
        </div>
    );
};

export default FlowAstrologyResult;