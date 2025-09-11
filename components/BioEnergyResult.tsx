import React from 'react';
import type { BioEnergyData, BioEnergyInfo, BioEnergyCard } from '../lib/types';
import Button from './Button';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
  data: BioEnergyData;
  info: BioEnergyInfo;
  color: string;
  card: BioEnergyCard;
  onTryAgain: () => void;
  onGoHome: () => void;
  onOpenDonationModal: () => void;
}

const BioEnergyResult: React.FC<Props> = ({ data, info, color, card, onTryAgain, onGoHome, onOpenDonationModal }) => {
    const { t, language } = useLocalization();
    const birthDate = new Intl.DateTimeFormat(t('locale'), {
        day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(new Date(info.year, info.month - 1, info.day));

    const colorStyles: Record<string, { bg: string, text: string, border: string }> = {
        Red: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500' },
        Green: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500' },
        Blue: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500' },
        Purple: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500' },
        Yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500' },
        White: { bg: 'bg-gray-200/20', text: 'text-gray-200', border: 'border-gray-200' },
        Black: { bg: 'bg-gray-800/20', text: 'text-gray-400', border: 'border-gray-600' },
    };
    
    const colorStyle = colorStyles[color] || colorStyles.White;

    return (
        <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-100 font-serif leading-tight">{t('bioEnergyResultTitle')}</h2>
                <p className="mt-4 text-xl text-cyan-300 font-semibold">{info.name}</p>
                <p className="text-md text-gray-400">{birthDate}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <Card className={`text-center ${colorStyle.bg} border-2 ${colorStyle.border}`}>
                    <h3 className="text-2xl font-bold font-serif text-gray-200 mb-2">{t('bioEnergyColorTitle')}</h3>
                    <p className={`text-3xl font-bold font-serif ${colorStyle.text}`}>{t(`energyColor${color}` as any)}</p>
                </Card>
                 <Card className="text-center bg-gray-900/50 border-2 border-yellow-500">
                    <h3 className="text-2xl font-bold font-serif text-gray-200 mb-2">{t('bioEnergyCardTitle')}</h3>
                    <p className="text-3xl font-bold font-serif text-yellow-300">{card.name[language as 'vi' | 'en']}</p>
                 </Card>
                 <Card className="text-center bg-gray-900/50 border-2 border-green-500">
                    <h3 className="text-2xl font-bold font-serif text-gray-200 mb-2">{t('bioEnergyDobTitle')}</h3>
                     <p className="text-3xl font-bold font-serif text-green-300">{birthDate}</p>
                 </Card>
            </div>
            
            <div className="space-y-6">
                 <Card>
                    <h3 className={`text-2xl font-bold font-serif mb-3 ${colorStyle.text}`}>{t('bioEnergyColorAnalysis')}</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-justify">{data.colorAnalysis}</p>
                </Card>
                 <Card>
                    <h3 className="text-2xl font-bold font-serif mb-3 text-yellow-300">{t('bioEnergyCardAnalysis')}</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-justify">{data.cardAnalysis}</p>
                </Card>
                <Card className="border-2 border-green-400/50">
                    <h3 className="text-2xl font-bold font-serif mb-3 text-green-300">{t('bioEnergyPrediction')}</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-justify">{data.synthesizedPrediction}</p>
                </Card>
            </div>

            <div className="mt-12 text-center text-amber-100/80 max-w-3xl mx-auto text-sm">
                <p>{t('resultSupportMessage')}</p>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Button onClick={onGoHome} variant="secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    {t('home')}
                </Button>
                <Button onClick={onTryAgain} variant="secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5m9-1-9 9-9-9" /></svg>
                    {t('bioEnergyTryAgain')}
                </Button>
                <Button onClick={onOpenDonationModal} variant="primary">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {t('donate')}
                </Button>
            </div>
        </div>
    );
};

export default BioEnergyResult;