import React from 'react';
import Card from './Card';
import Button from './Button';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
    onStartAstrology: () => void;
    onStartPhysiognomy: () => void;
    onStartZodiacFinder: () => void;
    onStartIChing: () => void;
}

const FeatureCard: React.FC<{
    title: string;
    description: string;
    buttonText: string;
    icon: React.ReactNode;
    onClick: () => void;
    buttonVariant: 'primary' | 'special' | 'secondary' | 'iching';
}> = ({ title, description, buttonText, icon, onClick, buttonVariant }) => (
    <div className="group relative h-full">
        <div className={`absolute -inset-1 bg-gradient-to-r ${
            buttonVariant === 'primary' ? 'from-yellow-600 to-purple-600' : 
            buttonVariant === 'special' ? 'from-purple-600 to-indigo-600' :
            buttonVariant === 'iching' ? 'from-emerald-600 to-teal-600' :
            'from-cyan-600 to-blue-600'
        } rounded-2xl blur opacity-25 group-hover:opacity-100 group-hover:blur-md transition duration-500`}></div>
        <Card className="relative flex flex-col text-center items-center h-full">
            <div className="p-4 bg-gray-900/50 rounded-full mb-4 border border-gray-700">
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


const Home: React.FC<Props> = ({ onStartAstrology, onStartPhysiognomy, onStartZodiacFinder, onStartIChing }) => {
    const { t } = useLocalization();
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
                    <FeatureCard
                        title={t('astrologyTitle')}
                        description={t('astrologyDesc')}
                        buttonText={t('astrologyButton')}
                        onClick={onStartAstrology}
                        buttonVariant="primary"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-12v4m-2-2h4m5 4v4m-2-2h4M5 11h14M5 11a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2M5 11v2a2 2 0 002 2h10a2 2 0 002-2v-2" /></svg>}
                    />
                </div>
                 <div className="animate-fade-in" style={{ animationDelay: '0.9s' }}>
                    <FeatureCard
                        title={t('physiognomyTitle')}
                        description={t('physiognomyDesc')}
                        buttonText={t('physiognomyButton')}
                        onClick={onStartPhysiognomy}
                        buttonVariant="special"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                    />
                </div>
                 <div className="animate-fade-in md:col-span-2 lg:col-span-1" style={{ animationDelay: '1.2s' }}>
                     <FeatureCard
                        title={t('iChingTitle')}
                        description={t('iChingDesc')}
                        buttonText={t('iChingButton')}
                        onClick={onStartIChing}
                        buttonVariant="iching"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><g strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18M12 3v18" strokeLinecap="round" strokeLinejoin="round" /></g></svg>}
                    />
                </div>
                 <div className="animate-fade-in md:col-span-2 lg:col-span-3" style={{ animationDelay: '1.5s' }}>
                    <FeatureCard
                        title={t('zodiacHourTitle')}
                        description={t('zodiacHourDesc')}
                        buttonText={t('zodiacHourButton')}
                        onClick={onStartZodiacFinder}
                        buttonVariant="secondary"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                </div>
            </div>
        </div>
    );
};

export default Home;