import React from 'react';
import type { AuspiciousNamingData, AuspiciousNamingInfo } from '../lib/types';
import Button from './Button';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
  data: AuspiciousNamingData;
  info: AuspiciousNamingInfo;
  onTryAgain: () => void;
  onGoHome: () => void;
  onOpenDonationModal: () => void;
}

const AuspiciousNamingResult: React.FC<Props> = ({ data, info, onTryAgain, onGoHome, onOpenDonationModal }) => {
    const { t } = useLocalization();
    const birthDate = new Intl.DateTimeFormat(t('locale'), {
        day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(new Date(info.childYear, info.childMonth - 1, info.childDay));

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-100 font-serif leading-tight">{t('namingResultTitle')}</h2>
                <p className="mt-4 text-xl text-sky-300 font-semibold">{t('childLastNameLabel')}: {info.childLastName}</p>
                <p className="text-md text-gray-400">{birthDate} - {t(info.childGender)}</p>
            </div>

            <Card className="mb-8">
                <h3 className="text-2xl font-bold font-serif text-green-300 mb-3">{t('namingResultAnalysisSummary')}</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-justify" style={{lineHeight: 1.8}}>{data.analysisSummary}</p>
            </Card>

            <h3 className="text-3xl font-bold font-serif text-sky-300 mb-8 text-center">{t('namingResultSuggestions')}</h3>
            
            <div className="space-y-8">
                {data.nameSuggestions.map((suggestion, index) => (
                    <div key={index} className="animate-slide-in-up" style={{ animationDelay: `${index * 150}ms`, opacity: 0 }}>
                        <Card className="p-6 border-l-4 border-sky-500">
                            <h4 className="text-3xl font-bold font-serif text-yellow-300 mb-6">{suggestion.fullName}</h4>
                            
                            <div className="space-y-4">
                                <details className="group">
                                    <summary className="font-semibold text-lg text-sky-300 cursor-pointer hover:text-sky-200 list-none flex justify-between items-center">
                                        {t('meaningAnalysis')}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </summary>
                                    <p className="text-sm text-gray-300 mt-2 p-3 bg-gray-950/50 rounded-lg whitespace-pre-wrap">{suggestion.meaningAnalysis}</p>
                                </details>
                                <details className="group">
                                    <summary className="font-semibold text-lg text-sky-300 cursor-pointer hover:text-sky-200 list-none flex justify-between items-center">
                                        {t('fiveElementsAnalysis')}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </summary>
                                    <p className="text-sm text-gray-300 mt-2 p-3 bg-gray-950/50 rounded-lg whitespace-pre-wrap">{suggestion.fiveElementsAnalysis}</p>
                                </details>
                                <details className="group">
                                    <summary className="font-semibold text-lg text-sky-300 cursor-pointer hover:text-sky-200 list-none flex justify-between items-center">
                                        {t('phoneticsAnalysis')}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </summary>
                                    <p className="text-sm text-gray-300 mt-2 p-3 bg-gray-950/50 rounded-lg whitespace-pre-wrap">{suggestion.phoneticsAnalysis}</p>
                                </details>
                                <div>
                                    <p className="font-semibold text-lg text-sky-300">{t('overall')}</p>
                                    <p className="text-sm text-gray-300 mt-2 p-3 bg-gray-950/50 rounded-lg whitespace-pre-wrap">{suggestion.overall}</p>
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
                    {t('namingTryAgain')}
                </Button>
                <Button onClick={onOpenDonationModal} variant="primary">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {t('donate')}
                </Button>
            </div>
        </div>
    );
};

export default AuspiciousNamingResult;