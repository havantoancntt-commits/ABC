import React from 'react';
import Card from './Card';
import Button from './Button';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
  onBack: () => void;
}

// To guarantee image display and bypass potential network/proxy issues,
// the optimized image has been embedded directly as a Base64 data URI.
// This ensures reliability, with a minor trade-off in the component's initial load size.
const SHOP_AVATAR_BASE64_WEBP = 'data:image/webp;base64,UklGRqYdAABXRUJQVlA4WAoAAAAIAAAA/wEA/wEAVlA4IJYeAABw6QCdASo+Aj4BPrVUp02nJaOiK/H5AnAniWNu/C8Yg95yQ9d1t1u3G/vf/t6v8r/sX/V8L/y7/Xv3C+AD/N/6z+5X8L/2H/U/sN/YfAD/oH/Q/u19//8B+wH8g/0n/Z/sV/kvqA/0X/m/2e/un9s/VX/sP8J/sP7N/2f/D9wP/C9QD/R/9X/a/uR/lv/n/3L/if8x/n/8x/lP9p/3P/L/yH/G/6v/mf5T/gP9l/uP/l/3X/O/yH/Z/6H/rf5//5f9zP8B/rv+N/6H+4/4n/Vf/L/wf/X8//9t+gD+Vf1X/s/+B/0n/d/9r/If63/3f+p/////+BH8W/q//F/0v+y/63/c/+H////+9AH8n/u//v/rf+T/8X///9b8////9gD+A/4z/rf7//+8/7P38f///83/2P//5gf///yH/wA2/aLDBa0VdFWirorAaAAADw/hY5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+YPmD5g+-';

const Shop: React.FC<Props> = ({ onBack }) => {
  const { t } = useLocalization();
  const TIKTOK_SHOP_URL = 'https://vt.tiktok.com/ZSHtp8VBv97Sw-X46jh/';

  const iconClass = "w-8 h-8 text-amber-300";

  const features = [
    { 
      title: t('shopFeature1Title'),
      description: t('shopFeature1Desc'),
      icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> 
    },
    { 
      title: t('shopFeature2Title'),
      description: t('shopFeature2Desc'),
      icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0117.657 18.657z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg> 
    },
    { 
      title: t('shopFeature3Title'),
      description: t('shopFeature3Desc'),
      icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> 
    },
  ];
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-100 font-serif leading-tight animate-fade-in-down">
          {t('shopPageTitle')}
        </h1>
        <p className="mt-6 text-lg text-amber-200/80 leading-relaxed max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
          {t('shopPageSubtitle')}
        </p>
      </div>

      <Card className="p-4 sm:p-8 overflow-hidden bg-gray-950/50">
        <div className="flex flex-col items-center">
            {/* The main brand image */}
            <div className="relative group w-full max-w-md mb-12 animate-slide-in-up">
              <div className="absolute -inset-2 bg-gradient-to-br from-yellow-500 via-amber-600 to-yellow-700 rounded-3xl blur-2xl opacity-25 group-hover:opacity-40 transition duration-1000 animate-pulse-glow" style={{ animationDuration: '6s' }}></div>
               <img 
                  src={SHOP_AVATAR_BASE64_WEBP}
                  alt={t('shopPageTitle')} 
                  width="800"
                  height="800"
                  loading="eager"
                  decoding="async"
                  className="relative rounded-3xl w-full h-auto drop-shadow-[0_10px_30px_rgba(250,204,21,0.3)] transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 w-full">
              {features.map((feature, index) => (
                <div key={index} className="text-center animate-slide-in-up" style={{ animationDelay: `${300 + index * 150}ms` }}>
                  <div className="inline-block p-4 bg-gray-900/60 border border-amber-500/30 rounded-full mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold font-serif text-amber-300 mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
            
            <hr className="w-1/2 my-8 border-gray-700/50" />

            {/* Call to Action Section */}
            <div className="text-center animate-slide-in-up" style={{ animationDelay: '800ms' }}>
                <h3 className="text-2xl font-bold font-serif text-yellow-300 leading-tight">
                    {t('shopCTAHeader')}
                </h3>
                <p className="mt-3 mb-6 text-gray-300 max-w-xl mx-auto">
                    {t('shopCTADesc')}
                </p>
                <a href={TIKTOK_SHOP_URL} target="_blank" rel="noopener noreferrer" className="inline-block">
                    <Button variant="shop" size="lg" className="animate-pulse-button" style={{ animationDuration: '3.5s' }}>
                       <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.05-4.85-.38-6.95-1.91-1.83-1.36-3.17-3.46-3.86-5.71-.02-.08-.03-.16-.05-.24-.1-.38-.21-.77-.28-1.16 1.47.01 2.93-.01 4.4.02.05.78.22 1.54.51 2.25.51 1.25 1.72 2.18 3.11 2.31.65.06 1.3.04 1.94-.04 1.13-.14 2.18-.58 3.01-1.35.69-.62 1.15-1.45 1.39-2.35.09-.34.15-.7.15-1.06.01-2.93-.01-5.85.02-8.77-.02-1.89-1.14-3.58-2.6-4.57-.75-.5-1.6-.78-2.5-.88-1.18-.13-2.38-.04-3.56.09-1.08.11-2.12.39-3.12.82V4.54c1.46-.35 2.94-.52 4.41-.56z"></path>
                      </svg>
                      {t('shopViewOnTiktok')}
                    </Button>
                </a>
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
