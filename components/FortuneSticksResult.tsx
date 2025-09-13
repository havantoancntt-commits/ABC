import React from 'react';
import type { FortuneStickData } from '../lib/types';
import { useLocalization } from '../hooks/useLocalization';
import Card from './Card';
import Button from './Button';

interface Props {
  data: FortuneStickData;
  onTryAgain: () => void;
  onGoHome: () => void;
  onOpenDonationModal: () => void;
}

const FortuneSticksResult: React.FC<Props> = ({ data, onTryAgain, onGoHome, onOpenDonationModal }) => {
    const { t } = useLocalization();

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-amber-300 font-serif">{t('fortuneSticksResultTitle')}</h2>
            </div>
            <Card>
                <div className="text-center mb-8">
                    <span className="inline-block px-6 py-2 bg-red-800/50 text-amber-200 text-5xl font-serif border-2 border-amber-400 rounded-lg shadow-lg">
                       Xăm Số {data.stickNumber}
                    </span>
                </div>

                <div className="space-y-8">
                    <div className="p-6 bg-gray-950/50 rounded-lg border-l-4 border-amber-400">
                        <h3 className="text-2xl font-bold font-serif text-amber-300 mb-4">{t('fortuneSticksPoem')}</h3>
                        <p className="text-gray-200 text-lg leading-loose whitespace-pre-wrap font-serif italic text-center">{data.poem}</p>
                    </div>

                    <div className="p-6 bg-gray-950/50 rounded-lg">
                        <h3 className="text-2xl font-bold font-serif text-amber-300 mb-4">{t('fortuneSticksInterpretation')}</h3>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-justify" style={{lineHeight: 1.8}}>{data.interpretation}</p>
                    </div>

                    <div className="p-6 bg-gray-950/50 rounded-lg">
                        <h3 className="text-2xl font-bold font-serif text-amber-300 mb-4">{t('fortuneSticksSummary')}</h3>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-justify" style={{lineHeight: 1.8}}>{data.summary}</p>
                    </div>
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
                    {t('fortuneSticksTryAgain')}
                </Button>
                <Button onClick={onOpenDonationModal} variant="primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {t('donate')}
                </Button>
            </div>
        </div>
    );
};

export default FortuneSticksResult;
