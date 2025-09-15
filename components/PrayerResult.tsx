import React from 'react';
import type { PrayerData, PrayerRequestInfo } from '../lib/types';
import Button from './Button';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

interface Props {
  data: PrayerData;
  info: PrayerRequestInfo;
  onTryAgain: () => void;
  onGoHome: () => void;
  onOpenDonationModal: () => void;
}

const PrayerResult: React.FC<Props> = ({ data, info, onTryAgain, onGoHome, onOpenDonationModal }) => {
    const { t, language } = useLocalization();
    const { isSpeaking, isPaused, currentSentenceIndex, sentences, play, pause, cancel } = useSpeechSynthesis(data.prayerText || '', language);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10 animate-fade-in">
                <h2 className="text-4xl font-bold text-amber-300 font-serif">{data.title}</h2>
                <p className="mt-2 text-lg text-gray-300">{t('prayerResultForDevotee', { name: info.name })}</p>
            </div>
            
            <Card>
                <div className="flex justify-center items-center gap-4 mb-8">
                    <Button 
                        onClick={isSpeaking ? pause : play} 
                        variant="prayer"
                        aria-label={isSpeaking ? 'Pause reading' : 'Play reading'}
                    >
                        {isSpeaking ? (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                        <span>{isSpeaking ? t('pause') : (isPaused ? t('resume') : t('play'))}</span>
                    </Button>
                    {(isSpeaking || isPaused) && (
                        <Button 
                            onClick={cancel} 
                            variant="secondary"
                            aria-label="Stop reading"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
                            <span>{t('stop')}</span>
                        </Button>
                    )}
                </div>

                <div className="p-6 bg-gray-950/50 rounded-lg max-h-[60vh] overflow-y-auto">
                    <h3 className="text-2xl font-bold font-serif text-emerald-300 mb-4">{t('prayerTextTitle')}</h3>
                    <div className="text-gray-200 text-lg leading-loose whitespace-pre-wrap font-serif">
                         {sentences.map((sentence, index) => (
                            <span key={index} className={`transition-all duration-300 ${currentSentenceIndex === index ? 'bg-yellow-500/20 text-yellow-200' : 'text-gray-300'}`}>
                                {sentence}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-gray-950/50 rounded-lg mt-8">
                    <h3 className="text-2xl font-bold font-serif text-emerald-300 mb-4">{t('prayerInterpretationTitle')}</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-justify" style={{lineHeight: 1.8}}>{data.interpretation}</p>
                </div>
            </Card>

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
                    {t('prayerTryAgain')}
                </Button>
                <Button onClick={onOpenDonationModal} variant="primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {t('donate')}
                </Button>
            </div>
        </div>
    );
};

export default PrayerResult;