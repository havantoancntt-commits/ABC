import React, { useState, useEffect, useCallback } from 'react';
import type { ZodiacHourData } from '../lib/types';
import Button from './Button';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';
import { calculateZodiacData } from '../lib/zodiac';

const ZodiacHourFinder: React.FC = () => {
  const { t, language } = useLocalization();
  const [currentDate] = useState(new Date());
  const [day, setDay] = useState(currentDate.getDate());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [data, setData] = useState<ZodiacHourData | null>(null);

  const findHours = useCallback(() => {
    const result = calculateZodiacData({ day, month, year }, language);
    setData(result);
  }, [day, month, year, language]);

  useEffect(() => {
    findHours();
  }, [findHours]);

  const handleFind = (e: React.FormEvent) => {
    e.preventDefault();
    findHours();
  };

  const renderOptions = (start: number, end: number) => {
    const options = [];
    for (let i = start; i <= end; i++) {
      options.push(<option key={i} value={i}>{i}</option>);
    }
    return options;
  };

  const selectedDateString = new Intl.DateTimeFormat(t('locale'), {
      day: '2-digit', month: '2-digit', year: 'numeric'
  }).format(new Date(year, month - 1, day));
  
  return (
    <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-100 font-serif leading-tight">
              {t('zodiacFinderTitle')}
          </h2>
          <p className="mt-4 text-lg text-gray-300 leading-relaxed">
              {t('zodiacFinderSubtitle')}
          </p>
      </div>
      <Card>
        <form onSubmit={handleFind} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('zodiacFinderSelectDate')}</label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="day" className="sr-only">{t('day')}</label>
                <select id="day" value={day} onChange={(e) => setDay(parseInt(e.target.value))} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all">
                    {renderOptions(1, 31)}
                </select>
              </div>
              <div>
                <label htmlFor="month" className="sr-only">{t('month')}</label>
                <select id="month" value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all">
                    {renderOptions(1, 12)}
                </select>
              </div>
              <div>
                <label htmlFor="year" className="sr-only">{t('year')}</label>
                <select id="year" value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all">
                    {renderOptions(1920, currentDate.getFullYear() + 5).reverse()}
                </select>
              </div>
            </div>
          </div>
          <Button type="submit" variant="primary" className="w-full text-md py-3">
             {t('zodiacFinderButton')}
          </Button>
        </form>
      </Card>

      {data && (
        <Card className="mt-8">
            <h3 className="text-2xl font-bold font-serif text-center text-yellow-300 mb-2">
                {t('zodiacFinderResultTitle', { date: selectedDateString })}
            </h3>
            <p className="text-center text-lg text-gray-300 mb-8">{t('zodiacFinderDayInfo', { dayCanChi: data.dayCanChi })}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {data.hours.map((hour, index) => (
                    <div key={hour.name} className={`p-4 rounded-lg flex items-center gap-4 border-l-4 ${hour.isAuspicious ? 'bg-yellow-500/10 border-yellow-400' : 'bg-purple-500/10 border-purple-400'}`}
                         style={{ animation: `fadeInUp 0.5s ${index * 30}ms ease-out forwards`, opacity: 0 }}>
                        <div className={`text-2xl ${hour.isAuspicious ? 'text-yellow-400' : 'text-purple-400'}`}>
                            {hour.isAuspicious ? '☀️' : '🌙'}
                        </div>
                        <div className="flex-grow">
                            <div className="flex justify-between items-baseline">
                                <span className="font-bold text-xl text-white">{hour.name}</span>
                                <span className="text-sm font-mono text-gray-400">{hour.timeRange}</span>
                            </div>
                            <div className="flex justify-between items-baseline mt-1">
                                <span className={`text-sm font-semibold ${hour.isAuspicious ? 'text-yellow-300' : 'text-purple-300'}`}>
                                    {hour.isAuspicious ? t('zodiacFinderAuspicious') : t('zodiacFinderInauspicious')}
                                </span>
                                <span className="text-xs text-gray-500">{hour.governingStar}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
      )}
      <style>{`
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
      `}</style>
    </div>
  );
};

export default ZodiacHourFinder;