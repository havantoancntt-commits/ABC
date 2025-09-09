import type { BirthInfo, AstrologyChartData, PhysiognomyData, CastResult, IChingInterpretation, NumerologyInfo, NumerologyData, PalmReadingData, TarotCard, TarotReadingData, FlowAstrologyInfo, FlowAstrologyData, AuspiciousDayInfo, AuspiciousDayData, HandwritingData, CareerInfo, CareerAdviceData, TalismanInfo, TalismanData, AuspiciousNamingInfo, AuspiciousNamingData, BioEnergyInfo, BioEnergyCard, BioEnergyData } from './types';

async function callProxy(operation: string, payload: object): Promise<any> {
    const response = await fetch('/api/gemini-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, payload }),
    });

    if (!response.ok) {
        if (response.status === 504) {
            throw new Error('The server took too long to respond (Gateway Timeout). This might be due to a complex request or high server load. Please try again in a moment.');
        }
        let errorMsg = 'An unknown error occurred while reading the server response.';
        try {
            const errorData = await response.json();
            errorMsg = errorData.error || `Server error: ${response.statusText || response.status}`;
        } catch (e) {
            // This catches cases where the response is not JSON, e.g., a Vercel 500 error page.
            errorMsg = `Failed to process server response (Error Code: ${response.status}). Please try again.`;
        }
        throw new Error(errorMsg);
    }

    return response.json();
}

export const generateAstrologyChart = async (info: BirthInfo, language: string): Promise<AstrologyChartData> => {
  try {
    const data = await callProxy('generateAstrologyChart', { info, language });
    return data as AstrologyChartData;
  } catch (error) {
    console.error("Error generating astrology chart:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Could not generate chart due to a connection error or server issue. Please try again.");
  }
};

export const analyzePhysiognomy = async (base64Image: string, language: string): Promise<PhysiognomyData> => {
  try {
    const data = await callProxy('analyzePhysiognomy', { base64Image, language });
    return data as PhysiognomyData;
  } catch (error)
 {
    console.error("Error analyzing physiognomy:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Could not analyze face due to a connection error or server issue. Please try again.");
  }
};

export const getIChingInterpretation = async (castResult: CastResult, question: string, language: string): Promise<IChingInterpretation> => {
    try {
        const data = await callProxy('getIChingInterpretation', { castResult, question, language });
        return data as IChingInterpretation;
    } catch (error) {
        console.error("Error getting I Ching interpretation:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Could not get interpretation due to a connection error or server issue. Please try again.");
    }
};

export const generateNumerologyChart = async (info: NumerologyInfo, language: string): Promise<NumerologyData> => {
    try {
        const data = await callProxy('generateNumerologyChart', { info, language });
        return data as NumerologyData;
    } catch (error) {
        console.error("Error generating numerology chart:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Could not generate numerology chart due to a connection error or server issue. Please try again.");
    }
};

export const analyzePalm = async (base64Image: string, language: string): Promise<PalmReadingData> => {
    try {
        const data = await callProxy('analyzePalm', { base64Image, language });
        return data as PalmReadingData;
    } catch (error) {
        console.error("Error analyzing palm:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Could not analyze palm due to a connection error or server issue. Please try again.");
    }
};

export const getTarotReading = async (cards: TarotCard[], question: string, language: string): Promise<TarotReadingData> => {
    try {
        const data = await callProxy('getTarotReading', { cards, question, language });
        return data as TarotReadingData;
    } catch (error) {
        console.error("Error getting Tarot reading:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Could not get Tarot reading due to a connection error or server issue. Please try again.");
    }
};

export const generateFlowAstrology = async (info: FlowAstrologyInfo, language: string): Promise<FlowAstrologyData> => {
    try {
        const data = await callProxy('generateFlowAstrology', { info, language });
        return data as FlowAstrologyData;
    } catch (error) {
        console.error("Error generating flow astrology chart:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Could not generate flow astrology chart due to a connection error or server issue. Please try again.");
    }
};

export const getAuspiciousDayAnalysis = async (info: AuspiciousDayInfo, language: string): Promise<AuspiciousDayData> => {
    try {
        const data = await callProxy('getAuspiciousDayAnalysis', { info, language });
        return data as AuspiciousDayData;
    } catch (error) {
        console.error("Error getting auspicious day analysis:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Could not get auspicious day analysis due to a connection error or server issue. Please try again.");
    }
};

export const analyzeHandwriting = async (base64Image: string, language: string): Promise<HandwritingData> => {
    try {
        const data = await callProxy('analyzeHandwriting', { base64Image, language });
        return data as HandwritingData;
    } catch (error) {
        console.error("Error analyzing handwriting:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Could not analyze handwriting due to a connection error or server issue. Please try again.");
    }
};

export const getCareerAdvice = async (info: CareerInfo, language: string): Promise<CareerAdviceData> => {
    try {
        const data = await callProxy('getCareerAdvice', { info, language });
        return data as CareerAdviceData;
    } catch (error) {
        console.error("Error getting career advice:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Could not get career advice due to a connection error or server issue. Please try again.");
    }
};

export const generateTalisman = async (info: TalismanInfo, language: string): Promise<TalismanData> => {
    try {
        const data = await callProxy('generateTalisman', { info, language });
        return data as TalismanData;
    } catch (error) {
        console.error("Error generating talisman:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Could not generate talisman due to a connection error or server issue. Please try again.");
    }
};

export const generateAuspiciousName = async (info: AuspiciousNamingInfo, language: string): Promise<AuspiciousNamingData> => {
    try {
        const data = await callProxy('generateAuspiciousName', { info, language });
        return data as AuspiciousNamingData;
    } catch (error) {
        console.error("Error generating auspicious name:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Could not generate name suggestions due to a connection error or server issue. Please try again.");
    }
};

export const generateBioEnergyReading = async (info: BioEnergyInfo, color: string, card: BioEnergyCard, language: string): Promise<BioEnergyData> => {
    try {
        const data = await callProxy('generateBioEnergyReading', { info, color, card, language });
        return data as BioEnergyData;
    } catch (error) {
        console.error("Error generating bio-energy reading:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Could not generate bio-energy reading due to a connection error or server issue. Please try again.");
    }
};
