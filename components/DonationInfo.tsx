import React, { useState } from 'react';
import { SUPPORT_INFO } from '../lib/constants';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
  variant?: 'form' | 'modal';
}

const PaypalIcon: React.FC = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
        <path fillRule="evenodd" clipRule="evenodd" d="M3.522 6.095c.214-1.22.99-2.18 2.222-2.18h10.363c1.99 0 2.622 1.05 2.333 2.924l-2.002 12.87c-.16 1.023-.74 1.39-1.63 1.39H8.785c-1.14 0-1.8-.74-2.023-1.812L3.522 6.095zm5.55 9.112c.307.36.757.54 1.285.54h.43c2.22 0 3.255-1.57 3.59-3.768.14-1.002.05-1.5-.27-1.92-.32-.43-.88-.71-1.62-.71h-1.5c-1.4 0-2.43.91-2.73 2.454a2.2 2.2 0 00-.01.32c-.01.27-.04.6-.26 1.154l.055-.08zm3.266-5.268c.55-.9 1.6-1.42 2.87-1.42.36 0 .68.07.95.2.35.16.48.45.39.81l-.57 2.14c-.08.31-.33.51-.65.51h-.02c-.52 0-.96-.32-1.1-.81-.13-.51-.6-2.07-.6-2.07l-.27-.36z" fill="#FFFFFF"></path>
        <path fillRule="evenodd" clipRule="evenodd" d="M6.075 4.195c.264-1.5 1.25-2.68 2.8-2.68h9.11c2.45 0 3.24 1.3 2.88 3.6l-2.47 15.9c-.2 1.26-.91 1.71-2 1.71H7.81c-1.4 0-2.22-.91-2.49-2.23L1.9 6.475c-.24-1.42.27-2.61 1.6-3.04.7-.24 1.48-.24 2.57.76zM9.47 5.925c.67-1.1 1.95-1.74 3.5-1.74.45 0 .83.08 1.16.24.43.2.6.55.48 1l-.7 2.64c-.1.38-.4.63-.8.63h-.02c-.64 0-1.18-.4-1.35-1-.16-.62-.74-2.55-.74-2.55l-.33-.44c.4-.04.4-.04.4-.04zm1.53 10.3c.38.44.92.66 1.57.66h.53c2.72 0 4-1.93 4.4-4.63.17-1.23.06-1.84-.33-2.36-.4-.53-1.08-.87-2-.87h-1.84c-1.72 0-3 1.12-3.35 3.02-.03.2-.04.4-.02.5.03.33-.2 1.42-.32 1.42v.01l.09-.25z" fill="#0079C1"></path>
    </svg>
);


const DonationInfo: React.FC<Props> = ({ variant = 'form' }) => {
  const { t } = useLocalization();
  const [copyStatus, setCopyStatus] = useState<Record<string, string>>({});
  const [transferContentWithId] = useState(`${SUPPORT_INFO.transferContent}${Math.floor(1000 + Math.random() * 9000)}`);
  const qrCodeUrl = `https://img.vietqr.io/image/${SUPPORT_INFO.bankBin}-${SUPPORT_INFO.accountNumber}-compact2.png?addInfo=${encodeURIComponent(transferContentWithId)}&accountName=${encodeURIComponent(SUPPORT_INFO.accountName)}`;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus({ [field]: t('copied') });
      setTimeout(() => setCopyStatus(prev => ({ ...prev, [field]: '' })), 2000);
    }).catch(err => {
      console.error('Could not copy text: ', err);
      setCopyStatus({ [field]: t('copyError') });
    });
  };

  const containerClass = variant === 'modal'
    ? 'bg-transparent border-none shadow-none p-0'
    : 'mt-6 p-6 rounded-lg bg-gray-900/50 border border-gray-700/50 shadow-lg';

  return (
    <div className={`text-center ${containerClass}`}>
      <h3 className="text-xl font-semibold text-yellow-300 font-serif mb-2">{t('donationTitle')}</h3>
      <p className="text-amber-100 mb-4 text-sm leading-relaxed max-w-lg mx-auto">
        {t('donationMessage')}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-4">
        <div className="p-2 bg-white rounded-md shadow-md shrink-0">
          <img src={qrCodeUrl} alt="VietQR Code for Donation" width="150" height="150" />
        </div>
        <div className="text-left space-y-2 text-sm w-full sm:max-w-xs">
          <div className="flex justify-between items-center p-2 bg-black/30 rounded-md">
            <span className="text-amber-200/80 mr-2 shrink-0">{t('donationBank')}:</span>
            <span className="font-semibold text-white text-right">{SUPPORT_INFO.bank}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-black/30 rounded-md">
            <span className="text-amber-200/80 mr-2 shrink-0">{t('donationAccountNo')}:</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{SUPPORT_INFO.accountNumber}</span>
              <button type="button" onClick={() => copyToClipboard(SUPPORT_INFO.accountNumber, 'stk')} className="text-yellow-300 hover:text-yellow-200 text-xs font-bold shrink-0 w-16 text-center transition-all">{copyStatus['stk'] || t('copy')}</button>
            </div>
          </div>
          <div className="flex justify-between items-center p-2 bg-black/30 rounded-md">
            <span className="text-amber-200/80 mr-2 shrink-0">{t('donationAccountName')}:</span>
            <span className="font-semibold text-white text-right">{SUPPORT_INFO.accountName}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-black/30 rounded-md">
            <span className="text-amber-200/80 mr-2 shrink-0">{t('donationContent')}:</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{transferContentWithId}</span>
              <button type="button" onClick={() => copyToClipboard(transferContentWithId, 'nd')} className="text-yellow-300 hover:text-yellow-200 text-xs font-bold shrink-0 w-16 text-center transition-all">{copyStatus['nd'] || t('copy')}</button>
            </div>
          </div>
        </div>
      </div>
       <div className="flex items-center my-6 max-w-md mx-auto">
        <hr className="flex-grow border-t border-gray-700/50" />
        <span className="px-3 text-gray-400 text-sm font-semibold">{t('donationOr')}</span>
        <hr className="flex-grow border-t border-gray-700/50" />
      </div>

      <div className="max-w-xs mx-auto">
        <a
          href={SUPPORT_INFO.paypalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-[#0070BA] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#005ea6] transition-all duration-300 shadow-lg transform hover:-translate-y-0.5"
        >
          <PaypalIcon />
          <span>{t('donationPayPal')}</span>
        </a>
      </div>
    </div>
  );
};

export default DonationInfo;