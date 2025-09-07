import React, { useState, useCallback, useEffect } from 'react';
import type { BirthInfo, AstrologyChartData, SavedChart, PhysiognomyData, NumerologyInfo, NumerologyData, PalmReadingData, TarotReadingData, FlowAstrologyInfo, FlowAstrologyData } from '../lib/types';
import { AppState } from '../lib/types';
import { generateAstrologyChart, analyzePhysiognomy, generateNumerologyChart, analyzePalm, generateFlowAstrology } from '../lib/gemini';
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
import Shop from './Hero'; // Re-using Hero.tsx for the Shop component
import NumerologyForm from './NumerologyForm';
import NumerologyChart from './NumerologyChart';
import PalmScan from './PalmScan';
import PalmReadingResult from './PalmReadingResult';
import TarotReading from './TarotReading';
import FlowAstrologyForm from './FlowAstrologyForm';
import FlowAstrologyResult from './FlowAstrologyResult';
import { SUPPORT_INFO } from '../lib/constants';
import { useLocalization } from '../hooks/useLocalization';
import Card from './Card';
import Button from './Button';

const createChartId = (info: BirthInfo): string => {
  const hourPart = info.hour === -1 ? 'unknown' : info.hour;
  return `${info.name}-${info.gender}-${info.year}-${info.month}-${info.day}-${hourPart}`.trim().replace(/\s+/g, '_');
};

// --- Password Prompt Component ---
interface PasswordPromptProps {
  onSuccess: () => void;
  onBack: () => void;
}

const PasswordPrompt: React.FC<PasswordPromptProps> = ({ onSuccess, onBack }) => {
  const { t } = useLocalization();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<Record<string, string>>({});

  const copyToClipboard = (text: string, field: string) => {
    if (copyStatus[field]) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus({ [field]: t('copied') });
      setTimeout(() => {
        setCopyStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[field];
          return newStatus;
        });
      }, 2000);
    }).catch(err => {
      console.error('Could not copy text: ', err);
      setCopyStatus({ [field]: t('copyError') });
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'tuvi2025') {
      setError(null);
      onSuccess();
    } else {
      setError(t('passwordIncorrect'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-slide-in-up">
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="text-center md:text-left">
            <div className="inline-block p-3 bg-gray-800/60 border border-yellow-500/30 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h2 className="text-3xl font-bold font-serif text-yellow-300 leading-tight">
              {t('passwordPromptTitle')}
            </h2>
            <p className="text-gray-300 mt-3 leading-relaxed">
              {t('passwordPromptSubtitle')}
            </p>

            <form onSubmit={handleSubmit} className="mt-8">
              <label htmlFor="password-input" className="sr-only">
                {t('passwordLabel')}
              </label>
              <input
                type="password"
                id="password-input"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all ${error ? 'border-red-500' : 'border-gray-600'}`}
                placeholder={t('passwordPlaceholder')}
                required
                aria-required="true"
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
          <div className="p-6 bg-gray-950/60 rounded-lg border border-yellow-500/30">
            <h3 className="font-semibold text-xl text-yellow-300 font-serif mb-4 text-center">
              {t('passwordPaymentTitle')}
            </h3>
            <ol className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 font-bold text-yellow-400 bg-gray-800 rounded-full h-6 w-6 flex items-center justify-center">1</span>
                <span>{t('passwordPaymentStep1')}</span>
              </li>
              <li className="pl-9">
                <div className="flex items-center justify-between p-3 bg-black/30 rounded-md">
                  <span className="font-mono text-white text-lg tracking-wider">
                    {SUPPORT_INFO.zaloPhone}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(SUPPORT_INFO.zaloPhone, 'zaloPhone')}
                    className="text-yellow-400 hover:text-yellow-300 text-xs font-bold uppercase disabled:text-gray-500 transition-colors w-20 text-right"
                    disabled={!!copyStatus['zaloPhone']}
                  >
                    {copyStatus['zaloPhone'] || t('copy')}
                  </button>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 font-bold text-yellow-400 bg-gray-800 rounded-full h-6 w-6 flex items-center justify-center">2</span>
                <span>{t('passwordPaymentStep2')}</span>
              </li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );
};


const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [birthInfo, setBirthInfo] = useState<BirthInfo | null>(null);
  const [chartData, setChartData] = useState<AstrologyChartData | null>(null);
  const [physiognomyData, setPhysiognomyData] = useState<PhysiognomyData | null>(null);
  const [numerologyInfo, setNumerologyInfo] = useState<NumerologyInfo | null>(null);
  const [numerologyData, setNumerologyData] = useState<NumerologyData | null>(null);
  const [palmReadingData, setPalmReadingData] = useState<PalmReadingData | null>(null);
  const [tarotReadingData, setTarotReadingData] = useState<TarotReadingData | null>(null);
  const [flowAstrologyInfo, setFlowAstrologyInfo] = useState<FlowAstrologyInfo | null>(null);
  const [flowAstrologyData, setFlowAstrologyData] = useState<FlowAstrologyData | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedPalmImage, setCapturedPalmImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedCharts, setSavedCharts] = useState<SavedChart[]>([]);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [chartToDelete, setChartToDelete] = useState<SavedChart | null>(null);
  const [visitCount, setVisitCount] = useState<number>(0);
  const [postLoginAction, setPostLoginAction] = useState<(() => void) | null>(null);
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
    setNumerologyInfo(null);
    setNumerologyData(null);
    setPalmReadingData(null);
    setCapturedPalmImage(null);
    setTarotReadingData(null);
    setFlowAstrologyInfo(null);
    setFlowAstrologyData(null);
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

  const handleAnalyzePalm = useCallback(async () => {
    if (!capturedPalmImage) return;
    
    setAppState(AppState.PALM_SCAN_LOADING);
    setError(null);
    const base64Data = capturedPalmImage.split(',')[1];
    if(!base64Data) {
        setError(t('errorInvalidImageData'));
        setAppState(AppState.PALM_SCAN_CAPTURE);
        return;
    }

    try {
      const data = await analyzePalm(base64Data, language);
      setPalmReadingData(data);
      setAppState(AppState.PALM_SCAN_RESULT);
    } catch (err) {
       console.error(err);
       setError(err instanceof Error ? err.message : t('errorUnknown'));
       setAppState(AppState.PALM_SCAN_CAPTURE);
    }
  }, [capturedPalmImage, language, t]);

  const handleGenerateNumerology = useCallback(async (info: NumerologyInfo) => {
    setNumerologyInfo(info);
    setAppState(AppState.NUMEROLOGY_LOADING);
    setError(null);
    try {
        const data = await generateNumerologyChart(info, language);
        setNumerologyData(data);
        setAppState(AppState.NUMEROLOGY_RESULT);
    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : t('errorUnknown'));
        setAppState(AppState.NUMEROLOGY_FORM);
    }
  }, [language, t]);

  const handleGenerateFlowAstrology = useCallback(async (info: FlowAstrologyInfo) => {
    setFlowAstrologyInfo(info);
    setAppState(AppState.FLOW_ASTROLOGY_LOADING);
    setError(null);
    try {
        const data = await generateFlowAstrology(info, language);
        setFlowAstrologyData(data);
        setAppState(AppState.FLOW_ASTROLOGY_RESULT);
    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : t('errorUnknown'));
        setAppState(AppState.FLOW_ASTROLOGY_FORM);
    }
  }, [language, t]);

  const handleCaptureImage = useCallback((imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
  }, []);

  const handleRetakeCapture = useCallback(() => {
    setCapturedImage(null);
    setError(null);
  }, []);

  const handleCapturePalmImage = useCallback((imageDataUrl: string) => {
    setCapturedPalmImage(imageDataUrl);
  }, []);

  const handleRetakePalmCapture = useCallback(() => {
    setCapturedPalmImage(null);
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
  
  const handleStartAstrology = useCallback(() => {
    const action = () => {
        setAppState(AppState.ASTROLOGY_FORM);
    };
    if (sessionStorage.getItem('astrology_unlocked') === 'true') {
        action();
    } else {
        setPostLoginAction(() => action);
        setAppState(AppState.ASTROLOGY_PASSWORD);
    }
  }, []);

  const handleStartPhysiognomy = useCallback(() => setAppState(AppState.FACE_SCAN_CAPTURE), []);
  const handleStartPalmReading = useCallback(() => setAppState(AppState.PALM_SCAN_CAPTURE), []);
  const handleStartNumerology = useCallback(() => {
      setError(null);
      setAppState(AppState.NUMEROLOGY_FORM);
  }, []);
  const handleStartFlowAstrology = useCallback(() => {
    setError(null);
    setAppState(AppState.FLOW_ASTROLOGY_FORM);
  }, []);
  const handleStartZodiacFinder = useCallback(() => {
      setError(null);
      setAppState(AppState.ZODIAC_HOUR_FINDER);
  }, []);
  const handleStartIChing = useCallback(() => {
      setError(null);
      setAppState(AppState.ICHING_DIVINATION);
  }, []);
    const handleStartTarot = useCallback(() => {
      setError(null);
      setAppState(AppState.TAROT_READING);
  }, []);
  const handleStartShop = useCallback(() => {
      setError(null);
      setAppState(AppState.SHOP);
  }, []);

  const handleViewChart = useCallback((chart: SavedChart) => {
    const action = () => {
      setBirthInfo(chart.birthInfo);
      setChartData(chart.chartData);
      setAppState(AppState.RESULT);
    };
    if (sessionStorage.getItem('astrology_unlocked') === 'true') {
        action();
    } else {
        setPostLoginAction(() => action);
        setAppState(AppState.ASTROLOGY_PASSWORD);
    }
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

  const handleResetPalmScan = useCallback(() => {
      setAppState(AppState.PALM_SCAN_CAPTURE);
      setPalmReadingData(null);
      setCapturedPalmImage(null);
      setError(null);
  }, []);

  const handlePasswordSuccess = useCallback(() => {
    sessionStorage.setItem('astrology_unlocked', 'true');
    if (postLoginAction) {
      postLoginAction();
    } else {
      setAppState(AppState.ASTROLOGY_FORM);
    }
    setPostLoginAction(null);
  }, [postLoginAction]);

  const renderContent = () => {
    switch (appState) {
      case AppState.HOME:
        return <Home onStartAstrology={handleStartAstrology} onStartPhysiognomy={handleStartPhysiognomy} onStartZodiacFinder={handleStartZodiacFinder} onStartIChing={handleStartIChing} onStartShop={handleStartShop} onStartNumerology={handleStartNumerology} onStartPalmReading={handleStartPalmReading} onStartTarot={handleStartTarot} onStartFlowAstrology={handleStartFlowAstrology} />;
      case AppState.SAVED_CHARTS:
        return <SavedCharts 
          charts={savedCharts}
          onView={handleViewChart}
          onDelete={handleDeleteChart}
          onCreateNew={handleStartAstrology}
        />;
      case AppState.ASTROLOGY_PASSWORD:
        return <PasswordPrompt onSuccess={handlePasswordSuccess} onBack={handleResetToHome} />;
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
      case AppState.PALM_SCAN_CAPTURE:
        return <PalmScan 
            onAnalyze={handleAnalyzePalm} 
            onBack={handleResetToHome}
            onCapture={handleCapturePalmImage}
            onRetake={handleRetakePalmCapture}
            capturedImage={capturedPalmImage}
        />;
      case AppState.PALM_SCAN_LOADING:
        return <Spinner message={t('spinnerPalmReading')} />;
      case AppState.PALM_SCAN_RESULT:
          return palmReadingData && capturedPalmImage && <PalmReadingResult 
              analysisData={palmReadingData} 
              imageData={capturedPalmImage} 
              onReset={handleResetPalmScan} 
              onBackToHome={handleResetToHome} 
              onOpenDonationModal={() => setIsDonationModalOpen(true)} 
          />;
      case AppState.ZODIAC_HOUR_FINDER:
          return <ZodiacHourFinder />;
      case AppState.ICHING_DIVINATION:
          return <IChingDivination onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
       case AppState.TAROT_READING:
          return <TarotReading onOpenDonationModal={() => setIsDonationModalOpen(true)} onBack={handleResetToHome} />;
      case AppState.SHOP:
          return <Shop onBack={handleResetToHome} />;
      case AppState.NUMEROLOGY_FORM:
          return <NumerologyForm onSubmit={handleGenerateNumerology} />;
      case AppState.NUMEROLOGY_LOADING:
          return <Spinner message={t('spinnerNumerology')} />;
      case AppState.NUMEROLOGY_RESULT:
          return numerologyData && <NumerologyChart data={numerologyData} info={numerologyInfo!} onReset={handleResetToHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      case AppState.FLOW_ASTROLOGY_FORM:
          return <FlowAstrologyForm onSubmit={handleGenerateFlowAstrology} />;
      case AppState.FLOW_ASTROLOGY_LOADING:
          return <Spinner message={t('spinnerFlowAstrology')} />;
      case AppState.FLOW_ASTROLOGY_RESULT:
          return flowAstrologyData && <FlowAstrologyResult data={flowAstrologyData} info={flowAstrologyInfo!} onReset={handleResetToHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-gray-200">
      <div className="min-h-screen bg-black bg-opacity-70 backdrop-blur-md flex flex-col">
        <Header onHomeClick={handleResetToHome} />
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
              <p className="text-xs text-gray-600 mt-1">{t('footerAIDisclaimer')}</p>
            </div>
            <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-700/50 text-left md:text-right">
              <h4 className="font-bold text-lg text-yellow-400 font-serif mb-2">{t('footerSupportTitle')}</h4>
              <p className="text-sm">{t('footerSupportDesc')}</p>
              <div className="flex items-center flex-wrap gap-3 mt-3 md:justify-end">
                <a 
                  href={`https://zalo.me/${SUPPORT_INFO.zaloPhone}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.999 15.826h-2.922v-2.145h2.922v-1.125l-4.047-2.344v-2.313h4.047v-2.148h-5.242v7.929h-1.758v-7.929h-5.25v2.148h4.055v2.313l-4.055 2.344v1.125h2.922v2.145h-2.922v1.125l4.055 2.344v2.313h-4.055v2.148h5.25v-7.93h1.758v7.93h5.242v-2.148h-4.047v-2.313l4.047-2.344v-1.125z" />
                  </svg>
                  <span>Zalo: {SUPPORT_INFO.zaloPhone}</span>
                </a>
                <a 
                  href="https://www.tiktok.com/@jar_of_luck?_t=ZS-8zV1Gs8cJVp&_r=1"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-black text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors border border-gray-600"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.05-4.85-.38-6.95-1.91-1.83-1.36-3.17-3.46-3.86-5.71-.02-.08-.03-.16-.05-.24-.1-.38-.21-.77-.28-1.16 1.47.01 2.93-.01 4.4.02.05.78.22 1.54.51 2.25.51 1.25 1.72 2.18 3.11 2.31.65.06 1.3.04 1.94-.04 1.13-.14 2.18-.58 3.01-1.35.69-.62 1.15-1.45 1.39-2.35.09-.34.15-.7.15-1.06.01-2.93-.01-5.85.02-8.77-.02-1.89-1.14-3.58-2.6-4.57-.75-.5-1.6-.78-2.5-.88-1.18-.13-2.38-.04-3.56.09-1.08.11-2.12.39-3.12.82V4.54c1.46-.35 2.94-.52 4.41-.56z"></path>
                  </svg>
                  <span>{t('followTikTok')}</span>
                </a>
              </div>
            </div>
          </div>
        </footer>
        <DonationModal isOpen={isDonationModalOpen} onClose={() => setIsDonationModalOpen(false)} />
        <ZaloContact />
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