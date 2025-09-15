import React, { useState, useCallback, useEffect, lazy, Suspense, useReducer } from 'react';
import type { AppStateStructure, ConfirmationModalState, SavedItem, SavedItemPayload } from '../types';
import { AppState } from '../types';
import Header from './Header';
import Footer from './Footer';
import DonationModal from './PaymentModal';
import Spinner from './Spinner';
import ZaloContact from './ZaloContact';
import ConfirmationModal from './ConfirmationModal';
import ErrorToast from './ErrorToast';
import { useLocalization } from '../hooks/useLocalization';
import type { TranslationKey } from '../hooks/useLocalization';
import { useFeatureHandlers } from '../hooks/useFeatureHandlers';

// --- Lazy Load Components for Performance ---
const Home = lazy(() => import('./Home'));
const SavedItems = lazy(() => import('./SavedItems'));
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
const FortuneSticksShake = lazy(() => import('./FortuneSticksShake'));
const FortuneSticksResult = lazy(() => import('./FortuneSticksResult'));
const GodOfWealthBlessing = lazy(() => import('./GodOfWealthBlessing'));
const GodOfWealthResult = lazy(() => import('./GodOfWealthResult'));
const PrayerGeneratorForm = lazy(() => import('./PrayerGeneratorForm'));
const PrayerResult = lazy(() => import('./PrayerResult'));
const FengShuiForm = lazy(() => import('./FengShuiForm'));
const FengShuiCapture = lazy(() => import('./FengShuiCapture'));
const FengShuiResult = lazy(() => import('./FengShuiResult'));
const HoaTayScan = lazy(() => import('./HoaTayScan'));
const HoaTayResult = lazy(() => import('./HoaTayResult'));


// --- State Management with useReducer ---

const initialState: AppStateStructure = {
  currentView: AppState.HOME,
  data: {
    birthInfo: null, chartData: null, physiognomyData: null, numerologyInfo: null, numerologyData: null,
    palmReadingData: null, handwritingData: null, tarotReadingData: null, flowAstrologyInfo: null, flowAstrologyData: null,
    careerInfo: null, careerAdviceData: null, talismanInfo: null, talismanData: null, auspiciousNamingInfo: null,
    auspiciousNamingData: null, bioEnergyInfo: null, bioEnergyData: null, fortuneStickInfo: null, fortuneStickData: null,
    godOfWealthInfo: null, godOfWealthData: null, prayerRequestInfo: null, prayerData: null, fengShuiInfo: null, fengShuiData: null,
    hoaTayData: null,
    capturedImage: null, capturedPalmImage: null, capturedHandwritingImage: null, capturedEnergyColor: null, drawnBioEnergyCard: null, fengShuiThumbnail: null,
  },
  error: null,
};

type AppAction =
  | { type: 'SET_VIEW'; payload: AppState }
  | { type: 'SET_DATA'; payload: Partial<AppStateStructure['data']> }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_VIEW'; payload: { savedItems: SavedItem[] } }
  | { type: 'RESET_FEATURE_DATA' };

function appReducer(state: AppStateStructure, action: AppAction): AppStateStructure {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_DATA':
      return { ...state, data: { ...state.data, ...action.payload } };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_FEATURE_DATA':
        return {...state, data: initialState.data, error: null };
    case 'RESET_VIEW': {
      const { savedItems } = action.payload;
      const nextView = savedItems.length > 0 ? AppState.SAVED_ITEMS : AppState.HOME;
      return { ...initialState, currentView: nextView };
    }
    default:
      return state;
  }
}

const App: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [modalState, setModalState] = useState<ConfirmationModalState | null>(null);
  const [visitCount, setVisitCount] = useState<number>(0);
  
  const { language, t } = useLocalization();
  
  const getStorageKey = useCallback(() => 'savedItems_guest', []);

  useEffect(() => {
    const currentStorageKey = getStorageKey();
    const oldStorageKey = 'astrologyCharts_guest';
    
    try {
      const storedItems = localStorage.getItem(currentStorageKey);
      const oldStoredCharts = localStorage.getItem(oldStorageKey);

      if (storedItems) {
        const parsedItems = JSON.parse(storedItems);
        if (Array.isArray(parsedItems)) { // Basic validation
            setSavedItems(parsedItems);
             if (parsedItems.length > 0) {
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
            if (migratedItems.length > 0) {
               dispatch({ type: 'SET_VIEW', payload: AppState.SAVED_ITEMS });
            }
        }
      } else {
        setSavedItems([]); // Clear items if nothing is in storage
      }
    } catch (e) {
      console.error("Could not load items from localStorage", e);
      localStorage.removeItem(currentStorageKey);
      localStorage.removeItem(oldStorageKey);
    }
  }, [getStorageKey]);
  
  useEffect(() => {
    if (sessionStorage.getItem('visit_logged') !== 'true') {
        let currentCount = parseInt(localStorage.getItem('visitCount') || '0', 10);
        currentCount++;
        localStorage.setItem('visitCount', currentCount.toString());
        setVisitCount(currentCount);
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
        case 'godOfWealth': id = `godofwealth-${createDeterministicId(payload.info.name)}`; isUpdate = false; break; // Allow multiple wishes
        case 'prayer': id = `prayer-${createDeterministicId(payload.info.name, payload.info.occasion, payload.info.deity)}`; isUpdate = true; break;
        case 'fengShui': id = `fengshui-${createDeterministicId(payload.info.spaceType, payload.info.ownerBirthYear)}`; isUpdate = true; break;
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
  
  const {
      handleGenerateChart, handleAnalyzeFace, handleAnalyzePalm, handleAnalyzeHandwriting, handleAnalyzeHoaTay,
      handleGenerateNumerology, handleGenerateFlowAstrology, handleGenerateCareerAdvice,
      handleGenerateTalisman, handleGenerateAuspiciousName, handleGenerateBioEnergy,
      handleGetFortuneStick, handleGetGodOfWealthBlessing, handleGeneratePrayer, handleAnalyzeFengShui,
      handleCaptureImage, handleRetakeCapture, handleCapturePalmImage, handleRetakePalmCapture,
      handleCaptureHandwritingImage, handleRetakeHandwritingCapture, handleCaptureEnergy,
      handleStartBioEnergy, handleStartFengShui, handleViewItem
  } = useFeatureHandlers({ state, dispatch, saveItem, language, t });

  useEffect(() => {
      const getTitleForView = () => {
          const key = `viewTitle${AppState[state.currentView]}` as TranslationKey;
          let nameParam = '';
          
          if(state.data.birthInfo) nameParam = state.data.birthInfo.name;
          else if(state.data.numerologyInfo) nameParam = state.data.numerologyInfo.fullName;
          
          const viewTitle = t(key, { name: nameParam });
          return viewTitle !== key ? `${viewTitle} | ${t('appName')}` : t('appName');
      };
      document.title = getTitleForView();
  }, [state.currentView, state.data, t]);


  const handleDeleteItem = (itemToDelete: SavedItem) => {
      const name = itemToDelete.payload.type === 'astrology' ? itemToDelete.payload.birthInfo.name : t(`itemType${itemToDelete.payload.type.charAt(0).toUpperCase() + itemToDelete.payload.type.slice(1)}` as TranslationKey);
      setModalState({ type: 'deleteItem', item: itemToDelete, title: t('confirmDeleteTitle'), message: t('confirmDeleteMessageWithName', { name }) });
  };
  
  const confirmModalAction = () => {
    if (!modalState || modalState.type !== 'deleteItem') return;
    
    const itemToDelete = modalState.item;
    const newItems = savedItems.filter(item => item.id !== itemToDelete.id);
    setSavedItems(newItems);
    localStorage.setItem(getStorageKey(), JSON.stringify(newItems));
    setModalState(null);
  };
  
  const { birthInfo, chartData } = state.data;
  
  const handleGoHome = useCallback(() => { dispatch({ type: 'RESET_VIEW', payload: { savedItems } }); }, [savedItems]);
  const createResetHandler = (view: AppState) => useCallback(() => {
      dispatch({ type: 'RESET_FEATURE_DATA' });
      dispatch({ type: 'SET_VIEW', payload: view });
  }, [view]);

  const handleResetAstrology = createResetHandler(AppState.ASTROLOGY_FORM);
  const handleResetPhysiognomy = createResetHandler(AppState.FACE_SCAN_CAPTURE);
  const handleResetPalmReading = createResetHandler(AppState.PALM_SCAN_CAPTURE);
  const handleResetHandwriting = createResetHandler(AppState.HANDWRITING_ANALYSIS_CAPTURE);
  const handleResetHoaTay = createResetHandler(AppState.HOA_TAY_SCAN_CAPTURE);
  const handleResetNumerology = createResetHandler(AppState.NUMEROLOGY_FORM);
  const handleResetFlowAstrology = createResetHandler(AppState.FLOW_ASTROLOGY_FORM);
  const handleResetCareerAdvisor = createResetHandler(AppState.CAREER_ADVISOR_FORM);
  const handleResetTalisman = createResetHandler(AppState.TALISMAN_GENERATOR);
  const handleResetAuspiciousNaming = createResetHandler(AppState.AUSPICIOUS_NAMING_FORM);
  const handleResetBioEnergy = createResetHandler(AppState.BIO_ENERGY_FORM);
  const handleResetFortuneSticks = createResetHandler(AppState.FORTUNE_STICKS_SHAKE);
  const handleResetGodOfWealth = createResetHandler(AppState.GOD_OF_WEALTH_BLESSING);
  const handleResetPrayer = createResetHandler(AppState.PRAYER_GENERATOR_FORM);
  const handleResetFengShui = createResetHandler(AppState.FENG_SHUI_FORM);

  const renderContent = () => {
    switch (state.currentView) {
      case AppState.HOME:
        return <Home 
            onStartAstrology={() => dispatch({ type: 'SET_VIEW', payload: AppState.ASTROLOGY_FORM })} 
            onStartPhysiognomy={() => dispatch({ type: 'SET_VIEW', payload: AppState.FACE_SCAN_CAPTURE })}
            onStartZodiacFinder={() => dispatch({ type: 'SET_VIEW', payload: AppState.ZODIAC_HOUR_FINDER })}
            onStartIChing={() => dispatch({ type: 'SET_VIEW', payload: AppState.ICHING_DIVINATION })}
            onStartShop={() => dispatch({ type: 'SET_VIEW', payload: AppState.SHOP })}
            onStartNumerology={() => dispatch({ type: 'SET_VIEW', payload: AppState.NUMEROLOGY_FORM })}
            onStartPalmReading={() => dispatch({ type: 'SET_VIEW', payload: AppState.PALM_SCAN_CAPTURE })}
            onStartTarot={() => dispatch({ type: 'SET_VIEW', payload: AppState.TAROT_READING })}
            onStartFlowAstrology={() => dispatch({ type: 'SET_VIEW', payload: AppState.FLOW_ASTROLOGY_FORM })}
            onStartAuspiciousDayFinder={() => dispatch({ type: 'SET_VIEW', payload: AppState.AUSPICIOUS_DAY_FINDER })}
            onStartHandwritingAnalysis={() => dispatch({ type: 'SET_VIEW', payload: AppState.HANDWRITING_ANALYSIS_CAPTURE })}
            onStartCareerAdvisor={() => dispatch({ type: 'SET_VIEW', payload: AppState.CAREER_ADVISOR_FORM })}
            onStartTalismanGenerator={() => dispatch({ type: 'SET_VIEW', payload: AppState.TALISMAN_GENERATOR })}
            onStartAuspiciousNaming={() => dispatch({ type: 'SET_VIEW', payload: AppState.AUSPICIOUS_NAMING_FORM })}
            onStartBioEnergy={() => dispatch({ type: 'SET_VIEW', payload: AppState.BIO_ENERGY_FORM })}
            onStartFortuneSticks={() => dispatch({ type: 'SET_VIEW', payload: AppState.FORTUNE_STICKS_SHAKE })}
            onStartGodOfWealth={() => dispatch({ type: 'SET_VIEW', payload: AppState.GOD_OF_WEALTH_BLESSING })}
            onStartPrayerGenerator={() => dispatch({ type: 'SET_VIEW', payload: AppState.PRAYER_GENERATOR_FORM })}
            onStartFengShui={() => dispatch({ type: 'SET_VIEW', payload: AppState.FENG_SHUI_FORM })}
            onStartHoaTay={() => dispatch({ type: 'SET_VIEW', payload: AppState.HOA_TAY_SCAN_CAPTURE })}
        />;
      case AppState.SAVED_ITEMS:
        return <SavedItems items={savedItems} onView={handleViewItem} onDelete={handleDeleteItem} onCreateNew={handleGoHome} />;
      case AppState.ASTROLOGY_FORM:
        return <BirthInfoForm onSubmit={handleGenerateChart} />;
      case AppState.LOADING:
        return <Spinner initialMessageKey='spinnerAstrology' />;
      case AppState.RESULT:
        return birthInfo && chartData && <AstrologyChart data={chartData} birthInfo={birthInfo} onTryAgain={handleResetAstrology} onGoHome={handleGoHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      case AppState.FACE_SCAN_CAPTURE:
        return <FaceScan onCapture={handleCaptureImage} onAnalyze={handleAnalyzeFace} capturedImage={state.data.capturedImage} onRetake={handleRetakeCapture} onBack={handleGoHome} />;
      case AppState.FACE_SCAN_LOADING:
        return <Spinner initialMessageKey='spinnerPhysiognomy' />;
      case AppState.FACE_SCAN_RESULT:
        return state.data.physiognomyData && state.data.capturedImage && <PhysiognomyResult analysisData={state.data.physiognomyData} imageData={state.data.capturedImage} onTryAgain={handleResetPhysiognomy} onGoHome={handleGoHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      case AppState.PALM_SCAN_CAPTURE:
        return <PalmScan onCapture={handleCapturePalmImage} onAnalyze={handleAnalyzePalm} capturedImage={state.data.capturedPalmImage} onRetake={handleRetakePalmCapture} onBack={handleGoHome} />;
      case AppState.PALM_SCAN_LOADING:
        return <Spinner initialMessageKey='spinnerPalmReading' />;
      case AppState.PALM_SCAN_RESULT:
        return state.data.palmReadingData && state.data.capturedPalmImage && <PalmReadingResult analysisData={state.data.palmReadingData} imageData={state.data.capturedPalmImage} onTryAgain={handleResetPalmReading} onGoHome={handleGoHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
       case AppState.HANDWRITING_ANALYSIS_CAPTURE:
        return <HandwritingScan onCapture={handleCaptureHandwritingImage} onAnalyze={handleAnalyzeHandwriting} capturedImage={state.data.capturedHandwritingImage} onRetake={handleRetakeHandwritingCapture} onBack={handleGoHome} />;
      case AppState.HANDWRITING_ANALYSIS_LOADING:
        return <Spinner initialMessageKey='spinnerHandwriting' />;
      case AppState.HANDWRITING_ANALYSIS_RESULT:
        return state.data.handwritingData && state.data.capturedHandwritingImage && <HandwritingResult analysisData={state.data.handwritingData} imageData={state.data.capturedHandwritingImage} onTryAgain={handleResetHandwriting} onGoHome={handleGoHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      case AppState.HOA_TAY_SCAN_CAPTURE:
        return <HoaTayScan onAnalyze={handleAnalyzeHoaTay} onBack={handleGoHome} />;
      case AppState.HOA_TAY_SCAN_LOADING:
        return <Spinner initialMessageKey='spinnerHoaTay' />;
      case AppState.HOA_TAY_SCAN_RESULT:
        return state.data.hoaTayData && <HoaTayResult analysisData={state.data.hoaTayData} onTryAgain={handleResetHoaTay} onGoHome={handleGoHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      case AppState.ZODIAC_HOUR_FINDER:
        return <ZodiacHourFinder />;
      case AppState.ICHING_DIVINATION:
        return <IChingDivination onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      case AppState.SHOP:
        return <Shop onBack={handleGoHome} />;
      case AppState.NUMEROLOGY_FORM:
        return <NumerologyForm onSubmit={handleGenerateNumerology} />;
      case AppState.NUMEROLOGY_LOADING:
        return <Spinner initialMessageKey='spinnerNumerology' />;
      case AppState.NUMEROLOGY_RESULT:
        return state.data.numerologyData && state.data.numerologyInfo && <NumerologyChart data={state.data.numerologyData} info={state.data.numerologyInfo} onTryAgain={handleResetNumerology} onGoHome={handleGoHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      case AppState.TAROT_READING:
        return <TarotReading onOpenDonationModal={() => setIsDonationModalOpen(true)} onBack={handleGoHome} />;
       case AppState.FLOW_ASTROLOGY_FORM:
        return <FlowAstrologyForm onSubmit={handleGenerateFlowAstrology} />;
      case AppState.FLOW_ASTROLOGY_LOADING:
        return <Spinner initialMessageKey='spinnerFlowAstrology' />;
      case AppState.FLOW_ASTROLOGY_RESULT:
        return state.data.flowAstrologyData && state.data.flowAstrologyInfo && <FlowAstrologyResult data={state.data.flowAstrologyData} info={state.data.flowAstrologyInfo} onTryAgain={handleResetFlowAstrology} onGoHome={handleGoHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      case AppState.AUSPICIOUS_DAY_FINDER:
        return <AuspiciousDayFinder />;
      case AppState.CAREER_ADVISOR_FORM:
        return <CareerAdvisorForm onSubmit={handleGenerateCareerAdvice} />;
      case AppState.CAREER_ADVISOR_LOADING:
        return <Spinner initialMessageKey='spinnerCareerAdvisor' />;
      case AppState.CAREER_ADVISOR_RESULT:
        return state.data.careerAdviceData && state.data.careerInfo && <CareerAdvisorResult data={state.data.careerAdviceData} info={state.data.careerInfo} onTryAgain={handleResetCareerAdvisor} onGoHome={handleGoHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      case AppState.TALISMAN_GENERATOR:
        return <TalismanGeneratorForm onSubmit={handleGenerateTalisman} />;
      case AppState.TALISMAN_LOADING:
        return <Spinner initialMessageKey='spinnerTalisman' />;
      case AppState.TALISMAN_RESULT:
        return state.data.talismanData && state.data.talismanInfo && <TalismanResult data={state.data.talismanData} info={state.data.talismanInfo} onTryAgain={handleResetTalisman} onGoHome={handleGoHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      case AppState.AUSPICIOUS_NAMING_FORM:
        return <AuspiciousNamingForm onSubmit={handleGenerateAuspiciousName} />;
      case AppState.AUSPICIOUS_NAMING_LOADING:
        return <Spinner initialMessageKey='spinnerAuspiciousNaming' />;
      case AppState.AUSPICIOUS_NAMING_RESULT:
        return state.data.auspiciousNamingData && state.data.auspiciousNamingInfo && <AuspiciousNamingResult data={state.data.auspiciousNamingData} info={state.data.auspiciousNamingInfo} onTryAgain={handleResetAuspiciousNaming} onGoHome={handleGoHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      case AppState.BIO_ENERGY_FORM:
        return <BioEnergyForm onSubmit={handleStartBioEnergy} />;
      case AppState.BIO_ENERGY_CAPTURE:
        return <BioEnergyCapture onCapture={handleCaptureEnergy} onBack={() => dispatch({type: 'SET_VIEW', payload: AppState.BIO_ENERGY_FORM})} />;
      case AppState.BIO_ENERGY_CARD_DRAW:
        return state.data.capturedEnergyColor && <BioEnergyCardDraw onDraw={handleGenerateBioEnergy} onBack={() => dispatch({type: 'SET_VIEW', payload: AppState.BIO_ENERGY_CAPTURE})} energyColor={state.data.capturedEnergyColor} />;
      case AppState.BIO_ENERGY_LOADING:
        return <Spinner initialMessageKey='spinnerBioEnergy' />;
      case AppState.BIO_ENERGY_RESULT:
        return state.data.bioEnergyData && state.data.bioEnergyInfo && state.data.capturedEnergyColor && state.data.drawnBioEnergyCard && <BioEnergyResult data={state.data.bioEnergyData} info={state.data.bioEnergyInfo} color={state.data.capturedEnergyColor} card={state.data.drawnBioEnergyCard} onTryAgain={handleResetBioEnergy} onGoHome={handleGoHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      case AppState.FORTUNE_STICKS_SHAKE:
        return <FortuneSticksShake onSubmit={handleGetFortuneStick} />;
      case AppState.FORTUNE_STICKS_LOADING:
        return <Spinner initialMessageKey='spinnerFortuneSticks' />;
      case AppState.FORTUNE_STICKS_RESULT:
        return state.data.fortuneStickData && <FortuneSticksResult data={state.data.fortuneStickData} onTryAgain={handleResetFortuneSticks} onGoHome={handleGoHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      case AppState.GOD_OF_WEALTH_BLESSING:
        return <GodOfWealthBlessing onSubmit={handleGetGodOfWealthBlessing} />;
      case AppState.GOD_OF_WEALTH_LOADING:
        return <Spinner initialMessageKey='spinnerGodOfWealth' />;
      case AppState.GOD_OF_WEALTH_RESULT:
        return state.data.godOfWealthData && state.data.godOfWealthInfo && <GodOfWealthResult data={state.data.godOfWealthData} info={state.data.godOfWealthInfo} onTryAgain={handleResetGodOfWealth} onGoHome={handleGoHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      case AppState.PRAYER_GENERATOR_FORM:
        return <PrayerGeneratorForm onSubmit={handleGeneratePrayer} />;
      case AppState.PRAYER_GENERATOR_LOADING:
        return <Spinner initialMessageKey='spinnerPrayer' />;
      case AppState.PRAYER_GENERATOR_RESULT:
        return state.data.prayerData && state.data.prayerRequestInfo && <PrayerResult data={state.data.prayerData} info={state.data.prayerRequestInfo} onTryAgain={handleResetPrayer} onGoHome={handleGoHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      case AppState.FENG_SHUI_FORM:
        return <FengShuiForm onSubmit={handleStartFengShui} />;
      case AppState.FENG_SHUI_CAPTURE:
        return <FengShuiCapture onAnalyze={handleAnalyzeFengShui} onBack={() => dispatch({type: 'SET_VIEW', payload: AppState.FENG_SHUI_FORM})} />;
      case AppState.FENG_SHUI_LOADING:
        return <Spinner initialMessageKey='spinnerFengShui' />;
      case AppState.FENG_SHUI_RESULT:
        return state.data.fengShuiData && state.data.fengShuiInfo && state.data.fengShuiThumbnail && <FengShuiResult data={state.data.fengShuiData} info={state.data.fengShuiInfo} thumbnail={state.data.fengShuiThumbnail} onTryAgain={handleResetFengShui} onGoHome={handleGoHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <Header onHomeClick={handleGoHome} />
      <ErrorToast message={state.error} onClose={() => dispatch({ type: 'SET_ERROR', payload: null })} />
      <main className="app-main container mx-auto px-4 py-8 sm:py-12">
        <Suspense fallback={<Spinner initialMessageKey='processing' />}>
            {renderContent()}
        </Suspense>
      </main>
      <ZaloContact />
      <DonationModal isOpen={isDonationModalOpen} onClose={() => setIsDonationModalOpen(false)} />
       {modalState && (
        <ConfirmationModal
          isOpen={!!modalState}
          onClose={() => setModalState(null)}
          onConfirm={confirmModalAction}
          title={modalState.title}
          message={modalState.message}
        />
      )}
      <Footer visitCount={visitCount} />
    </div>
  );
};

export default App;