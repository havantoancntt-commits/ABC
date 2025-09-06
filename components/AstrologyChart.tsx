import React, { useState, useMemo, useEffect } from 'react';
import type { AstrologyChartData, BirthInfo, Palace } from '../lib/types';
import Button from './Button';
import { useLocalization } from '../hooks/useLocalization';

declare const html2canvas: any;
declare const jspdf: any;

interface Props {
  data: AstrologyChartData;
  birthInfo: BirthInfo;
  onReset: () => void;
  onOpenDonationModal: () => void;
}

const PalaceIcon: React.FC<{ palaceName: string }> = ({ palaceName }) => {
    const iconClass = "w-5 h-5 text-yellow-400/80";
    const icons: Record<string, React.ReactNode> = {
        'Cung Mệnh': <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
        'Cung Phụ Mẫu': <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3" /></svg>,
        'Cung Phúc Đức': <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0117.657 18.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>,
        'Cung Điền Trạch': <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
        'Cung Quan Lộc': <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
        'Cung Nô Bộc': <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
        'Cung Thiên Di': <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.293l.5-1.5A2 2 0 0110.121 2h3.758a2 2 0 011.914 1.793l.5 1.5M21 12h-2.292a1 1 0 00-.97.712L17.67 15.5H6.33L5.262 12.712A1 1 0 004.292 12H2" /></svg>,
        'Cung Tật Ách': <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>,
        'Cung Tài Bạch': <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2.01M18 10a6 6 0 11-12 0 6 6 0 0112 0z" /></svg>,
        'Cung Tử Tức': <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
        'Cung Phu Thê': <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path fill="currentColor" d="M12 4.248c-3.148-5.402-12-3.825-12 2.942 0 4.661 5.571 9.427 12 15.808 6.43-6.381 12-11.147 12-15.808 0-6.792-8.875-8.306-12-2.942z"/></svg>,
        'Cung Huynh Đệ': <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12a4.002 4.002 0 00-4-4 4 4 0 00-4 4v1h8v-1a4.002 4.002 0 00-4-4zM19 12a4.002 4.002 0 00-4-4 4 4 0 00-4 4v1h8v-1a4.002 4.002 0 00-4-4z" /></svg>,
    };
    return icons[palaceName] || null;
};

const PalaceCard: React.FC<{ palace: Palace; isMenh: boolean; isThan: boolean; onClick: () => void; }> = React.memo(({ palace, isMenh, isThan, onClick }) => {
    const { t } = useLocalization();
    const borderClass = isMenh 
        ? 'border-yellow-400 border-2 shadow-[0_0_20px_rgba(250,204,21,0.5)]' 
        : isThan 
        ? 'border-fuchsia-400 border-2 shadow-[0_0_20px_rgba(232,121,249,0.5)]' 
        : 'border-gray-800';
    const textClass = isMenh ? 'text-yellow-300' : isThan ? 'text-fuchsia-300' : 'text-gray-300';
    
    const branchMap: Record<string, string> = {
        'Cung Mệnh': 'Dần', 'Cung Phụ Mẫu': 'Mão', 'Cung Phúc Đức': 'Thìn', 'Cung Điền Trạch': 'Tỵ',
        'Cung Quan Lộc': 'Ngọ', 'Cung Nô Bộc': 'Mùi', 'Cung Thiên Di': 'Thân', 'Cung Tật Ách': 'Dậu',
        'Cung Tài Bạch': 'Tuất', 'Cung Tử Tức': 'Hợi', 'Cung Phu Thê': 'Tý', 'Cung Huynh Đệ': 'Sửu'
    };

    const displayName = palace.name.replace('Cung ', '').replace('Palace of ', '');

    return (
        <button onClick={onClick} className={`w-full h-full relative bg-gray-900/50 rounded-lg p-2 sm:p-3 text-[10px] sm:text-xs border ${borderClass} flex flex-col transition-all duration-300 hover:bg-gray-900 hover:shadow-lg hover:-translate-y-1 hover:shadow-yellow-500/20`}>
            {isMenh && <span className="absolute top-1 right-1 text-[10px] sm:text-xs font-bold text-yellow-300 bg-black/50 px-1.5 py-0.5 rounded">{t('menh')}</span>}
            {isThan && !isMenh && <span className="absolute top-1 right-1 text-[10px] sm:text-xs font-bold text-fuchsia-300 bg-black/50 px-1.5 py-0.5 rounded">{t('than')}</span>}
            
            <span className="absolute bottom-1 left-2 text-sm font-serif text-gray-600">{branchMap[palace.name]}</span>
            
            <h3 className={`font-bold text-center text-xs sm:text-sm mb-1 sm:mb-2 flex items-center justify-center gap-2 ${textClass}`}>
                <PalaceIcon palaceName={palace.name} />
                {displayName}
            </h3>
            <div className="text-center text-purple-300 font-semibold flex-grow min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center break-words">{palace.stars.join(', ')}</div>
            <div className="mt-auto text-center text-yellow-500 hover:text-yellow-400 text-xs font-semibold">{t('details')}</div>
        </button>
    );
});

const PalaceDetailModal: React.FC<{ palace: Palace; onClose: () => void; }> = ({ palace, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity p-4 animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="max-w-2xl w-full p-8 rounded-xl bg-gray-900/70 backdrop-blur-lg border border-yellow-400/30 shadow-2xl shadow-black/50"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-yellow-300 font-serif flex items-center gap-3">
                            <PalaceIcon palaceName={palace.name} />
                            {palace.name}
                        </h2>
                        <p className="font-semibold text-purple-300 mt-2">{palace.stars.join(', ')}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto pr-4 -mr-4">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-justify" style={{lineHeight: 1.8}}>{palace.interpretation}</p>
                </div>
            </div>
        </div>
    );
};

const palaceToGridArea: Record<string, string> = {
    'Cung Quan Lộc': 'quan-loc', 'Cung Nô Bộc': 'no-boc', 'Cung Thiên Di': 'thien-di', 'Cung Tật Ách': 'tat-ach',
    'Cung Điền Trạch': 'dien-trach', 'Cung Tài Bạch': 'tai-bach',
    'Cung Phúc Đức': 'phuc-duc', 'Cung Tử Tức': 'tu-tuc',
    'Cung Phụ Mẫu': 'phu-mau', 'Cung Mệnh': 'menh', 'Cung Phu Thê': 'phu-the', 'Cung Huynh Đệ': 'huynh-de'
};

const AstrologyChart: React.FC<Props> = ({ data, birthInfo, onReset, onOpenDonationModal }) => {
    const { t } = useLocalization();
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [viewingPalace, setViewingPalace] = useState<Palace | null>(null);

    const allPalaces = useMemo(() => [
        data.cungMenh, data.cungPhuMau, data.cungPhucDuc, data.cungDienTrach,
        data.cungQuanLoc, data.cungNoBoc, data.cungThienDi, data.cungTatAch,
        data.cungTaiBach, data.cungTuTuc, data.cungPhuThe, data.cungHuynhDe
    ], [data]);

    const loadScript = (src: string) => {
        return new Promise<void>((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                return resolve();
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Script load error for ${src}`));
            document.body.appendChild(script);
        });
    };

    const handleDownloadPdf = async () => {
        setIsDownloadingPdf(true);
        try {
            await Promise.all([
                loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),
                loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
            ]);
            
            const chartElement = document.getElementById('laso-print-area');
            if (!chartElement) throw new Error("Chart element not found");

            const canvas = await html2canvas(chartElement, { scale: 2, useCORS: true, backgroundColor: '#0c0a1a' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF({
                orientation: 'p',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`Horoscope-${birthInfo.name.replace(/\s/g, '_')}.pdf`);

        } catch (error) {
            console.error("Failed to download PDF:", error);
            alert(t('errorPdf'));
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    const birthDate = new Intl.DateTimeFormat(t('locale'), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(new Date(birthInfo.year, birthInfo.month - 1, birthInfo.day));

    return (
        <div className="max-w-7xl mx-auto">
            <div id="laso-print-area" className="p-2 sm:p-4 bg-gray-900/30 rounded-lg">
                <div className="grid grid-cols-4 grid-rows-4 gap-1 sm:gap-2" style={{aspectRatio: '1 / 1'}}>
                    {allPalaces.map(palace => (
                         <div key={palace.name} style={{ gridArea: palaceToGridArea[palace.name] }}>
                            <PalaceCard 
                                palace={palace} 
                                isMenh={palace.name === data.cungMenh.name} 
                                isThan={palace.name === data.tongQuan.thanCungName}
                                onClick={() => setViewingPalace(palace)}
                            />
                        </div>
                    ))}

                    <div className="p-2 sm:p-4 bg-gray-950/70 rounded-lg border border-yellow-500/30 flex flex-col justify-center text-center shadow-[0_0_20px_rgba(250,204,21,0.2)]" style={{gridArea: 'center'}}>
                        <div className="flex-grow flex flex-col justify-center">
                            <h2 className="text-lg sm:text-2xl font-bold text-yellow-400 font-serif">{birthInfo.name}</h2>
                            <p className="text-gray-300 text-xs sm:text-sm">{t(birthInfo.gender)} - {birthDate}</p>
                            <p className="text-gray-400 text-[10px] sm:text-xs">{birthInfo.hour === -1 ? t('formHourUnknown') : t('formHourUnit', { hour: birthInfo.hour })}</p>
                         </div>
                         <div className="text-[10px] sm:text-xs space-y-1 text-gray-300 my-2 py-2 border-y border-gray-700/50">
                           <p><strong className="text-gray-400">{t('menh')}:</strong> {data.tongQuan.menh}</p>
                           <p><strong className="text-gray-400">{t('than')}:</strong> {data.tongQuan.than}</p>
                        </div>
                        <details className="text-xs mt-auto">
                           <summary className="text-center text-yellow-500 cursor-pointer hover:text-yellow-400 list-none font-semibold">{t('starChart')}</summary>
                           <pre className="text-gray-400 whitespace-pre-wrap font-sans text-left mt-2 p-2 bg-gray-900/70 rounded max-h-24 overflow-y-auto text-[10px]">{data.anSao}</pre>
                        </details>
                    </div>
                </div>

                <style>{`
                    #laso-print-area .grid {
                        grid-template-areas: 
                            "quan-loc   no-boc   thien-di  tat-ach"
                            "dien-trach  center   center    tai-bach"
                            "phuc-duc   center   center    tu-tuc"
                            "phu-mau    menh     phu-the   huynh-de";
                    }
                    #laso-print-area [style*="grid-area: center"] {
                        grid-column: span 2;
                        grid-row: span 2;
                    }
                `}</style>

                <div className="mt-4 p-6 bg-gray-900/50 rounded-lg border border-gray-800">
                    <h3 className="text-xl font-bold text-yellow-400 font-serif mb-3">{t('summary')}</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-justify" style={{lineHeight: 1.8}}>{data.tongKet}</p>
                </div>
            </div>

            {viewingPalace && <PalaceDetailModal palace={viewingPalace} onClose={() => setViewingPalace(null)} />}

            <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button onClick={onReset} variant="secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    {t('home')}
                </Button>
                <Button onClick={handleDownloadPdf} disabled={isDownloadingPdf} variant="secondary" className="bg-blue-600 hover:bg-blue-700 text-white">
                     {isDownloadingPdf ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                     )}
                    {isDownloadingPdf ? t('creating') : t('downloadPdf')}
                </Button>
                <Button onClick={onOpenDonationModal} variant="special">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {t('donate')}
                </Button>
            </div>
        </div>
    );
};

export default AstrologyChart;