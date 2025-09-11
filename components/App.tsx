import React, { useState, useCallback, useEffect, lazy, Suspense, useMemo, useReducer } from 'react';
import type { AppStateStructure, ConfirmationModalState, BirthInfo, AstrologyChartData, SavedItem, PhysiognomyData, NumerologyInfo, NumerologyData, PalmReadingData, TarotReadingData, FlowAstrologyInfo, FlowAstrologyData, HandwritingData, CareerInfo, CareerAdviceData, TalismanInfo, TalismanData, AuspiciousNamingInfo, AuspiciousNamingData, SavedItemPayload, BioEnergyInfo, BioEnergyCard, BioEnergyData, GoogleUser } from '../types';
import { AppState } from '../types';
import { generateAstrologyChart, analyzePhysiognomy, generateNumerologyChart, analyzePalm, generateFlowAstrology, analyzeHandwriting, getCareerAdvice, generateTalisman, generateAuspiciousName, generateBioEnergyReading } from '../lib/gemini';
import Header from './Header';
import DonationModal from './PaymentModal';
import Spinner from './Spinner';
import ZaloContact from './ZaloContact';
import ConfirmationModal from './ConfirmationModal';
import { useLocalization } from '../hooks/useLocalization';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { logAdminEvent } from '../lib/logger';
import type { TranslationKey } from '../hooks/useLocalization';

// --- Lazy Load Components for Performance ---
const Home = lazy(() => import('./Home'));
const SavedItems = lazy(() => import('./SavedItems'));
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
const BioEnergyForm = lazy(() => import('./BioEnergyForm'));
const BioEnergyCapture = lazy(() => import('./BioEnergyCapture'));
const BioEnergyCardDraw = lazy(() => import('./BioEnergyCardDraw'));
const BioEnergyResult = lazy(() => import('./BioEnergyResult'));
const AdminLogin = lazy(() => import('./AdminLogin'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));

// --- State Management with useReducer ---

const initialState: AppStateStructure = {
  currentView: AppState.HOME,
  data: {
    birthInfo: null, chartData: null, physiognomyData: null, numerologyInfo: null, numerologyData: null,
    palmReadingData: null, handwritingData: null, tarotReadingData: null, flowAstrologyInfo: null, flowAstrologyData: null,
    careerInfo: null, careerAdviceData: null, talismanInfo: null, talismanData: null, auspiciousNamingInfo: null,
    auspiciousNamingData: null, bioEnergyInfo: null, bioEnergyData: null, capturedImage: null, capturedPalmImage: null,
    capturedHandwritingImage: null, capturedEnergyColor: null, drawnBioEnergyCard: null,
  },
  error: null,
  postLoginAction: null,
};

type AppAction =
  | { type: 'SET_VIEW'; payload: AppState }
  | { type: 'SET_DATA'; payload: Partial<AppStateStructure['data']> }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_POST_LOGIN_ACTION'; payload: (() => void) | null }
  | { type: 'RESET_VIEW'; payload: { user: GoogleUser | null, savedItems: SavedItem[] } }
  | { type: 'RESET_FEATURE_DATA' };

function appReducer(state: AppStateStructure, action: AppAction): AppStateStructure {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload, error: null };
    case 'SET_DATA':
      return { ...state, data: { ...state.data, ...action.payload } };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_POST_LOGIN_ACTION':
      return { ...state, postLoginAction: action.payload };
    case 'RESET_FEATURE_DATA':
        return {...state, data: initialState.data, error: null };
    case 'RESET_VIEW': {
      const { user, savedItems } = action.payload;
      const isAdmin = sessionStorage.getItem('admin_auth') === 'true';
      let nextView = AppState.HOME;
      if (isAdmin) nextView = AppState.ADMIN_DASHBOARD;
      else if (user && savedItems.length > 0) nextView = AppState.SAVED_ITEMS;
      return { ...initialState, currentView: nextView };
    }
    default:
      return state;
  }
}

// --- Background Theme Mapping ---
const backgroundClassMap: Partial<Record<AppState, string>> = {
    [AppState.HOME]: 'bg-theme-home',
    [AppState.SAVED_ITEMS]: 'bg-theme-home',
    [AppState.ZODIAC_HOUR_FINDER]: 'bg-theme-home',
    [AppState.ADMIN_LOGIN]: 'bg-theme-home',
    [AppState.ADMIN_DASHBOARD]: 'bg-theme-home',

    [AppState.ASTROLOGY_FORM]: 'bg-theme-astrology',
    [AppState.ASTROLOGY_PASSWORD]: 'bg-theme-astrology',
    [AppState.LOADING]: 'bg-theme-astrology',
    [AppState.RESULT]: 'bg-theme-astrology',
    [AppState.NUMEROLOGY_FORM]: 'bg-theme-astrology',
    [AppState.NUMEROLOGY_LOADING]: 'bg-theme-astrology',
    [AppState.NUMEROLOGY_RESULT]: 'bg-theme-astrology',
    [AppState.FLOW_ASTROLOGY_FORM]: 'bg-theme-astrology',
    [AppState.FLOW_ASTROLOGY_LOADING]: 'bg-theme-astrology',
    [AppState.FLOW_ASTROLOGY_RESULT]: 'bg-theme-astrology',
    [AppState.CAREER_ADVISOR_FORM]: 'bg-theme-astrology',
    [AppState.CAREER_ADVISOR_PASSWORD]: 'bg-theme-astrology',
    [AppState.CAREER_ADVISOR_LOADING]: 'bg-theme-astrology',
    [AppState.CAREER_ADVISOR_RESULT]: 'bg-theme-astrology',
    [AppState.AUSPICIOUS_NAMING_FORM]: 'bg-theme-astrology',
    [AppState.AUSPICIOUS_NAMING_LOADING]: 'bg-theme-astrology',
    [AppState.AUSPICIOUS_NAMING_RESULT]: 'bg-theme-astrology',
    [AppState.AUSPICIOUS_DAY_FINDER]: 'bg-theme-astrology',

    [AppState.FACE_SCAN_CAPTURE]: 'bg-theme-personal',
    [AppState.FACE_SCAN_LOADING]: 'bg-theme-personal',
    [AppState.FACE_SCAN_RESULT]: 'bg-theme-personal',
    [AppState.PALM_SCAN_CAPTURE]: 'bg-theme-personal',
    [AppState.PALM_SCAN_LOADING]: 'bg-theme-personal',
    [AppState.PALM_SCAN_RESULT]: 'bg-theme-personal',
    [AppState.HANDWRITING_ANALYSIS_CAPTURE]: 'bg-theme-personal',
    [AppState.HANDWRITING_ANALYSIS_LOADING]: 'bg-theme-personal',
    [AppState.HANDWRITING_ANALYSIS_RESULT]: 'bg-theme-personal',
    
    [AppState.ICHING_DIVINATION]: 'bg-theme-divination',
    [AppState.TAROT_READING]: 'bg-theme-divination',
    [AppState.BIO_ENERGY_FORM]: 'bg-theme-divination',
    [AppState.BIO_ENERGY_CAPTURE]: 'bg-theme-divination',
    [AppState.BIO_ENERGY_CARD_DRAW]: 'bg-theme-divination',
    [AppState.BIO_ENERGY_LOADING]: 'bg-theme-divination',
    [AppState.BIO_ENERGY_RESULT]: 'bg-theme-divination',

    [AppState.SHOP]: 'bg-theme-shop',
    [AppState.TALISMAN_GENERATOR]: 'bg-theme-shop',
    [AppState.TALISMAN_LOADING]: 'bg-theme-shop',
    [AppState.TALISMAN_RESULT]: 'bg-theme-shop',
};

const getBackgroundClassForState = (state: AppState): string => backgroundClassMap[state] || 'bg-theme-home';


const App: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [modalState, setModalState] = useState<ConfirmationModalState | null>(null);
  const [visitCount, setVisitCount] = useState<number>(0);
  
  const { language, t } = useLocalization();
  const { user, authError } = useGoogleAuth();

  const backgroundClass = useMemo(() => getBackgroundClassForState(state.currentView), [state.currentView]);

  const getStorageKey = useCallback((userId?: string) => {
    const id = userId || user?.sub;
    return id ? `savedItems_${id}` : 'savedItems_guest';
  }, [user]);

  useEffect(() => {
    if (authError) {
      dispatch({ type: 'SET_ERROR', payload: t('googleSignInError') });
    }
  }, [authError, t]);

  useEffect(() => {
    const currentStorageKey = getStorageKey();
    const oldStorageKey = user ? `astrologyCharts_${user.sub}` : 'astrologyCharts_guest';
    
    try {
      const storedItems = localStorage.getItem(currentStorageKey);
      const oldStoredCharts = localStorage.getItem(oldStorageKey);

      if (storedItems) {
        const parsedItems = JSON.parse(storedItems);
        if (Array.isArray(parsedItems)) { // Basic validation
            setSavedItems(parsedItems);
             if (user && parsedItems.length > 0 && sessionStorage.getItem('admin_auth') !== 'true') {
               dispatch({ type: 'SET_VIEW', payload: AppState.SAVED_ITEMS });
            }
        }
      } else if (oldStoredCharts) {
        // Migrate old data
        const parsedCharts = JSON.parse(oldStoredCharts);
        if (Array.isArray(parsedCharts) && parsedCharts.every(c => c.id && c.birthInfo && c.chartData)) {
            const migratedItems: SavedItem[] = parsedCharts.map((chart: any) => ({
                id: chart.id,
                timestamp: new Date().toISOString(),
                payload: { type: 'astrology', birthInfo: chart.birthInfo, chartData: chart.chartData }
            }));
            migratedItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setSavedItems(migratedItems);
            localStorage.setItem(currentStorageKey, JSON.stringify(migratedItems));
            localStorage.removeItem(oldStorageKey);
            if (user && migratedItems.length > 0 && sessionStorage.getItem('admin_auth') !== 'true') {
               dispatch({ type: 'SET_VIEW', payload: AppState.SAVED_ITEMS });
            }
        }
      } else {
        setSavedItems([]); // Clear items if nothing is in storage for the user
      }
    } catch (e) {
      console.error("Could not load items from localStorage", e);
      localStorage.removeItem(currentStorageKey);
      localStorage.removeItem(oldStorageKey);
    }
  }, [user, getStorageKey]);

  useEffect(() => {
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
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [state.currentView]);

  useEffect(() => {
    if (state.currentView === AppState.SAVED_ITEMS && savedItems.length === 0) {
      dispatch({ type: 'SET_VIEW', payload: AppState.HOME });
    }
  }, [savedItems, state.currentView]);
  
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

  const saveItem = useCallback((payload: SavedItemPayload) => {
    let id: string;
    let isUpdate = false;
    const createDeterministicId = (...args: (string | number)[]) => args.join('-').trim().replace(/\s+/g, '_');

    switch (payload.type) {
        case 'astrology': id = `astrology-${createDeterministicId(payload.birthInfo.name, payload.birthInfo.gender, payload.birthInfo.year, payload.birthInfo.month, payload.birthInfo.day, payload.birthInfo.hour)}`; isUpdate = true; break;
        case 'numerology': id = `numerology-${createDeterministicId(payload.info.fullName, payload.info.year, payload.info.month, payload.info.day)}`; isUpdate = true; break;
        case 'flowAstrology': id = `flow-${createDeterministicId(payload.info.name, payload.info.year, payload.info.month, payload.info.day)}`; isUpdate = true; break;
        case 'auspiciousNaming': id = `naming-${createDeterministicId(payload.info.childLastName, payload.info.childYear, payload.info.childMonth, payload.info.childDay)}`; isUpdate = true; break;
        case 'bioEnergy': id = `bioenergy-${createDeterministicId(payload.info.name, payload.info.year, payload.info.month, payload.info.day)}`; isUpdate = true; break;
        default: id = `${payload.type}-${crypto.randomUUID()}`; break;
    }

    const newItem: SavedItem = { id, timestamp: new Date().toISOString(), payload };
    
    setSavedItems(currentItems => {
      const updatedItems = isUpdate ? [...currentItems.filter(item => item.id !== id), newItem] : [...currentItems, newItem];
      updatedItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      localStorage.setItem(getStorageKey(), JSON.stringify(updatedItems));
      return updatedItems;
    });
  }, [getStorageKey]);

  const handleGenerateChart = useCallback(async (info: BirthInfo) => {
    trackFeatureUsage('astrologyChart');
    logAdminEvent('Generate Astrology Chart', user?.email || 'Guest', `For: ${info.name}`);
    dispatch({ type: 'SET_DATA', payload: { birthInfo: info } });
    dispatch({ type: 'SET_VIEW', payload: AppState.LOADING });
    try {
      const data = await generateAstrologyChart(info, language);
      dispatch({ type: 'SET_DATA', payload: { chartData: data } });
      saveItem({ type: 'astrology', birthInfo: info, chartData: data });
      dispatch({ type: 'SET_VIEW', payload: AppState.RESULT });
    } catch (err) {
      console.error(err);
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : t('errorUnknown') });
      dispatch({ type: 'SET_VIEW', payload: AppState.ASTROLOGY_FORM });
    }
  }, [language, t, user, saveItem]);
  
  const handleAnalyzeFace = useCallback(async () => {
    const { capturedImage } = state.data;
    if (!capturedImage) return;
    trackFeatureUsage('physiognomy');
    logAdminEvent('Analyze Physiognomy', user?.email || 'Guest');
    dispatch({ type: 'SET_VIEW', payload: AppState.FACE_SCAN_LOADING });
    const base64Data = capturedImage.split(',')[1];
    if(!base64Data) {
        dispatch({ type: 'SET_ERROR', payload: t('errorInvalidImageData')});
        dispatch({ type: 'SET_VIEW', payload: AppState.FACE_SCAN_CAPTURE });
        return;
    }
    try {
      const data = await analyzePhysiognomy(base64Data, language);
      dispatch({ type: 'SET_DATA', payload: { physiognomyData: data } });
      saveItem({ type: 'physiognomy', name: t('itemTypePhysiognomy'), imageData: capturedImage, analysisData: data });
      dispatch({ type: 'SET_VIEW', payload: AppState.FACE_SCAN_RESULT });
    } catch (err) {
       console.error(err);
       dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : t('errorUnknown') });
       dispatch({ type: 'SET_VIEW', payload: AppState.FACE_SCAN_CAPTURE });
    }
  }, [state.data.capturedImage, language, t, user, saveItem]);

  const handleAnalyzePalm = useCallback(async () => {
    const { capturedPalmImage } = state.data;
    if (!capturedPalmImage) return;
    trackFeatureUsage('palmReading');
    logAdminEvent('Analyze Palm', user?.email || 'Guest');
    dispatch({ type: 'SET_VIEW', payload: AppState.PALM_SCAN_LOADING });
    const base64Data = capturedPalmImage.split(',')[1];
    if(!base64Data) {
        dispatch({ type: 'SET_ERROR', payload: t('errorInvalidImageData')});
        dispatch({ type: 'SET_VIEW', payload: AppState.PALM_SCAN_CAPTURE });
        return;
    }
    try {
      const data = await analyzePalm(base64Data, language);
      dispatch({ type: 'SET_DATA', payload: { palmReadingData: data } });
      saveItem({ type: 'palmReading', name: t('itemTypePalmReading'), imageData: capturedPalmImage, analysisData: data });
      dispatch({ type: 'SET_VIEW', payload: AppState.PALM_SCAN_RESULT });
    } catch (err) {
       console.error(err);
       dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : t('errorUnknown') });
       dispatch({ type: 'SET_VIEW', payload: AppState.PALM_SCAN_CAPTURE });
    }
  }, [state.data.capturedPalmImage, language, t, user, saveItem]);

  const handleAnalyzeHandwriting = useCallback(async () => {
    const { capturedHandwritingImage } = state.data;
    if (!capturedHandwritingImage) return;
    trackFeatureUsage('handwriting');
    logAdminEvent('Analyze Handwriting', user?.email || 'Guest');
    dispatch({ type: 'SET_VIEW', payload: AppState.HANDWRITING_ANALYSIS_LOADING });
    const base64Data = capturedHandwritingImage.split(',')[1];
    if(!base64Data) {
        dispatch({ type: 'SET_ERROR', payload: t('errorInvalidImageData')});
        dispatch({ type: 'SET_VIEW', payload: AppState.HANDWRITING_ANALYSIS_CAPTURE });
        return;
    }
    try {
      const data = await analyzeHandwriting(base64Data, language);
      dispatch({ type: 'SET_DATA', payload: { handwritingData: data } });
      saveItem({ type: 'handwriting', name: t('itemTypeHandwriting'), imageData: capturedHandwritingImage, analysisData: data });
      dispatch({ type: 'SET_VIEW', payload: AppState.HANDWRITING_ANALYSIS_RESULT });
    } catch (err) {
       console.error(err);
       dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : t('errorUnknown') });
       dispatch({ type: 'SET_VIEW', payload: AppState.HANDWRITING_ANALYSIS_CAPTURE });
    }
  }, [state.data.capturedHandwritingImage, language, t, user, saveItem]);

  const handleGenerateNumerology = useCallback(async (info: NumerologyInfo) => {
    trackFeatureUsage('numerology');
    logAdminEvent('Generate Numerology', user?.email || 'Guest', `For: ${info.fullName}`);
    dispatch({ type: 'SET_DATA', payload: { numerologyInfo: info } });
    dispatch({ type: 'SET_VIEW', payload: AppState.NUMEROLOGY_LOADING });
    try {
        const data = await generateNumerologyChart(info, language);
        dispatch({ type: 'SET_DATA', payload: { numerologyData: data } });
        saveItem({ type: 'numerology', info, data });
        dispatch({ type: 'SET_VIEW', payload: AppState.NUMEROLOGY_RESULT });
    } catch (err) {
        console.error(err);
        dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : t('errorUnknown') });
        dispatch({ type: 'SET_VIEW', payload: AppState.NUMEROLOGY_FORM });
    }
  }, [language, t, user, saveItem]);

  const handleGenerateFlowAstrology = useCallback(async (info: FlowAstrologyInfo) => {
    trackFeatureUsage('flowAstrology');
    logAdminEvent('Generate Flow Astrology', user?.email || 'Guest', `For: ${info.name}`);
    dispatch({ type: 'SET_DATA', payload: { flowAstrologyInfo: info } });
    dispatch({ type: 'SET_VIEW', payload: AppState.FLOW_ASTROLOGY_LOADING });
    try {
        const data = await generateFlowAstrology(info, language);
        dispatch({ type: 'SET_DATA', payload: { flowAstrologyData: data } });
        saveItem({ type: 'flowAstrology', info, data });
        dispatch({ type: 'SET_VIEW', payload: AppState.FLOW_ASTROLOGY_RESULT });
    } catch (err) {
        console.error(err);
        dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : t('errorUnknown') });
        dispatch({ type: 'SET_VIEW', payload: AppState.FLOW_ASTROLOGY_FORM });
    }
  }, [language, t, user, saveItem]);

    const handleGenerateCareerAdvice = useCallback(async (info: CareerInfo) => {
    trackFeatureUsage('careerAdvisor');
    logAdminEvent('Get Career Advice', user?.email || 'Guest', `For: ${info.name}`);
    dispatch({ type: 'SET_DATA', payload: { careerInfo: info } });
    dispatch({ type: 'SET_VIEW', payload: AppState.CAREER_ADVISOR_LOADING });
    try {
        const data = await getCareerAdvice(info, language);
        dispatch({ type: 'SET_DATA', payload: { careerAdviceData: data } });
        dispatch({ type: 'SET_VIEW', payload: AppState.CAREER_ADVISOR_RESULT });
    } catch (err) {
        console.error(err);
        dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : t('errorUnknown') });
        dispatch({ type: 'SET_VIEW', payload: AppState.CAREER_ADVISOR_FORM });
    }
  }, [language, t, user]);

  const handleGenerateTalisman = useCallback(async (info: TalismanInfo) => {
    trackFeatureUsage('talisman');
    logAdminEvent('Generate Talisman', user?.email || 'Guest', `For: ${info.name}`);
    dispatch({ type: 'SET_DATA', payload: { talismanInfo: info } });
    dispatch({ type: 'SET_VIEW', payload: AppState.TALISMAN_LOADING });
    try {
        const data = await generateTalisman(info, language);
        dispatch({ type: 'SET_DATA', payload: { talismanData: data } });
        dispatch({ type: 'SET_VIEW', payload: AppState.TALISMAN_RESULT });
    } catch (err) {
        console.error(err);
        dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : t('errorUnknown') });
        dispatch({ type: 'SET_VIEW', payload: AppState.TALISMAN_GENERATOR });
    }
  }, [language, t, user]);

  const handleGenerateAuspiciousName = useCallback(async (info: AuspiciousNamingInfo) => {
    trackFeatureUsage('auspiciousNaming');
    logAdminEvent('Generate Auspicious Name', user?.email || 'Guest', `For family: ${info.childLastName}`);
    dispatch({ type: 'SET_DATA', payload: { auspiciousNamingInfo: info } });
    dispatch({ type: 'SET_VIEW', payload: AppState.AUSPICIOUS_NAMING_LOADING });
    try {
        const data = await generateAuspiciousName(info, language);
        dispatch({ type: 'SET_DATA', payload: { auspiciousNamingData: data } });
        saveItem({ type: 'auspiciousNaming', info, data });
        dispatch({ type: 'SET_VIEW', payload: AppState.AUSPICIOUS_NAMING_RESULT });
    } catch (err) {
        console.error(err);
        dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : t('errorUnknown') });
        dispatch({ type: 'SET_VIEW', payload: AppState.AUSPICIOUS_NAMING_FORM });
    }
  }, [language, t, user, saveItem]);
  
  const handleGenerateBioEnergy = useCallback(async (card: BioEnergyCard) => {
    const { bioEnergyInfo, capturedEnergyColor } = state.data;
    if (!bioEnergyInfo || !capturedEnergyColor) return;
    trackFeatureUsage('bioEnergyReading');
    logAdminEvent('Generate Bio-Energy Reading', user?.email || 'Guest', `For: ${bioEnergyInfo.name}`);
    dispatch({ type: 'SET_DATA', payload: { drawnBioEnergyCard: card } });
    dispatch({ type: 'SET_VIEW', payload: AppState.BIO_ENERGY_LOADING });
    try {
      const data = await generateBioEnergyReading(bioEnergyInfo, capturedEnergyColor, card, language);
      dispatch({ type: 'SET_DATA', payload: { bioEnergyData: data } });
      saveItem({ type: 'bioEnergy', info: bioEnergyInfo, color: capturedEnergyColor, card, data });
      dispatch({ type: 'SET_VIEW', payload: AppState.BIO_ENERGY_RESULT });
    } catch (err) {
      console.error(err);
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : t('errorUnknown') });
      dispatch({ type: 'SET_VIEW', payload: AppState.BIO_ENERGY_FORM });
    }
  }, [state.data, language, t, user, saveItem]);

  const handleCaptureImage = useCallback((imageDataUrl: string) => { dispatch({ type: 'SET_DATA', payload: { capturedImage: imageDataUrl } }); }, []);
  const handleRetakeCapture = useCallback(() => { dispatch({ type: 'SET_DATA', payload: { capturedImage: null } }); dispatch({type: 'SET_ERROR', payload: null}); }, []);
  const handleCapturePalmImage = useCallback((imageDataUrl: string) => { dispatch({ type: 'SET_DATA', payload: { capturedPalmImage: imageDataUrl } }); }, []);
  const handleRetakePalmCapture = useCallback(() => { dispatch({ type: 'SET_DATA', payload: { capturedPalmImage: null } }); dispatch({type: 'SET_ERROR', payload: null}); }, []);
  const handleCaptureHandwritingImage = useCallback((imageDataUrl: string) => { dispatch({ type: 'SET_DATA', payload: { capturedHandwritingImage: imageDataUrl } }); }, []);
  const handleRetakeHandwritingCapture = useCallback(() => { dispatch({ type: 'SET_DATA', payload: { capturedHandwritingImage: null } }); dispatch({type: 'SET_ERROR', payload: null}); }, []);
  
  const handleFormSubmit = useCallback((info: BirthInfo) => {
    const chartId = `astrology-${info.name.replace(/\s/g, '_')}-${info.gender}-${info.year}-${info.month}-${info.day}-${info.hour}`;
    const existingItem = savedItems.find(item => item.id === chartId);

    if (existingItem && existingItem.payload.type === 'astrology') {
      dispatch({ type: 'SET_DATA', payload: { birthInfo: existingItem.payload.birthInfo, chartData: existingItem.payload.chartData } });
      dispatch({ type: 'SET_VIEW', payload: AppState.RESULT });
    } else {
      handleGenerateChart(info);
    }
  }, [savedItems, handleGenerateChart]);

  const handleResetToHome = useCallback(() => dispatch({ type: 'RESET_VIEW', payload: { user, savedItems } }), [user, savedItems]);
  
  const handleStartAstrology = useCallback(() => {
    const action = () => { dispatch({ type: 'RESET_FEATURE_DATA' }); dispatch({ type: 'SET_VIEW', payload: AppState.ASTROLOGY_FORM }); };
    if (sessionStorage.getItem('astrology_unlocked') === 'true' || !user) action();
    else {
        dispatch({ type: 'SET_POST_LOGIN_ACTION', payload: () => action });
        dispatch({ type: 'SET_VIEW', payload: AppState.ASTROLOGY_PASSWORD });
    }
  }, [user]);

  const handleStartPhysiognomy = useCallback(() => { trackFeatureUsage('physiognomyScan'); dispatch({ type: 'RESET_FEATURE_DATA' }); dispatch({ type: 'SET_VIEW', payload: AppState.FACE_SCAN_CAPTURE }); }, []);
  const handleStartPalmReading = useCallback(() => { trackFeatureUsage('palmScan'); dispatch({ type: 'RESET_FEATURE_DATA' }); dispatch({ type: 'SET_VIEW', payload: AppState.PALM_SCAN_CAPTURE }); }, []);
  const handleStartHandwritingAnalysis = useCallback(() => { trackFeatureUsage('handwritingScan'); dispatch({ type: 'RESET_FEATURE_DATA' }); dispatch({ type: 'SET_VIEW', payload: AppState.HANDWRITING_ANALYSIS_CAPTURE }); }, []);
  const handleStartNumerology = useCallback(() => { trackFeatureUsage('numerologyForm'); dispatch({ type: 'RESET_FEATURE_DATA' }); dispatch({ type: 'SET_VIEW', payload: AppState.NUMEROLOGY_FORM }); }, []);
  const handleStartFlowAstrology = useCallback(() => { trackFeatureUsage('flowAstrologyForm'); dispatch({ type: 'RESET_FEATURE_DATA' }); dispatch({ type: 'SET_VIEW', payload: AppState.FLOW_ASTROLOGY_FORM }); }, []);
  const handleStartZodiacFinder = useCallback(() => { trackFeatureUsage('zodiacHourFinder'); dispatch({ type: 'RESET_FEATURE_DATA' }); dispatch({ type: 'SET_VIEW', payload: AppState.ZODIAC_HOUR_FINDER }); }, []);
  const handleStartAuspiciousDayFinder = useCallback(() => { trackFeatureUsage('auspiciousDayFinder'); dispatch({ type: 'RESET_FEATURE_DATA' }); dispatch({ type: 'SET_VIEW', payload: AppState.AUSPICIOUS_DAY_FINDER }); }, []);
  const handleStartIChing = useCallback(() => { trackFeatureUsage('iChing'); dispatch({ type: 'RESET_FEATURE_DATA' }); dispatch({ type: 'SET_VIEW', payload: AppState.ICHING_DIVINATION }); }, []);
  const handleStartTarot = useCallback(() => { trackFeatureUsage('tarotReading'); dispatch({ type: 'RESET_FEATURE_DATA' }); dispatch({ type: 'SET_VIEW', payload: AppState.TAROT_READING }); }, []);
  const handleStartShop = useCallback(() => { trackFeatureUsage('shop'); dispatch({ type: 'RESET_FEATURE_DATA' }); dispatch({ type: 'SET_VIEW', payload: AppState.SHOP }); }, []);
  const handleStartTalismanGenerator = useCallback(() => { trackFeatureUsage('talismanForm'); dispatch({ type: 'RESET_FEATURE_DATA' }); dispatch({ type: 'SET_VIEW', payload: AppState.TALISMAN_GENERATOR }); }, []);
  const handleStartAuspiciousNaming = useCallback(() => { trackFeatureUsage('auspiciousNamingForm'); dispatch({ type: 'RESET_FEATURE_DATA' }); dispatch({ type: 'SET_VIEW', payload: AppState.AUSPICIOUS_NAMING_FORM }); }, []);
  const handleStartBioEnergy = useCallback(() => { trackFeatureUsage('bioEnergyForm'); dispatch({ type: 'RESET_FEATURE_DATA' }); dispatch({ type: 'SET_VIEW', payload: AppState.BIO_ENERGY_FORM }); }, []);

  const handleStartCareerAdvisor = useCallback(() => {
    const action = () => { dispatch({ type: 'RESET_FEATURE_DATA' }); dispatch({ type: 'SET_VIEW', payload: AppState.CAREER_ADVISOR_FORM }); };
    if (sessionStorage.getItem('career_unlocked') === 'true' || !user) action();
    else {
        dispatch({ type: 'SET_POST_LOGIN_ACTION', payload: () => action });
        dispatch({ type: 'SET_VIEW', payload: AppState.CAREER_ADVISOR_PASSWORD });
    }
  }, [user]);

  const handleViewItem = useCallback((item: SavedItem) => {
    dispatch({ type: 'RESET_FEATURE_DATA' });
    const { payload } = item;
    switch(payload.type) {
        case 'astrology': {
             const viewAction = () => {
                dispatch({ type: 'SET_DATA', payload: { birthInfo: payload.birthInfo, chartData: payload.chartData } });
                dispatch({ type: 'SET_VIEW', payload: AppState.RESULT });
            };
            if (sessionStorage.getItem('astrology_unlocked') === 'true' || !user) viewAction();
            else {
                dispatch({ type: 'SET_POST_LOGIN_ACTION', payload: () => viewAction });
                dispatch({ type: 'SET_VIEW', payload: AppState.ASTROLOGY_PASSWORD });
            }
            break;
        }
        case 'physiognomy':
            dispatch({ type: 'SET_DATA', payload: { physiognomyData: payload.analysisData, capturedImage: payload.imageData } });
            dispatch({ type: 'SET_VIEW', payload: AppState.FACE_SCAN_RESULT });
            break;
        case 'palmReading':
            dispatch({ type: 'SET_DATA', payload: { palmReadingData: payload.analysisData, capturedPalmImage: payload.imageData } });
            dispatch({ type: 'SET_VIEW', payload: AppState.PALM_SCAN_RESULT });
            break;
        case 'handwriting':
            dispatch({ type: 'SET_DATA', payload: { handwritingData: payload.analysisData, capturedHandwritingImage: payload.imageData } });
            dispatch({ type: 'SET_VIEW', payload: AppState.HANDWRITING_ANALYSIS_RESULT });
            break;
        case 'numerology':
            dispatch({ type: 'SET_DATA', payload: { numerologyInfo: payload.info, numerologyData: payload.data } });
            dispatch({ type: 'SET_VIEW', payload: AppState.NUMEROLOGY_RESULT });
            break;
        case 'flowAstrology':
            dispatch({ type: 'SET_DATA', payload: { flowAstrologyInfo: payload.info, flowAstrologyData: payload.data } });
            dispatch({ type: 'SET_VIEW', payload: AppState.FLOW_ASTROLOGY_RESULT });
            break;
        case 'auspiciousNaming':
            dispatch({ type: 'SET_DATA', payload: { auspiciousNamingInfo: payload.info, auspiciousNamingData: payload.data } });
            dispatch({ type: 'SET_VIEW', payload: AppState.AUSPICIOUS_NAMING_RESULT });
            break;
        case 'bioEnergy':
            dispatch({ type: 'SET_DATA', payload: { bioEnergyInfo: payload.info, capturedEnergyColor: payload.color, drawnBioEnergyCard: payload.card, bioEnergyData: payload.data } });
            dispatch({ type: 'SET_VIEW', payload: AppState.BIO_ENERGY_RESULT });
            break;
    }
  }, [user]);

  const handleDeleteItem = useCallback((item: SavedItem) => { 
    setModalState({ type: 'deleteItem', item });
  }, []);

  const confirmDeleteItem = useCallback(() => {
    if (modalState?.type !== 'deleteItem') return;
    const itemToDelete = modalState.item;
    const updatedItems = savedItems.filter(item => item.id !== itemToDelete.id);
    setSavedItems(updatedItems);
    localStorage.setItem(getStorageKey(), JSON.stringify(updatedItems));
    logAdminEvent('Deleted Saved Item', user?.email || 'Guest', `ID: ${itemToDelete.id}`);
    setModalState(null);
  }, [modalState, savedItems, user, getStorageKey]);

  const handleAstrologyPasswordSuccess = useCallback(() => {
    sessionStorage.setItem('astrology_unlocked', 'true');
    logAdminEvent('Unlocked Astrology', user?.email || 'Guest');
    if (state.postLoginAction) state.postLoginAction();
    else dispatch({ type: 'SET_VIEW', payload: AppState.ASTROLOGY_FORM });
    dispatch({ type: 'SET_POST_LOGIN_ACTION', payload: null });
  }, [state.postLoginAction, user]);
  
  const handleCareerPasswordSuccess = useCallback(() => {
    sessionStorage.setItem('career_unlocked', 'true');
    logAdminEvent('Unlocked Career Advisor', user?.email || 'Guest');
    if (state.postLoginAction) state.postLoginAction();
    else dispatch({ type: 'SET_VIEW', payload: AppState.CAREER_ADVISOR_FORM });
    dispatch({ type: 'SET_POST_LOGIN_ACTION', payload: null });
  }, [state.postLoginAction, user]);

  const handleAdminAction = useCallback((action: 'clear_charts' | 'clear_history') => {
      setModalState({ type: 'adminAction', action });
  }, []);

  const confirmAdminAction = useCallback(() => {
      if (modalState?.type !== 'adminAction') return;
      const { action } = modalState;
      logAdminEvent(`Admin Action: ${action}`, 'Admin');
      if (action === 'clear_charts') {
          Object.keys(localStorage).forEach(key => {
              if (key.startsWith('savedItems_') || key.startsWith('astrologyCharts_')) localStorage.removeItem(key);
          });
          setSavedItems([]);
      } else if (action === 'clear_history') {
          localStorage.removeItem('adminHistoryLog');
      }
      setModalState(null);
  }, [modalState]);

  const getConfirmationModalProps = () => {
    if (!modalState) return { isOpen: false, onConfirm: () => {}, onClose: () => {}, title: '', message: '' };

    if (modalState.type === 'deleteItem') {
      const { payload } = modalState.item;
      let name: string | undefined;
      switch (payload.type) {
        case 'astrology': name = payload.birthInfo.name; break;
        case 'numerology': name = payload.info.fullName; break;
        case 'flowAstrology': name = payload.info.name; break;
        case 'bioEnergy': name = payload.info.name; break;
      }
      return {
        isOpen: true,
        onConfirm: confirmDeleteItem,
        onClose: () => setModalState(null),
        title: t('confirmDeleteTitle'),
        message: name ? t('confirmDeleteMessageWithName', { name }) : t('confirmDeleteMessage'),
      };
    }

    if (modalState.type === 'adminAction') {
      const configMap = {
          clear_charts: { titleKey: 'adminClearChartsConfirmTitle' as const, messageKey: 'adminClearChartsConfirmMessage' as const },
          clear_history: { titleKey: 'adminClearHistoryConfirmTitle' as const, messageKey: 'adminClearHistoryConfirmMessage' as const },
      };
      const config = configMap[modalState.action];
      return {
        isOpen: true,
        onConfirm: confirmAdminAction,
        onClose: () => setModalState(null),
        title: t(config.titleKey),
        message: t(config.messageKey),
      };
    }

    return { isOpen: false, onConfirm: () => {}, onClose: () => {}, title: '', message: '' };
  };
  
  const confirmationProps = getConfirmationModalProps();

  const getTranslatedError = (errorKey: string | null): string => {
    if (!errorKey) return '';
    const isBackendKey = /^[a-z]+(_[a-z]+)*$/.test(errorKey);
    if (isBackendKey) {
        const translationKey = errorKey.replace(/_([a-z])/g, (g) => g[1].toUpperCase()) as TranslationKey;
        const translated = t(translationKey);
        return translated === translationKey ? t('errorUnknown') : translated;
    }
    return errorKey;
  };

  // --- View Mapping ---
  const viewMap: Partial<Record<AppState, React.ReactNode>> = {
      [AppState.HOME]: <Home onStartAstrology={handleStartAstrology} onStartPhysiognomy={handleStartPhysiognomy} onStartZodiacFinder={handleStartZodiacFinder} onStartIChing={handleStartIChing} onStartShop={handleStartShop} onStartNumerology={handleStartNumerology} onStartPalmReading={handleStartPalmReading} onStartTarot={handleStartTarot} onStartFlowAstrology={handleStartFlowAstrology} onStartAuspiciousDayFinder={handleStartAuspiciousDayFinder} onStartHandwritingAnalysis={handleStartHandwritingAnalysis} onStartCareerAdvisor={handleStartCareerAdvisor} onStartTalismanGenerator={handleStartTalismanGenerator} onStartAuspiciousNaming={handleStartAuspiciousNaming} onStartBioEnergy={handleStartBioEnergy} />,
      [AppState.SAVED_ITEMS]: <SavedItems items={savedItems} onView={handleViewItem} onDelete={handleDeleteItem} onCreateNew={handleStartAstrology} />,
      [AppState.ASTROLOGY_PASSWORD]: <PasswordPrompt onSuccess={handleAstrologyPasswordSuccess} onBack={handleResetToHome} feature="astrology"/>,
      [AppState.ASTROLOGY_FORM]: <BirthInfoForm onSubmit={handleFormSubmit} initialName={user?.name} />,
      [AppState.LOADING]: <Spinner message={t('spinnerAstrology')} />,
      [AppState.RESULT]: state.data.chartData && <AstrologyChart data={state.data.chartData} birthInfo={state.data.birthInfo!} onReset={handleResetToHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />,
      [AppState.FACE_SCAN_CAPTURE]: <FaceScan onAnalyze={handleAnalyzeFace} onBack={handleResetToHome} onCapture={handleCaptureImage} onRetake={handleRetakeCapture} capturedImage={state.data.capturedImage} />,
      [AppState.FACE_SCAN_LOADING]: <Spinner message={t('spinnerPhysiognomy')} />,
      [AppState.FACE_SCAN_RESULT]: state.data.physiognomyData && state.data.capturedImage && <PhysiognomyResult analysisData={state.data.physiognomyData} imageData={state.data.capturedImage} onReset={() => dispatch({type: 'SET_VIEW', payload: AppState.FACE_SCAN_CAPTURE})} onBackToHome={handleResetToHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />,
      [AppState.PALM_SCAN_CAPTURE]: <PalmScan onAnalyze={handleAnalyzePalm} onBack={handleResetToHome} onCapture={handleCapturePalmImage} onRetake={handleRetakePalmCapture} capturedImage={state.data.capturedPalmImage} />,
      [AppState.PALM_SCAN_LOADING]: <Spinner message={t('spinnerPalmReading')} />,
      [AppState.PALM_SCAN_RESULT]: state.data.palmReadingData && state.data.capturedPalmImage && <PalmReadingResult analysisData={state.data.palmReadingData} imageData={state.data.capturedPalmImage} onReset={() => dispatch({type: 'SET_VIEW', payload: AppState.PALM_SCAN_CAPTURE})} onBackToHome={handleResetToHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />,
      [AppState.HANDWRITING_ANALYSIS_CAPTURE]: <HandwritingScan onAnalyze={handleAnalyzeHandwriting} onBack={handleResetToHome} onCapture={handleCaptureHandwritingImage} onRetake={handleRetakeHandwritingCapture} capturedImage={state.data.capturedHandwritingImage} />,
      [AppState.HANDWRITING_ANALYSIS_LOADING]: <Spinner message={t('spinnerHandwriting')} />,
      [AppState.HANDWRITING_ANALYSIS_RESULT]: state.data.handwritingData && state.data.capturedHandwritingImage && <HandwritingResult analysisData={state.data.handwritingData} imageData={state.data.capturedHandwritingImage} onReset={() => dispatch({type: 'SET_VIEW', payload: AppState.HANDWRITING_ANALYSIS_CAPTURE})} onBackToHome={handleResetToHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />,
      [AppState.ZODIAC_HOUR_FINDER]: <ZodiacHourFinder />,
      [AppState.AUSPICIOUS_DAY_FINDER]: <AuspiciousDayFinder />,
      [AppState.ICHING_DIVINATION]: <IChingDivination onOpenDonationModal={() => setIsDonationModalOpen(true)} />,
      [AppState.TAROT_READING]: <TarotReading onOpenDonationModal={() => setIsDonationModalOpen(true)} onBack={handleResetToHome} />,
      [AppState.SHOP]: <Shop onBack={handleResetToHome} />,
      [AppState.NUMEROLOGY_FORM]: <NumerologyForm onSubmit={handleGenerateNumerology} initialName={user?.name} />,
      [AppState.NUMEROLOGY_LOADING]: <Spinner message={t('spinnerNumerology')} />,
      [AppState.NUMEROLOGY_RESULT]: state.data.numerologyData && <NumerologyChart data={state.data.numerologyData} info={state.data.numerologyInfo!} onReset={handleResetToHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />,
      [AppState.FLOW_ASTROLOGY_FORM]: <FlowAstrologyForm onSubmit={handleGenerateFlowAstrology} initialName={user?.name} />,
      [AppState.FLOW_ASTROLOGY_LOADING]: <Spinner message={t('spinnerFlowAstrology')} />,
      [AppState.FLOW_ASTROLOGY_RESULT]: state.data.flowAstrologyData && <FlowAstrologyResult data={state.data.flowAstrologyData} info={state.data.flowAstrologyInfo!} onReset={handleResetToHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />,
      [AppState.CAREER_ADVISOR_PASSWORD]: <PasswordPrompt onSuccess={handleCareerPasswordSuccess} onBack={handleResetToHome} feature="career" />,
      [AppState.CAREER_ADVISOR_FORM]: <CareerAdvisorForm onSubmit={handleGenerateCareerAdvice} initialName={user?.name} />,
      [AppState.CAREER_ADVISOR_LOADING]: <Spinner message={t('spinnerCareerAdvisor')} />,
      [AppState.CAREER_ADVISOR_RESULT]: state.data.careerAdviceData && <CareerAdvisorResult data={state.data.careerAdviceData} info={state.data.careerInfo!} onReset={handleResetToHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />,
      [AppState.TALISMAN_GENERATOR]: <TalismanGeneratorForm onSubmit={handleGenerateTalisman} initialName={user?.name} />,
      [AppState.TALISMAN_LOADING]: <Spinner message={t('spinnerTalisman')} />,
      [AppState.TALISMAN_RESULT]: state.data.talismanData && <TalismanResult data={state.data.talismanData} info={state.data.talismanInfo!} onReset={() => dispatch({type: 'SET_VIEW', payload: AppState.TALISMAN_GENERATOR})} onOpenDonationModal={() => setIsDonationModalOpen(true)} />,
      [AppState.AUSPICIOUS_NAMING_FORM]: <AuspiciousNamingForm onSubmit={handleGenerateAuspiciousName} />,
      [AppState.AUSPICIOUS_NAMING_LOADING]: <Spinner message={t('spinnerAuspiciousNaming')} />,
      [AppState.AUSPICIOUS_NAMING_RESULT]: state.data.auspiciousNamingData && <AuspiciousNamingResult data={state.data.auspiciousNamingData} info={state.data.auspiciousNamingInfo!} onReset={handleStartAuspiciousNaming} onOpenDonationModal={() => setIsDonationModalOpen(true)} />,
      [AppState.BIO_ENERGY_FORM]: <BioEnergyForm onSubmit={(info) => { dispatch({ type: 'SET_DATA', payload: { bioEnergyInfo: info }}); dispatch({type: 'SET_VIEW', payload: AppState.BIO_ENERGY_CAPTURE}); }} initialName={user?.name} />,
      [AppState.BIO_ENERGY_CAPTURE]: <BioEnergyCapture onCapture={(color) => { dispatch({ type: 'SET_DATA', payload: { capturedEnergyColor: color } }); dispatch({type: 'SET_VIEW', payload: AppState.BIO_ENERGY_CARD_DRAW}); }} onBack={() => dispatch({type: 'SET_VIEW', payload: AppState.BIO_ENERGY_FORM})} />,
      [AppState.BIO_ENERGY_CARD_DRAW]: <BioEnergyCardDraw onDraw={handleGenerateBioEnergy} onBack={() => dispatch({type: 'SET_VIEW', payload: AppState.BIO_ENERGY_CAPTURE})} energyColor={state.data.capturedEnergyColor!} />,
      [AppState.BIO_ENERGY_LOADING]: <Spinner message={t('spinnerBioEnergy')} />,
      [AppState.BIO_ENERGY_RESULT]: state.data.bioEnergyData && <BioEnergyResult data={state.data.bioEnergyData} info={state.data.bioEnergyInfo!} color={state.data.capturedEnergyColor!} card={state.data.drawnBioEnergyCard!} onReset={handleResetToHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />,
      [AppState.ADMIN_LOGIN]: <AdminLogin onSuccess={() => {logAdminEvent('Admin Signed In', 'Admin'); dispatch({type: 'SET_VIEW', payload: AppState.ADMIN_DASHBOARD});}} onBack={handleResetToHome} />,
      [AppState.ADMIN_DASHBOARD]: <AdminDashboard visitCount={visitCount} onAdminAction={handleAdminAction} onBack={handleResetToHome} />,
  };

  return (
    <div className={`min-h-screen text-gray-200 background-container ${backgroundClass}`}>
      <div className="min-h-screen bg-black bg-opacity-70 backdrop-blur-md flex flex-col">
        <Header onHomeClick={handleResetToHome} />
        <main className="container mx-auto px-4 py-8 flex-grow">
          {state.error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg relative mb-6 flex items-start justify-between animate-fade-in" role="alert" aria-live="assertive">
              <div className="flex items-start">
                <svg className="w-6 h-6 mr-3 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.244