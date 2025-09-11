import React from 'react';
import { SUPPORT_INFO } from '../lib/constants';
import { useLocalization } from '../hooks/useLocalization';

const ZaloContact: React.FC = () => {
  const { t } = useLocalization();
  return (
    <a
      href={`https://zalo.me/${SUPPORT_INFO.zaloPhone}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-5 right-5 z-50 flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full shadow-2xl transition-transform transform hover:scale-110 animate-pulse-glow"
      aria-label="Chat with us on Zalo"
      title={`Chat Zalo: ${SUPPORT_INFO.zaloPhone}`}
    >
      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.999 15.826h-2.922v-2.145h2.922v-1.125l-4.047-2.344v-2.313h4.047v-2.148h-5.242v7.929h-1.758v-7.929h-5.25v2.148h4.055v2.313l-4.055 2.344v1.125h2.922v2.145h-2.922v1.125l4.055 2.344v2.313h-4.055v2.148h5.25v-7.93h1.758v7.93h5.242v-2.148h-4.047v-2.313l4.047-2.344v-1.125z" />
      </svg>
       <span className="absolute hidden group-hover:block -top-10 left-1/2 transform -translate-x-1/2 w-auto px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md shadow-lg whitespace-nowrap">
        {/* FIX: Corrected invalid translation key. */}
        {t('zaloTooltip')}
      </span>
    </a>
  );
};

export default React.memo(ZaloContact);