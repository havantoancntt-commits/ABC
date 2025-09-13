import React, { useState } from 'react';
import type { PrayerRequestInfo } from '../lib/types';
import Button from './Button';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';
import type { TranslationKey } from '../hooks/useLocalization';

interface Props {
  onSubmit: (data: PrayerRequestInfo) => void;
  initialName?: string;
}

const PrayerGeneratorForm: React.FC<Props> = ({ onSubmit, initialName }) => {
  const { t } = useLocalization();
  const [name, setName] = useState(initialName || '');
  const [occasion, setOccasion] = useState(t('prayerOccasionOption1'));
  const [deity, setDeity] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const occasionOptions: TranslationKey[] = [
      'prayerOccasionOption1', 'prayerOccasionOption2', 'prayerOccasionOption3',
      'prayerOccasionOption4', 'prayerOccasionOption5', 'prayerOccasionOption6'
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (name.trim() === '') newErrors.name = t('errorFormName');
    if (occasion.trim() === '') newErrors.occasion = t('errorPrayerOccasion');
    if (deity.trim() === '') newErrors.deity = t('errorPrayerDeity');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ name, occasion, deity });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-100 font-serif leading-tight">
              {t('prayerFormTitle')}
          </h2>
          <p className="mt-4 text-lg text-gray-300 leading-relaxed">
              {t('prayerFormSubtitle')}
          </p>
      </div>
      <Card>
        <h2 className="text-3xl font-bold text-center mb-8 text-emerald-300 font-serif">{t('prayerFormHeading')}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">{t('prayerFormNameLabel')}</label>
            <input
              type="text" id="name" value={name} onChange={(e) => {setName(e.target.value); if (errors.name) setErrors(prev => ({...prev, name: ''})); }}
              className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${errors.name ? 'border-red-500' : 'border-gray-600'}`}
              placeholder={t('formNamePlaceholder')} required
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="occasion" className="block text-sm font-medium text-gray-300 mb-2">{t('prayerFormOccasionLabel')}</label>
            <select
              id="occasion" value={occasion} onChange={(e) => setOccasion(e.target.value)}
              className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${errors.occasion ? 'border-red-500' : 'border-gray-600'}`}
            >
              {occasionOptions.map(key => <option key={key} value={t(key)}>{t(key)}</option>)}
            </select>
             {errors.occasion && <p className="text-red-500 text-xs mt-1">{errors.occasion}</p>}
          </div>
          
          <div>
            <label htmlFor="deity" className="block text-sm font-medium text-gray-300 mb-2">{t('prayerFormDeityLabel')}</label>
            <input
              type="text" id="deity" value={deity} onChange={(e) => {setDeity(e.target.value); if (errors.deity) setErrors(prev => ({...prev, deity: ''})); }}
              className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${errors.deity ? 'border-red-500' : 'border-gray-600'}`}
              placeholder={t('prayerFormDeityPlaceholder')} required
            />
            {errors.deity && <p className="text-red-500 text-xs mt-1">{errors.deity}</p>}
          </div>

          <div className="pt-4">
            <Button type="submit" variant="prayer" className="w-full text-lg py-4">
              {t('prayerFormSubmitButton')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PrayerGeneratorForm;
