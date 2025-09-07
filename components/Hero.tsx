import React from 'react';
import Card from './Card';
import Button from './Button';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
  onBack: () => void;
}

const Shop: React.FC<Props> = ({ onBack }) => {
  const { t } = useLocalization();
  const PRODUCT_IMAGE_URL = 'https://i.imgur.com/8p3MCO3.jpeg';
  const TIKTOK_SHOP_URL = 'https://vt.tiktok.com/ZSHtp8VBv97Sw-X46jh/';

  const iconClass = "w-7 h-7 text-amber-300";

  const features = [
    { text: t('shopFeature1'), icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg> },
    { text: t('shopFeature2'), icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
    { text: t('shopFeature3'), icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0117.657 18.657z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg> },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-100 font-serif leading-tight animate-fade-in-down">
          {t('shopPageTitle')}
        </h1>
      </div>
      <Card className="p-4 sm:p-8 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-3 animate-slide-in-up">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-br from-yellow-500 via-amber-600 to-yellow-700 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition duration-1000 animate-pulse-glow" style={{ animationDuration: '6s' }}></div>
              <img 
                src={PRODUCT_IMAGE_URL}
                alt={t('shopProductName')} 
                className="relative rounded-2xl w-full shadow-2xl shadow-black/50 border-2 border-yellow-600/50"
              />
            </div>
          </div>
          <div className="lg:col-span-2 animate-slide-in-up" style={{ animationDelay: '200ms' }}>
            <h2 className="text-4xl font-bold font-serif text-yellow-300 leading-tight">
              {t('shopProductName')}
            </h2>
            <p className="text-lg text-amber-200 mt-2 font-serif italic">{t('shopProductBrand')}</p>
            <p className="mt-6 text-gray-300 leading-relaxed text-justify">
              {t('shopProductDesc')}
            </p>
            <div className="mt-8 space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-4 text-gray-200">
                  <div className="p-3 bg-gray-800/70 rounded-full border border-gray-700">
                    {feature.icon}
                  </div>
                  <span className="font-semibold text-lg">{feature.text}</span>
                </div>
              ))}
            </div>
            
            <hr className="my-8 border-gray-700/50" />
            
            <div>
              <h4 className="font-serif font-bold text-xl text-yellow-300 mb-2">{t('shopPhilosophyTitle')}</h4>
              <p className="text-sm text-gray-400 italic leading-relaxed">{t('shopPhilosophyText')}</p>
            </div>
            
            <div className="mt-10">
              <a href={TIKTOK_SHOP_URL} target="_blank" rel="noopener noreferrer" className="inline-block w-full sm:w-auto">
                <Button variant="shop" size="lg" className="w-full sm:w-auto animate-pulse-button" style={{ animationDuration: '3.5s' }}>
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.05-4.85-.38-6.95-1.91-1.83-1.36-3.17-3.46-3.86-5.71-.02-.08-.03-.16-.05-.24-.1-.38-.21-.77-.28-1.16 1.47.01 2.93-.01 4.4.02.05.78.22 1.54.51 2.25.51 1.25 1.72 2.18 3.11 2.31.65.06 1.3.04 1.94-.04 1.13-.14 2.18-.58 3.01-1.35.69-.62 1.15-1.45 1.39-2.35.09-.34.15-.7.15-1.06.01-2.93-.01-5.85.02-8.77-.02-1.89-1.14-3.58-2.6-4.57-.75-.5-1.6-.78-2.5-.88-1.18-.13-2.38-.04-3.56.09-1.08.11-2.12.39-3.12.82V4.54c1.46-.35 2.94-.52 4.41-.56z"></path>
                  </svg>
                  {t('shopCTA')}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </Card>
      <div className="mt-8 text-center">
        <Button onClick={onBack} variant="secondary">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {t('back')}
        </Button>
      </div>
    </div>
  );
};

export default Shop;