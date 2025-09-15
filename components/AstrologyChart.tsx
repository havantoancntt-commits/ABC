

import React, { useState, useMemo, useEffect } from 'react';
import type { AstrologyChartData, BirthInfo, Palace } from '../types';
import Button from './Button';
// FIX: Imported the Card component to resolve reference errors.
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
  data: AstrologyChartData;
  birthInfo: BirthInfo;
  onTryAgain: () => void;
  onGoHome: () => void;
  onOpenDonationModal: () => void;
}

const PalaceIcon: React.FC<{ palaceKey: string }> = ({ palaceKey }) => {
    const iconClass = "w-5 h-5 text-yellow-400/80";
    const icons: Record<string, React.ReactNode> = {
        'menh': <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
        'phuMau': <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3" /></svg>,
        'phucDuc': <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0117.657 18.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>,
        'dienTrach': <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
        'quanLoc': <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
        'noBoc': <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
        'thienDi': <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 13a3 3 0 100-6 3 3 0 000 6z" /></svg>,
        'tatAch': <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        'taiBach': <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
        'tuTuc': <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v1.5M12 17.747v1.5M12 12a1 1 0 01-1-1v-1a1 1 0 012 0v1a1 1 0 01-1 1zm-5.707-3.707l1.06 1.06a1 1 0 001.414-1.414l-1.06-1.06a1 1 0 00-1.414 1.414zm11.414 0a1 1 0 00-1.414-1.414l-1.06 1.06a1 1 0 001.414 1.414l1.06-1.06z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.293 17.707l-1.06-1.06a1 1 0 111.414-1.414l1.06 1.06a1 1 0 01-1.414 1.414zm11.414 0l-1.06-1.06a1 1 0 00-1.414 1.414l1.06 1.06a1 1 0 001.414-1.414zM12 21a9 9 0 110-18 9 9 0 010 18z" /></svg>,
        'phuThe': <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
        'huynhDe': <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3" /></svg>
    };
    return icons[palaceKey] || null;
};

const BRANCH_GRID_AREAS: Record<string, string> = {
    'Dần': 'phu-mau', 'Mão': 'phuc-duc', 'Thìn': 'dien-trach', 'Tỵ': 'quan-loc',
    'Ngọ': 'no-boc', 'Mùi': 'thien-di', 'Thân': 'tat-ach', 'Dậu': 'tai-bach',
    'Tuất': 'tu-tuc', 'Hợi': 'phu-the', 'Tý': 'huynh-de', 'Sửu': 'menh'
};

const AstrologyChart: React.FC<Props> = ({ data, birthInfo, onTryAgain, onGoHome, onOpenDonationModal }) => {
    const { t } = useLocalization();
    const [isSavingImage, setIsSavingImage] = useState(false);
    const [activeTab, setActiveTab] = useState('chart');

    const palaces = useMemo(() => [
        data.cungMenh, data.cungPhuMau, data.cungPhucDuc, data.cungDienTrach,
        data.cungQuanLoc, data.cungNoBoc, data.cungThienDi, data.cungTatAch,
        data.cungTaiBach, data.cungTuTuc, data.cungPhuThe, data.cungHuynhDe
    ], [data]);

    const handleSaveImage = async () => {
        if (isSavingImage) return;
        setIsSavingImage(true);
        try {
            const [{ default: html2canvas }] = await Promise.all([
                import('html2canvas')
            ]);
            
            const chartElement = document.getElementById('laso-print-area');
            if (!chartElement) throw new Error("Chart element not found");

            const canvas = await html2canvas(chartElement, { scale: 2, useCORS: true, backgroundColor: '#0c0a1a' });
            const dataUrl = canvas.toDataURL('image/png');

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `LaSo-${birthInfo.name.replace(/\s/g, '_')}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error(error);
            alert(t('errorSaveImage'));
        } finally {
            setIsSavingImage(false);
        }
    };

    const birthDate = new Intl.DateTimeFormat(t('locale'), {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
    }).format(new Date(birthInfo.year, birthInfo.month - 1, birthInfo.day, birthInfo.hour));

    return (
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-100 font-serif leading-tight">Lá Số Tử Vi</h2>
                <p className="mt-2 text-xl text-yellow-300 font-semibold">{birthInfo.name}</p>
                <p className="text-md text-gray-400">{t(birthInfo.gender)} - {birthDate}</p>
            </div>

            <div className="flex justify-center border-b border-gray-700/50 mb-8">
                 <button onClick={() => setActiveTab('chart')} className={`px-6 py-3 font-bold text-lg transition-colors duration-300 ${activeTab === 'chart' ? 'text-yellow-300 border-b-2 border-yellow-300' : 'text-gray-400 hover:text-white'}`}>Lá Số</button>
                 <button onClick={() => setActiveTab('details')} className={`px-6 py-3 font-bold text-lg transition-colors duration-300 ${activeTab === 'details' ? 'text-yellow-300 border-b-2 border-yellow-300' : 'text-gray-400 hover:text-white'}`}>{t('details')}</button>
            </div>

            {activeTab === 'chart' && (
                <div id="laso-print-area" className="p-4 bg-gray-900/50 rounded-lg">
                    <div className="astrology-grid grid grid-cols-4 grid-rows-4 gap-1 w-full aspect-square max-w-5xl mx-auto">
                        {palaces.map((palace) => {
                            const gridArea = BRANCH_GRID_AREAS[palace.branchName] || '';
                            const isMenh = palace.key === 'menh';
                            const isThan = palace.key === data.tongQuan.thanCungKey;
                            
                            return (
                                <div key={palace.key} className={`bg-black/40 border rounded-md p-2 flex flex-col text-xs text-center transition-all duration-300 ${isMenh ? 'border-yellow-400 shadow-lg shadow-yellow-500/10' : 'border-gray-700'} ${isThan ? 'bg-purple-500/10' : ''}`} style={{ gridArea }}>
                                    <div className="flex justify-between items-center text-gray-400 font-semibold text-[10px]">
                                        <span>{palace.branchName}</span>
                                        {isThan && <span className="px-1.5 py-0.5 bg-purple-600 text-white rounded-full text-[8px] font-bold">{t('than')}</span>}
                                    </div>
                                    <div className={`font-bold my-1 flex items-center justify-center gap-1.5 ${isMenh ? 'text-yellow-300' : 'text-gray-200'}`}>
                                        <PalaceIcon palaceKey={palace.key} />
                                        <span>{palace.name}</span>
                                    </div>
                                    <div className="flex-grow grid grid-cols-2 gap-x-1 text-[9px] leading-tight text-left">
                                        {palace.stars.map(star => <span key={star} className="truncate">{star}</span>)}
                                    </div>
                                </div>
                            );
                        })}

                        <div className="grid-center-cell bg-black/40 border border-gray-700 rounded-md p-4 text-center flex flex-col justify-center">
                            <h3 className="text-2xl font-bold text-yellow-300 font-serif">{birthInfo.name}</h3>
                            <p className="text-sm text-gray-300">{birthDate}</p>
                            <div className="mt-4 text-xs text-gray-400 whitespace-pre-wrap">{data.anSao}</div>
                        </div>
                    </div>
                </div>
            )}
            
             {activeTab === 'details' && (
                <div className="space-y-8 animate-fade-in">
                    {palaces.map((palace) => (
                         <Card key={palace.key}>
                            <h3 className="text-xl font-bold font-serif text-yellow-300 mb-3 flex items-center gap-2">
                                <PalaceIcon palaceKey={palace.key} />
                                {palace.name}
                            </h3>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-justify" style={{lineHeight: 1.8}}>{palace.interpretation}</p>
                        </Card>
                    ))}
                    <Card>
                        <h3 className="text-xl font-bold font-serif text-yellow-300 mb-3">{t('summary')}</h3>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-justify" style={{lineHeight: 1.8}}>{data.tongKet}</p>
                    </Card>
                </div>
            )}


            <div className="mt-8 text-center text-amber-100/80 max-w-3xl mx-auto text-sm">
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
                    {t('astrologyTryAgain')}
                </Button>
                <Button onClick={handleSaveImage} disabled={isSavingImage} variant="secondary">
                    {isSavingImage ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    )}
                    {isSavingImage ? t('creating') : t('saveChartImage')}
                </Button>
                <Button onClick={onOpenDonationModal} variant="primary">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {t('donate')}
                </Button>
            </div>
        </div>
    );
};

export default AstrologyChart;