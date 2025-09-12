import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { SUPPORT_INFO } from '../lib/constants';

interface Props {
  visitCount: number;
}

const Footer: React.FC<Props> = ({ visitCount }) => {
  const { t } = useLocalization();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-8 mt-16 bg-black bg-opacity-30 border-t border-[var(--color-card-border)] backdrop-blur-lg">
      <div className="container mx-auto px-4 text-center text-sm text-[var(--color-text-secondary)]">
        <p className="mb-2 font-serif text-lg text-[var(--color-text-primary)]">
          {SUPPORT_INFO.channelName}
        </p>
        <p className="mb-4">
          &copy; {currentYear} {t('appName')}. All Rights Reserved.
        </p>
        {visitCount > 0 && (
           <div className="inline-flex items-center gap-2 rounded-full bg-gray-900/50 px-3 py-1 text-xs border border-[var(--color-card-border)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>{t('adminTotalVisits')}: {visitCount.toLocaleString(t('locale'))}</span>
           </div>
        )}
      </div>
    </footer>
  );
};

export default React.memo(Footer);