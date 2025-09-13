import React from 'react';
import type { PalmReadingData } from '../lib/types';
import Button from './Button';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';
import AnalysisSection from './AnalysisSection';

interface Props {
  analysisData: PalmReadingData;
  imageData: string;
  onTryAgain: () => void;
  onGoHome: () => void;
  onOpenDonationModal: () => void;
}

const iconClass = "w-6 h-6 text-rose-400";
const ICONS = {
    tongQuan: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    duongTamDao: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    duongTriDao: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    duongSinhDao: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    loiKhuyen: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
};

const PalmReadingResult: React.FC<Props> = ({ analysisData, imageData, onTryAgain, onGoHome, onOpenDonationModal }) => {
  const { t } = useLocalization();
  const analysisSections = [
      { title: t('palmReadingSection1'), content: analysisData.tongQuan, icon: ICONS.tongQuan },
      { title: t('palmReadingSection2'), content: analysisData.duongTamDao, icon: ICONS.duongTamDao },
      { title: t('palmReadingSection3'), content: analysisData.duongTriDao, icon: ICONS.duongTriDao },
      { title: t('palmReadingSection4'), content: analysisData.duongSinhDao, icon: ICONS.duongSinhDao },
      { title: t('palmReadingSection5'), content: analysisData.loiKhuyen, icon: ICONS.loiKhuyen }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-8 text-rose-400 font-serif animate-fade-in-down">{t('palmReadingResultTitle')}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 text-center p-6 bg-gray-900/50 rounded-lg border border-gray-800 lg:sticky lg:top-28">
          <h3 className="text-2xl font-serif text-rose-300 mb-4">{t('palmReadingResultImageTitle')}</h3>
          <img 
            src={imageData} 
            alt={t('palmReadingResultImageAlt')} 
            className="rounded-lg shadow-2xl w-full mx-auto border-2 border-rose-500/50"
          />
        </div>
        
        <div className="lg:col-span-2 space-y-8">
            {analysisSections.map((section, index) => (
                <div key={index} className="animate-slide-in-up" style={{ animationDelay: `${index * 150}ms`, opacity: 0 }}>
                    <AnalysisSection title={section.title} content={section.content} icon={section.icon} colorClass="text-rose-400" />
                </div>
            ))}
        </div>
      </div>

      <div className="mt-10 text-center text-amber-100/80 max-w-3xl mx-auto text-sm">
          <p>{t('resultSupportMessage')}</p>
      </div>
      <p className="mt-4 text-center text-gray-500 text-xs max-w-2xl mx-auto">{t('resultDisclaimer')}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <Button onClick={onGoHome} variant="secondary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          {t('home')}
        </Button>
        <Button onClick={onTryAgain} variant="secondary">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5m9-1-9 9-9-9" /></svg>
          {t('palmReadingTryAgain')}
        </Button>
        <Button onClick={onOpenDonationModal} variant="primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            {t('donate')}
        </Button>
      </div>
    </div>
  );
};

export default PalmReadingResult;
