import React from 'react';
import type { HoaTayData } from '../lib/types';
import Button from './Button';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';
import AnalysisSection from './AnalysisSection';

interface Props {
  analysisData: HoaTayData;
  onTryAgain: () => void;
  onGoHome: () => void;
  onOpenDonationModal: () => void;
}

const iconClass = "w-6 h-6 text-rose-400";
const ICONS = {
    tongQuan: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    leftHand: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.5 15.5l-1.5-1.5a2.5 2.5 0 00-3.5 0l-.5.5-1.5-1.5a2.5 2.5 0 00-3.5 0l-1.5 1.5M19 19l-1.5-1.5a2.5 2.5 0 00-3.5 0l-.5.5-1.5-1.5a2.5 2.5 0 00-3.5 0L5 19m14-5.5a2.5 2.5 0 00-3.5-3.5l-1.5 1.5-1-1a2.5 2.5 0 00-3.5 0l-1.5 1.5-1-1a2.5 2.5 0 00-3.5 0L5 13.5" /></svg>,
    rightHand: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.5 8.5l1.5 1.5a2.5 2.5 0 003.5 0l.5-.5 1.5 1.5a2.5 2.5 0 003.5 0l1.5-1.5M5 5l1.5 1.5a2.5 2.5 0 003.5 0l.5-.5 1.5 1.5a2.5 2.5 0 003.5 0L19 5m-14 8.5a2.5 2.5 0 003.5 3.5l1.5-1.5 1 1a2.5 2.5 0 003.5 0l1.5-1.5 1 1a2.5 2.5 0 003.5 0l1.5-1.5" /></svg>,
    loiKhuyen: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
};

const HoaTayResult: React.FC<Props> = ({ analysisData, onTryAgain, onGoHome, onOpenDonationModal }) => {
  const { t } = useLocalization();
  const { leftHandWhorls, rightHandWhorls, totalWhorls, leftHandInterpretation, rightHandInterpretation, overallInterpretation, advice } = analysisData;
  const analysisSections = [
      { title: t('hoaTaySectionLeftHand', { count: leftHandWhorls }), content: leftHandInterpretation, icon: ICONS.leftHand },
      { title: t('hoaTaySectionRightHand', { count: rightHandWhorls }), content: rightHandInterpretation, icon: ICONS.rightHand },
      { title: t('hoaTaySectionOverall', { count: totalWhorls }), content: overallInterpretation, icon: ICONS.tongQuan },
      { title: t('hoaTaySectionAdvice'), content: advice, icon: ICONS.loiKhuyen }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-4 text-rose-400 font-serif animate-fade-in-down">{t('hoaTayResultTitle')}</h2>
      <p className="text-center text-gray-300 mb-10">{t('hoaTayResultSummary', { leftCount: leftHandWhorls, rightCount: rightHandWhorls, totalCount: totalWhorls })}</p>

      <div className="space-y-8">
          {analysisSections.map((section, index) => (
              <div key={index} className="animate-slide-in-up" style={{ animationDelay: `${index * 150}ms`, opacity: 0 }}>
                  <AnalysisSection title={section.title} content={section.content} icon={section.icon} colorClass="text-rose-400" />
              </div>
          ))}
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
          {t('hoaTayTryAgain')}
        </Button>
        <Button onClick={onOpenDonationModal} variant="primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            {t('donate')}
        </Button>
      </div>
    </div>
  );
};

export default HoaTayResult;
