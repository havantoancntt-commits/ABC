import React, { useState } from 'react';
import type { NumerologyData, NumerologyInfo, NumerologyNumber, BirthdayChartData } from '../lib/types';
import Button from './Button';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
  data: NumerologyData;
  info: NumerologyInfo;
  onTryAgain: () => void;
  onGoHome: () => void;
  onOpenDonationModal: () => void;
}

const NumberCard: React.FC<{ title: string; numberInfo: NumerologyNumber, color: string }> = ({ title, numberInfo, color }) => (
    <div className="flex flex-col items-center text-center">
        <div className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center border-4 ${color} shadow-lg mb-4`}>
            <div className={`absolute inset-0 rounded-full ${color.replace('border-', 'bg-').replace('cyan', 'blue')} opacity-10`}></div>
            <span className="text-5xl font-bold text-white font-serif">{numberInfo.number}</span>
        </div>
        <h3 className={`text-xl font-semibold ${color.replace('border-', 'text-')}`}>{title}</h3>
    </div>
);


const BirthdayChart: React.FC<{ chartData: BirthdayChartData }> = ({ chartData }) => {
    const { t } = useLocalization();
    const gridNumbers = [3, 6, 9, 2, 5, 8, 1, 4, 7];

    const arrowPaths: Record<string, string> = {
        '1-4-7': 'M 50 260 L 270 260',
        '2-5-8': 'M 50 160 L 270 160',
        '3-6-9': 'M 50 60 L 270 60',
        '3-2-1': 'M 50 60 L 50 260',
        '6-5-4': 'M 160 60 L 160 260',
        '9-8-7': 'M 270 60 L 270 260',
        '1-5-9': 'M 50 260 L 270 60',
        '3-5-7': 'M 50 60 L 270 260',
    };

    const arrowNameKeywords: Record<string, string[]> = {
        '1-4-7': ['thực tế', 'practicality', 'thể chất', 'physicality', 'hỗn loạn', 'disorder'],
        '2-5-8': ['cảm xúc', 'feeling', 'tinh thần', 'spirituality', 'nhạy cảm', 'sensitivity'],
        '3-6-9': ['trí não', 'intellect', 'trí tuệ', 'mind', 'trí nhớ', 'memory'],
        '3-2-1': ['kế hoạch', 'planning', 'thụ động', 'lack'],
        '6-5-4': ['ý chí', 'willpower', 'uất giận', 'frustration'],
        '9-8-7': ['hoạt động', 'action', 'activity', 'trì hoãn', 'passivity'],
        '1-5-9': ['quyết tâm', 'determination', 'chần chừ', 'procrastination'],
        '3-5-7': ['nhạy bén', 'sensitivity', 'tâm linh', 'hoài nghi', 'skepticism'],
    };

    const findArrowPath = (arrowName: string) => {
        const lowerCaseName = arrowName.toLowerCase();
        for (const pathKey in arrowNameKeywords) {
            if (arrowNameKeywords[pathKey].some(keyword => lowerCaseName.includes(keyword))) {
                return arrowPaths[pathKey];
            }
        }
        return null;
    };

    return (
        <Card className="mt-8">
            <h3 className="text-3xl font-bold text-cyan-300 font-serif mb-8 text-center">{t('numerologyBirthdayChartTitle')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="relative aspect-square max-w-sm mx-auto w-full">
                    <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-2">
                        {gridNumbers.map(num => {
                            const count = chartData.numberCounts[num - 1] || 0;
                            return (
                                <div key={num} className={`aspect-square flex items-center justify-center rounded-lg border-2 ${count > 0 ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-700/50'}`}>
                                    <span className={`font-bold text-4xl font-serif text-center break-all ${count > 0 ? 'text-white' : 'text-gray-600'}`}>
                                        {count > 0 ? `${num}`.repeat(count) : num}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 320 320" preserveAspectRatio="none">
                        {chartData.strengthArrows.map(arrow => {
                            const path = findArrowPath(arrow.name);
                            if (!path) return null;
                            return <path key={`strength-${arrow.name}`} d={path} stroke="#22d3ee" strokeWidth="5" strokeLinecap="round" fill="none" className="opacity-80 drop-shadow-[0_0_5px_#22d3ee]" />;
                        })}
                        {chartData.weaknessArrows.map(arrow => {
                            const path = findArrowPath(arrow.name);
                            if (!path) return null;
                            return <path key={`weakness-${arrow.name}`} d={path} stroke="#a855f7" strokeWidth="5" strokeLinecap="round" strokeDasharray="10 5" fill="none" className="opacity-70" />;
                        })}
                    </svg>
                </div>
                <div className="space-y-6">
                    {chartData.strengthArrows.length > 0 && (
                        <div>
                            <h4 className="text-xl font-semibold text-cyan-300 font-serif mb-3">{t('numerologyStrengthArrows')}</h4>
                            <div className="space-y-4">
                                {chartData.strengthArrows.map(arrow => (
                                    <div key={arrow.name} className="p-4 bg-gray-900/50 rounded-lg border-l-4 border-cyan-400">
                                        <p className="font-bold text-white">{arrow.name}</p>
                                        <p className="text-gray-400 text-sm mt-1">{arrow.interpretation}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                     {chartData.weaknessArrows.length > 0 && (
                        <div>
                            <h4 className="text-xl font-semibold text-purple-400 font-serif mb-3">{t('numerologyWeaknessArrows')}</h4>
                            <div className="space-y-4">
                                {chartData.weaknessArrows.map(arrow => (
                                    <div key={arrow.name} className="p-4 bg-gray-900/50 rounded-lg border-l-4 border-purple-400">
                                        <p className="font-bold text-white">{arrow.name}</p>
                                        <p className="text-gray-400 text-sm mt-1">{arrow.interpretation}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};


const NumerologyChart: React.FC<Props> = ({ data, info, onTryAgain, onGoHome, onOpenDonationModal }) => {
    const { t } = useLocalization();
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    
    const InterpretationSection: React.FC<{ title: string; number: number; content: string; icon: React.ReactNode }> = React.memo(({ title, number, content, icon }) => (
        <Card className="p-6">
            <h3 className="text-2xl font-bold text-cyan-300 font-serif mb-4 flex items-center gap-3">
                {icon}
                {t('numerologyCoreNumber', {title, number})}
            </h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-justify" style={{lineHeight: 1.8}}>{content}</p>
        </Card>
    ));

    const handleDownloadPdf = async () => {
        setIsDownloadingPdf(true);
        try {
            const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
                import('jspdf'),
                import('html2canvas')
            ]);
            
            const chartElement = document.getElementById('numerology-print-area');
            if (!chartElement) throw new Error("Chart element not found");

            const canvas = await html2canvas(chartElement, { scale: 2, useCORS: true, backgroundColor: '#0c0a1a' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`Numerology-${info.fullName.replace(/\s/g, '_')}.pdf`);

        } catch (error) {
            console.error("Failed to download PDF:", error);
            alert(t('errorPdf'));
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    const birthDate = new Intl.DateTimeFormat(t('locale'), {
        day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(new Date(info.year, info.month - 1, info.day));

    const coreNumbers = [
        { title: t('numerologyLifePath'), data: data.lifePathNumber, color: 'border-cyan-400' },
        { title: t('numerologyDestiny'), data: data.destinyNumber, color: 'border-purple-400' },
        { title: t('numerologySoulUrge'), data: data.soulUrgeNumber, color: 'border-yellow-400' },
        { title: t('numerologyPersonality'), data: data.personalityNumber, color: 'border-emerald-400' },
        { title: t('numerologyBirthday'), data: data.birthdayNumber, color: 'border-rose-400' },
    ];
    
    const iconClass = "w-7 h-7 text-cyan-400 shrink-0";
    const icons: React.ReactNode[] = [
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <div id="numerology-print-area" className="p-2 sm:p-4 bg-gray-900/30 rounded-lg">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-100 font-serif leading-tight">{t('numerologyResultTitle')}</h2>
                    <p className="mt-4 text-xl text-cyan-300 font-semibold">{info.fullName}</p>
                    <p className="text-md text-gray-400">{birthDate}</p>
                </div>
                <Card>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-8 gap-x-4">
                        {coreNumbers.map((item, index) => (
                             <div key={index} className="animate-slide-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                                 <NumberCard title={item.title} numberInfo={item.data} color={item.color} />
                             </div>
                        ))}
                    </div>
                </Card>
                
                {data.birthdayChart && <BirthdayChart chartData={data.birthdayChart} />}

                <div className="mt-8 space-y-8">
                    {coreNumbers.map((item, index) => (
                        <div key={index} className="animate-slide-in-up" style={{ animationDelay: `${(index + 5) * 100}ms` }}>
                            <InterpretationSection title={item.title} number={item.data.number} content={item.data.interpretation} icon={icons[index]} />
                        </div>
                    ))}
                    <div className="animate-slide-in-up" style={{ animationDelay: '1000ms' }}>
                        <Card className="p-6">
                            <h3 className="text-2xl font-bold text-cyan-300 font-serif mb-4 flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {t('numerologySummary')}
                            </h3>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-justify" style={{lineHeight: 1.8}}>{data.summary}</p>
                        </Card>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center text-amber-100/80 max-w-3xl mx-auto text-sm">
                <p>{t('resultSupportMessage')}</p>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Button onClick={onGoHome} variant="secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    {t('home')}
                </Button>
                 <Button onClick={onTryAgain} variant="secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5m9-1-9 9-9-9" /></svg>
                    {t('numerologyTryAgain')}
                </Button>
                <Button onClick={handleDownloadPdf} disabled={isDownloadingPdf} variant="secondary" className="bg-blue-600 hover:bg-blue-700 text-white">
                     {isDownloadingPdf ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                     )}
                    {isDownloadingPdf ? t('creating') : t('numerologyDownloadPdf')}
                </Button>
                <Button onClick={onOpenDonationModal} variant="primary">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {t('donate')}
                </Button>
            </div>
        </div>
    );
};

export default NumerologyChart;