import React from 'react';
import { useLocalization } from '../hooks/useLocalization';

const MysticalHero: React.FC = () => {
    const { t } = useLocalization();
    return (
        <div className="relative mb-16 max-w-5xl mx-auto group animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 via-yellow-500 to-rose-600 rounded-3xl blur-xl opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative aspect-[16/7] w-full bg-black rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-gray-800">
                <svg viewBox="0 0 400 175" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" aria-hidden="true">
                    <defs>
                        <filter id="hero-glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.7 0" result="glowMatrix" />
                            <feMerge>
                                <feMergeNode in="glowMatrix" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <radialGradient id="grad-purple-center" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="grad-yellow-top" cx="85%" cy="20%" r="60%">
                             <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                        </radialGradient>
                         <style>{`
                            @keyframes rotate-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                            @keyframes rotate-fast { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
                            .ring-1 { animation: rotate-slow 40s linear infinite; transform-origin: center; }
                            .ring-2 { animation: rotate-fast 60s linear infinite; transform-origin: center; }
                        `}</style>
                    </defs>
                    
                    {/* Background Gradients */}
                    <rect width="400" height="175" fill="black" />
                    <rect x="100" y="-50" width="200" height="200" fill="url(#grad-purple-center)" />
                    <rect x="0" y="0" width="400" height="175" fill="url(#grad-yellow-top)" />

                    {/* Starfield */}
                    <g fill="var(--color-text-primary)" opacity="0.6">
                        <circle cx="50" cy="30" r="1" className="animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '3s' }} />
                        <circle cx="120" cy="150" r="0.5" className="animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }} />
                        <circle cx="200" cy="80" r="1.2" className="animate-pulse" style={{ animationDuration: '2s' }} />
                        <circle cx="350" cy="130" r="0.8" className="animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }} />
                        <circle cx="250" cy="20" r="0.6" />
                        <circle cx="80" cy="90" r="1" className="animate-pulse" style={{ animationDelay: '0.2s', animationDuration: '2.5s' }} />
                        <circle cx="380" cy="40" r="1" />
                        <circle cx="20" cy="130" r="0.7" />
                        <circle cx="300" cy="160" r="0.5" className="animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }} />
                    </g>

                    {/* Central Astrology Symbol */}
                    <g transform="translate(200 87.5)" stroke="var(--color-primary)" strokeWidth="0.5" fill="none" filter="url(#hero-glow)">
                        <circle r="70" opacity="0.3" strokeDasharray="2 6" className="ring-1" />
                        <circle r="80" opacity="0.2" strokeDasharray="1 10" className="ring-2" />
                        <circle r="60" opacity="0.2" strokeWidth="1"/>
                        <circle r="50" strokeDasharray="4 4" opacity="0.4" strokeWidth="1"/>
                        <circle r="40" strokeWidth="1"/>
                        
                        <g opacity="0.7">
                            <line x1="0" y1="-40" x2="0" y2="40" />
                            <line x1="-40" y1="0" x2="40" y2="0" />
                            <line x1="-28.28" y1="-28.28" x2="28.28" y2="28.28" />
                            <line x1="-28.28" y1="28.28" x2="28.28" y2="-28.28" />
                        </g>

                        <circle r="10" fill="var(--color-primary)" fillOpacity="0.1" />
                    </g>
                    
                     <text x="20" y="160" fontFamily="'Playfair Display', serif" fontSize="12" fill="var(--color-text-secondary)" opacity="0.5">
                        {t('appName')}
                    </text>
                </svg>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            </div>
        </div>
    );
};

export default MysticalHero;