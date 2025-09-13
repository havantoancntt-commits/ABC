import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import type { TranslationKey } from '../hooks/useLocalization';
import { SUPPORT_INFO } from '../lib/constants';
import Card from './Card';
import Button from './Button';

interface PasswordPromptProps {
  onSuccess: () => void;
  onBack: () => void;
  feature: 'astrology' | 'career';
}

const PasswordPrompt: React.FC<PasswordPromptProps> = ({ onSuccess, onBack, feature }) => {
  const { t } = useLocalization();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<Record<string, string>>({});

  const featureConfig = {
    astrology: {
      password: 'tuvi2025',
      titleKey: 'passwordPromptTitle' as const,
      subtitleKey: 'passwordPromptSubtitle' as const,
      valueTitleKey: 'passwordPromptValueTitle' as const,
      valueDescKey: 'passwordPromptValueDesc' as const,
      paymentStep1Key: 'passwordPaymentStep1' as const,
      transferContentSuffix: 'TV',
    },
    career: {
      password: 'nghenghiep2025',
      titleKey: 'passwordPromptTitle' as const,
      subtitleKey: 'careerPasswordPromptSubtitle' as const,
      // FIX: Corrected invalid translation key. The key 'careerPasswordPromptValueTitle' did not exist. Replaced with 'passwordPromptValueTitle'.
      valueTitleKey: 'passwordPromptValueTitle' as const,
      valueDescKey: 'careerPasswordPromptValueDesc' as const,
      paymentStep1Key: 'careerPasswordPaymentStep1' as const,
      transferContentSuffix: 'NN',
    }
  };

  const config = featureConfig[feature];
  const [transferContent] = useState(`${SUPPORT_INFO.transferContent}_${config.transferContentSuffix}`);

  const copyToClipboard = (text: string, field: string) => {
    if (copyStatus[field]) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus(prev => ({ ...prev, [field]: t('copied') }));
      setTimeout(() => {
        setCopyStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[field];
          return newStatus;
        });
      }, 2000);
    }).catch(err => {
      console.error('Could not copy text: ', err);
      setCopyStatus(prev => ({ ...prev, [field]: t('copyError') }));
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === config.password) {
      setError(null);
      onSuccess();
    } else {
      setError(t('passwordIncorrect'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-4 sm:p-6 md:p-8">
        <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-yellow-300 leading-tight">
              {t(config.titleKey)}
            </h2>
            <p className="text-gray-300 mt-3 leading-relaxed max-w-2xl mx-auto">
              {t(config.subtitleKey)}
            </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Column: Value & Form */}
          <div className="flex flex-col">
            <h3 className="font-semibold text-xl text-yellow-300 font-serif mb-4 text-center lg:text-left">
              {t(config.valueTitleKey)}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">{t(config.valueDescKey)}</p>
            <form onSubmit={handleSubmit} className="mt-auto">
              <label htmlFor="password-input" className="sr-only">
                {t('passwordLabel')}
              </label>
              <input
                type="password"
                id="password-input"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
                className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all ${error ? 'border-red-500' : 'border-gray-600'}`}
                placeholder={t('passwordPlaceholder')}
                required
                aria-invalid={!!error}
                aria-describedby={error ? "password-error" : undefined}
              />
              {error && <p id="password-error" className="text-red-500 text-xs mt-2 text-center">{error}</p>}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button onClick={onBack} variant="secondary" type="button">{t('back')}</Button>
                <Button type="submit" variant="primary">{t('passwordSubmit')}</Button>
              </div>
            </form>
          </div>
          
          {/* Right Column: Instructions */}
          <div className="p-6 bg-gray-950/60 rounded-lg border border-yellow-500/30">
            <h3 className="font-semibold text-xl text-yellow-300 font-serif mb-4 text-center">
              {t('passwordPaymentTitle')}
            </h3>
            <ol className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 font-bold text-yellow-400 bg-gray-800 rounded-full h-6 w-6 flex items-center justify-center">1</span>
                <span>{t(config.paymentStep1Key)}</span>
              </li>
               <li className="flex items-start gap-3">
                <span className="flex-shrink-0 font-bold text-yellow-400 bg-gray-800 rounded-full h-6 w-6 flex items-center justify-center">2</span>
                <span>{t('passwordPaymentStep2')}
                  <a href={`https://zalo.me/${SUPPORT_INFO.zaloPhone}`} target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:text-yellow-300 transition-colors"> Zalo</a>.
                </span>
              </li>
              <li className="pl-9 space-y-2">
                <div className="flex items-center justify-between p-2 bg-black/30 rounded-md">
                  <span className="font-medium text-gray-400 mr-2">{t('zaloNumber')}:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white tracking-wider">{SUPPORT_INFO.zaloPhone}</span>
                    <button type="button" onClick={() => copyToClipboard(SUPPORT_INFO.zaloPhone, 'zaloPhone')} className="text-yellow-400 hover:text-yellow-300 text-xs font-bold uppercase disabled:text-gray-500 transition-colors w-16 text-right" disabled={!!copyStatus['zaloPhone']}>
                      {copyStatus['zaloPhone'] || t('copy')}
                    </button>
                  </div>
                </div>
                 <div className="flex items-center justify-between p-2 bg-black/30 rounded-md">
                  <span className="font-medium text-gray-400 mr-2">{t('passwordTransferContent')}:</span>
                   <div className="flex items-center gap-2">
                    <span className="font-mono text-white tracking-wider">{transferContent}</span>
                    <button type="button" onClick={() => copyToClipboard(transferContent, 'nd')} className="text-yellow-400 hover:text-yellow-300 text-xs font-bold uppercase disabled:text-gray-500 transition-colors w-16 text-right" disabled={!!copyStatus['nd']}>
                      {copyStatus['nd'] || t('copy')}
                    </button>
                  </div>
                </div>
              </li>
               <li className="flex items-start gap-3">
                <span className="flex-shrink-0 font-bold text-yellow-400 bg-gray-800 rounded-full h-6 w-6 flex items-center justify-center">3</span>
                <span>{t('passwordPaymentStep3')}</span>
              </li>
            </ol>
            <div className="mt-4 text-center">
                 <a href={`https://zalo.me/${SUPPORT_INFO.zaloPhone}`} target="_blank" rel="noopener noreferrer" className="text-xs text-yellow-400 hover:text-yellow-200">
                    {t('passwordSupportText')}
                </a>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PasswordPrompt;
