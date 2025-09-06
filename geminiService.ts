import type { BirthInfo, AstrologyChartData, PhysiognomyData, ZodiacHourData } from './types';

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
  } catch (error) {
    console.error("Error analyzing physiognomy:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Could not analyze face due to a connection error or server issue. Please try again.");
  }
};

export const findZodiacHours = async (date: { day: number, month: number, year: number }, language: string): Promise<ZodiacHourData> => {
    try {
        const data = await callProxy('findZodiacHours', { date, language });
        return data as ZodiacHourData;
    } catch (error) {
        console.error("Error finding zodiac hours:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Could not find zodiac hours due to a connection error or server issue. Please try again.");
    }
};
