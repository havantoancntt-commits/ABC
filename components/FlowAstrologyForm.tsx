import React, { useState, useEffect } from 'react';
import type { FlowAstrologyInfo } from '../lib/types';
import Button from './Button';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
  onSubmit: (data: FlowAstrologyInfo) => void;
  // FIX: Add initialName prop to pre-fill the form.
  initialName?: string;
}

const FlowAstrologyForm: React.FC<Props> = ({ onSubmit, initialName }) => {
  const { t } = useLocalization();
  const currentYear = new Date().getFullYear();
  // FIX: Use initialName to set the initial state for the name.
  const [name, setName] = useState(initialName || '');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(currentYear - 20);
  const [hour, setHour] = useState(12);
  const [intuitiveNumber, setIntuitiveNumber] = useState('');
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
    if (intuitiveNumber.trim() === '' || isNaN(parseInt(intuitiveNumber, 10))) {
        newErrors.intuitiveNumber = t('errorFormIntuitiveNumber');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ name, gender, year, month, day, hour, intuitiveNumber: parseInt(intuitiveNumber, 10) });
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
              {t('flowAstrologyFormTitle')}
          </h2>
          <p className="mt-4 text-lg text-gray-300 leading-relaxed">
              {t('flowAstrologyFormSubtitle')}
          </p>
      </div>
      <Card>
        <h2 className="text-3xl font-bold text-center mb-8 text-sky-300 font-serif">{t('formHeading')}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">{t('formNameLabel')}</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({...prev, name: ''}));
              }}
              className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all ${errors.name ? 'border-red-500' : 'border-gray-600'}`}
              placeholder={t('formNamePlaceholder')}
              required
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('formDobLabel')}</label>
              <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="day" className="sr-only">{t('day')}</label>
                    <select id="day" value={day} onChange={(e) => setDay(parseInt(e.target.value))} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all">
                        {renderOptions(1, 31)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="month" className="sr-only">{t('month')}</label>
                    <select id="month" value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all">
                        {renderOptions(1, 12)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="year" className="sr-only">{t('year')}</label>
                    <select id="year" value={year} onChange={(e) => { setYear(parseInt(e.target.value)); if (errors.year) setErrors(prev => ({...prev, year: ''})); }} className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all ${errors.year ? 'border-red-500' : 'border-gray-600'}`}>
                        {renderOptions(1920, currentYear).reverse()}
                    </select>
                  </div>
              </div>
              {errors.year && <p className="text-red-500 text-xs mt-1 md:col-span-3 text-right">{errors.year}</p>}
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-2">{t('formGenderLabel')}</label>
            <select id="gender" value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all">
              <option value="male">{t('male')}</option>
              <option value="female">{t('female')}</option>
            </select>
          </div>

          <div>
              <label htmlFor="hour" className="block text-sm font-medium text-gray-300 mb-2">{t('formHourLabel')}</label>
              <select id="hour" value={hour} onChange={(e) => setHour(parseInt(e.target.value))} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all">
                  <option value={-1}>{t('formHourUnknown')}</option>
                  {renderOptions(0, 23).map(option => React.cloneElement(option, { children: t('formHourUnit', { hour: option.props.value }) }))}
              </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="intuitiveNumber" className="block text-sm font-medium text-gray-300 mb-2">{t('flowAstrologyIntuitiveNumberLabel')}</label>
            <input
              type="number"
              id="intuitiveNumber"
              value={intuitiveNumber}
              onChange={(e) => {
                setIntuitiveNumber(e.target.value);
                if (errors.intuitiveNumber) setErrors(prev => ({...prev, intuitiveNumber: ''}));
              }}
              className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all ${errors.intuitiveNumber ? 'border-red-500' : 'border-gray-600'}`}
              placeholder={t('flowAstrologyIntuitiveNumberPlaceholder')}
              required
            />
            {errors.intuitiveNumber && <p className="text-red-500 text-xs mt-1">{errors.intuitiveNumber}</p>}
          </div>
          
          <div className="md:col-span-2 mt-4">
            <Button type="submit" variant="flow" className="w-full text-lg py-4">
              {t('flowAstrologySubmitButton')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default FlowAstrologyForm;