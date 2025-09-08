import React, { useState } from 'react';
import { SUPPORT_INFO } from '../lib/constants';
import { useLocalization } from '../hooks/useLocalization';

type Tab = 'bank' | 'zalopay' | 'paypal';

const ZaloPayIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className={className}>
        <g fill="none" fillRule="evenodd">
            <path d="M24 48c13.255 0 24-10.745 24-24S37.255 0 24 0 0 10.745 0 24s10.745 24 24 24z" fill="#0068FF"></path>
            <path d="M36.538 24.052c0 1.233-.35 2.393-1.049 3.483-.7 1.09-1.685 1.956-2.956 2.6a8.44 8.44 0 0 1-3.92 1.048c-1.233 0-2.393-.35-3.483-1.05-1.09-.7-1.956-1.684-2.6-2.955a8.44 8.44 0 0 1-1.048-3.92c0-1.233.35-2.393 1.05-3.484.7-1.09 1.684-1.955 2.955-2.6a8.44 8.44 0 0 1 3.92-1.048c1.233 0 2.393.35 3.483 1.05 1.09.7 1.956 1.684 2.6 2.956.699.948 1.048 2.064 1.048 3.34zm-7.05-4.482a4.425 4.425 0 0 0-1.743-.882 4.09 4.09 0 0 0-1.905-.315c-.7.034-1.365.22-1.995.556a4.425 4.425 0 0 0-1.743.882c-.448.483-.816 1.036-1.104 1.658-.288.622-.432 1.3-.432 2.034 0 .734.144 1.41.432 2.034.288.622.656 1.175 1.104 1.658.482.448 1.036.816 1.658 1.104.622.288 1.3.432 2.034.432.734 0 1.41-.144 2.034-.432.622-.288 1.175-.656 1.658-1.104.448-.483.816-1.036 1.104-1.658.288-.622.432-1.3.432-2.034 0-.734-.144-1.41-.432-2.034a5.04 5.04 0 0 0-1.104-1.658z" fill="#FFF"></path>
            <path d="M19.324 22.843a.89.89 0 0 0-.588.196l-4.134 3.093a.92.92 0 0 0-.34 1.116c.143.375.5.6.903.6h2.238c.403 0 .76-.225.903-.6a.92.92 0 0 0-.34-1.116l-1.02-1.066-1.01-1.05a.15.15 0 0 1-.01-.196c.03-.04.1-.06.15-.06h5.36c.05 0 .12.02.15.06a.15.15 0 0 1-.01.196l-2.03 2.116a.92.92 0 0 0-.34 1.116c.143.375.5.6.903.6h2.238c.403 0 .76-.225.903-.6a.92.92 0 0 0-.34-1.116l-4.134-3.093a.89.89 0 0 0-.588-.196h-1.39z" fill="#0068FF"></path>
        </g>
    </svg>
);

const PaypalIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path fillRule="evenodd" clipRule="evenodd" d="M3.522 6.095c.214-1.22.99-2.18 2.222-2.18h10.363c1.99 0 2.622 1.05 2.333 2.924l-2.002 12.87c-.16 1.023-.74 1.39-1.63 1.39H8.785c-1.14 0-1.8-.74-2.023-1.812L3.522 6.095zm5.55 9.112c.307.36.757.54 1.285.54h.43c2.22 0 3.255-1.57 3.59-3.768.14-1.002.05-1.5-.27-1.92-.32-.43-.88-.71-1.62-.71h-1.5c-1.4 0-2.43.91-2.73 2.454a2.2 2.2 0 00-.01.32c-.01.27-.04.6-.26 1.154l.055-.08zm3.266-5.268c.55-.9 1.6-1.42 2.87-1.42.36 0 .68.07.95.2.35.16.48.45.39.81l-.57 2.64c-.08.31-.33.51-.65.51h-.02c-.52 0-.96-.32-1.1-.81-.13-.51-.6-2.07-.6-2.07l-.27-.36z" fill="#FFFFFF"></path>
        <path fillRule="evenodd" clipRule="evenodd" d="M6.075 4.195c.264-1.5 1.25-2.68 2.8-2.68h9.11c2.45 0 3.24 1.3 2.88 3.6l-2.47 15.9c-.2 1.26-.91 1.71-2 1.71H7.81c-1.4 0-2.22-.91-2.49-2.23L1.9 6.475c-.24-1.42.27-2.61 1.6-3.04.7-.24 1.48-.24 2.57.76zM9.47 5.925c.67-1.1 1.95-1.74 3.5-1.74.45 0 .83.08 1.16.24.43.2.6.55.48 1l-.7 2.64c-.1.38-.4.63-.8.63h-.02c-.64 0-1.18-.4-1.35-1-.16-.62-.74-2.55-.74-2.55l-.33-.44c.4-.04.4-.04.4-.04zm1.53 10.3c.38.44.92.66 1.57.66h.53c2.72 0 4-1.93 4.4-4.63.17-1.23.06-1.84-.33-2.36-.4-.53-1.08-.87-2-.87h-1.84c-1.72 0-3 1.12-3.35 3.02-.03.2-.04.4-.02.5.03.33-.2 1.42-.32 1.42v.01l.09-.25z" fill="#0079C1"></path>
    </svg>
);

const CopyButton: React.FC<{ textToCopy: string, fieldName: string }> = ({ textToCopy, fieldName }) => {
    const { t } = useLocalization();
    const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setStatus('copied');
            setTimeout(() => setStatus('idle'), 2000);
        }).catch(() => {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 2000);
        });
    };
    
    const textMap = {
        idle: t('copy'),
        copied: t('copied'),
        error: t('copyError'),
    };
    const colorMap = {
        idle: 'text-yellow-300 hover:text-yellow-200',
        copied: 'text-green-400',
        error: 'text-red-400',
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            className={`text-xs font-bold shrink-0 w-16 text-center transition-all ${colorMap[status]}`}
        >
            {textMap[status]}
        </button>
    );
};


const DonationInfo: React.FC = () => {
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState<Tab>('bank');
  const [transferContentWithId] = useState(`${SUPPORT_INFO.transferContent}_${Math.floor(1000 + Math.random() * 9000)}`);
  const qrCodeUrl = `https://img.vietqr.io/image/${SUPPORT_INFO.bankBin}-${SUPPORT_INFO.accountNumber}-compact2.png?addInfo=${encodeURIComponent(transferContentWithId)}&accountName=${encodeURIComponent(SUPPORT_INFO.accountName)}`;

  const TabButton: React.FC<{ tab: Tab; children: React.ReactNode }> = ({ tab, children }) => (
    <button
        type="button"
        onClick={() => setActiveTab(tab)}
        className={`flex-1 px-4 py-3 text-sm font-bold rounded-t-lg transition-colors focus:outline-none ${
            activeTab === tab 
            ? 'bg-gray-900/50 border-b-2 border-yellow-400 text-white' 
            : 'text-gray-400 hover:text-white'
        }`}
    >
        {children}
    </button>
  );

  return (
    <div className="w-full">
        <div className="flex border-b border-gray-700/50">
            <TabButton tab="bank">{t('donationViaBank')}</TabButton>
            <TabButton tab="zalopay">{t('donationViaZaloPay')}</TabButton>
            <TabButton tab="paypal">{t('donationViaPayPal')}</TabButton>
        </div>
        <div className="p-6 bg-gray-900/50 rounded-b-lg">
            {activeTab === 'bank' && (
                <div className="animate-fade-in">
                    <p className="text-center text-amber-100 mb-4 text-sm">{t('donationScanQR')}</p>
                    <div className="flex justify-center p-2 bg-white rounded-md shadow-md w-40 h-40 mx-auto">
                        <img src={qrCodeUrl} alt="VietQR Code for Donation" width="150" height="150" />
                    </div>
                    <div className="flex items-center my-4">
                        <hr className="flex-grow border-t border-gray-700/50" />
                        <span className="px-3 text-gray-400 text-xs font-semibold">{t('donationOrManual')}</span>
                        <hr className="flex-grow border-t border-gray-700/50" />
                    </div>
                    <div className="text-left space-y-2 text-sm">
                        <div className="flex justify-between items-center p-2 bg-black/30 rounded-md">
                            <span className="text-amber-200/80 mr-2 shrink-0">{t('donationBank')}:</span>
                            <span className="font-semibold text-white text-right">{SUPPORT_INFO.bank}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-black/30 rounded-md">
                            <span className="text-amber-200/80 mr-2 shrink-0">{t('donationAccountNo')}:</span>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">{SUPPORT_INFO.accountNumber}</span>
                                <CopyButton textToCopy={SUPPORT_INFO.accountNumber} fieldName="stk" />
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
                                <CopyButton textToCopy={transferContentWithId} fieldName="nd" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
             {activeTab === 'zalopay' && (
                <div className="animate-fade-in text-center">
                    <p className="text-amber-100 mb-4 text-sm">{t('donationZaloPayMessage')}</p>
                    <ZaloPayIcon className="w-16 h-16 mx-auto mb-4" />
                     <div className="flex items-center justify-between p-3 bg-black/30 rounded-md max-w-sm mx-auto">
                        <span className="font-mono text-white text-lg tracking-wider">{SUPPORT_INFO.zaloPhone}</span>
                        <CopyButton textToCopy={SUPPORT_INFO.zaloPhone} fieldName="zalo" />
                    </div>
                    <a href={`https://social.zalopay.vn/qr/pay?server=zalopay&utm_source=web&receive_id=${SUPPORT_INFO.zaloPhone}`}
                        target="_blank" rel="noopener noreferrer"
                        className="mt-6 inline-flex items-center justify-center gap-2 w-full max-w-sm bg-[#0068FF] text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Mở ZaloPay
                    </a>
                </div>
            )}
             {activeTab === 'paypal' && (
                <div className="animate-fade-in text-center">
                    <p className="text-amber-100 mb-4 text-sm">Use PayPal for international contributions.</p>
                     <PaypalIcon className="w-16 h-16 mx-auto text-[#0079C1] mb-4" />
                     <a
                        href={SUPPORT_INFO.paypalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex items-center justify-center gap-3 w-full max-w-sm bg-[#0070BA] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#005ea6] transition-all"
                     >
                        <PaypalIcon />
                        <span>{t('donationPayPal')}</span>
                    </a>
                </div>
            )}
        </div>
    </div>
  );
};

export default DonationInfo;