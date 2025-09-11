import React from 'react';
import type { CareerAdviceData, CareerInfo } from '../lib/types';
import Button from './Button';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
  data: CareerAdviceData;
  info: CareerInfo;
  onTryAgain: () => void;
  onGoHome: () => void;
  onOpenDonationModal: () => void;
}

const CompatibilityBar: React.FC<{ score: number }> = ({ score }) => {
    const color = score >= 80 ? 'bg-teal-400' : score >= 60 ? 'bg-yellow-400' : 'bg-red-400';
    return (
        <div className="w-full bg-gray-700/50 rounded-full h-2.5">
            <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${score}%` }}></div>
        </div>
    );
};

const CareerAdvisorResult: React.FC<Props> = ({ data, info, onTryAgain, onGoHome, onOpenDonationModal }) => {
    const { t } = useLocalization();
    const birthDate = new Intl.DateTimeFormat(t('locale'), {
        day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(new Date(info.year, info.month - 1, info.day));

    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-100 font-serif leading-tight">{t('careerResultTitle')}</h2>
                <p className="mt-4 text-xl text-blue-300 font-semibold">{info.name}</p>
                <p className="text-md text-gray-400">{birthDate}</p>
            </div>

            <Card className="mb-8">
                <h3 className="text-2xl font-bold font-serif text-teal-300 mb-3">{t('careerResultOverall')}</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-justify" style={{lineHeight: 1.8}}>{data.overallAnalysis}</p>
            </Card>

            <h3 className="text-3xl font-bold font-serif text-teal-300 mb-8 text-center">{t('careerResultTop3')}</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {data.topSuggestions.map((suggestion, index) => (
                    <div key={index} className="animate-slide-in-up" style={{ animationDelay: `${index * 150}ms`, opacity: 0 }}>
                        <Card className="h-full flex flex-col">
                            <div className="text-center">
                                <h4 className="text-2xl font-bold font-serif text-yellow-300">{suggestion.careerTitle}</h4>
                                <p className="font-semibold text-teal-300 mt-2">{t('careerResultCompatibility', { score: suggestion.compatibilityScore })}</p>
                                <div className="mt-2 mb-4">
                                    <CompatibilityBar score={suggestion.compatibilityScore} />
                                </div>
                            </div>

                            <p className="text-sm text-gray-400 mb-4 text-justify">{suggestion.summary}</p>
                            
                            <details className="mt-auto">
                                <summary className="font-semibold text-teal-300 cursor-pointer hover:text-teal-200">{t('careerResultWhy')}</summary>
                                <p className="text-sm text-gray-300 mt-2 p-3 bg-gray-950/50 rounded-lg whitespace-pre-wrap">{suggestion.rationale}</p>
                            </details>
                            <details className="mt-2">
                                <summary className="font-semibold text-teal-300 cursor-pointer hover:text-teal-200">{t('careerResultPath')}</summary>
                                <p className="text-sm text-gray-300 mt-2 p-3 bg-gray-950/50 rounded-lg whitespace-pre-wrap">{suggestion.careerPath}</p>
                            </details>
                             <div className="mt-4">
                                <p className="font-semibold text-teal-300">{t('careerResultFields')}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {suggestion.suggestedFields.map(field => (
                                        <span key={field} className="text-xs bg-gray-700 text-white px-2 py-1 rounded-full">{field}</span>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}
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
                    {t('careerTryAgain')}
                </Button>
                <Button onClick={onOpenDonationModal} variant="primary">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {t('donate')}
                </Button>
            </div>
        </div>
    );
};

export default CareerAdvisorResult;