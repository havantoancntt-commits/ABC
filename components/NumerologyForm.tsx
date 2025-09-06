import React, { useState } from 'react';
import type { NumerologyInfo } from '../lib/types';
import Button from './Button';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
  onSubmit: (data: NumerologyInfo) => void;
}

const NumerologyForm: React.FC<Props> = ({ onSubmit }) => {
  const { t } = useLocalization();
  const currentYear = new Date().getFullYear();
  const [fullName, setFullName] = useState('');
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(currentYear - 20);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (fullName.trim() === '') {
      newErrors.fullName = t('errorFormFullName');
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
      onSubmit({ fullName, year, month, day });
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
              {t('numerologyFormTitle')}
          </h2>
          <p className="mt-4 text-lg text-gray-300 leading-relaxed">
              {t('numerologyFormSubtitle')}
          </p>
      </div>
      <Card>
        <h2 className="text-3xl font-bold text-center mb-8 text-cyan-300 font-serif">{t('numerologyFormHeading')}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">{t('numerologyFullNameLabel')}</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors(prev => ({...prev, fullName: ''}));
              }}
              className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all ${errors.fullName ? 'border-red-500' : 'border-gray-600'}`}
              placeholder={t('numerologyFullNamePlaceholder')}
              required
              aria-required="true"
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
            />
            {errors.fullName && <p id="fullName-error" className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>
          
          <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('numerologyDobLabel')}</label>
              <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="day" className="sr-only">{t('day')}</label>
                    <select
                        id="day"
                        value={day}
                        onChange={(e) => setDay(parseInt(e.target.value))}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    >
                        {renderOptions(1, 31)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="month" className="sr-only">{t('month')}</label>
                    <select
                        id="month"
                        value={month}
                        onChange={(e) => setMonth(parseInt(e.target.value))}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    >
                        {renderOptions(1, 12)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="year" className="sr-only">{t('year')}</label>
                    <select
                        id="year"
                        value={year}
                        onChange={(e) => {
                            setYear(parseInt(e.target.value));
                            if (errors.year) setErrors(prev => ({...prev, year: ''}));
                        }}
                        className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all ${errors.year ? 'border-red-500' : 'border-gray-600'}`}
                        aria-invalid={!!errors.year}
                        aria-describedby={errors.year ? "year-error" : undefined}
                    >
                        {renderOptions(1920, currentYear).reverse()}
                    </select>
                  </div>
              </div>
              {errors.year && <p id="year-error" className="text-red-500 text-xs mt-1 text-right">{errors.year}</p>}
          </div>

          <div className="pt-4">
            <Button type="submit" variant="numerology" className="w-full text-lg py-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              {t('numerologySubmitButton')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NumerologyForm;
