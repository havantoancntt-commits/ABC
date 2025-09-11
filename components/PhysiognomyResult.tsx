import React from 'react';
import type { PhysiognomyData } from '../types';
import Button from './Button';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
  analysisData: PhysiognomyData;
  imageData: string;
  onReset: () => void;
  onBackToHome: () => void;
  onOpenDonationModal: () => void;
}

const iconClass = "w-6 h-6 text-yellow-500";
const ICONS = {
    tongQuan: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    tamDinh: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    nguQuan: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    loiKhuyen: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
};

const AnalysisSection: React.FC<{ title: string; content: string; icon: React.ReactNode }> = React.memo(({ title, content, icon }) => (
    <Card className="p-6">
        <h3 className="text-xl font-bold text-yellow-400 font-serif mb-4 flex items-center gap-3">
            {icon}
            {title}
        </h3>
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-justify" style={{lineHeight: 1.8}}>{content}</p>
    </Card>
));

const PhysiognomyResult: React.FC<Props> = ({ analysisData, imageData, onReset, onBackToHome, onOpenDonationModal }) => {
  const { t } = useLocalization();
  const analysisSections = [
      { title: t('physiognomyResultSection1'), content: analysisData.tongQuan, icon: ICONS.tongQuan },
      { title: t('physiognomyResultSection2'), content: analysisData.tamDinh, icon: ICONS.tamDinh },
      { title: t('physiognomyResultSection3'), content: analysisData.nguQuan, icon: ICONS.nguQuan },
      { title: t('physiognomyResultSection4'), content: analysisData.loiKhuyen, icon: ICONS.loiKhuyen }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-8 text-yellow-400 font-serif animate-fade-in-down">{t('physiognomyResultTitle')}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 text-center p-6 bg-gray-900/50 rounded-lg border border-gray-800 lg:sticky lg:top-28">
          <h3 className="text-2xl font-serif text-yellow-300 mb-4">{t('physiognomyResultImageTitle')}</h3>
          <img 
            src={imageData} 
            alt={t('physiognomyResultImageAlt')} 
            className="rounded-lg shadow-2xl w-full mx-auto border-2 border-yellow-500/50"
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
        <Button onClick={onBackToHome} variant="secondary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          {t('home')}
        </Button>
        