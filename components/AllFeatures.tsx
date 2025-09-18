import React from 'react';
import Card from './Card';
import Button from './Button';
import { useLocalization } from '../hooks/useLocalization';
import MysticalHero from './MysticalHero';

interface Props {
    onStartAstrology: () => void;
    onStartPhysiognomy: () => void;
    onStartZodiacFinder: () => void;
    onStartIChing: () => void;
    onStartShop: () => void;
    onStartNumerology: () => void;
    onStartPalmReading: () => void;
    onStartTarot: () => void;
    onStartFlowAstrology: () => void;
    onStartAuspiciousDayFinder: () => void;
    onStartHandwritingAnalysis: () => void;
    onStartCareerAdvisor: () => void;
    onStartTalismanGenerator: () => void;
    onStartAuspiciousNaming: () => void;
    onStartBioEnergy: () => void;
    onStartFortuneSticks: () => void;
    onStartGodOfWealth: () => void;
    onStartPrayerGenerator: () => void;
    onStartFengShui: () => void;
    onStartHoaTay: () => void;
}

type ButtonVariantForFeature = 'primary' | 'special' | 'iching' | 'shop' | 'numerology' | 'palm' | 'tarot' | 'flow' | 'dayselection' | 'graphology' | 'career' | 'talisman' | 'naming' | 'bioenergy' | 'fortune' | 'wealth' | 'secondary' | 'prayer' | 'fengshui' | 'hoatay';

const buttonVariantGradients: Record<ButtonVariantForFeature, string> = {
    primary: 'from-yellow-600 to-purple-600',
    special: 'from-purple-600 to-indigo-600',
    iching: 'from-emerald-600 to-teal-600',
    shop: 'from-amber-600 to-yellow-600',
    numerology: 'from-cyan-600 to-blue-600',
    palm: 'from-rose-600 to-pink-600',
    tarot: 'from-purple-600 to-pink-600',
    flow: 'from-sky-500 to-fuchsia-600',
    dayselection: 'from-teal-600 to-cyan-600',
    graphology: 'from-slate-600 to-indigo-600',
    career: 'from-blue-600 to-teal-600',
    talisman: 'from-red-600 to-amber-600',
    naming: 'from-sky-600 to-green-600',
    bioenergy: 'from-cyan-500 to-green-500',
    fortune: 'from-red-600 to-amber-600',
    wealth: 'from-amber-500 to-yellow-400',
    prayer: 'from-emerald-600 to-yellow-600',
    fengshui: 'from-green-600 to-emerald-700',
    hoatay: 'from-pink-500 to-rose-500',
    secondary: 'from-cyan-600 to-blue-600', // Fallback
};

const FeatureCard: React.FC<{
    title: string;
    description: string;
    buttonText: string;
    icon: React.ReactNode;
    onClick: () => void;
    buttonVariant: ButtonVariantForFeature;
}> = ({ title, description, buttonText, icon, onClick, buttonVariant }) => (
    <div className="group relative h-full">
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${buttonVariantGradients[buttonVariant]} rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-500 group-hover:duration-300`}></div>
        <Card className="relative flex flex-col text-center items-center h-full transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-[1.03] group-hover:shadow-2xl group-hover:shadow-black/50 overflow-hidden">
            <div className="animate-shine"></div>
            <div className="p-4 bg-gray-900/50 rounded-full mb-4 border border-gray-700 transition-all duration-300 group-hover:scale-110 group-hover:bg-gray-900 group-hover:border-yellow-400/50">
                {icon}
            </div>
            <h3 className="text-2xl font-bold font-serif text-yellow-300 mb-3">{title}</h3>
            <p className="text-gray-400 text-sm flex-grow mb-6">{description}</p>
            <Button onClick={onClick} variant={buttonVariant} className="w-full mt-auto">
                {buttonText}
            </Button>
        </Card>
    </div>
);


const AllFeatures: React.FC<Props> = (props) => {
    const { t } = useLocalization();

    const iconBaseClass = "h-10 w-10";

    const features = [
        { title: t('astrologyTitle'), description: t('astrologyDesc'), buttonText: t('astrologyButton'), onClick: props.onStartAstrology, buttonVariant: 'primary' as const, icon: <svg className={iconBaseClass} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="grad_astrology" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#FDE68A"/><stop offset="100%" stopColor="#F59E0B"/></radialGradient></defs><path d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4 4 12.954 4 24s8.954 20 20 20z" stroke="url(#grad_astrology)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M24 34c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10z" stroke="url(#grad_astrology)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity=".7"/><path d="M4 24h40M24 4v40" stroke="url(#grad_astrology)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity=".5"/><path d="M8.879 8.879l29.242 29.242m0-29.242L8.879 38.121" stroke="url(#grad_astrology)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity=".5"/></svg> },
        { title: t('fengShuiTitle'), description: t('fengShuiDesc'), buttonText: t('fengShuiButton'), onClick: props.onStartFengShui, buttonVariant: 'fengshui' as const, icon: <svg className={iconBaseClass} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 4L8 12v24l16 8 16-8V12L24 4z" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M24 4v40M8 12l32 16m0-16L8 28m16-24l16 8-16 8-16-8 16-8z" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity=".7"/></svg> },
        { title: t('physiognomyTitle'), description: t('physiognomyDesc'), buttonText: t('physiognomyButton'), onClick: props.onStartPhysiognomy, buttonVariant: 'special' as const, icon: <svg className={iconBaseClass} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4z" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity=".5"/><path d="M16 19c0-2 2-4 8-4s8 2 8 4M16 29s4 4 8 4 8-4 8-4M4 16h40M4 32h40" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
        { title: t('careerAdvisorTitle'), description: t('careerAdvisorDesc'), buttonText: t('careerAdvisorButton'), onClick: props.onStartCareerAdvisor, buttonVariant: 'career' as const, icon: <svg className={iconBaseClass} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4 4 12.954 4 24s8.954 20 20 20z" stroke="#38BDF8" strokeWidth="2" strokeOpacity=".6"/><path d="m24 34 8-18-18 8 10 10z" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
        { title: t('godOfWealthTitle'), description: t('godOfWealthDesc'), buttonText: t('godOfWealthButton'), onClick: props.onStartGodOfWealth, buttonVariant: 'wealth' as const, icon: <svg className={iconBaseClass} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad_wealth" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFFBEB"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs><path d="M10 28c0-3.314 2.686-6 6-6h16c3.314 0 6 2.686 6 6v2c0 3.314-2.686 6-6 6H16c-3.314 0-6-2.686-6-6v-2z" stroke="url(#grad_wealth)" strokeWidth="2"/><path d="M14 22c0-3.314 2.686-6 6-6h8c3.314 0 6 2.686 6 6v6h-4v-6c0-1.105-.895-2-2-2h-8c-1.105 0-2 .895-2 2v6h-4v-6z" stroke="url(#grad_wealth)" strokeWidth="2"/></svg> },
        { title: t('fortuneSticksTitle'), description: t('fortuneSticksDesc'), buttonText: t('fortuneSticksButton'), onClick: props.onStartFortuneSticks, buttonVariant: 'fortune' as const, icon: <svg className={iconBaseClass} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 44h20c1.105 0 2-.895 2-2V20H12v22c0 1.105.895 2 2 2z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 4v34m6-34v34m6-34v34" stroke="#FCA5A5" strokeWidth="2" strokeLinecap="round"/></svg> },
        { title: t('prayerGeneratorTitle'), description: t('prayerGeneratorDesc'), buttonText: t('prayerGeneratorButton'), onClick: props.onStartPrayerGenerator, buttonVariant: 'prayer' as const, icon: <svg className={iconBaseClass} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 26c-1-3 1-8 5-9m11 9c1-3-1-8-5-9" stroke="#FACC15" strokeWidth="2" strokeLinecap="round"/><path d="M24 10c0 4-4 8-4 14v10h8V24c0-6-4-10-4-14zM12 36h24" stroke="#6EE7B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
        { title: t('auspiciousNamingTitle'), description: t('auspiciousNamingDesc'), buttonText: t('auspiciousNamingButton'), onClick: props.onStartAuspiciousNaming, buttonVariant: 'naming' as const, icon: <svg className={iconBaseClass} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 38h24m-18-8 6-22 6 22m-10-8h8" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
        { title: t('bioEnergyTitle'), description: t('bioEnergyDesc'), buttonText: t('bioEnergyButton'), onClick: props.onStartBioEnergy, buttonVariant: 'bioenergy' as const, icon: <svg className={iconBaseClass} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="grad_bio" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#67E8F9"/><stop offset="100%" stopColor="#22C55E"/></radialGradient></defs><circle cx="24" cy="24" r="16" stroke="url(#grad_bio)" strokeWidth="2" strokeDasharray="4 4" strokeOpacity=".7"/><circle cx="24" cy="24" r="8" fill="url(#grad_bio)"/></svg> },
        { title: t('flowAstrologyTitle'), description: t('flowAstrologyDesc'), buttonText: t('flowAstrologyButton'), onClick: props.onStartFlowAstrology, buttonVariant: 'flow' as const, icon: <svg className={iconBaseClass} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 24c8-12 16 12 24 0s12 12 16 0" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" fill="#A855F7"/><circle cx="36" cy="36" r="3" fill="#A855F7"/></svg> },
        { title: t('palmReadingTitle'), description: t('palmReadingDesc'), buttonText: t('palmReadingButton'), onClick: props.onStartPalmReading, buttonVariant: 'palm' as const, icon: <svg className={iconBaseClass} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 40V22c0-4.418 3.582-8 8-8s8 3.582 8 8v18m-16 0c-4.418 0-8-3.582-8-8V18m24 14c4.418 0 8-3.582 8-8V18" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 14c-4-2-6-8-6-8" stroke="#FDA4AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity=".8"/></svg> },
        { title: t('hoaTayTitle'), description: t('hoaTayDesc'), buttonText: t('hoaTayButton'), onClick: props.onStartHoaTay, buttonVariant: 'hoatay' as const, icon: <svg className={iconBaseClass} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 34c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10z" stroke="#F472B6" strokeWidth="2"/><path d="M24 30c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6z" stroke="#F472B6" strokeWidth="2" strokeOpacity=".7"/><path d="M24 26c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="#FECDD3"/></svg> },
        { title: t('handwritingAnalysisTitle'), description: t('handwritingAnalysisDesc'), buttonText: t('handwritingAnalysisButton'), onClick: props.onStartHandwritingAnalysis, buttonVariant: 'graphology' as const, icon: <svg className={iconBaseClass} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 38s4-3 8-3 10 4 14 3 8-4 8-4" stroke="#818CF8" strokeWidth="2" strokeLinecap="round"/><path d="M14 12 8 36m26-24-6 24" stroke="#6366F1" strokeWidth="2" strokeLinecap="round"/></svg> },
        { title: t('tarotReadingTitle'), description: t('tarotReadingDesc'), buttonText: t('tarotReadingButton'), onClick: props.onStartTarot, buttonVariant: 'tarot' as const, icon: <svg className={iconBaseClass} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g transform="rotate(-15 24 24)"><rect x="18" y="8" width="22" height="32" rx="2" stroke="#D946EF" strokeWidth="2" strokeOpacity=".7" transform="rotate(20 29 24)"/><rect x="8" y="8" width="22" height="32" rx="2" stroke="#F472B6" strokeWidth="2"/></g></svg> },
        { title: t('numerologyTitle'), description: t('numerologyDesc'), buttonText: t('numerologyButton'), onClick: props.onStartNumerology, buttonVariant: 'numerology' as const, icon: <svg className={iconBaseClass} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12h24v24H12z" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity=".7"/><path d="M20 12v24m8-24v24M12 20h24m-24 8h24" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
        { title: t('talismanTitle'), description: t('talismanDesc'), buttonText: t('talismanButton'), onClick: props.onStartTalismanGenerator, buttonVariant: 'talisman' as const, icon: <svg className={iconBaseClass} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 4 8 16l16 12 16-12L24 4z" stroke="#DC2626" strokeWidth="2"/><path d="M8 16v16l16 8V28L8 16zM40 16v16L24 40V28l16-12z" stroke="#F59E0B" strokeWidth="2" strokeOpacity=".8"/></svg> },
        { title: t('iChingTitle'), description: t('iChingDesc'), buttonText: t('iChingButton'), onClick: props.onStartIChing, buttonVariant: 'iching' as const, icon: <svg className={iconBaseClass} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 12h32m-32 8h12v-2h-12v2zm20 0h12m-32 8h32" stroke="#34D399" strokeWidth="4" strokeLinecap="round"/></svg> },
        { title: t('auspiciousDayTitle'), description: t('auspiciousDayDesc'), buttonText: t('auspiciousDayButton'), onClick: props.onStartAuspiciousDayFinder, buttonVariant: 'dayselection' as const, icon: <svg className={iconBaseClass} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="10" width="32" height="28" rx="2" stroke="#2DD4BF" strokeWidth="2"/><path d="M8 20h32m-24-10v-4m16 4v-4" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round"/><circle cx="24" cy="29" r="4" fill="#fff"/></svg> },
        { title: t('zodiacHourTitle'), description: t('zodiacHourDesc'), buttonText: t('zodiacHourButton'), onClick: props.onStartZodiacFinder, buttonVariant: 'secondary' as const, icon: <svg className={iconBaseClass} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="18" stroke="#22D3EE" strokeWidth="2" strokeOpacity=".7"/><path d="M24 12v12l8 6" stroke="#67E8F9" strokeWidth="2" strokeLinecap="round"/></svg> },
        { title: t('shopTitle'), description: t('shopDesc'), buttonText: t('shopButton'), onClick: props.onStartShop, buttonVariant: 'shop' as const, icon: <svg className={iconBaseClass} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 18 8 10h32l-4 8H12z" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 10v24c0 1.105.895 2 2 2h28c1.105 0 2-.895 2-2V10" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <div className="text-center pt-8 pb-16">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-100 font-serif leading-tight animate-fade-in-down">
                    {t('homeTitle')}
                </h1>
                <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    {t('homeSubtitle')}
                </p>
            </div>
            
            <MysticalHero />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {features.map((feature, index) => (
                    <div key={feature.title} className="animate-fade-in" style={{ animationDelay: `${0.1 + index * 0.05}s` }}>
                        <FeatureCard {...feature} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllFeatures;