import React from 'react';
import type { SavedChart } from '../lib/types';
import Button from './Button';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
  charts: SavedChart[];
  onView: (chart: SavedChart) => void;
  onDelete: (chart: SavedChart) => void;
  onCreateNew: () => void;
}

const SavedCharts: React.FC<Props> = ({ charts, onView, onDelete, onCreateNew }) => {
  const { t, language } = useLocalization();
  
  return (
    <Card className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-yellow-400 font-serif">{t('savedChartsTitle')}</h2>
      {charts.length > 0 ? (
        <div className="space-y-4 mb-8">
          {charts.map((chart, index) => {
             const birthDate = new Intl.DateTimeFormat(t('locale'), {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).format(new Date(chart.birthInfo.year, chart.birthInfo.month - 1, chart.birthInfo.day));

            return (
                <div 
                  key={chart.id} 
                  className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 transition-all hover:shadow-lg hover:border-yellow-500/50 hover:bg-gray-900/80 hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div>
                    <p className="font-bold text-white text-lg">{chart.birthInfo.name}</p>
                    <p className="text-sm text-gray-400 mt-1">{`${t('savedChartsDob')}: ${birthDate}`}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Button
                      onClick={() => onView(chart)}
                      variant="primary"
                      size="sm"
                      aria-label={t('savedChartsViewAria', { name: chart.birthInfo.name })}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      <span>{t('view')}</span>
                    </Button>
                    <Button
                      onClick={() => onDelete(chart)}
                      variant="danger"
                       size="sm"
                      aria-label={t('savedChartsDeleteAria', { name: chart.birthInfo.name })}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </Button>
                  </div>
                </div>
            )
          })}
        </div>
      ) : (
        <p className="text-center text-gray-400 mb-8">{t('savedChartsEmpty')}</p>
      )}
      <Button onClick={onCreateNew} variant="primary" className="w-full text-lg py-3">
        + {t('savedChartsCreateNew')}
      </Button>
    </Card>
  );
};

export default SavedCharts;