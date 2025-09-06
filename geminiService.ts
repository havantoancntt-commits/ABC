import type { BirthInfo, AstrologyChartData, PhysiognomyData } from './types';

async function callProxy(operation: string, payload: object): Promise<any> {
    const response = await fetch('/api/gemini-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, payload }),
    });

    if (!response.ok) {
        if (response.status === 504) {
            throw new Error('Máy chủ mất quá nhiều thời gian để phản hồi (Gateway Timeout). Điều này có thể do yêu cầu phức tạp hoặc hệ thống đang quá tải. Vui lòng thử lại sau giây lát.');
        }
        let errorMsg = 'Đã xảy ra lỗi không xác định khi đọc phản hồi từ máy chủ.';
        try {
            const errorData = await response.json();
            errorMsg = errorData.error || `Lỗi máy chủ: ${response.statusText || response.status}`;
        } catch (e) {
            // This catches cases where the response is not JSON, e.g., a Vercel 500 error page.
            errorMsg = `Không thể xử lý phản hồi từ máy chủ (Mã lỗi: ${response.status}). Vui lòng thử lại.`;
        }
        throw new Error(errorMsg);
    }

    return response.json();
}

export const generateAstrologyChart = async (info: BirthInfo): Promise<AstrologyChartData> => {
  try {
    const data = await callProxy('generateAstrologyChart', { info });
    return data as AstrologyChartData;
  } catch (error) {
    console.error("Lỗi khi tạo lá số tử vi:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Không thể tạo lá số do lỗi kết nối hoặc sự cố từ máy chủ. Vui lòng thử lại.");
  }
};

export const analyzePhysiognomy = async (base64Image: string): Promise<PhysiognomyData> => {
  try {
    const data = await callProxy('analyzePhysiognomy', { base64Image });
    return data as PhysiognomyData;
  } catch (error) {
    console.error("Lỗi khi phân tích nhân tướng:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Không thể phân tích nhân tướng do lỗi kết nối hoặc sự cố từ máy chủ. Vui lòng thử lại.");
  }
};