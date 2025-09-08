import React, { useState, useEffect } from 'react';
import type { CareerInfo } from '../lib/types';
import Button from './Button';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';
import type { TranslationKey } from '../hooks/useLocalization';

interface Props {
  onSubmit: (data: CareerInfo) => void;
}

const ProgressBar: React.FC<{ step: number; totalSteps: number }> = ({ step, totalSteps }) => (
    <div className="w-full bg-gray-700/50 rounded-full h-2.5 mb-8">
        <div 
            className="bg-gradient-to-r from-blue-500 to-teal-400 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${(step / totalSteps) * 100}%` }}>
        </div>
    </div>
);

const CareerAdvisorForm: React.FC<Props> = ({ onSubmit }) => {
    const { t } = useLocalization();
    const currentYear = new Date().getFullYear();
    const [step, setStep] = useState(1);

    // Form data states
    const [name, setName] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [day, setDay] = useState(1);
    const [month, setMonth] = useState(1);
    const [year, setYear] = useState(currentYear - 20);
    const [hour, setHour] = useState(12);
    const [interests, setInterests] = useState<string[]>([]);
    const [skills, setSkills] = useState<string[]>([]);
    const [aspiration, setAspiration] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const totalSteps = 4;
    
    const interestOptions: { key: TranslationKey, value: string }[] = [
        { key: 'interestTech', value: 'Technology & Innovation'},
        { key: 'interestArt', value: 'Art & Creativity'},
        { key: 'interestBusiness', value: 'Business & Management'},
        { key: 'interestHelping', value: 'Helping Others & Community'},
        { key: 'interestResearch', value: 'Research & Analysis'},
        { key: 'interestBuilding', value: 'Hands-on & Building'},
    ];

    const skillOptions: { key: TranslationKey, value: string }[] = [
        { key: 'skillProblemSolving', value: 'Problem Solving'},
        { key: 'skillCommunication', value: 'Communication'},
        { key: 'skillLeadership', value: 'Leadership'},
        { key: 'skillAttentionToDetail', value: 'Attention to Detail'},
        { key: 'skillCreativity', value: 'Creativity'},
        { key: 'skillTechnical', value: 'Technical Skills'},
    ];

    useEffect(() => {
        const daysInMonth = new Date(year, month, 0).getDate();
        if (day > daysInMonth) setDay(daysInMonth);
    }, [year, month, day]);

    const validateStep = () => {
        const newErrors: Record<string, string> = {};
        if (step === 1) {
            if (name.trim() === '') newErrors.name = t('errorFormName');
            if (year > currentYear) newErrors.year = t('errorFormYear');
        }
        if (step === 2 && interests.length === 0) newErrors.interests = t('errorCareerInterests');
        if (step === 3 && skills.length === 0) newErrors.skills = t('errorCareerSkills');
        
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
            onSubmit({ name, gender, year, month, day, hour, interests, skills, aspiration });
        }
    };
  
    const handleToggle = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
        setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
        if(errors.interests) setErrors(p => ({...p, interests: ''}));
        if(errors.skills) setErrors(p => ({...p, skills: ''}));
    };

    const renderOptions = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, i) => start + i).map(i => <option key={i} value={i}>{i}</option>);
    
    const renderStep1 = () => (
        <>
            <h3 className="text-xl font-bold text-center mb-6 text-teal-300 font-serif">{t('careerFormStep1Title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">{t('formNameLabel')}</label>
                    <input type="text" id="name" value={name} onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(p => ({...p, name: ''})); }}
                        className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all ${errors.name ? 'border-red-500' : 'border-gray-600'}`}
                        placeholder={t('formNamePlaceholder')} required />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-2">{t('formGenderLabel')}</label>
                    <select id="gender" value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all">
                        <option value="male">{t('male')}</option>
                        <option value="female">{t('female')}</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="hour" className="block text-sm font-medium text-gray-300 mb-2">{t('formHourLabel')}</label>
                    <select id="hour" value={hour} onChange={(e) => setHour(parseInt(e.target.value))}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all">
                        <option value={-1}>{t('formHourUnknown')}</option>
                        {renderOptions(0, 23).map(option => React.cloneElement(option, { children: t('formHourUnit', { hour: option.props.value }) }))}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('formDobLabel')}</label>
                    <div className="grid grid-cols-3 gap-4">
                        <select id="day" value={day} onChange={(e) => setDay(parseInt(e.target.value))} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all">{renderOptions(1, 31)}</select>
                        <select id="month" value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all">{renderOptions(1, 12)}</select>
                        <select id="year" value={year} onChange={(e) => { setYear(parseInt(e.target.value)); if (errors.year) setErrors(p => ({...p, year: ''})); }} className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all ${errors.year ? 'border-red-500' : 'border-gray-600'}`}>{renderOptions(1920, currentYear).reverse()}</select>
                    </div>
                    {errors.year && <p className="text-red-500 text-xs mt-1 md:col-span-3 text-right">{errors.year}</p>}
                </div>
            </div>
        </>
    );

    const renderMultiSelectStep = (titleKey: TranslationKey, subtitleKey: TranslationKey, options: {key: TranslationKey, value: string}[], selected: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, error: string | undefined) => (
        <>
            <h3 className="text-xl font-bold text-center mb-2 text-teal-300 font-serif">{t(titleKey)}</h3>
            <p className="text-center text-gray-400 mb-6">{t(subtitleKey)}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {options.map(opt => {
                    const isSelected = selected.includes(opt.value);
                    return (
                        <button type="button" key={opt.value} onClick={() => handleToggle(setter, opt.value)}
                            className={`p-4 rounded-lg border-2 text-left transition-all duration-300 ${isSelected ? 'bg-teal-500/20 border-teal-400 text-white' : 'bg-gray-900/50 border-gray-700 hover:border-gray-500 text-gray-300'}`}>
                            {t(opt.key)}
                        </button>
                    )
                })}
            </div>
            {error && <p className="text-red-500 text-xs mt-4 text-center">{error}</p>}
        </>
    );
    
    const renderStep4 = () => (
         <>
            <h3 className="text-xl font-bold text-center mb-2 text-teal-300 font-serif">{t('careerFormStep4Title')}</h3>
            <p className="text-center text-gray-400 mb-6">{t('careerFormStep4Subtitle')}</p>
             <textarea value={aspiration} onChange={(e) => setAspiration(e.target.value)}
                placeholder={t('careerFormAspirationPlaceholder')}
                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all h-40" />
        </>
    );


    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-bold text-gray-100 font-serif leading-tight">{t('careerAdvisorTitle')}</h2>
                <p className="mt-4 text-lg text-gray-300 leading-relaxed">{t('careerAdvisorSubtitle')}</p>
            </div>
            <Card>
                <ProgressBar step={step} totalSteps={totalSteps} />
                <form onSubmit={handleSubmit}>
                    <div className="min-h-[350px]">
                        {step === 1 && renderStep1()}
                        {step === 2 && renderMultiSelectStep('careerFormStep2Title', 'careerFormStep2Subtitle', interestOptions, interests, setInterests, errors.interests)}
                        {step === 3 && renderMultiSelectStep('careerFormStep3Title', 'careerFormStep3Subtitle', skillOptions, skills, setSkills, errors.skills)}
                        {step === 4 && renderStep4()}
                    </div>
                    <div className="mt-8 flex justify-between items-center">
                        <Button type="button" onClick={handleBack} variant="secondary" disabled={step === 1} className={step === 1 ? 'opacity-0' : 'opacity-100'}>{t('back')}</Button>
                        {step < totalSteps && <Button type="button" onClick={handleNext} variant="career">{t('next')}</Button>}
                        {step === totalSteps && <Button type="submit" variant="career">{t('careerFormSubmit')}</Button>}
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CareerAdvisorForm;
