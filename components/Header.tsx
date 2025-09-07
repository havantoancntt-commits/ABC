import React from 'react';
import { useLocalization } from '../hooks/useLocalization';

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
            <button onClick={() => setLanguage('en')} className={buttonClass('en')}>
                EN
            </button>
        </div>
    );
};

const Header: React.FC<Props> = ({ onHomeClick }) => {
  const { t } = useLocalization();
  return (
    <header className="py-6 bg-black bg-opacity-30 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-40 animate-fade-in-down shadow-lg shadow-black/20">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <button onClick={onHomeClick} className="flex items-center gap-3 group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400 group-hover:text-yellow-300 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-12v4m-2-2h4m5 4v4m-2-2h4M5 11h14M5 11a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2M5 11v2a2 2 0 002 2h10a2 2 0 002-2v-2" /></svg>
          <h1 className="text-xl md:text-2xl font-bold text-gray-100 font-serif group-hover:text-white transition-colors">
            {t('appName')}
          </h1>
        </button>
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default React.memo(Header);