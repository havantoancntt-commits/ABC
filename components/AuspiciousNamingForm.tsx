import React, { useState, useEffect } from 'react';
import type { AuspiciousNamingInfo } from '../lib/types';
import Button from './Button';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';
import type { TranslationKey } from '../hooks/useLocalization';

interface Props {
  onSubmit: (data: AuspiciousNamingInfo) => void;
}

const ProgressBar: React.FC<{ step: number; totalSteps: number }> = ({ step, totalSteps }) => (
    <div className="w-full bg-gray-700/50 rounded-full h-2.5 mb-8">
        <div 
            className="bg-gradient-to-r from-sky-500 to-green-400 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${(step / totalSteps) * 100}%` }}>
        </div>
    </div>
);

const AuspiciousNamingForm: React.FC<Props> = ({ onSubmit }) => {
    const { t } = useLocalization();
    const currentYear = new Date().getFullYear();
    const [step, setStep] = useState(1);
    const totalSteps = 4;

    // Form data
    const [childLastName, setChildLastName] = useState('');
    const [childGender, setChildGender] = useState<'male' | 'female'>('male');
    const [childDay, setChildDay] = useState(1);
    const [childMonth, setChildMonth] = useState(1);
    const [childYear, setChildYear] = useState(currentYear);
    const [isBorn, setIsBorn] = useState(true);
    const [fatherName, setFatherName] = useState('');
    const [motherName, setMotherName] = useState('');
    const [desiredQualities, setDesiredQualities] = useState<string[]>([]);
    const [otherConstraints, setOtherConstraints] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const qualityOptions: { key: TranslationKey, value: string }[] = [
        { key: 'qualityIntelligent', value: 'Intelligent, Wise'},
        { key: 'qualityStrong', value: 'Strong, Resilient'},
        { key: 'qualityPeaceful', value: 'Peaceful, Lucky'},
        { key: 'qualityElegant', value: 'Elegant, Gentle'},
        { key: 'qualitySuccessful', value: 'Successful, Stable'},
        { key: 'qualityKind', value: 'Kind, Virtuous'},
    ];

    useEffect(() => {
        const daysInMonth = new Date(childYear, childMonth, 0).getDate();
        if (childDay > daysInMonth) setChildDay(daysInMonth);
    }, [childYear, childMonth, childDay]);

    const validateStep = () => {
        const newErrors: Record<string, string> = {};
        if (step === 1) {
            if (childLastName.trim() === '') newErrors.childLastName = t('errorChildLastName');
            if (childYear > currentYear + 1) newErrors.year = t('errorFormYear');
        }
        if (step === 3 && desiredQualities.length === 0) newErrors.desiredQualities = t('errorDesiredQualities');
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            if (step < totalSteps) setStep(s => s + 1);
        }
    };
    const handleBack = () => {
        if (step > 1) setStep(s => s - 1);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateStep()) {
            onSubmit({ childLastName, childGender, childYear, childMonth, childDay, isBorn, fatherName, motherName, desiredQualities, otherConstraints });
        }
    };
  
    const handleToggleQuality = (quality: string) => {
        setDesiredQualities(prev => prev.includes(quality) ? prev.filter(i => i !== quality) : [...prev, quality]);
        if(errors.desiredQualities) setErrors(p => ({...p, desiredQualities: ''}));
    };

    const renderOptions = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, i) => start + i).map(i => <option key={i} value={i}>{i}</option>);
    
    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-bold text-gray-100 font-serif leading-tight">{t('namingFormTitle')}</h2>
                <p className="mt-4 text-lg text-gray-300 leading-relaxed">{t('namingFormSubtitle')}</p>
            </div>
            <Card>
                <ProgressBar step={step} totalSteps={totalSteps} />
                <form onSubmit={handleSubmit}>
                    <div className="min-h-[380px]">
                        {step === 1 && (
                            <>
                                <h3 className="text-xl font-bold text-center mb-6 text-sky-300 font-serif">{t('namingFormStep1Title')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                    <div className="md:col-span-2">
                                        <label htmlFor="childLastName" className="block text-sm font-medium text-gray-300 mb-2">{t('childLastNameLabel')}</label>
                                        <input type="text" id="childLastName" value={childLastName} onChange={(e) => { setChildLastName(e.target.value); if (errors.childLastName) setErrors(p => ({...p, childLastName: ''})); }}
                                            className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${errors.childLastName ? 'border-red-500' : 'border-gray-600'}`}
                                            placeholder={t('childLastNamePlaceholder')} required />
                                        {errors.childLastName && <p className="text-red-500 text-xs mt-1">{errors.childLastName}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('formDobLabel')}</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            <select value={childDay} onChange={(e) => setChildDay(parseInt(e.target.value))} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500">{renderOptions(1, 31)}</select>
                                            <select value={childMonth} onChange={(e) => setChildMonth(parseInt(e.target.value))} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500">{renderOptions(1, 12)}</select>
                                            <select value={childYear} onChange={(e) => { setChildYear(parseInt(e.target.value)); if (errors.year) setErrors(p => ({...p, year: ''})); }} className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${errors.year ? 'border-red-500' : 'border-gray-600'}`}>{renderOptions(1950, currentYear + 1).reverse()}</select>
                                        </div>
                                         {errors.year && <p className="text-red-500 text-xs mt-1 md:col-span-3 text-right">{errors.year}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-2">{t('formGenderLabel')}</label>
                                        <select id="gender" value={childGender} onChange={(e) => setChildGender(e.target.value as 'male' | 'female')} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                                            <option value="male">{t('male')}</option>
                                            <option value="female">{t('female')}</option>
                                        </select>
                                    </div>
                                     <div>
                                        <label htmlFor="isBorn" className="block text-sm font-medium text-gray-300 mb-2">{t('childIsBornLabel')}</label>
                                        <select id="isBorn" value={String(isBorn)} onChange={(e) => setIsBorn(e.target.value === 'true')} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                                            <option value="true">{t('optionYes')}</option>
                                            <option value="false">{t('optionNo')}</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}
                        {step === 2 && (
                             <>
                                <h3 className="text-xl font-bold text-center mb-6 text-sky-300 font-serif">{t('namingFormStep2Title')}</h3>
                                <div className="space-y-4">
                                     <div>
                                        <label htmlFor="fatherName" className="block text-sm font-medium text-gray-300 mb-2">{t('fatherNameLabel')}</label>
                                        <input type="text" id="fatherName" value={fatherName} onChange={(e) => setFatherName(e.target.value)}
                                            className="w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                            placeholder={t('fatherNamePlaceholder')} />
                                    </div>
                                    <div>
                                        <label htmlFor="motherName" className="block text-sm font-medium text-gray-300 mb-2">{t('motherNameLabel')}</label>
                                        <input type="text" id="motherName" value={motherName} onChange={(e) => setMotherName(e.target.value)}
                                            className="w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                            placeholder={t('motherNamePlaceholder')} />
                                    </div>
                                </div>
                            </>
                        )}
                        {step === 3 && (
                            <>
                                <h3 className="text-xl font-bold text-center mb-2 text-sky-300 font-serif">{t('namingFormStep3Title')}</h3>
                                <p className="text-center text-gray-400 mb-6">{t('desiredQualitiesSubtitle')}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {qualityOptions.map(opt => {
                                        const isSelected = desiredQualities.includes(opt.value);
                                        return (
                                            <button type="button" key={opt.value} onClick={() => handleToggleQuality(opt.value)}
                                                className={`p-4 rounded-lg border-2 text-left transition-all duration-300 ${isSelected ? 'bg-sky-500/20 border-sky-400 text-white' : 'bg-gray-900/50 border-gray-700 hover:border-gray-500 text-gray-300'}`}>
                                                {t(opt.key)}
                                            </button>
                                        )
                                    })}
                                </div>
                                {errors.desiredQualities && <p className="text-red-500 text-xs mt-4 text-center">{errors.desiredQualities}</p>}
                            </>
                        )}
                        {step === 4 && (
                             <>
                                <h3 className="text-xl font-bold text-center mb-2 text-sky-300 font-serif">{t('namingFormStep4Title')}</h3>
                                <p className="text-center text-gray-400 mb-6">{t('otherConstraintsSubtitle')}</p>
                                 <textarea value={otherConstraints} onChange={(e) => setOtherConstraints(e.target.value)}
                                    placeholder={t('otherConstraintsPlaceholder')}
                                    className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 h-40" />
                            </>
                        )}
                    </div>
                    <div className="mt-8 flex justify-between items-center">
                        <Button type="button" onClick={handleBack} variant="secondary" disabled={step === 1} className={step === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}>{t('back')}</Button>
                        {step < totalSteps && <Button type="button" onClick={handleNext} variant="naming">{t('next')}</Button>}
                        {step === totalSteps && <Button type="submit" variant="naming">{t('namingFormSubmit')}</Button>}
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default AuspiciousNamingForm;
