import type { BirthInfo, AstrologyChartData, PhysiognomyData, CastResult, IChingInterpretation, NumerologyInfo, NumerologyData, PalmReadingData, TarotCard, TarotReadingData, FlowAstrologyInfo, FlowAstrologyData, AuspiciousDayInfo, AuspiciousDayData, HandwritingData, CareerInfo, CareerAdviceData, TalismanInfo, TalismanData, AuspiciousNamingInfo, AuspiciousNamingData, BioEnergyInfo, BioEnergyCard, BioEnergyData, FortuneStickInfo, FortuneStickData, GodOfWealthInfo, GodOfWealthData, PrayerRequestInfo, PrayerData, FengShuiInfo, FengShuiData, HoaTayData, FingerprintAnalysisData } from './types';

async function callProxy(operation: string, payload: object): Promise<any> {
    const response = await fetch('/api/gemini-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, payload }),
    });

    if (!response.ok) {
        if (response.status === 504) {
            // Throw a specific key for timeout errors that can be translated on the frontend.
            throw new Error('error_server_timeout');
        }
        let errorMsg = 'An unknown server error occurred.';
        try {
            const errorData = await response.json();
            // The error key (e.g., 'error_ai_overloaded') will be used for translation on the frontend
            errorMsg = errorData.error || `Server Error: ${response.status}`;
        } catch (e) {
            // This catches cases where the response is not JSON, e.g., a Vercel 500 HTML page.
             errorMsg = `Server returned a non-JSON response (Status: ${response.status}).`;
        }
        // Throw the error message directly, which will be caught by the UI component
        throw new Error(errorMsg);
    }

    return response.json();
}

export const generateAstrologyChart = (info: BirthInfo, language: string): Promise<AstrologyChartData> => {
  return callProxy('generateAstrologyChart', { info, language });
};

export const analyzePhysiognomy = (base64Image: string, language: string): Promise<PhysiognomyData> => {
  return callProxy('analyzePhysiognomy', { base64Image, language });
};

export const getIChingInterpretation = (castResult: CastResult, question: string, language: string): Promise<IChingInterpretation> => {
    return callProxy('getIChingInterpretation', { castResult, question, language });
};

export const generateNumerologyChart = (info: NumerologyInfo, language: string): Promise<NumerologyData> => {
    return callProxy('generateNumerologyChart', { info, language });
};

export const analyzePalm = (base64Image: string, language: string): Promise<PalmReadingData> => {
    return callProxy('analyzePalm', { base64Image, language });
};

export const getTarotReading = (cards: TarotCard[], question: string, language: string): Promise<TarotReadingData> => {
    return callProxy('getTarotReading', { cards, question, language });
};

export const generateFlowAstrology = (info: FlowAstrologyInfo, language: string): Promise<FlowAstrologyData> => {
    return callProxy('generateFlowAstrology', { info, language });
};

export const getAuspiciousDayAnalysis = (info: AuspiciousDayInfo, language: string): Promise<AuspiciousDayData> => {
    return callProxy('getAuspiciousDayAnalysis', { info, language });
};

export const analyzeHandwriting = (base64Image: string, language: string): Promise<HandwritingData> => {
    return callProxy('analyzeHandwriting', { base64Image, language });
};

export const getCareerAdvice = (info: CareerInfo, language: string): Promise<CareerAdviceData> => {
    return callProxy('getCareerAdvice', { info, language });
};

export const generateTalisman = (info: TalismanInfo, language: string): Promise<TalismanData> => {
    return callProxy('generateTalisman', { info, language });
};

export const generateAuspiciousName = (info: AuspiciousNamingInfo, language: string): Promise<AuspiciousNamingData> => {
    return callProxy('generateAuspiciousName', { info, language });
};

export const generateBioEnergyReading = (info: BioEnergyInfo, color: string, card: BioEnergyCard, language: string): Promise<BioEnergyData> => {
    return callProxy('generateBioEnergyReading', { info, color, card, language });
};

export const getFortuneStickInterpretation = (info: FortuneStickInfo, language: string): Promise<FortuneStickData> => {
    return callProxy('getFortuneStickInterpretation', { info, language });
};

export const getGodOfWealthBlessing = (info: GodOfWealthInfo, language: string): Promise<GodOfWealthData> => {
    return callProxy('getGodOfWealthBlessing', { info, language });
};

export const generatePrayer = (info: PrayerRequestInfo, language: string): Promise<PrayerData> => {
    return callProxy('generatePrayer', { info, language });
};

export const analyzeFengShui = (info: FengShuiInfo, videoFrames: string[], language: string): Promise<FengShuiData> => {
    return callProxy('analyzeFengShui', { info, videoFrames, language });
};

export const analyzeHoaTay = (counts: { leftHandWhorls: number, rightHandWhorls: number }, language: string): Promise<HoaTayData> => {
    return callProxy('analyzeHoaTay', { counts, language });
};

export const analyzeFingerprint = (base64Image: string, language: string): Promise<FingerprintAnalysisData> => {
    return callProxy('analyzeFingerprint', { base64Image, language });
};