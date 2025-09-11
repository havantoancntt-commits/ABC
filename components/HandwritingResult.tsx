import React from 'react';
import type { HandwritingData } from '../lib/types';
import Button from './Button';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
  analysisData: HandwritingData;
  imageData: string;
  onTryAgain: () => void;
  onGoHome: () => void;
  onOpenDonationModal: () => void;
}

const iconClass = "w-6 h-6 text-indigo-400";
const ICONS = {
    tongQuan: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    khongGian: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v4m0 0h-4m4 0l-5-5" /></svg>,
    netChu: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
    chuKy: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    loiKhuyen: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
};

const AnalysisSection: React.FC<{ title: string; content: string; icon: React.ReactNode }> = React.memo(({ title, content, icon }) => (
    <Card className="p-6">
        <h3 className="text-xl font-bold text-indigo-400 font-serif mb-4 flex items-center gap-3">
            {icon}
            {title}
        </h3>
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-justify" style={{lineHeight: 1.8}}>{content}</p>
    </Card>
));

const HandwritingResult: React.FC<Props> = ({ analysisData, imageData, onTryAgain, onGoHome, onOpenDonationModal }) => {
  const { t } = useLocalization();
  const analysisSections = [
      { title: t('handwritingSection1'), content: analysisData.tongQuan, icon: ICONS.tongQuan },
      { title: t('handwritingSection2'), content: analysisData.khongGian, icon: ICONS.khongGian },
      { title: t('handwritingSection3'), content: analysisData.netChu, icon: ICONS.netChu },
      { title: t('handwritingSection4'), content: analysisData.chuKy, icon: ICONS.chuKy },
      { title: t('handwritingSection5'), content: analysisData.loiKhuyen, icon: ICONS.loiKhuyen }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-8 text-indigo-400 font-serif animate-fade-in-down">{t('handwritingResultTitle')}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 text-center p-6 bg-gray-900/50 rounded-lg border border-gray-800 lg:sticky lg:top-28">
          <h3 className="text-2xl font-serif text-indigo-300 mb-4">{t('handwritingResultImageTitle')}</h3>
          <img 
            src={imageData} 
            alt={t('handwritingResultImageAlt')} 
            className="rounded-lg shadow-2xl w-full mx-auto border-2 border-indigo-500/50"
          />
        </div>
        
        <div className="lg:col-span-2 space-y-8">
            {analysisSections.map((section, index) => (
                <div key={index} className="animate-slide-in-up" style={{ animationDelay: `${index * 150}ms`, opacity: 0 }}>
                    <AnalysisSection title={section.title} content={section.content} icon={section.icon} />
                </div>
            ))}
        </div>
      </div>

      <div className="mt-10 text-center text-amber-100/80 max-w-3xl mx-auto text-sm">
          <p>{t('resultSupportMessage')}</p>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <Button onClick={onGoHome} variant="secondary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          {t('home')}
        </Button>
        <Button onClick={onTryAgain} variant="secondary">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5m9-1-9 9-9-9" /></svg>
          {t('handwritingTryAgain')}
        </Button>
        <Button onClick={onOpenDonationModal} variant="primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            {t('donate')}
        </Button>
      </div>
    </div>
  );
};

export default HandwritingResult;