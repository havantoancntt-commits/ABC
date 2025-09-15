import React from 'react';
import type { SavedItem } from '../lib/types';
import Button from './Button';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';
import type { TranslationKey } from '../hooks/useLocalization';

interface Props {
  items: SavedItem[];
  onView: (item: SavedItem) => void;
  onDelete: (item: SavedItem) => void;
  onCreateNew: () => void;
}

const ItemDetails: React.FC<{ item: SavedItem }> = ({ item }) => {
    const { t } = useLocalization();
    const { payload } = item;

    const getTitle = (): string => {
        const key: TranslationKey = `itemType${payload.type.charAt(0).toUpperCase() + payload.type.slice(1)}` as TranslationKey;
        return t(key);
    };

    const getDescription = (): string => {
        const date = new Intl.DateTimeFormat(t('locale'), { dateStyle: 'medium' }).format(new Date(item.timestamp));
        switch (payload.type) {
            case 'astrology':
                return t('itemDescAstrology', { name: payload.birthInfo.name });
            case 'numerology':
                return t('itemDescNumerology', { name: payload.info.fullName });
            case 'flowAstrology':
                return t('itemDescFlowAstrology', { name: payload.info.name });
            case 'auspiciousNaming':
                return t('itemDescAuspiciousNaming', { lastName: payload.info.childLastName });
            case 'bioEnergy':
                return t('itemDescBioEnergy', { name: payload.info.name });
            case 'godOfWealth':
                return t('itemDescGodOfWealth', { name: payload.info.name });
            case 'prayer':
                return t('itemDescPrayer', { occasion: payload.info.occasion });
            case 'fengShui':
                return t('itemDescFengShui', { spaceType: payload.info.spaceType });
            case 'physiognomy':
                return t('itemDescPhysiognomy', { date });
            case 'palmReading':
                return t('itemDescPalmReading', { date });
            case 'handwriting':
                return t('itemDescHandwriting', { date });
            case 'hoaTay':
                return t('itemDescHoaTay', { count: payload.analysisData.totalWhorls });
            default:
                return new Intl.DateTimeFormat(t('locale'), { dateStyle: 'full', timeStyle: 'short' }).format(new Date(item.timestamp));
        }
    };
    
    const getNameForAria = (): string => {
        switch (payload.type) {
            case 'astrology': return payload.birthInfo.name;
            case 'numerology': return payload.info.fullName;
            case 'flowAstrology': return payload.info.name;
            case 'bioEnergy': return payload.info.name;
            case 'godOfWealth': return payload.info.name;
            case 'prayer': return payload.info.occasion;
            case 'fengShui': return payload.info.spaceType;
            case 'hoaTay': return getTitle();
            default: return getTitle();
        }
    }

    return (
        <div className="flex-grow">
            <p className="font-bold text-white text-lg">{getTitle()}</p>
            <p className="text-sm text-gray-400 mt-1">{getDescription()}</p>
        </div>
    );
};


const SavedItems: React.FC<Props> = ({ items, onView, onDelete, onCreateNew }) => {
  const { t } = useLocalization();
  
  return (
    <Card className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-yellow-400 font-serif">{t('savedItemsTitle')}</h2>
      {items.length > 0 ? (
        <div className="space-y-4 mb-8">
          {items.map((item, index) => {
            const nameForAria = item.payload.type === 'astrology' ? item.payload.birthInfo.name : t(`itemType${item.payload.type.charAt(0).toUpperCase() + item.payload.type.slice(1)}` as TranslationKey);
            return (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:border-yellow-500/50 hover:bg-gray-900/80 hover:scale-[1.02] animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ItemDetails item={item} />
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <Button
                      onClick={() => onView(item)}
                      variant="primary"
                      size="sm"
                      aria-label={t('savedItemViewAria', { name: nameForAria })}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      <span>{t('view')}</span>
                    </Button>
                    <Button
                      onClick={() => onDelete(item)}
                      variant="danger"
                       size="sm"
                      aria-label={t('savedItemDeleteAria', { name: nameForAria })}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </Button>
                  </div>
                </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center text-gray-500 mb-8 py-12 border-2 border-dashed border-gray-700/50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-12v4m-2-2h4m5 4v4m-2-2h4M5 11h14M5 11a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2M5 11v2a2 2 0 002 2h10a2 2 0 002-2v-2" />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-gray-300">{t('savedItemsEmpty')}</h3>
            <p className="mt-2 text-sm">{t('savedItemsEmptyHint')}</p>
        </div>
      )}
      <Button onClick={onCreateNew} variant="primary" className="w-full text-lg py-3">
        + {t('savedItemsCreateNew')}
      </Button>
    </Card>
  );
};

export default SavedItems;