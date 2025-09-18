import React from 'react';
import type { NhatMenhData, NhatMenhInfo } from '../lib/types';
import Button from './Button';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';
import AnalysisSection from './AnalysisSection';

interface Props {
  data: NhatMenhData;
  info: NhatMenhInfo;
  onTryAgain: () => void;
  onGoHome: () => void;
  onOpenDonationModal: () => void;
}

const NhatMenhResult: React.FC<Props> = ({ data, info, onTryAgain, onGoHome, onOpenDonationModal }) => {
    const { t } = useLocalization();
    const date = new Intl.DateTimeFormat(t('locale'), { dateStyle: 'long' }).format(new Date(info.year, info.month - 1, info.day));
    
    const elementSymbol: Record<string, string> = {
        'Kim': '金', 'Mộc': '木', 'Thủy': '水', 'Hỏa': '火', 'Thổ': '土'
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-bold text-gray-100 font-serif leading-tight">{t('nhatMenhResultTitle')}</h2>
                <p className="mt-2 text-lg text-purple-300">{date}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {/* Oracle Card */}
                <div className="md:col-span-2">
                    <Card className="p-4 bg-gradient-to-br from-gray-900 to-black border-2" style={{ borderColor: data.luckyColorHex }}>
                         <div className="relative aspect-[3/5] w-full border border-gray-700 rounded-xl p-4 flex flex-col items-center justify-between text-center bg-black/30">
                            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                            
                            {/* Header */}
                            <div>
                                <h3 className="font-serif text-xl" style={{ color: data.luckyColorHex }}>{t('nhatMenhCardTitle')}</h3>
                                <p className="text-xs text-gray-400">{date}</p>
                            </div>
                            
                            {/* Main Numbers & Elements */}
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center">
                                    <span className="text-7xl font-serif font-bold text-white">{data.destinyNumber}</span>
                                    <span className="text-sm text-gray-400">{t('nhatMenhDestinyNumber')}</span>
                                </div>
                                 <div className="flex flex-col items-center">
                                    <span className="text-7xl font-serif font-bold text-white">{elementSymbol[data.dominantElement]}</span>
                                    <span className="text-sm text-gray-400">{t('nhatMenhDominantElement')}</span>
                                </div>
                            </div>

                            {/* Lucky Info */}
                            <div className="w-full text-sm">
                                <div className="flex justify-between border-t border-gray-700 pt-2">
                                    <span className="text-gray-400">{t('nhatMenhLuckyColor')}:</span>
                                    <span className="font-semibold" style={{ color: data.luckyColorHex }}>{data.luckyColorName}</span>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-gray-400">{t('nhatMenhLuckyZodiac')}:</span>
                                    <span className="font-semibold text-white">{data.luckyZodiac}</span>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-gray-400">{t('nhatMenhUnluckyZodiac')}:</span>
                                    <span className="font-semibold text-white">{data.unluckyZodiac}</span>
                                </div>
                            </div>
                         </div>
                    </Card>
                </div>
                {/* Interpretations */}
                <div className="md:col-span-3 space-y-6">
                    <AnalysisSection title={t('nhatMenhOverallReading')} content={data.overallReading} icon={<></>} colorClass="text-purple-300" />
                    <AnalysisSection title={t('nhatMenhSpiritualMark')} content={data.spiritualMarkInterpretation} icon={<></>} colorClass="text-purple-300" />
                    <AnalysisSection title={t('nhatMenhDailyMessage')} content={data.dailyMessage} icon={<></>} colorClass="text-purple-300" />
                </div>
            </div>

            <div className="mt-12 text-center text-amber-100/80 max-w-3xl mx-auto text-sm">
                <p>{t('resultSupportMessage')}</p>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
                 <Button onClick={onGoHome} variant="secondary">{t('home')}</Button>
                <Button onClick={onTryAgain} variant="secondary">{t('nhatMenhTryAgain')}</Button>
                <Button onClick={onOpenDonationModal} variant="primary">{t('donate')}</Button>
            </div>
             <style>{`
                .bg-grid-pattern {
                    background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
                    background-size: 20px 20px;
                }
            `}</style>
        </div>
    );
};

export default NhatMenhResult;
