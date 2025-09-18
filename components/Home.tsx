import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import Button from './Button';

interface Props {
  onStartNhatMenh: () => void;
  onViewAllFeatures: () => void;
}

const Home: React.FC<Props> = ({ onStartNhatMenh, onViewAllFeatures }) => {
  const { t } = useLocalization();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] text-center overflow-hidden py-12">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative z-10 animate-fade-in-down">
        <h1 className="text-5xl md:text-7xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-br from-yellow-300 to-amber-500 leading-tight">
          {t('nhatMenhAppName')}
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          {t('nhatMenhAppSubtitle')}
        </p>
      </div>

      <div className="relative z-10 mt-12 animate-slide-in-up">
        <Button onClick={onStartNhatMenh} variant="nhatmenh" size="lg" className="animate-pulse-button">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          {t('nhatMenhCtaButton')}
        </Button>
      </div>

       <div className="relative z-10 mt-20">
          <Button onClick={onViewAllFeatures} variant="secondary" size="sm">
            {t('nhatMenhViewOtherTools')}
          </Button>
       </div>
    </div>
  );
};

export default Home;
