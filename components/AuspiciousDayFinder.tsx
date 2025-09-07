import React, { useState, useCallback } from 'react';
import type { AuspiciousDayInfo, AuspiciousDayData } from '../lib/types';
import { getAuspiciousDayAnalysis } from '../lib/gemini';
import { useLocalization } from '../hooks/useLocalization';
import Card from './Card';
import Button from './Button';
import Spinner from './Spinner';

const AuspiciousDayFinder: React.FC = () => {
    const { t, language } = useLocalization();
    const currentDate = new Date();
    const [day, setDay] = useState(currentDate.getDate());
    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    const [year, setYear] = useState(currentDate.getFullYear());
    const [event, setEvent] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [analysisData, setAnalysisData] = useState<AuspiciousDayData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (event.trim() === '') {
            newErrors.event = t('errorFormEvent');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFindDay = useCallback(async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        setError(null);
        setAnalysisData(null);

        const info: AuspiciousDayInfo = { day, month, year, event };

        try {
            const data = await getAuspiciousDayAnalysis(info, language);
            setAnalysisData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('errorUnknown'));
        } finally {
            setIsLoading(false);
        }
    }, [day, month, year, event, language, t]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleFindDay();
    };

    const handleReset = () => {
        setAnalysisData(null);
        setError(null);
        setIsLoading(false);
        setEvent('');
        setErrors({});
    };

    const renderOptions = (start: number, end: number) => {
        const options = [];
        for (let i = start; i <= end; i++) {
            options.push(<option key={i} value={i}>{i}</option>);
        }
        return options;
    };

    if (isLoading) {
        return <Spinner message={t('spinnerAuspiciousDay')} />;
    }

    if (error) {
        return (
            <div className="text-center">
                <Card>
                    <p className="text-red-400 font-bold mb-2">{t('errorTitle')}</p>
                    <p className="text-red-300">{error}</p>
                    <Button onClick={handleReset} variant="secondary" className="mt-6">
                        {t('back')}
                    </Button>
                </Card>
            </div>
        );
    }

    if (analysisData) {
        return <AnalysisResult data={analysisData} onReset={handleReset} />;
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-bold text-gray-100 font-serif leading-tight">
                    {t('auspiciousDayFinderTitle')}
                </h2>
                <p className="mt-4 text-lg text-gray-300 leading-relaxed">
                    {t('auspiciousDayFinderSubtitle')}
                </p>
            </div>
            <Card>
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('zodiacFinderSelectDate')}</label>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="day" className="sr-only">{t('day')}</label>
                                <select id="day" value={day} onChange={(e) => setDay(parseInt(e.target.value))} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all">
                                    {renderOptions(1, 31)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="month" className="sr-only">{t('month')}</label>
                                <select id="month" value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all">
                                    {renderOptions(1, 12)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="year" className="sr-only">{t('year')}</label>
                                <select id="year" value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all">
                                    {renderOptions(1920, currentDate.getFullYear() + 5).reverse()}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="event" className="block text-sm font-medium text-gray-300 mb-2">{t('auspiciousDayFinderEventLabel')}</label>
                        <input
                            type="text"
                            id="event"
                            value={event}
                            onChange={(e) => {
                                setEvent(e.target.value);
                                if (errors.event) setErrors(prev => ({ ...prev, event: '' }));
                            }}
                            className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all ${errors.event ? 'border-red-500' : 'border-gray-600'}`}
                            placeholder={t('auspiciousDayFinderEventPlaceholder')}
                            required
                        />
                        {errors.event && <p className="text-red-500 text-xs mt-1">{errors.event}</p>}
                    </div>
                    <div className="pt-2">
                        <Button type="submit" variant="dayselection" className="w-full text-lg py-4">
                            {t('auspiciousDayFinderButton')}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

interface AnalysisResultProps {
    data: AuspiciousDayData;
    onReset: () => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, onReset }) => {
    const { t } = useLocalization();
    const selectedDateString = data.gregorianDate;

    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-bold text-gray-100 font-serif leading-tight">
                    {t('auspiciousDayResultTitle', { date: selectedDateString })}
                </h2>
                <p className="mt-4 text-lg text-teal-300">{t('lunarDate')}: {data.lunarDate}</p>
                <p className="text-md text-gray-400">{data.yearCanChi} - {data.monthCanChi} - {data.dayCanChi}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <InfoCard title={t('dayInfo')}>
                        <InfoItem label={t('solarTerm')} value={data.tietKhi} />
                        <InfoItem label={t('dutyOfficer')} value={data.truc} />
                    </InfoCard>
                    <InfoCard title={t('goodStars')} iconColor="text-yellow-400">
                        <p className="text-gray-300 leading-relaxed">{data.goodStars.join(', ')}</p>
                    </InfoCard>
                    <InfoCard title={t('badStars')} iconColor="text-purple-400">
                        <p className="text-gray-300 leading-relaxed">{data.badStars.join(', ')}</p>
                    </InfoCard>
                    <InfoCard title={t('auspiciousHours')} iconColor="text-yellow-400">
                        <p className="text-gray-300 font-semibold leading-relaxed">{data.auspiciousHours.join(' | ')}</p>
                    </InfoCard>
                </div>
                <div className="space-y-6">
                    <InfoCard title={t('overallAnalysis')}>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{data.overallAnalysis}</p>
                    </InfoCard>
                     <InfoCard title={t('eventAnalysis', { event: '' })} iconColor="text-teal-300">
                         <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{data.eventAnalysis}</p>
                    </InfoCard>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                 <InfoCard title={t('recommendedActivities')} iconColor="text-green-400">
                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                        {data.recommendedActivities.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </InfoCard>
                <InfoCard title={t('avoidActivities')} iconColor="text-red-400">
                     <ul className="list-disc list-inside space-y-2 text-gray-300">
                        {data.avoidActivities.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </InfoCard>
            </div>

            <div className="mt-10 text-center">
                <Button onClick={onReset} variant="secondary">
                    {t('back')}
                </Button>
            </div>
        </div>
    );
};

const InfoCard: React.FC<{ title: string; children: React.ReactNode; iconColor?: string }> = ({ title, children, iconColor = 'text-teal-300' }) => (
    <Card>
        <h3 className={`text-2xl font-bold font-serif mb-4 ${iconColor}`}>{title}</h3>
        {children}
    </Card>
);

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-800">
        <span className="text-gray-400">{label}:</span>
        <span className="font-semibold text-white">{value}</span>
    </div>
);


export default AuspiciousDayFinder;