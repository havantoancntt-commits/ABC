import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import type { BirthInfo, AstrologyChartData, SavedChart, PhysiognomyData, NumerologyInfo, NumerologyData, PalmReadingData, TarotReadingData, FlowAstrologyInfo, FlowAstrologyData, HandwritingData, CareerInfo, CareerAdviceData, TalismanInfo, TalismanData, AuspiciousNamingInfo, AuspiciousNamingData, GoogleUser } from '../lib/types';
import { AppState } from '../lib/types';
import { generateAstrologyChart, analyzePhysiognomy, generateNumerologyChart, analyzePalm, generateFlowAstrology, analyzeHandwriting, getCareerAdvice, generateTalisman, generateAuspiciousName } from '../lib/gemini';
import Header from './Header';
import DonationModal from './PaymentModal';
import Spinner from './Spinner';
import ZaloContact from './ZaloContact';
import ConfirmationModal from './ConfirmationModal';
import { SUPPORT_INFO } from '../lib/constants';
import { useLocalization } from '../hooks/useLocalization';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { logAdminEvent } from '../lib/logger';
import type { TranslationKey } from '../hooks/useLocalization';
import Button from './Button';

// --- Lazy Load Components for Performance ---
const Home = lazy(() => import('./Home'));
const SavedCharts = lazy(() => import('./SavedCharts'));
const PasswordPrompt = lazy(() => import('./PasswordPrompt'));
const BirthInfoForm = lazy(() => import('./BirthInfoForm'));
const AstrologyChart = lazy(() => import('./AstrologyChart'));
const FaceScan = lazy(() => import('./FaceScan'));
const PhysiognomyResult = lazy(() => import('./PhysiognomyResult'));
const PalmScan = lazy(() => import('./PalmScan'));
const PalmReadingResult = lazy(() => import('./PalmReadingResult'));
const HandwritingScan = lazy(() => import('./HandwritingScan'));
const HandwritingResult = lazy(() => import('./HandwritingResult'));
const ZodiacHourFinder = lazy(() => import('./ZodiacHourFinder'));
const AuspiciousDayFinder = lazy(() => import('./AuspiciousDayFinder'));
const IChingDivination = lazy(() => import('./IChingDivination'));
const TarotReading = lazy(() => import('./TarotReading'));
const Shop = lazy(() => import('./Hero'));
const NumerologyForm = lazy(() => import('./NumerologyForm'));
const NumerologyChart = lazy(() => import('./NumerologyChart'));
const FlowAstrologyForm = lazy(() => import('./FlowAstrologyForm'));
const FlowAstrologyResult = lazy(() => import('./FlowAstrologyResult'));
const CareerAdvisorForm = lazy(() => import('./CareerAdvisorForm'));
const CareerAdvisorResult = lazy(() => import('./CareerAdvisorResult'));
const TalismanGeneratorForm = lazy(() => import('./TalismanGeneratorForm'));
const TalismanResult = lazy(() => import('./TalismanResult'));
const AuspiciousNamingForm = lazy(() => import('./AuspiciousNamingForm'));
const AuspiciousNamingResult = lazy(() => import('./AuspiciousNamingResult'));
const AdminLogin = lazy(() => import('./AdminLogin'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));


const createChartId = (info: BirthInfo): string => {
  const hourPart = info.hour === -1 ? 'unknown' : info.hour;
  return `${info.name}-${info.gender}-${info.year}-${info.month}-${info.day}-${hourPart}`.trim().replace(/\s+/g, '_');
};


const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [birthInfo, setBirthInfo] = useState<BirthInfo | null>(null);
  const [chartData, setChartData] = useState<AstrologyChartData | null>(null);
  const [physiognomyData, setPhysiognomyData] = useState<PhysiognomyData | null>(null);
  const [numerologyInfo, setNumerologyInfo] = useState<NumerologyInfo | null>(null);
  const [numerologyData, setNumerologyData] = useState<NumerologyData | null>(null);
  const [palmReadingData, setPalmReadingData] = useState<PalmReadingData | null>(null);
  const [handwritingData, setHandwritingData] = useState<HandwritingData | null>(null);
  const [tarotReadingData, setTarotReadingData] = useState<TarotReadingData | null>(null);
  const [flowAstrologyInfo, setFlowAstrologyInfo] = useState<FlowAstrologyInfo | null>(null);
  const [flowAstrologyData, setFlowAstrologyData] = useState<FlowAstrologyData | null>(null);
  const [careerInfo, setCareerInfo] = useState<CareerInfo | null>(null);
  const [careerAdviceData, setCareerAdviceData] = useState<CareerAdviceData | null>(null);
  const [talismanInfo, setTalismanInfo] = useState<TalismanInfo | null>(null);
  const [talismanData, setTalismanData] = useState<TalismanData | null>(null);
  const [auspiciousNamingInfo, setAuspiciousNamingInfo] = useState<AuspiciousNamingInfo | null>(null);
  const [auspiciousNamingData, setAuspiciousNamingData] = useState<AuspiciousNamingData | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedPalmImage, setCapturedPalmImage] = useState<string | null>(null);
  const [capturedHandwritingImage, setCapturedHandwritingImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedCharts, setSavedCharts] = useState<SavedChart[]>([]);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [chartToDelete, setChartToDelete] = useState<SavedChart | null>(null);
  const [visitCount, setVisitCount] = useState<number>(0);
  const [postLoginAction, setPostLoginAction] = useState<(() => void) | null>(null);
  const [adminActionToConfirm, setAdminActionToConfirm] = useState<{ action: string; title: string; message: string; } | null>(null);
  const { language, t } = useLocalization();
  const { user, handleSignIn, handleSignOut, authError } = useGoogleAuth({
    onSuccess: (gUser) => logAdminEvent('User Signed In', gUser.email, `Name: ${gUser.name}`),
    onError: () => setError(t('googleSignInError')),
  });

  const getChartStorageKey = useCallback((userId?: string) => {
    const id = userId || user?.sub;
    return id ? `astrologyCharts_${id}` : 'astrologyCharts_guest';
  }, [user]);

  useEffect(() => {
    const currentChartStorageKey = getChartStorageKey();
    try {
      const storedCharts = localStorage.getItem(currentChartStorageKey);
      if (storedCharts) {
        const parsedCharts = JSON.parse(storedCharts);
        if (Array.isArray(parsedCharts) && parsedCharts.every(c => c.id && c.birthInfo && c.chartData)) {
            setSavedCharts(parsedCharts);
            // If logged in and has charts, go to saved charts screen.
            if (user && parsedCharts.length > 0 && sessionStorage.getItem('admin_auth') !== 'true') {
               setAppState(AppState.SAVED_CHARTS);
            }
        } else {
            localStorage.removeItem(currentChartStorageKey);
        }
      } else {
        setSavedCharts([]); // Clear charts if nothing is in storage for the user
      }
    } catch (e) {
      console.error("Could not load charts from localStorage", e);
      localStorage.removeItem(currentChartStorageKey);
    }
  }, [user, getChartStorageKey]);

  useEffect(() => {
    // Log initial visit
    if (sessionStorage.getItem('visit_logged') !== 'true') {
        let currentCount = parseInt(localStorage.getItem('visitCount') || '0', 10);
        currentCount++;
        localStorage.setItem('visitCount', currentCount.toString());
        setVisitCount(currentCount);
        logAdminEvent('App Visit', 'Guest', `Total Visits: ${currentCount}`);
        sessionStorage.setItem('visit_logged', 'true');
    } else {
        setVisitCount(parseInt(localStorage.getItem('visitCount') || '0', 10));
    }
    
    // Set auth error if it exists
    if(authError) setError(authError);
  }, [authError]);

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
    setHandwritingData(null);
    setCapturedHandwritingImage(null);
    setTarotReadingData(null);
    setFlowAstrologyInfo(null);
    setFlowAstrologyData(null);
    setCareerInfo(null);
    setCareerAdviceData(null);
    setTalismanInfo(null);
    setTalismanData(null);
    setAuspiciousNamingInfo(null);
    setAuspiciousNamingData(null);
    setError(null);
  }, []);
  
  const trackFeatureUsage = (feature: string) => {
    try {
        const storedUsage = localStorage.getItem('featureUsage') || '{}';
        const usage = JSON.parse(storedUsage);
        usage[feature] = (usage[feature] || 0) + 1;
        localStorage.setItem('featureUsage', JSON.stringify(usage));
    } catch (e) {
        console.error("Failed to track feature usage", e);
    }
  };

  const handleGenerateChart = useCallback(async (info: BirthInfo) => {
    trackFeatureUsage('astrologyChart');
    logAdminEvent('Generate Astrology Chart', user?.email || 'Guest', `For: ${info.name}`);
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
      localStorage.setItem(getChartStorageKey(), JSON.stringify(updatedCharts));

      setAppState(AppState.RESULT);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t('errorUnknown'));
      setAppState(AppState.ASTROLOGY_FORM);
    }
  }, [savedCharts, language, t, user, getChartStorageKey]);
  
  const handleAnalyzeFace = useCallback(async () => {
    if (!capturedImage) return;
    trackFeatureUsage('physiognomy');
    logAdminEvent('Analyze Physiognomy', user?.email || 'Guest');
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
  }, [capturedImage, language, t, user]);

  const handleAnalyzePalm = useCallback(async () => {
    if (!capturedPalmImage) return;
    trackFeatureUsage('palmReading');
    logAdminEvent('Analyze Palm', user?.email || 'Guest');
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
  }, [capturedPalmImage, language, t, user]);

  const handleAnalyzeHandwriting = useCallback(async () => {
    if (!capturedHandwritingImage) return;
    trackFeatureUsage('handwriting');
    logAdminEvent('Analyze Handwriting', user?.email || 'Guest');
    setAppState(AppState.HANDWRITING_ANALYSIS_LOADING);
    setError(null);
    const base64Data = capturedHandwritingImage.split(',')[1];
    if(!base64Data) {
        setError(t('errorInvalidImageData'));
        setAppState(AppState.HANDWRITING_ANALYSIS_CAPTURE);
        return;
    }

    try {
      const data = await analyzeHandwriting(base64Data, language);
      setHandwritingData(data);
      setAppState(AppState.HANDWRITING_ANALYSIS_RESULT);
    } catch (err) {
       console.error(err);
       setError(err instanceof Error ? err.message : t('errorUnknown'));
       setAppState(AppState.HANDWRITING_ANALYSIS_CAPTURE);
    }
  }, [capturedHandwritingImage, language, t, user]);

  const handleGenerateNumerology = useCallback(async (info: NumerologyInfo) => {
    trackFeatureUsage('numerology');
    logAdminEvent('Generate Numerology', user?.email || 'Guest', `For: ${info.fullName}`);
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
  }, [language, t, user]);

  const handleGenerateFlowAstrology = useCallback(async (info: FlowAstrologyInfo) => {
    trackFeatureUsage('flowAstrology');
    logAdminEvent('Generate Flow Astrology', user?.email || 'Guest', `For: ${info.name}`);
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
  }, [language, t, user]);

    const handleGenerateCareerAdvice = useCallback(async (info: CareerInfo) => {
    trackFeatureUsage('careerAdvisor');
    logAdminEvent('Get Career Advice', user?.email || 'Guest', `For: ${info.name}`);
    setCareerInfo(info);
    setAppState(AppState.CAREER_ADVISOR_LOADING);
    setError(null);
    try {
        const data = await getCareerAdvice(info, language);
        setCareerAdviceData(data);
        setAppState(AppState.CAREER_ADVISOR_RESULT);
    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : t('errorUnknown'));
        setAppState(AppState.CAREER_ADVISOR_FORM);
    }
  }, [language, t, user]);

  const handleGenerateTalisman = useCallback(async (info: TalismanInfo) => {
    trackFeatureUsage('talisman');
    logAdminEvent('Generate Talisman', user?.email || 'Guest', `For: ${info.name}`);
    setTalismanInfo(info);
    setAppState(AppState.TALISMAN_LOADING);
    setError(null);
    try {
        const data = await generateTalisman(info, language);
        setTalismanData(data);
        setAppState(AppState.TALISMAN_RESULT);
    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : t('errorUnknown'));
        setAppState(AppState.TALISMAN_GENERATOR);
    }
  }, [language, t, user]);

  const handleGenerateAuspiciousName = useCallback(async (info: AuspiciousNamingInfo) => {
    trackFeatureUsage('auspiciousNaming');
    logAdminEvent('Generate Auspicious Name', user?.email || 'Guest', `For family: ${info.childLastName}`);
    setAuspiciousNamingInfo(info);
    setAppState(AppState.AUSPICIOUS_NAMING_LOADING);
    setError(null);
    try {
        const data = await generateAuspiciousName(info, language);
        setAuspiciousNamingData(data);
        setAppState(AppState.AUSPICIOUS_NAMING_RESULT);
    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : t('errorUnknown'));
        setAppState(AppState.AUSPICIOUS_NAMING_FORM);
    }
  }, [language, t, user]);

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

  const handleCaptureHandwritingImage = useCallback((imageDataUrl: string) => {
    setCapturedHandwritingImage(imageDataUrl);
  }, []);

  const handleRetakeHandwritingCapture = useCallback(() => {
    setCapturedHandwritingImage(null);
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
    if (sessionStorage.getItem('admin_auth') === 'true') {
        setAppState(AppState.ADMIN_DASHBOARD);
        return;
    }
    if (user && savedCharts.length > 0) {
        setAppState(AppState.SAVED_CHARTS);
    } else {
        setAppState(AppState.HOME);
    }
    resetAllDynamicData();
  }, [user, savedCharts, resetAllDynamicData]);
  
  const handleStartAstrology = useCallback(() => {
    const action = () => {
        setAppState(AppState.ASTROLOGY_FORM);
    };
    if (sessionStorage.getItem('astrology_unlocked') === 'true' || !user) {
        action();
    } else {
        setPostLoginAction(() => action);
        setAppState(AppState.ASTROLOGY_PASSWORD);
    }
  }, [user]);

  const handleStartPhysiognomy = useCallback(() => { trackFeatureUsage('physiognomyScan'); setAppState(AppState.FACE_SCAN_CAPTURE) }, []);
  const handleStartPalmReading = useCallback(() => { trackFeatureUsage('palmScan'); setAppState(AppState.PALM_SCAN_CAPTURE) }, []);
  const handleStartHandwritingAnalysis = useCallback(() => { trackFeatureUsage('handwritingScan'); setAppState(AppState.HANDWRITING_ANALYSIS_CAPTURE) }, []);
  const handleStartNumerology = useCallback(() => { trackFeatureUsage('numerologyForm'); setError(null); setAppState(AppState.NUMEROLOGY_FORM); }, []);
  const handleStartFlowAstrology = useCallback(() => { trackFeatureUsage('flowAstrologyForm'); setError(null); setAppState(AppState.FLOW_ASTROLOGY_FORM); }, []);
  const handleStartZodiacFinder = useCallback(() => { trackFeatureUsage('zodiacHourFinder'); setError(null); setAppState(AppState.ZODIAC_HOUR_FINDER); }, []);
  const handleStartAuspiciousDayFinder = useCallback(() => { trackFeatureUsage('auspiciousDayFinder'); setError(null); setAppState(AppState.AUSPICIOUS_DAY_FINDER); }, []);
  const handleStartIChing = useCallback(() => { trackFeatureUsage('iChing'); setError(null); setAppState(AppState.ICHING_DIVINATION); }, []);
    const handleStartTarot = useCallback(() => { trackFeatureUsage('tarotReading'); setError(null); setAppState(AppState.TAROT_READING); }, []);
  const handleStartShop = useCallback(() => { trackFeatureUsage('shop'); setError(null); setAppState(AppState.SHOP); }, []);
  const handleStartTalismanGenerator = useCallback(() => { trackFeatureUsage('talismanForm'); setError(null); setAppState(AppState.TALISMAN_GENERATOR); }, []);
  const handleStartAuspiciousNaming = useCallback(() => { trackFeatureUsage('auspiciousNamingForm'); setError(null); setAppState(AppState.AUSPICIOUS_NAMING_FORM); }, []);

  const handleStartCareerAdvisor = useCallback(() => {
    const action = () => {
        setError(null);
        setAppState(AppState.CAREER_ADVISOR_FORM);
    };
    if (sessionStorage.getItem('career_unlocked') === 'true' || !user) {
        action();
    } else {
        setPostLoginAction(() => action);
        setAppState(AppState.CAREER_ADVISOR_PASSWORD);
    }
  }, [user]);

  const handleViewChart = useCallback((chart: SavedChart) => {
    const action = () => {
      setBirthInfo(chart.birthInfo);
      setChartData(chart.chartData);
      setAppState(AppState.RESULT);
    };
    if (sessionStorage.getItem('astrology_unlocked') === 'true' || !user) {
        action();
    } else {
        setPostLoginAction(() => action);
        setAppState(AppState.ASTROLOGY_PASSWORD);
    }
  }, [user]);

  const handleDeleteChart = useCallback((chart: SavedChart) => {
    setChartToDelete(chart);
  }, []);

  const confirmDeleteChart = useCallback(() => {
    if (!chartToDelete) return;
    const updatedCharts = savedCharts.filter(chart => chart.id !== chartToDelete.id);
    setSavedCharts(updatedCharts);
    localStorage.setItem(getChartStorageKey(), JSON.stringify(updatedCharts));
    logAdminEvent('Deleted Chart', user?.email || 'Guest', `For: ${chartToDelete.birthInfo.name}`);
    setChartToDelete(null);
  }, [chartToDelete, savedCharts, user, getChartStorageKey]);
  
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

  const handleResetHandwritingScan = useCallback(() => {
    setAppState(AppState.HANDWRITING_ANALYSIS_CAPTURE);
    setHandwritingData(null);
    setCapturedHandwritingImage(null);
    setError(null);
}, []);

  const handleAstrologyPasswordSuccess = useCallback(() => {
    sessionStorage.setItem('astrology_unlocked', 'true');
    logAdminEvent('Unlocked Astrology', user?.email || 'Guest');
    if (postLoginAction) {
      postLoginAction();
    } else {
      setAppState(AppState.ASTROLOGY_FORM);
    }
    setPostLoginAction(null);
  }, [postLoginAction, user]);
  
  const handleCareerPasswordSuccess = useCallback(() => {
    sessionStorage.setItem('career_unlocked', 'true');
    logAdminEvent('Unlocked Career Advisor', user?.email || 'Guest');
    if (postLoginAction) {
        postLoginAction();
    } else {
        setAppState(AppState.CAREER_ADVISOR_FORM);
    }
    setPostLoginAction(null);
  }, [postLoginAction, user]);

  const handleStartAdminLogin = useCallback(() => {
    setAppState(AppState.ADMIN_LOGIN);
  }, []);

  const handleAdminLoginSuccess = useCallback(() => {
      logAdminEvent('Admin Signed In', 'Admin');
      setAppState(AppState.ADMIN_DASHBOARD);
  }, []);

  const handleAdminAction = useCallback((action: string) => {
      const confirmConfig = {
          clear_charts: { title: t('adminClearChartsConfirmTitle'), message: t('adminClearChartsConfirmMessage') },
          clear_history: { title: t('adminClearHistoryConfirmTitle'), message: t('adminClearHistoryConfirmMessage') },
      }[action];

      if(confirmConfig) {
          setAdminActionToConfirm({ action, ...confirmConfig });
      }
  }, [t]);

  const confirmAdminAction = useCallback(() => {
      if (!adminActionToConfirm) return;
      const { action } = adminActionToConfirm;
      
      logAdminEvent(`Admin Action: ${action}`, 'Admin');

      if (action === 'clear_charts') {
          Object.keys(localStorage).forEach(key => {
              if (key.startsWith('astrologyCharts_')) {
                  localStorage.removeItem(key);
              }
          });
          setSavedCharts([]); // Clear current user's view
      } else if (action === 'clear_history') {
          localStorage.removeItem('adminHistoryLog');
      }
      setAdminActionToConfirm(null);
  }, [adminActionToConfirm]);


  const getTranslatedError = (errorKey: string | null): string => {
    if (!errorKey) return '';
    const isBackendKey = /^[a-z]+(_[a-z]+)*$/.test(errorKey);
    if (isBackendKey) {
        const translationKey = errorKey.replace(/_([a-z])/g, (g) => g[1].toUpperCase()) as TranslationKey;
        const translated = t(translationKey);
        if (translated === translationKey) {
            return t('errorUnknown');
        }
        return translated;
    }
    return errorKey;
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.HOME:
        return <Home onStartAstrology={handleStartAstrology} onStartPhysiognomy={handleStartPhysiognomy} onStartZodiacFinder={handleStartZodiacFinder} onStartIChing={handleStartIChing} onStartShop={handleStartShop} onStartNumerology={handleStartNumerology} onStartPalmReading={handleStartPalmReading} onStartTarot={handleStartTarot} onStartFlowAstrology={handleStartFlowAstrology} onStartAuspiciousDayFinder={handleStartAuspiciousDayFinder} onStartHandwritingAnalysis={handleStartHandwritingAnalysis} onStartCareerAdvisor={handleStartCareerAdvisor} onStartTalismanGenerator={handleStartTalismanGenerator} onStartAuspiciousNaming={handleStartAuspiciousNaming} />;
      case AppState.SAVED_CHARTS:
        return <SavedCharts 
          charts={savedCharts}
          onView={handleViewChart}
          onDelete={handleDeleteChart}
          onCreateNew={handleStartAstrology}
        />;
      case AppState.ASTROLOGY_PASSWORD:
        return <PasswordPrompt onSuccess={handleAstrologyPasswordSuccess} onBack={handleResetToHome} feature="astrology"/>;
      case AppState.ASTROLOGY_FORM:
        return <BirthInfoForm onSubmit={handleFormSubmit} initialName={user?.name} />;
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
      case AppState.HANDWRITING_ANALYSIS_CAPTURE:
        return <HandwritingScan
            onAnalyze={handleAnalyzeHandwriting} 
            onBack={handleResetToHome}
            onCapture={handleCaptureHandwritingImage}
            onRetake={handleRetakeHandwritingCapture}
            capturedImage={capturedHandwritingImage}
        />;
      case AppState.HANDWRITING_ANALYSIS_LOADING:
        return <Spinner message={t('spinnerHandwriting')} />;
      case AppState.HANDWRITING_ANALYSIS_RESULT:
          return handwritingData && capturedHandwritingImage && <HandwritingResult 
              analysisData={handwritingData} 
              imageData={capturedHandwritingImage} 
              onReset={handleResetHandwritingScan} 
              onBackToHome={handleResetToHome} 
              onOpenDonationModal={() => setIsDonationModalOpen(true)} 
          />;
      case AppState.ZODIAC_HOUR_FINDER:
          return <ZodiacHourFinder />;
      case AppState.AUSPICIOUS_DAY_FINDER:
          return <AuspiciousDayFinder />;
      case AppState.ICHING_DIVINATION:
          return <IChingDivination onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
       case AppState.TAROT_READING:
          return <TarotReading onOpenDonationModal={() => setIsDonationModalOpen(true)} onBack={handleResetToHome} />;
      case AppState.SHOP:
          return <Shop onBack={handleResetToHome} />;
      case AppState.NUMEROLOGY_FORM:
          return <NumerologyForm onSubmit={handleGenerateNumerology} initialName={user?.name} />;
      case AppState.NUMEROLOGY_LOADING:
          return <Spinner message={t('spinnerNumerology')} />;
      case AppState.NUMEROLOGY_RESULT:
          return numerologyData && <NumerologyChart data={numerologyData} info={numerologyInfo!} onReset={handleResetToHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      case AppState.FLOW_ASTROLOGY_FORM:
          return <FlowAstrologyForm onSubmit={handleGenerateFlowAstrology} initialName={user?.name} />;
      case AppState.FLOW_ASTROLOGY_LOADING:
          return <Spinner message={t('spinnerFlowAstrology')} />;
      case AppState.FLOW_ASTROLOGY_RESULT:
          return flowAstrologyData && <FlowAstrologyResult data={flowAstrologyData} info={flowAstrologyInfo!} onReset={handleResetToHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      case AppState.CAREER_ADVISOR_PASSWORD:
          return <PasswordPrompt onSuccess={handleCareerPasswordSuccess} onBack={handleResetToHome} feature="career" />;
      case AppState.CAREER_ADVISOR_FORM:
          return <CareerAdvisorForm onSubmit={handleGenerateCareerAdvice} initialName={user?.name} />;
      case AppState.CAREER_ADVISOR_LOADING:
          return <Spinner message={t('spinnerCareerAdvisor')} />;
      case AppState.CAREER_ADVISOR_RESULT:
          return careerAdviceData && <CareerAdvisorResult data={careerAdviceData} info={careerInfo!} onReset={handleResetToHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      case AppState.TALISMAN_GENERATOR:
          return <TalismanGeneratorForm onSubmit={handleGenerateTalisman} initialName={user?.name} />;
      case AppState.TALISMAN_LOADING:
          return <Spinner message={t('spinnerTalisman')} />;
      case AppState.TALISMAN_RESULT:
          return talismanData && <TalismanResult data={talismanData} info={talismanInfo!} onReset={() => setAppState(AppState.TALISMAN_GENERATOR)} onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      case AppState.AUSPICIOUS_NAMING_FORM:
          return <AuspiciousNamingForm onSubmit={handleGenerateAuspiciousName} />;
      case AppState.AUSPICIOUS_NAMING_LOADING:
          return <Spinner message={t('spinnerAuspiciousNaming')} />;
      case AppState.AUSPICIOUS_NAMING_RESULT:
          return auspiciousNamingData && <AuspiciousNamingResult data={auspiciousNamingData} info={auspiciousNamingInfo!} onReset={handleStartAuspiciousNaming} onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      case AppState.ADMIN_LOGIN:
          return <AdminLogin onSuccess={handleAdminLoginSuccess} onBack={handleResetToHome} />;
      case AppState.ADMIN_DASHBOARD:
          return <AdminDashboard visitCount={visitCount} onAdminAction={handleAdminAction} onBack={handleResetToHome} />;
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
                  <span className="block mt-1">{getTranslatedError(error)}</span>
                </div>
              </div>
              <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-red-500/20 transition-colors ml-4" aria-label={t('errorCloseAriaLabel')}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          )}
          <Suspense fallback={<Spinner message={t('processing')} />}>
            <div className="animate-slide-in-up">
              {renderContent()}
            </div>
          </Suspense>
        </main>
        <footer className="text-center py-8 text-gray-400 bg-black bg-opacity-50 mt-8 border-t border-gray-700/50">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-left">
              <h4 className="font-bold text-lg text-yellow-400 font-serif mb-2">{t('appName')}</h4>
              <p className="text-sm text-gray-500">
                <button onClick={handleStartAdminLogin} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded">
                    &copy; {new Date().getFullYear()} - {SUPPORT_INFO.channelName}
                </button>
                . | {t('footerVisits')}: {visitCount > 0 ? visitCount.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US') : '...'}
              </p>
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
          isOpen={!!chartToDelete || !!adminActionToConfirm}
          onClose={() => {
              setChartToDelete(null);
              setAdminActionToConfirm(null);
          }}
          onConfirm={chartToDelete ? confirmDeleteChart : confirmAdminAction}
          title={chartToDelete ? t('confirmDeleteTitle') : adminActionToConfirm?.title || ''}
          message={chartToDelete ? t('confirmDeleteMessage', { name: chartToDelete?.birthInfo.name || '' }) : adminActionToConfirm?.message || ''}
        />
      </div>
    </div>
  );
};

export default App;