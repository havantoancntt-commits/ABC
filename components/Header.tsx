import React, { useState, useRef, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

interface Props {
  onHomeClick: () => void;
}

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLocalization();

    const buttonClass = (lang: string) => `px-3 py-1 text-sm font-bold rounded-md transition-colors ${
        language === lang 
        ? 'bg-yellow-400 text-gray-900' 
        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70'
    }`;

    return (
        <div className="flex items-center gap-2 bg-gray-800/50 p-1 rounded-lg">
            <button onClick={() => setLanguage('vi')} className={buttonClass('vi')}>
                VI
            </button>
            {/* FIX: Corrected language parameter to 'en' which is now a valid type. */}
            <button onClick={() => setLanguage('en')} className={buttonClass('en')}>
                EN
            </button>
        </div>
    );
};

const UserProfile: React.FC = () => {
    const { user, handleSignOut } = useGoogleAuth();
    const { t } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-white/10">
                <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border-2 border-yellow-400/80" />
                <span className="hidden sm:block font-semibold text-gray-200">{user.name.split(' ')[0]}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-2 z-50 animate-fade-in" style={{animationDuration: '200ms'}}>
                    <div className="px-4 py-2 border-b border-gray-700/50">
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-red-500/20 flex items-center gap-2">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        {t('signOut')}
                    </button>
                </div>
            )}
        </div>
    );
}

const Header: React.FC<Props> = ({ onHomeClick }) => {
  const { t } = useLocalization();
  return (
    <header className="py-6 bg-black bg-opacity-30 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-40 animate-fade-in-down shadow-2xl shadow-black/30">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <button onClick={onHomeClick} className="flex items-center gap-3 group rounded-lg p-2 -m-2 transition-colors hover:bg-white/5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400 group-hover:text-yellow-300 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-12v4m-2-2h4m5 4v4m-2-2h4M5 11h14M5 11a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2M5 11v2a2 2 0 002 2h10a2 2 0 002-2v-2" /></svg>
          <h1 className="text-xl md:text-2xl font-bold text-gray-100 font-serif group-hover:text-white transition-colors">
            {t('appName')}
          </h1>
        </button>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <UserProfile />
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);