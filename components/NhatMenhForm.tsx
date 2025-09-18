import React, { useState, useEffect } from 'react';
import type { NhatMenhInfo } from '../lib/types';
import Button from './Button';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
  onSubmit: (data: NhatMenhInfo) => void;
}

const spiritualMarks = [
    { name: 'Hoa Sen', symbol: '🪷', value: 'lotus' },
    { name: 'Phượng Hoàng', symbol: '🔥', value: 'phoenix' },
    { name: 'Rồng Xanh', symbol: '🐉', value: 'dragon' },
    { name: 'Linh Quy', symbol: '🐢', value: 'turtle' },
    { name: 'Ngọc Bích', symbol: '💎', value: 'jade' },
    { name: 'Vô Cực', symbol: '☯️', value: 'infinity' },
];

const NhatMenhForm: React.FC<Props> = ({ onSubmit }) => {
  const { t } = useLocalization();
  const currentYear = new Date().getFullYear();
  const [day, setDay] = useState(new Date().getDate());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [spiritualMark, setSpiritualMark] = useState(spiritualMarks[0].value);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) {
      setDay(daysInMonth);
    }
  }, [year, month, day]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (year > currentYear + 1) {
      newErrors.year = t('errorFormYear');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ year, month, day, spiritualMark });
    }
  };
  
  const renderOptions = (start: number, end: number) => {
    const options = [];
    for (let i = start; i <= end; i++) {
      options.push(<option key={i} value={i}>{i}</option>);
    }
    return options;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10 max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-100 font-serif leading-tight">
              {t('nhatMenhFormTitle')}
          </h2>
          <p className="mt-4 text-lg text-gray-300 leading-relaxed">
              {t('nhatMenhFormSubtitle')}
          </p>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 text-center">{t('nhatMenhFormDateLabel')}</label>
              <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="day" className="sr-only">{t('day')}</label>
                    <select
                        id="day" value={day} onChange={(e) => setDay(parseInt(e.target.value))}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-center">
                        {renderOptions(1, 31)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="month" className="sr-only">{t('month')}</label>
                    <select
                        id="month" value={month} onChange={(e) => setMonth(parseInt(e.target.value))}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-center">
                        {renderOptions(1, 12)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="year" className="sr-only">{t('year')}</label>
                    <select
                        id="year" value={year} onChange={(e) => { setYear(parseInt(e.target.value)); if (errors.year) setErrors(prev => ({...prev, year: ''})); }}
                        className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-center ${errors.year ? 'border-red-500' : 'border-gray-600'}`}>
                        {renderOptions(1920, currentYear + 1).reverse()}
                    </select>
                  </div>
              </div>
              {errors.year && <p className="text-red-500 text-xs mt-1 text-right">{errors.year}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4 text-center">{t('nhatMenhFormSpiritualMarkLabel')}</label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {spiritualMarks.map(mark => (
                    <button type="button" key={mark.value} onClick={() => setSpiritualMark(mark.value)}
                        className={`p-3 rounded-lg border-2 transition-all duration-300 flex flex-col items-center gap-1 ${spiritualMark === mark.value ? 'bg-purple-500/30 border-purple-400 scale-110' : 'bg-gray-900/50 border-gray-700 hover:border-gray-500'}`}>
                        <span className="text-3xl">{mark.symbol}</span>
                        <span className="text-xs text-gray-300">{mark.name}</span>
                    </button>
                ))}
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" variant="nhatmenh" className="w-full text-lg py-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              {t('nhatMenhCtaButton')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NhatMenhForm;