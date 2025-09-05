import React, { useState } from 'react';
import { SUPPORT_INFO } from '../constants';

interface Props {
  variant?: 'form' | 'modal';
}

const DonationInfo: React.FC<Props> = ({ variant = 'form' }) => {
  const [copyStatus, setCopyStatus] = useState<Record<string, string>>({});
  const [transferContentWithId] = useState(`${SUPPORT_INFO.transferContent}${Math.floor(1000 + Math.random() * 9000)}`);
  const qrCodeUrl = `https://img.vietqr.io/image/${SUPPORT_INFO.bankBin}-${SUPPORT_INFO.accountNumber}-compact2.png?addInfo=${encodeURIComponent(transferContentWithId)}&accountName=${encodeURIComponent(SUPPORT_INFO.accountName)}`;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus({ [field]: 'Đã chép!' });
      setTimeout(() => setCopyStatus(prev => ({ ...prev, [field]: '' })), 2000);
    }).catch(err => {
      console.error('Không thể sao chép: ', err);
      setCopyStatus({ [field]: 'Lỗi!' });
    });
  };

  const containerClass = variant === 'modal'
    ? 'bg-transparent border-none shadow-none p-0'
    : 'mt-6 p-6 rounded-lg bg-gray-900/50 border border-gray-700/50 shadow-lg';

  return (
    <div className={`text-center ${containerClass}`}>
      <h3 className="text-xl font-semibold text-yellow-300 font-serif mb-2">Tùy Hỷ Công Đức</h3>
      <p className="text-amber-100 mb-4 text-sm leading-relaxed max-w-lg mx-auto">
        Mỗi lá số là kết tinh của tâm huyết và tri thức. Sự ủng hộ của quý vị là động lực vô giá để chúng tôi duy trì và lan tỏa giá trị của Tử Vi Đẩu Số đến cộng đồng.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-4">
        <div className="p-2 bg-white rounded-md shadow-md shrink-0">
          <img src={qrCodeUrl} alt="VietQR Code for Donation" width="150" height="150" />
        </div>
        <div className="text-left space-y-2 text-sm w-full sm:max-w-xs">
          <div className="flex justify-between items-center p-2 bg-black/30 rounded-md">
            <span className="text-amber-200/80 mr-2 shrink-0">Ngân hàng:</span>
            <span className="font-semibold text-white text-right">{SUPPORT_INFO.bank}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-black/30 rounded-md">
            <span className="text-amber-200/80 mr-2 shrink-0">Số TK:</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{SUPPORT_INFO.accountNumber}</span>
              <button type="button" onClick={() => copyToClipboard(SUPPORT_INFO.accountNumber, 'stk')} className="text-yellow-300 hover:text-yellow-200 text-xs font-bold shrink-0 w-16 text-center transition-all">{copyStatus['stk'] || 'CHÉP'}</button>
            </div>
          </div>
          <div className="flex justify-between items-center p-2 bg-black/30 rounded-md">
            <span className="text-amber-200/80 mr-2 shrink-0">Chủ TK:</span>
            <span className="font-semibold text-white text-right">{SUPPORT_INFO.accountName}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-black/30 rounded-md">
            <span className="text-amber-200/80 mr-2 shrink-0">Nội dung:</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{transferContentWithId}</span>
              <button type="button" onClick={() => copyToClipboard(transferContentWithId, 'nd')} className="text-yellow-300 hover:text-yellow-200 text-xs font-bold shrink-0 w-16 text-center transition-all">{copyStatus['nd'] || 'CHÉP'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationInfo;