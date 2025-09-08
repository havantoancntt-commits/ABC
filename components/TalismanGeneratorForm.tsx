import React, { useState, useEffect } from 'react';
import type { TalismanInfo } from '../lib/types';
import Button from './Button';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
  onSubmit: (data: TalismanInfo) => void;
}

const TalismanGeneratorForm: React.FC<Props> = ({ onSubmit }) => {
  const { t } = useLocalization();
  const currentYear = new Date().getFullYear();
  const [name, setName] = useState('');
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(currentYear - 20);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) {
      setDay(daysInMonth);
    }
  }, [year, month, day]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (name.trim() === '') {
      newErrors.name = t('errorFormName');
    }
    if (year > currentYear) {
      newErrors.year = t('errorFormYear');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ name, year, month, day });
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
              {t('talismanFormTitle')}
          </h2>
          <p className="mt-4 text-lg text-gray-300 leading-relaxed">
              {t('talismanFormSubtitle')}
          </p>
      </div>
      <Card>
        <h2 className="text-3xl font-bold text-center mb-8 text-amber-400 font-serif">{t('formHeading')}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">{t('formNameLabel')}</label>
            <input
              type="text" id="name" value={name} onChange={(e) => {setName(e.target.value); if (errors.name) setErrors(prev => ({...prev, name: ''})); }}
              className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${errors.name ? 'border-red-500' : 'border-gray-600'}`}
              placeholder={t('formNamePlaceholder')} required
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('formDobLabel')}</label>
              <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="day" className="sr-only">{t('day')}</label>
                    <select id="day" value={day} onChange={(e) => setDay(parseInt(e.target.value))} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all">
                        {renderOptions(1, 31)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="month" className="sr-only">{t('month')}</label>
                    <select id="month" value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all">
                        {renderOptions(1, 12)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="year" className="sr-only">{t('year')}</label>
                    <select id="year" value={year} onChange={(e) => { setYear(parseInt(e.target.value)); if (errors.year) setErrors(prev => ({...prev, year: ''})); }}
                        className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${errors.year ? 'border-red-500' : 'border-gray-600'}`}>
                        {renderOptions(1920, currentYear).reverse()}
                    </select>
                  </div>
              </div>
              {errors.year && <p className="text-red-500 text-xs mt-1 md:col-span-3 text-right">{errors.year}</p>}
          </div>
          
          <div className="pt-4">
            <Button type="submit" variant="talisman" className="w-full text-lg py-4">
              {t('talismanFormSubmitButton')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TalismanGeneratorForm;