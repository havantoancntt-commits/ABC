import type { TarotCard } from './types';

export const SUPPORT_INFO = {
  channelName: 'Huyền Phong Phật Đạo',
  bank: 'Vietcombank (VCB)',
  bankBin: '970436',
  accountNumber: '0501000160764',
  accountName: 'HA VAN TOAN',
  transferContent: 'UNGHO_HPPD',
  zaloPhone: '0974313633',
  paypalUrl: 'https://www.paypal.me/TOANVAIO',
};

// This function reads the Google Client ID from a meta tag in the HTML.
// This is a robust way to handle client-side configuration without a build process.
const getGoogleClientId = (): string | null => {
  if (typeof document !== 'undefined') {
    const meta = document.querySelector('meta[name="google-client-id"]');
    return meta ? meta.getAttribute('content') : null;
  }
  return null;
};

export const GOOGLE_CLIENT_ID = getGoogleClientId();


export const TAROT_CARDS_MAJOR_ARCANA: readonly TarotCard[] = [
  { id: 0, name: { vi: 'The Fool', en: 'The Fool' } },
  { id: 1, name: { vi: 'The Magician', en: 'The Magician' } },
  { id: 2, name: { vi: 'The High Priestess', en: 'The High Priestess' } },
  { id: 3, name: { vi: 'The Empress', en: 'The Empress' } },
  { id: 4, name: { vi: 'The Emperor', en: 'The Emperor' } },
  { id: 5, name: { vi: 'The Hierophant', en: 'The Hierophant' } },
  { id: 6, name: { vi: 'The Lovers', en: 'The Lovers' } },
  { id: 7, name: { vi: 'The Chariot', en: 'The Chariot' } },
  { id: 8, name: { vi: 'Strength', en: 'Strength' } },
  { id: 9, name: { vi: 'The Hermit', en: 'The Hermit' } },
  { id: 10, name: { vi: 'Wheel of Fortune', en: 'Wheel of Fortune' } },
  { id: 11, name: { vi: 'Justice', en: 'Justice' } },
  { id: 12, name: { vi: 'The Hanged Man', en: 'The Hanged Man' } },
  { id: 13, name: { vi: 'Death', en: 'Death' } },
  { id: 14, name: { vi: 'Temperance', en: 'Temperance' } },
  { id: 15, name: { vi: 'The Devil', en: 'The Devil' } },
  { id: 16, name: { vi: 'The Tower', en: 'The Tower' } },
  { id: 17, name: { vi: 'The Star', en: 'The Star' } },
  { id: 18, name: { vi: 'The Moon', en: 'The Moon' } },
  { id: 19, name: { vi: 'The Sun', en: 'The Sun' } },
  { id: 20, name: { vi: 'Judgement', en: 'Judgement' } },
  { id: 21, name: { vi: 'The World', en: 'The World' } },
];