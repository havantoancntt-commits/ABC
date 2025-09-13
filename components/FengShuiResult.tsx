import React from 'react';
import type { FengShuiData, FengShuiInfo } from '../lib/types';
import Button from './Button';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
  data: FengShuiData;
  info: FengShuiInfo;
  thumbnail: string;
  onTryAgain: () => void;
  onGoHome: () => void;
  onOpenDonationModal: () => void;
}

const iconClass = "w-7 h-7 text-green-300 shrink-0";
const ICONS = {
    tongQuan: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    uuDiem: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.93L5 10m7 0a2 2 0 012 2v4a2 2 0 01-2 2h-4m0 0a2 2 0 01-2-2v-4a2 2 0 012-2h4z" /></svg>,
    nhuocDiem: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.738 3h4.017c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.085a2 2 0 001.736-.93l2-4m-7 0a2 2 0 01-2-2v-4a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4z" /></svg>,
    giaiPhap: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
};


const FengShuiResult: React.FC<Props> = ({ data, info, thumbnail, onTryAgain, onGoHome, onOpenDonationModal }) => {
    const { t } = useLocalization();

    return (
        <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-100 font-serif leading-tight">{t('fengShuiResultTitle')}</h2>
                <p className="mt-4 text-xl text-green-300 font-semibold">{info.spaceType}</p>
                <p className="text-md text-gray-400">{t('fengShuiResultOwnerBirthYear')}: {info.ownerBirthYear}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                 <div className="lg:col-span-1 text-center p-6 bg-gray-900/50 rounded-lg border border-gray-800 lg:sticky lg:top-28">
                    <h3 className="text-2xl font-serif text-green-300 mb-4">{t('fengShuiResultImageTitle')}</h3>
                    <img 
                        src={`data:image/jpeg;base64,${thumbnail}`}
                        alt={t('fengShuiResultImageAlt')} 
                        className="rounded-lg shadow-2xl w-full mx-auto border-2 border-green-500/50"
                    />
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <h3 className="text-2xl font-bold font-serif text-green-300 mb-3 flex items-center gap-3">{ICONS.tongQuan} {t('fengShuiResultOverall')}</h3>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-justify" style={{lineHeight: 1.8}}>{data.tongQuan}</p>
                    </Card>

                    <Card>
                        <h3 className="text-2xl font-bold font-serif text-green-300 mb-3 flex items-center gap-3">{ICONS.uuDiem} {t('fengShuiResultGoodPoints')}</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-300">
                           {data.uuDiem.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </Card>

                    <Card>
                        <h3 className="text-2xl font-bold font-serif text-green-300 mb-3 flex items-center gap-3">{ICONS.nhuocDiem} {t('fengShuiResultBadPoints')}</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-300">
                           {data.nhuocDiem.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </Card>

                     <Card>
                        <h3 className="text-2xl font-bold font-serif text-green-300 mb-4 flex items-center gap-3">{ICONS.giaiPhap} {t('fengShuiResultSolutions')}</h3>
                        <div className="space-y-4">
                            {data.giaiPhap.map((item, i) => (
                                <div key={i} className="p-4 bg-gray-950/50 rounded-lg border-l-4 border-green-400">
                                    <p className="font-bold text-lg text-white">{item.khuVuc}</p>
                                    <p className="text-gray-300 text-sm mt-1">{item.deXuat}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
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
                    {t('fengShuiTryAgain')}
                </Button>
                <Button onClick={onOpenDonationModal} variant="primary">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {t('donate')}
                </Button>
            </div>
        </div>
    );
};

export default FengShuiResult;
