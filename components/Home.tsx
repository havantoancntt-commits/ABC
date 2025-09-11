import React, { useEffect } from 'react';
import Card from './Card';
import Button from './Button';
import { useLocalization } from '../hooks/useLocalization';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

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
}

type ButtonVariantForFeature = 'primary' | 'special' | 'secondary' | 'iching' | 'shop' | 'numerology' | 'palm' | 'tarot' | 'flow' | 'dayselection' | 'graphology' | 'career' | 'talisman' | 'naming' | 'bioenergy';

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
        <Card className="relative flex flex-col text-center items-center h-full transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-black/50">
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


const Home: React.FC<Props> = (props) => {
    const { t } = useLocalization();
    const { user, isConfigured, isInitialized } = useGoogleAuth();

    useEffect(() => {
        if (isInitialized && !user) {
            const signInButtonContainer = document.getElementById('google-signin-button');
            if (signInButtonContainer) {
                // Ensure we don't render the button multiple times on re-renders
                if (signInButtonContainer.childElementCount === 0) {
                    window.google.accounts.id.renderButton(
                        signInButtonContainer,
                        { theme: "outline", size: "large", type: "standard", shape: "pill" }
                    );
                }
            }
        }
    }, [isInitialized, user]);

    const features = [
        { title: t('astrologyTitle'), description: t('astrologyDesc'), buttonText: t('astrologyButton'), onClick: props.onStartAstrology, buttonVariant: 'primary' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24"><defs><radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" style={{stopColor: 'rgb(250, 204, 21)', stopOpacity:1}} /><stop offset="100%" style={{stopColor:'rgb(245, 158, 11)',stopOpacity:1}} /></radialGradient></defs><path fill="url(#grad1)" d="M12 2a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0V2.75A.75.75 0 0112 2zM12 17a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0112 17zM2.75 12a.75.75 0 010-1.5h3.5a.75.75 0 010 1.5h-3.5zM17.75 12a.75.75 0 010-1.5h3.5a.75.75 0 010 1.5h-3.5z" opacity="0.6"/><path fill="url(#grad1)" d="M12 7a5 5 0 100 10 5 5 0 000-10zm-7 5a7 7 0 1114 0 7 7 0 01-14 0z" /></svg> },
        { title: t('careerAdvisorTitle'), description: t('careerAdvisorDesc'), buttonText: t('careerAdvisorButton'), onClick: props.onStartCareerAdvisor, buttonVariant: 'career' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24"><path fill="#38bdf8" d="M14.27 20.27L12 22.54l-2.27-2.27a8.5 8.5 0 01-2.27-6.02V5.5a.5.5 0 011 0v8.75a7.5 7.5 0 0013.5 0V5.5a.5.5 0 011 0v8.75a8.5 8.5 0 01-2.27 6.02zM12 13a4 4 0 100-8 4 4 0 000 8z" opacity="0.6"/><path fill="#22d3ee" d="M12 12a3 3 0 100-6 3 3 0 000 6zM12 14a1 1 0 100-2 1 1 0 000 2z"/><path fill="#38bdf8" d="M18.5 14.5a.5.5 0 00-.5.5v2a.5.5 0 001 0v-2a.5.5 0 00-.5-.5zM5.5 14.5a.5.5 0 00-.5.5v2a.5.5 0 001 0v-2a.5.5 0 00-.5-.5zM12 16.5a.5.5 0 00-.5.5v2a.5.5 0 001 0v-2a.5.5 0 00-.5-.5z"/></svg> },
        { title: t('auspiciousNamingTitle'), description: t('auspiciousNamingDesc'), buttonText: t('auspiciousNamingButton'), onClick: props.onStartAuspiciousNaming, buttonVariant: 'naming' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24"><path fill="#34d399" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/><path fill="#38bdf8" d="M2 20h20v2H2z" opacity="0.6"/></svg> },
        { title: t('bioEnergyTitle'), description: t('bioEnergyDesc'), buttonText: t('bioEnergyButton'), onClick: props.onStartBioEnergy, buttonVariant: 'bioenergy' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24"><defs><radialGradient id="gradBio" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#67e8f9"/><stop offset="100%" stopColor="#22c55e"/></radialGradient></defs><path fill="url(#gradBio)" d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" opacity="0.5"/><path fill="url(#gradBio)" d="M12 10.5c-2.2 0-4-1.2-4-2.8s1.8-2.8 4-2.8 4 1.2 4 2.8-1.8 2.8-4 2.8zm0 3c2.2 0 4 1.2 4 2.8s-1.8 2.8-4 2.8-4-1.2-4-2.8 1.8-2.8 4-2.8z"/></svg> },
        { title: t('flowAstrologyTitle'), description: t('flowAstrologyDesc'), buttonText: t('flowAstrologyButton'), onClick: props.onStartFlowAstrology, buttonVariant: 'flow' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24"><path fill="#a855f7" d="M2.5 7.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5c0 1.9-1.2 3.5-2.9 4.2.3 2.1 1.3 4 2.9 5.3 1.6-1.3 2.6-3.2 2.9-5.3 1.7-.7 2.9-2.3 2.9-4.2 0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5-2 4.5-4.5 4.5c-2.4 0-4.3-1.8-4.5-4 .1 1.7-.6 3.3-1.9 4.5-1.9 1.8-4.9 1.8-6.8 0-1.3-1.2-2-2.8-1.9-4.5-2.2.2-4.1 2.1-4.1 4.5z" opacity="0.5"/><path fill="#38bdf8" d="M12 14c-1.5 0-2.8-1-3.2-2.4.9-.4 1.9-.6 3-.6s2.1.2 3 .6c-.4 1.4-1.7 2.4-3.2 2.4z"/><circle cx="7" cy="7.5" r="2.5" fill="#38bdf8"/><circle cx="17" cy="7.5" r="2.5" fill="#38bdf8"/></svg> },
        { title: t('physiognomyTitle'), description: t('physiognomyDesc'), buttonText: t('physiognomyButton'), onClick: props.onStartPhysiognomy, buttonVariant: 'special' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24"><g fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path stroke="#c084fc" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" opacity="0.5"/><path stroke="#a855f7" d="M9.5 9.5a.5.5 0 100-1 .5.5 0 000 1zM14.5 9.5a.5.5 0 100-1 .5.5 0 000 1zM15 14s-1.5 2-3 2-3-2-3-2"/><path stroke="#a855f7" strokeDasharray="2 2" d="M2.5 8h19M2.5 16h19"/></g></svg> },
        { title: t('palmReadingTitle'), description: t('palmReadingDesc'), buttonText: t('palmReadingButton'), onClick: props.onStartPalmReading, buttonVariant: 'palm' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24"><path fill="#fda4af" d="M8.5 5.5c-.2 2.3-1.9 4.2-2.1 6.5C6.2 14.3 6 16.6 6 18c0 2.2 1.8 4 4 4h4c2.2 0 4-1.8 4-4v-1.5c0-2.2-1.8-4-4-4h-1c-2.2 0-4-1.8-4-4V5c0-1.7-1.3-3-3-3S2 3.3 2 5c0 .3.2.5.5.5z" opacity="0.6"/><path fill="#f43f5e" d="M11 9c-1.1 0-2 .9-2 2s.9 2 2 2 2 .9 2 2-.9 2-2 2-2 .9-2 2"/><path fill="#f43f5e" d="M14 9c-1.1 0-2 .9-2 2s.9 2 2 2 2 .9 2 2-.9 2-2 2-2 .9-2 2"/></svg> },
        { title: t('handwritingAnalysisTitle'), description: t('handwritingAnalysisDesc'), buttonText: t('handwritingAnalysisButton'), onClick: props.onStartHandwritingAnalysis, buttonVariant: 'graphology' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24"><g fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="#818cf8" d="M2 15.25l4.3-4.3c.9-.9 2.4-.9 3.4 0l2.6 2.6c.9.9 2.4.9 3.4 0L22 7.25" opacity="0.7"/><path stroke="#6366f1" d="M17 3l4 4L9 19H5v-4L17 3z"/></g></svg> },
        { title: t('tarotReadingTitle'), description: t('tarotReadingDesc'), buttonText: t('tarotReadingButton'), onClick: props.onStartTarot, buttonVariant: 'tarot' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24"><g transform="rotate(10 12 12)"><rect x="4" y="2" width="16" height="20" rx="2" fill="#c084fc" transform="rotate(-15 12 12)" opacity="0.7"/><rect x="4" y="2" width="16" height="20" rx="2" fill="#d946ef" transform="rotate(0 12 12)" opacity="0.8"/><rect x="4" y="2" width="16" height="20" rx="2" fill="#f472b6" transform="rotate(15 12 12)"/><path fill="#fff" d="M12 6l1.2 2.8L16 10l-2.5 2.2L14.8 15 12 13.4 9.2 15l1.3-2.8L8 10l2.8-.2z"/></g></svg> },
        { title: t('numerologyTitle'), description: t('numerologyDesc'), buttonText: t('numerologyButton'), onClick: props.onStartNumerology, buttonVariant: 'numerology' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24"><g fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="#22d3ee" d="M9 3L6 9l3 6M15 3l3 6-3 6M12 3v18M3 9h18M3 15h18" /></g></svg> },
        { title: t('talismanTitle'), description: t('talismanDesc'), buttonText: t('talismanButton'), onClick: props.onStartTalismanGenerator, buttonVariant: 'talisman' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24"><path fill="#f59e0b" d="M12 2L4 6v5c0 5 8 10 8 10s8-5 8-10V6l-8-4z" opacity="0.6"/><path fill="#dc2626" d="M12 12a3 3 0 100-6 3 3 0 000 6z"/><path fill="#f59e0b" d="M12 13c-2 0-3-2-3-2s3-4 6 0l-3 6z"/></svg> },
        { title: t('iChingTitle'), description: t('iChingDesc'), buttonText: t('iChingButton'), onClick: props.onStartIChing, buttonVariant: 'iching' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24"><path fill="#34d399" d="M3 6h18v2H3zM3 11h8v2H3zM13 11h8v2h-8zM3 16h18v2H3z" /></svg> },
        { title: t('auspiciousDayTitle'), description: t('auspiciousDayDesc'), buttonText: t('auspiciousDayButton'), onClick: props.onStartAuspiciousDayFinder, buttonVariant: 'dayselection' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2" fill="#2dd4bf" opacity="0.6"/><path fill="#2dd4bf" d="M16 2v4M8 2v4"/><circle cx="12" cy="14" r="3" fill="#fff"/><path fill="#0d9488" d="M3 10h18v2H3z"/></svg> },
        { title: t('zodiacHourTitle'), description: t('zodiacHourDesc'), buttonText: t('zodiacHourButton'), onClick: props.onStartZodiacFinder, buttonVariant: 'secondary' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="#22d3ee" strokeWidth="2" opacity="0.7"/><path fill="#22d3ee" d="M12 7v5l3.5 2"/><path fill="#67e8f9" d="M12 12a1 1 0 100-2 1 1 0 000 2z"/></svg> },
        { title: t('shopTitle'), description: t('shopDesc'), buttonText: t('shopButton'), onClick: props.onStartShop, buttonVariant: 'shop' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24"><path fill="#fbbf24" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zm12 4H6l-1 2h14l-1-2zM8 12a1 1 0 11-2 0 1 1 0 012 0zm5 1a1 1 0 110-2 1 1 0 010 2zm4-1a1 1 0 11-2 0 1 1 0 012 0z" opacity="0.6"/><path fill="#f59e0b" d="M18 6L6 6l-1 2h14z"/></svg> },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <div className="text-center pt-8 pb-16">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-100 font-serif leading-tight animate-fade-in-down">
                    {user ? t('welcomeUser', {name: user.name.split(' ')[0]}) : t('homeTitle')}
                </h1>
                <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    {user ? t('homeSubtitleLoggedIn') : t('homeSubtitle')}
                </p>
                {!user && (
                    <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                        <p className="text-amber-200/80 mb-4">{t('homeAuthPrompt')}</p>
                        {isConfigured ? (
                           <div id="google-signin-button" className="flex justify-center"></div>
                        ) : (
                           <p className="text-sm text-gray-500 italic">{t('homeAuthUnavailable')}</p>
                        )}
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-10">
                {features.map((feature, index) => (
                    <div key={feature.title} className="animate-fade-in" style={{ animationDelay: `${0.1 + index * 0.05}s` }}>
                        <FeatureCard {...feature} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;