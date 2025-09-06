import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { BirthInfo, AstrologyChartData, SavedChart, PhysiognomyData } from '../lib/types';
import { AppState } from '../lib/types';
import { generateAstrologyChart, analyzePhysiognomy } from '../lib/gemini';
import Header from './Header';
import BirthInfoForm from './BirthInfoForm';
import DonationModal from './PaymentModal';
import AstrologyChart from './AstrologyChart';
import Spinner from './Spinner';
import SavedCharts from './SavedCharts';
import ZaloContact from './ZaloContact';
import ConfirmationModal from './ConfirmationModal';
import FaceScan from './FaceScan';
import PhysiognomyResult from './PhysiognomyResult';
import Home from './Home';
import ZodiacHourFinder from './ZodiacHourFinder';
import IChingDivination from './IChingDivination';
import { SUPPORT_INFO } from '../lib/constants';
import { useLocalization } from '../hooks/useLocalization';

const createChartId = (info: BirthInfo): string => {
  const hourPart = info.hour === -1 ? 'unknown' : info.hour;
  return `${info.name}-${info.gender}-${info.year}-${info.month}-${info.day}-${hourPart}`.trim().replace(/\s+/g, '_');
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [birthInfo, setBirthInfo] = useState<BirthInfo | null>(null);
  const [chartData, setChartData] = useState<AstrologyChartData | null>(null);
  const [physiognomyData, setPhysiognomyData] = useState<PhysiognomyData | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedCharts, setSavedCharts] = useState<SavedChart[]>([]);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [chartToDelete, setChartToDelete] = useState<SavedChart | null>(null);
  const [visitCount, setVisitCount] = useState<number>(0);
  const { language, t } = useLocalization();

  useEffect(() => {
    try {
      const storedCharts = localStorage.getItem('astrologyCharts');
      if (storedCharts) {
        const parsedCharts = JSON.parse(storedCharts);
        if (Array.isArray(parsedCharts) && parsedCharts.every(c => c.id && c.birthInfo && c.chartData)) {
            setSavedCharts(parsedCharts);
            if (parsedCharts.length > 0) {
               setAppState(AppState.SAVED_CHARTS);
            }
        } else {
            console.warn("Invalid chart data in localStorage, clearing...");
            localStorage.removeItem('astrologyCharts');
        }
      }
    } catch (e) {
      console.error("Could not load charts from localStorage", e);
      localStorage.removeItem('astrologyCharts');
    }

    try {
        let currentCount = parseInt(localStorage.getItem('visitCount') || '0', 10);
        currentCount++;
        localStorage.setItem('visitCount', currentCount.toString());
        setVisitCount(currentCount);
    } catch (e) {
        console.error("Failed to update visit count", e);
        setVisitCount(1);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [appState]);

  useEffect(() => {
    if (appState === AppState.SAVED_CHARTS && savedCharts.length === 0) {
      setAppState(AppState.HOME);
    }
  }, [savedCharts, appState]);
  
  const resetAllDynamicData = useCallback(() => {
    setBirthInfo(null);
    setChartData(null);
    setPhysiognomyData(null);
    setCapturedImage(null);
    setError(null);
  }, []);

  const handleGenerateChart = useCallback(async (info: BirthInfo) => {
    setBirthInfo(info);
    setAppState(AppState.LOADING);
    setError(null);
    try {
      const data = await generateAstrologyChart(info, language);
      setChartData(data);
      
      const newChart: SavedChart = {
          id: createChartId(info),
          birthInfo: info,
          chartData: data
      };
      const updatedCharts = [...savedCharts.filter(c => c.id !== newChart.id), newChart];
      setSavedCharts(updatedCharts);
      localStorage.setItem('astrologyCharts', JSON.stringify(updatedCharts));

      setAppState(AppState.RESULT);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t('errorUnknown'));
      setAppState(AppState.ASTROLOGY_FORM);
    }
  }, [savedCharts, language, t]);
  
  const handleAnalyzeFace = useCallback(async () => {
    if (!capturedImage) return;
    
    setAppState(AppState.FACE_SCAN_LOADING);
    setError(null);
    const base64Data = capturedImage.split(',')[1];
    if(!base64Data) {
        setError(t('errorInvalidImageData'));
        setAppState(AppState.FACE_SCAN_CAPTURE);
        return;
    }

    try {
      const data = await analyzePhysiognomy(base64Data, language);
      setPhysiognomyData(data);
      setAppState(AppState.FACE_SCAN_RESULT);
    } catch (err) {
       console.error(err);
       setError(err instanceof Error ? err.message : t('errorUnknown'));
       setAppState(AppState.FACE_SCAN_CAPTURE);
    }
  }, [capturedImage, language, t]);

  const handleCaptureImage = useCallback((imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
  }, []);

  const handleRetakeCapture = useCallback(() => {
    setCapturedImage(null);
    setError(null);
  }, []);
  
  const handleFormSubmit = useCallback((info: BirthInfo) => {
    const chartId = createChartId(info);
    const existingChart = savedCharts.find(chart => chart.id === chartId);

    if (existingChart) {
      setBirthInfo(existingChart.birthInfo);
      setChartData(existingChart.chartData);
      setAppState(AppState.RESULT);
    } else {
      handleGenerateChart(info);
    }
  }, [savedCharts, handleGenerateChart]);

  const handleResetToHome = useCallback(() => {
    if (savedCharts.length > 0) {
        setAppState(AppState.SAVED_CHARTS);
    } else {
        setAppState(AppState.HOME);
    }
    resetAllDynamicData();
  }, [savedCharts, resetAllDynamicData]);
  
  const handleStartAstrology = useCallback(() => setAppState(AppState.ASTROLOGY_FORM), []);
  const handleStartPhysiognomy = useCallback(() => setAppState(AppState.FACE_SCAN_CAPTURE), []);
  const handleStartZodiacFinder = useCallback(() => {
      setError(null);
      setAppState(AppState.ZODIAC_HOUR_FINDER);
  }, []);
  const handleStartIChing = useCallback(() => {
      setError(null);
      setAppState(AppState.ICHING_DIVINATION);
  }, []);

  const handleViewChart = useCallback((chart: SavedChart) => {
    setBirthInfo(chart.birthInfo);
    setChartData(chart.chartData);
    setAppState(AppState.RESULT);
  }, []);

  const handleDeleteChart = useCallback((chart: SavedChart) => {
    setChartToDelete(chart);
  }, []);

  const confirmDeleteChart = useCallback(() => {
    if (!chartToDelete) return;
    const updatedCharts = savedCharts.filter(chart => chart.id !== chartToDelete.id);
    setSavedCharts(updatedCharts);
    localStorage.setItem('astrologyCharts', JSON.stringify(updatedCharts));
    setChartToDelete(null);
  }, [chartToDelete, savedCharts]);
  
  const handleCreateNew = useCallback(() => {
      setAppState(AppState.ASTROLOGY_FORM);
      setBirthInfo(null);
      setChartData(null);
      setError(null);
  }, []);

  const handleResetFaceScan = useCallback(() => {
      setAppState(AppState.FACE_SCAN_CAPTURE);
      setPhysiognomyData(null);
      setCapturedImage(null);
      setError(null);
  }, []);

  const MemoizedHeader = useMemo(() => <Header onHomeClick={handleResetToHome} />, [handleResetToHome]);
  const MemoizedZaloContact = useMemo(() => <ZaloContact />, []);

  const renderContent = () => {
    switch (appState) {
      case AppState.HOME:
        return <Home onStartAstrology={handleStartAstrology} onStartPhysiognomy={handleStartPhysiognomy} onStartZodiacFinder={handleStartZodiacFinder} onStartIChing={handleStartIChing} />;
      case AppState.SAVED_CHARTS:
        return <SavedCharts 
          charts={savedCharts}
          onView={handleViewChart}
          onDelete={handleDeleteChart}
          onCreateNew={handleCreateNew}
        />;
      case AppState.ASTROLOGY_FORM:
        return <BirthInfoForm onSubmit={handleFormSubmit} />;
      case AppState.LOADING:
        return <Spinner message={t('spinnerAstrology')} />;
      case AppState.RESULT:
        return chartData && <AstrologyChart data={chartData} birthInfo={birthInfo!} onReset={handleResetToHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      case AppState.FACE_SCAN_CAPTURE:
        return <FaceScan 
            onAnalyze={handleAnalyzeFace} 
            onBack={handleResetToHome}
            onCapture={handleCaptureImage}
            onRetake={handleRetakeCapture}
            capturedImage={capturedImage}
        />;
      case AppState.FACE_SCAN_LOADING:
        return <Spinner message={t('spinnerPhysiognomy')} />;
      case AppState.FACE_SCAN_RESULT:
          return physiognomyData && capturedImage && <PhysiognomyResult 
              analysisData={physiognomyData} 
              imageData={capturedImage} 
              onReset={handleResetFaceScan} 
              onBackToHome={handleResetToHome} 
              onOpenDonationModal={() => setIsDonationModalOpen(true)} 
          />;
      case AppState.ZODIAC_HOUR_FINDER:
          return <ZodiacHourFinder />;
      case AppState.ICHING_DIVINATION:
          return <IChingDivination onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-gray-200">
      <div className="min-h-screen bg-black bg-opacity-70 backdrop-blur-md flex flex-col">
        {MemoizedHeader}
        <main className="container mx-auto px-4 py-8 flex-grow">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg relative mb-6 flex items-start justify-between animate-fade-in" role="alert" aria-live="assertive">
              <div className="flex items-start">
                <svg className="w-6 h-6 mr-3 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <div>
                  <strong className="font-bold text-red-300">{t('errorTitle')}</strong>
                  <span className="block mt-1">{error}</span>
                </div>
              </div>
              <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-red-500/20 transition-colors ml-4" aria-label={t('errorCloseAriaLabel')}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          )}
          <div key={appState} className="animate-slide-in-up">
            {renderContent()}
          </div>
        </main>
        <footer className="text-center py-8 text-gray-400 bg-black bg-opacity-50 mt-8 border-t border-gray-700/50">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-left">
              <h4 className="font-bold text-lg text-yellow-400 font-serif mb-2">{t('appName')}</h4>
              <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} - {SUPPORT_INFO.channelName}. | {t('footerVisits')}: {visitCount > 0 ? visitCount.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US') : '...'}</p>
              <p className="text-xs text-gray-600 mt-2">{t('footerDisclaimer')}</p>
            </div>
            <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-700/50 text-left md:text-right">
              <h4 className="font-bold text-lg text-yellow-400 font-serif mb-2">{t('footerSupportTitle')}</h4>
              <p className="text-sm">{t('footerSupportDesc')}</p>
              <a 
                href={`https://zalo.me/${SUPPORT_INFO.zaloPhone}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.999 15.826h-2.922v-2.145h2.922v-1.125l-4.047-2.344v-2.313h4.047v-2.148h-5.242v7.929h-1.758v-7.929h-5.25v2.148h4.055v2.313l-4.055 2.344v1.125h2.922v2.145h-2.922v1.125l4.055 2.344v2.313h-4.055v2.148h5.25v-7.93h1.758v7.93h5.242v-2.148h-4.047v-2.313l4.047-2.344v-1.125z" />
                </svg>
                <span>Zalo: {SUPPORT_INFO.zaloPhone}</span>
              </a>
            </div>
          </div>
        </footer>
        <DonationModal isOpen={isDonationModalOpen} onClose={() => setIsDonationModalOpen(false)} />
        {MemoizedZaloContact}
        <ConfirmationModal
          isOpen={!!chartToDelete}
          onClose={() => setChartToDelete(null)}
          onConfirm={confirmDeleteChart}
          title={t('confirmDeleteTitle')}
          message={t('confirmDeleteMessage', { name: chartToDelete?.birthInfo.name || '' })}
        />
      </div>
    </div>
  );
};

export default App;