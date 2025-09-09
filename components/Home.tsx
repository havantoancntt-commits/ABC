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
}

const FeatureCard: React.FC<{
    title: string;
    description: string;
    buttonText: string;
    icon: React.ReactNode;
    onClick: () => void;
    buttonVariant: 'primary' | 'special' | 'secondary' | 'iching' | 'shop' | 'numerology' | 'palm' | 'tarot' | 'flow' | 'dayselection' | 'graphology' | 'career' | 'talisman' | 'naming';
}> = ({ title, description, buttonText, icon, onClick, buttonVariant }) => (
    <div className="group relative h-full">
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${
            buttonVariant === 'primary' ? 'from-yellow-600 to-purple-600' : 
            buttonVariant === 'special' ? 'from-purple-600 to-indigo-600' :
            buttonVariant === 'iching' ? 'from-emerald-600 to-teal-600' :
            buttonVariant === 'shop' ? 'from-amber-600 to-yellow-600' :
            buttonVariant === 'numerology' ? 'from-cyan-600 to-blue-600' :
            buttonVariant === 'palm' ? 'from-rose-600 to-pink-600' :
            buttonVariant === 'tarot' ? 'from-purple-600 to-pink-600' :
            buttonVariant === 'flow' ? 'from-sky-500 to-fuchsia-600' :
            buttonVariant === 'dayselection' ? 'from-teal-600 to-cyan-600' :
            buttonVariant === 'graphology' ? 'from-slate-600 to-indigo-600' :
            buttonVariant === 'career' ? 'from-blue-600 to-teal-600' :
            buttonVariant === 'talisman' ? 'from-red-600 to-amber-600' :
            buttonVariant === 'naming' ? 'from-sky-600 to-green-600' :
            'from-cyan-600 to-blue-600'
        } rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-500 group-hover:duration-300`}></div>
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
        { title: t('astrologyTitle'), description: t('astrologyDesc'), buttonText: t('astrologyButton'), onClick: props.onStartAstrology, buttonVariant: 'primary' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-12v4m-2-2h4m5 4v4m-2-2h4M5 11h14M5 11a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2M5 11v2a2 2 0 002 2h10a2 2 0 002-2v-2" /></svg> },
        { title: t('careerAdvisorTitle'), description: t('careerAdvisorDesc'), buttonText: t('careerAdvisorButton'), onClick: props.onStartCareerAdvisor, buttonVariant: 'career' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
        { title: t('auspiciousNamingTitle'), description: t('auspiciousNamingDesc'), buttonText: t('auspiciousNamingButton'), onClick: props.onStartAuspiciousNaming, buttonVariant: 'naming' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /><path d="M14 6l-8 8" opacity="0.6" /></svg> },
        { title: t('flowAstrologyTitle'), description: t('flowAstrologyDesc'), buttonText: t('flowAstrologyButton'), onClick: props.onStartFlowAstrology, buttonVariant: 'flow' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /><path d="M4 14a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3" opacity="0.4"/><path d="M20 10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-3" opacity="0.4"/></svg> },
        { title: t('physiognomyTitle'), description: t('physiognomyDesc'), buttonText: t('physiognomyButton'), onClick: props.onStartPhysiognomy, buttonVariant: 'special' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
        { title: t('palmReadingTitle'), description: t('palmReadingDesc'), buttonText: t('palmReadingButton'), onClick: props.onStartPalmReading, buttonVariant: 'palm' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0c-.454-.303-.977-.454-1.5-.454V5.454c.523 0 1.046-.151 1.5-.454a2.704 2.704 0 013 0 2.704 2.704 0 003 0 2.704 2.704 0 013 0 2.704 2.704 0 003 0c.454.303.977.454 1.5.454v10.092zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
        { title: t('handwritingAnalysisTitle'), description: t('handwritingAnalysisDesc'), buttonText: t('handwritingAnalysisButton'), onClick: props.onStartHandwritingAnalysis, buttonVariant: 'graphology' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> },
        { title: t('tarotReadingTitle'), description: t('tarotReadingDesc'), buttonText: t('tarotReadingButton'), onClick: props.onStartTarot, buttonVariant: 'tarot' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
        { title: t('numerologyTitle'), description: t('numerologyDesc'), buttonText: t('numerologyButton'), onClick: props.onStartNumerology, buttonVariant: 'numerology' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg> },
         { title: t('talismanTitle'), description: t('talismanDesc'), buttonText: t('talismanButton'), onClick: props.onStartTalismanGenerator, buttonVariant: 'talisman' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
        { title: t('iChingTitle'), description: t('iChingDesc'), buttonText: t('iChingButton'), onClick: props.onStartIChing, buttonVariant: 'iching' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><g strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18M12 3v18" strokeLinecap="round" strokeLinejoin="round" /></g></svg> },
        { title: t('auspiciousDayTitle'), description: t('auspiciousDayDesc'), buttonText: t('auspiciousDayButton'), onClick: props.onStartAuspiciousDayFinder, buttonVariant: 'dayselection' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l-3 3 6 0 -3-3zM12 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" opacity="0.6"/></svg> },
        { title: t('zodiacHourTitle'), description: t('zodiacHourDesc'), buttonText: t('zodiacHourButton'), onClick: props.onStartZodiacFinder, buttonVariant: 'secondary' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { title: t('shopTitle'), description: t('shopDesc'), buttonText: t('shopButton'), onClick: props.onStartShop, buttonVariant: 'shop' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
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