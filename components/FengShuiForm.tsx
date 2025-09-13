import React, { useState } from 'react';
import type { FengShuiInfo } from '../lib/types';
import Button from './Button';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';
import type { TranslationKey } from '../hooks/useLocalization';

interface Props {
  onSubmit: (data: FengShuiInfo) => void;
}

const FengShuiForm: React.FC<Props> = ({ onSubmit }) => {
  const { t } = useLocalization();
  const currentYear = new Date().getFullYear();
  const [spaceType, setSpaceType] = useState(t('fengShuiSpaceTypeResidence'));
  const [ownerBirthYear, setOwnerBirthYear] = useState(currentYear - 30);
  const [question, setQuestion] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const spaceTypeOptions: { key: TranslationKey, value: string }[] = [
      { key: 'fengShuiSpaceTypeResidence', value: t('fengShuiSpaceTypeResidence') },
      { key: 'fengShuiSpaceTypeOffice', value: t('fengShuiSpaceTypeOffice') },
      { key: 'fengShuiSpaceTypeShop', value: t('fengShuiSpaceTypeShop') },
      { key: 'fengShuiSpaceTypeDesk', value: t('fengShuiSpaceTypeDesk') },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (ownerBirthYear > currentYear) {
      newErrors.ownerBirthYear = t('errorFormYear');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ spaceType, ownerBirthYear, question });
    }
  };
  
  const renderYearOptions = () => {
    const options = [];
    for (let i = currentYear; i >= 1920; i--) {
      options.push(<option key={i} value={i}>{i}</option>);
    }
    return options;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-100 font-serif leading-tight">
              {t('fengShuiFormTitle')}
          </h2>
          <p className="mt-4 text-lg text-gray-300 leading-relaxed">
              {t('fengShuiFormSubtitle')}
          </p>
      </div>
      <Card>
        <h2 className="text-3xl font-bold text-center mb-8 text-green-300 font-serif">{t('fengShuiFormHeading')}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="spaceType" className="block text-sm font-medium text-gray-300 mb-2">{t('fengShuiFormSpaceTypeLabel')}</label>
            <select
              id="spaceType" value={spaceType} onChange={(e) => setSpaceType(e.target.value)}
              className="w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            >
              {spaceTypeOptions.map(opt => <option key={opt.key} value={opt.value}>{t(opt.key)}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="ownerBirthYear" className="block text-sm font-medium text-gray-300 mb-2">{t('fengShuiFormBirthYearLabel')}</label>
            <select
              id="ownerBirthYear" value={ownerBirthYear}
              onChange={(e) => { setOwnerBirthYear(parseInt(e.target.value, 10)); if (errors.ownerBirthYear) setErrors(p => ({...p, ownerBirthYear: ''})); }}
              className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${errors.ownerBirthYear ? 'border-red-500' : 'border-gray-600'}`}
            >
              {renderYearOptions()}
            </select>
             {errors.ownerBirthYear && <p className="text-red-500 text-xs mt-1">{errors.ownerBirthYear}</p>}
          </div>
          
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-300 mb-2">{t('fengShuiFormQuestionLabel')}</label>
            <textarea
              id="question" value={question} onChange={(e) => setQuestion(e.target.value)}
              className="w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all h-24"
              placeholder={t('fengShuiFormQuestionPlaceholder')}
            />
          </div>

          <div className="pt-4">
            <Button type="submit" variant="fengshui" className="w-full text-lg py-4">
              {t('fengShuiFormSubmitButton')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default FengShuiForm;
