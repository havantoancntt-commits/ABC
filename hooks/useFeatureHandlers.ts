import { useCallback } from 'react';
import type { AppStateStructure, BirthInfo, NumerologyInfo, FlowAstrologyInfo, CareerInfo, TalismanInfo, AuspiciousNamingInfo, BioEnergyInfo, BioEnergyCard, FortuneStickInfo, GodOfWealthInfo, PrayerRequestInfo, FengShuiInfo, SavedItemPayload, SavedItem } from '../types';
import { AppState } from '../types';
import { generateAstrologyChart, analyzePhysiognomy, generateNumerologyChart, analyzePalm, generateFlowAstrology, analyzeHandwriting, getCareerAdvice, generateTalisman, generateAuspiciousName, generateBioEnergyReading, getFortuneStickInterpretation, getGodOfWealthBlessing, generatePrayer, analyzeFengShui, analyzeHoaTay } from '../lib/gemini';
import type { TranslationKey } from './useLocalization';

type Dispatch = React.Dispatch<any>;
type TFunction = (key: TranslationKey, params?: Record<string, string | number>) => string;

interface HookParams {
    state: AppStateStructure;
    dispatch: Dispatch;
    saveItem: (payload: SavedItemPayload) => void;
    language: string;
    t: TFunction;
}

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

export const useFeatureHandlers = ({ state, dispatch, saveItem, language, t }: HookParams) => {

    const handleGenerateChart = useCallback(async (info: BirthInfo) => {
        trackFeatureUsage('astrologyChart');
        dispatch({ type: 'SET_DATA', payload: { birthInfo: info } });
        dispatch({ type: 'SET_VIEW', payload: AppState.LOADING });
        try {
        const data = await generateAstrologyChart(info, language);
        dispatch({ type: 'SET_DATA', payload: { chartData: data } });
        saveItem({ type: 'astrology', birthInfo: info, chartData: data });
        dispatch({ type: 'SET_VIEW', payload: AppState.RESULT });
        } catch (err) {
        console.error(err);
        dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? t(err.message as TranslationKey) || t('errorUnknown') : t('errorUnknown') });
        dispatch({ type: 'SET_VIEW', payload: AppState.ASTROLOGY_FORM });
        }
    }, [language, t, saveItem, dispatch]);
    
    const handleAnalyzeFace = useCallback(async () => {
        const { capturedImage } = state.data;
        if (!capturedImage) return;
        trackFeatureUsage('physiognomy');
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
        dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? t(err.message as TranslationKey) || t('errorUnknown') : t('errorUnknown') });
        dispatch({ type: 'SET_VIEW', payload: AppState.FACE_SCAN_CAPTURE });
        }
    }, [state.data.capturedImage, language, t, saveItem, dispatch]);

    const handleAnalyzePalm = useCallback(async () => {
        const { capturedPalmImage } = state.data;
        if (!capturedPalmImage) return;
        trackFeatureUsage('palmReading');
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
        dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? t(err.message as TranslationKey) || t('errorUnknown') : t('errorUnknown') });
        dispatch({ type: 'SET_VIEW', payload: AppState.PALM_SCAN_CAPTURE });
        }
    }, [state.data.capturedPalmImage, language, t, saveItem, dispatch]);

    const handleAnalyzeHandwriting = useCallback(async () => {
        const { capturedHandwritingImage } = state.data;
        if (!capturedHandwritingImage) return;
        trackFeatureUsage('handwriting');
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
        dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? t(err.message as TranslationKey) || t('errorUnknown') : t('errorUnknown') });
        dispatch({ type: 'SET_VIEW', payload: AppState.HANDWRITING_ANALYSIS_CAPTURE });
        }
    }, [state.data.capturedHandwritingImage, language, t, saveItem, dispatch]);

    const handleAnalyzeHoaTay = useCallback(async (counts: { leftHandWhorls: number, rightHandWhorls: number }) => {
        trackFeatureUsage('hoaTay');
        dispatch({ type: 'SET_VIEW', payload: AppState.HOA_TAY_SCAN_LOADING });
        try {
            const data = await analyzeHoaTay(counts, language);
            dispatch({ type: 'SET_DATA', payload: { hoaTayData: data } });
            saveItem({ type: 'hoaTay', name: t('itemTypeHoaTay'), analysisData: data });
            dispatch({ type: 'SET_VIEW', payload: AppState.HOA_TAY_SCAN_RESULT });
        } catch (err) {
            console.error(err);
            dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? t(err.message as TranslationKey) || t('errorUnknown') : t('errorUnknown') });
            dispatch({ type: 'SET_VIEW', payload: AppState.HOA_TAY_SCAN_CAPTURE });
        }
    }, [language, t, saveItem, dispatch]);

    const handleGenerateNumerology = useCallback(async (info: NumerologyInfo) => {
        trackFeatureUsage('numerology');
        dispatch({ type: 'SET_DATA', payload: { numerologyInfo: info } });
        dispatch({ type: 'SET_VIEW', payload: AppState.NUMEROLOGY_LOADING });
        try {
            const data = await generateNumerologyChart(info, language);
            dispatch({ type: 'SET_DATA', payload: { numerologyData: data } });
            saveItem({ type: 'numerology', info, data });
            dispatch({ type: 'SET_VIEW', payload: AppState.NUMEROLOGY_RESULT });
        } catch (err) {
            console.error(err);
            dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? t(err.message as TranslationKey) || t('errorUnknown') : t('errorUnknown') });
            dispatch({ type: 'SET_VIEW', payload: AppState.NUMEROLOGY_FORM });
        }
    }, [language, t, saveItem, dispatch]);

    const handleGenerateFlowAstrology = useCallback(async (info: FlowAstrologyInfo) => {
        trackFeatureUsage('flowAstrology');
        dispatch({ type: 'SET_DATA', payload: { flowAstrologyInfo: info } });
        dispatch({ type: 'SET_VIEW', payload: AppState.FLOW_ASTROLOGY_LOADING });
        try {
            const data = await generateFlowAstrology(info, language);
            dispatch({ type: 'SET_DATA', payload: { flowAstrologyData: data } });
            saveItem({ type: 'flowAstrology', info, data });
            dispatch({ type: 'SET_VIEW', payload: AppState.FLOW_ASTROLOGY_RESULT });
        } catch (err) {
            console.error(err);
            dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? t(err.message as TranslationKey) || t('errorUnknown') : t('errorUnknown') });
            dispatch({ type: 'SET_VIEW', payload: AppState.FLOW_ASTROLOGY_FORM });
        }
    }, [language, t, saveItem, dispatch]);

    const handleGenerateCareerAdvice = useCallback(async (info: CareerInfo) => {
        trackFeatureUsage('careerAdvisor');
        dispatch({ type: 'SET_DATA', payload: { careerInfo: info } });
        dispatch({ type: 'SET_VIEW', payload: AppState.CAREER_ADVISOR_LOADING });
        try {
            const data = await getCareerAdvice(info, language);
            dispatch({ type: 'SET_DATA', payload: { careerAdviceData: data } });
            dispatch({ type: 'SET_VIEW', payload: AppState.CAREER_ADVISOR_RESULT });
        } catch (err) {
            console.error(err);
            dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? t(err.message as TranslationKey) || t('errorUnknown') : t('errorUnknown') });
            dispatch({ type: 'SET_VIEW', payload: AppState.CAREER_ADVISOR_FORM });
        }
    }, [language, t, dispatch]);

    const handleGenerateTalisman = useCallback(async (info: TalismanInfo) => {
        trackFeatureUsage('talisman');
        dispatch({ type: 'SET_DATA', payload: { talismanInfo: info } });
        dispatch({ type: 'SET_VIEW', payload: AppState.TALISMAN_LOADING });
        try {
            const data = await generateTalisman(info, language);
            dispatch({ type: 'SET_DATA', payload: { talismanData: data } });
            dispatch({ type: 'SET_VIEW', payload: AppState.TALISMAN_RESULT });
        } catch (err) {
            console.error(err);
            dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? t(err.message as TranslationKey) || t('errorUnknown') : t('errorUnknown') });
            dispatch({ type: 'SET_VIEW', payload: AppState.TALISMAN_GENERATOR });
        }
    }, [language, t, dispatch]);

    const handleGenerateAuspiciousName = useCallback(async (info: AuspiciousNamingInfo) => {
        trackFeatureUsage('auspiciousNaming');
        dispatch({ type: 'SET_DATA', payload: { auspiciousNamingInfo: info } });
        dispatch({ type: 'SET_VIEW', payload: AppState.AUSPICIOUS_NAMING_LOADING });
        try {
            const data = await generateAuspiciousName(info, language);
            dispatch({ type: 'SET_DATA', payload: { auspiciousNamingData: data } });
            saveItem({ type: 'auspiciousNaming', info, data });
            dispatch({ type: 'SET_VIEW', payload: AppState.AUSPICIOUS_NAMING_RESULT });
        } catch (err) {
            console.error(err);
            dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? t(err.message as TranslationKey) || t('errorUnknown') : t('errorUnknown') });
            dispatch({ type: 'SET_VIEW', payload: AppState.AUSPICIOUS_NAMING_FORM });
        }
    }, [language, t, saveItem, dispatch]);
    
    const handleGenerateBioEnergy = useCallback(async (card: BioEnergyCard) => {
        const { bioEnergyInfo, capturedEnergyColor } = state.data;
        if (!bioEnergyInfo || !capturedEnergyColor) return;
        trackFeatureUsage('bioEnergyReading');
        dispatch({ type: 'SET_DATA', payload: { drawnBioEnergyCard: card } });
        dispatch({ type: 'SET_VIEW', payload: AppState.BIO_ENERGY_LOADING });
        try {
        const data = await generateBioEnergyReading(bioEnergyInfo, capturedEnergyColor, card, language);
        dispatch({ type: 'SET_DATA', payload: { bioEnergyData: data } });
        saveItem({ type: 'bioEnergy', info: bioEnergyInfo, color: capturedEnergyColor, card, data });
        dispatch({ type: 'SET_VIEW', payload: AppState.BIO_ENERGY_RESULT });
        } catch (err) {
        console.error(err);
        dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? t(err.message as TranslationKey) || t('errorUnknown') : t('errorUnknown') });
        dispatch({ type: 'SET_VIEW', payload: AppState.BIO_ENERGY_FORM });
        }
    }, [state.data, language, t, saveItem, dispatch]);

    const handleGetFortuneStick = useCallback(async (info: FortuneStickInfo) => {
        trackFeatureUsage('fortuneSticks');
        dispatch({ type: 'SET_DATA', payload: { fortuneStickInfo: info } });
        dispatch({ type: 'SET_VIEW', payload: AppState.FORTUNE_STICKS_LOADING });
        try {
            const data = await getFortuneStickInterpretation(info, language);
            dispatch({ type: 'SET_DATA', payload: { fortuneStickData: data } });
            dispatch({ type: 'SET_VIEW', payload: AppState.FORTUNE_STICKS_RESULT });
        } catch (err) {
            console.error(err);
            dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? t(err.message as TranslationKey) || t('errorUnknown') : t('errorUnknown') });
            dispatch({ type: 'SET_VIEW', payload: AppState.FORTUNE_STICKS_SHAKE });
        }
    }, [language, t, dispatch]);

    const handleGetGodOfWealthBlessing = useCallback(async (info: GodOfWealthInfo) => {
        trackFeatureUsage('godOfWealth');
        dispatch({ type: 'SET_DATA', payload: { godOfWealthInfo: info } });
        dispatch({ type: 'SET_VIEW', payload: AppState.GOD_OF_WEALTH_LOADING });
        try {
            const data = await getGodOfWealthBlessing(info, language);
            dispatch({ type: 'SET_DATA', payload: { godOfWealthData: data } });
            saveItem({ type: 'godOfWealth', info, data });
            dispatch({ type: 'SET_VIEW', payload: AppState.GOD_OF_WEALTH_RESULT });
        } catch (err) {
            console.error(err);
            dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? t(err.message as TranslationKey) || t('errorUnknown') : t('errorUnknown') });
            dispatch({ type: 'SET_VIEW', payload: AppState.GOD_OF_WEALTH_BLESSING });
        }
    }, [language, t, saveItem, dispatch]);

    const handleGeneratePrayer = useCallback(async (info: PrayerRequestInfo) => {
        trackFeatureUsage('prayer');
        dispatch({ type: 'SET_DATA', payload: { prayerRequestInfo: info } });
        dispatch({ type: 'SET_VIEW', payload: AppState.PRAYER_GENERATOR_LOADING });
        try {
            const data = await generatePrayer(info, language);
            dispatch({ type: 'SET_DATA', payload: { prayerData: data } });
            saveItem({ type: 'prayer', info, data });
            dispatch({ type: 'SET_VIEW', payload: AppState.PRAYER_GENERATOR_RESULT });
        } catch (err) {
            console.error(err);
            dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? t(err.message as TranslationKey) || t('errorUnknown') : t('errorUnknown') });
            dispatch({ type: 'SET_VIEW', payload: AppState.PRAYER_GENERATOR_FORM });
        }
    }, [language, t, saveItem, dispatch]);

    const handleAnalyzeFengShui = useCallback(async (frames: string[], thumbnail: string) => {
        const { fengShuiInfo } = state.data;
        if (!fengShuiInfo) return;
        trackFeatureUsage('fengShui');
        dispatch({ type: 'SET_DATA', payload: { fengShuiThumbnail: thumbnail } });
        dispatch({ type: 'SET_VIEW', payload: AppState.FENG_SHUI_LOADING });
        try {
        const data = await analyzeFengShui(fengShuiInfo, frames, language);
        dispatch({ type: 'SET_DATA', payload: { fengShuiData: data } });
        saveItem({ type: 'fengShui', info: fengShuiInfo, data, thumbnail });
        dispatch({ type: 'SET_VIEW', payload: AppState.FENG_SHUI_RESULT });
        } catch (err) {
        console.error(err);
        dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? t(err.message as TranslationKey) || t('errorUnknown') : t('errorUnknown') });
        dispatch({ type: 'SET_VIEW', payload: AppState.FENG_SHUI_FORM });
        }
    }, [state.data.fengShuiInfo, language, t, saveItem, dispatch]);

    const handleCaptureImage = useCallback((imageDataUrl: string) => { dispatch({ type: 'SET_DATA', payload: { capturedImage: imageDataUrl } }); }, [dispatch]);
    const handleRetakeCapture = useCallback(() => { dispatch({ type: 'SET_DATA', payload: { capturedImage: null } }); dispatch({type: 'SET_ERROR', payload: null}); }, [dispatch]);
    const handleCapturePalmImage = useCallback((imageDataUrl: string) => { dispatch({ type: 'SET_DATA', payload: { capturedPalmImage: imageDataUrl } }); }, [dispatch]);
    const handleRetakePalmCapture = useCallback(() => { dispatch({ type: 'SET_DATA', payload: { capturedPalmImage: null } }); dispatch({type: 'SET_ERROR', payload: null}); }, [dispatch]);
    const handleCaptureHandwritingImage = useCallback((imageDataUrl: string) => { dispatch({ type: 'SET_DATA', payload: { capturedHandwritingImage: imageDataUrl } }); }, [dispatch]);
    const handleRetakeHandwritingCapture = useCallback(() => { dispatch({ type: 'SET_DATA', payload: { capturedHandwritingImage: null } }); dispatch({type: 'SET_ERROR', payload: null}); }, [dispatch]);
    const handleCaptureEnergy = useCallback((color: string) => { dispatch({ type: 'SET_DATA', payload: { capturedEnergyColor: color } }); dispatch({ type: 'SET_VIEW', payload: AppState.BIO_ENERGY_CARD_DRAW }); }, [dispatch]);
    
    const handleStartBioEnergy = useCallback((info: BioEnergyInfo) => { dispatch({ type: 'SET_DATA', payload: { bioEnergyInfo: info } }); dispatch({ type: 'SET_VIEW', payload: AppState.BIO_ENERGY_CAPTURE }); }, [dispatch]);
    const handleStartFengShui = useCallback((info: FengShuiInfo) => { dispatch({ type: 'SET_DATA', payload: { fengShuiInfo: info } }); dispatch({ type: 'SET_VIEW', payload: AppState.FENG_SHUI_CAPTURE }); }, [dispatch]);

     const handleViewItem = useCallback((item: SavedItem) => {
        const { payload } = item;
        switch (payload.type) {
            case 'astrology':
                dispatch({ type: 'SET_DATA', payload: { birthInfo: payload.birthInfo, chartData: payload.chartData } });
                dispatch({ type: 'SET_VIEW', payload: AppState.RESULT });
                break;
            case 'physiognomy':
                dispatch({ type: 'SET_DATA', payload: { capturedImage: payload.imageData, physiognomyData: payload.analysisData } });
                dispatch({ type: 'SET_VIEW', payload: AppState.FACE_SCAN_RESULT });
                break;
            case 'palmReading':
                dispatch({ type: 'SET_DATA', payload: { capturedPalmImage: payload.imageData, palmReadingData: payload.analysisData } });
                dispatch({ type: 'SET_VIEW', payload: AppState.PALM_SCAN_RESULT });
                break;
            case 'handwriting':
                dispatch({ type: 'SET_DATA', payload: { capturedHandwritingImage: payload.imageData, handwritingData: payload.analysisData } });
                dispatch({ type: 'SET_VIEW', payload: AppState.HANDWRITING_ANALYSIS_RESULT });
                break;
            case 'hoaTay':
                dispatch({ type: 'SET_DATA', payload: { hoaTayData: payload.analysisData } });
                dispatch({ type: 'SET_VIEW', payload: AppState.HOA_TAY_SCAN_RESULT });
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
            case 'godOfWealth':
                dispatch({ type: 'SET_DATA', payload: { godOfWealthInfo: payload.info, godOfWealthData: payload.data }});
                dispatch({ type: 'SET_VIEW', payload: AppState.GOD_OF_WEALTH_RESULT });
                break;
            case 'prayer':
                dispatch({ type: 'SET_DATA', payload: { prayerRequestInfo: payload.info, prayerData: payload.data }});
                dispatch({ type: 'SET_VIEW', payload: AppState.PRAYER_GENERATOR_RESULT });
                break;
            case 'fengShui':
                dispatch({ type: 'SET_DATA', payload: { fengShuiInfo: payload.info, fengShuiData: payload.data, fengShuiThumbnail: payload.thumbnail } });
                dispatch({ type: 'SET_VIEW', payload: AppState.FENG_SHUI_RESULT });
                break;
            default: break;
        }
    }, [dispatch]);

    return {
        handleGenerateChart, handleAnalyzeFace, handleAnalyzePalm, handleAnalyzeHandwriting, handleAnalyzeHoaTay,
        handleGenerateNumerology, handleGenerateFlowAstrology, handleGenerateCareerAdvice,
        handleGenerateTalisman, handleGenerateAuspiciousName, handleGenerateBioEnergy,
        handleGetFortuneStick, handleGetGodOfWealthBlessing, handleGeneratePrayer, handleAnalyzeFengShui,
        handleCaptureImage, handleRetakeCapture, handleCapturePalmImage, handleRetakePalmCapture,
        handleCaptureHandwritingImage, handleRetakeHandwritingCapture, handleCaptureEnergy,
        handleStartBioEnergy, handleStartFengShui, handleViewItem
    };
};