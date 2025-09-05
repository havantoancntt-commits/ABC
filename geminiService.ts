import type { BirthInfo, AstrologyChartData, PhysiognomyData } from './types';

async function callProxy(operation: string, payload: object): Promise<any> {
    const response = await fetch('/api/gemini-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, payload }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Đã xảy ra lỗi không xác định.' }));
        if (response.status === 500 && errorData.error?.includes('API key not configured')) {
             throw new Error("Dịch vụ đang gặp lỗi cấu hình. Vui lòng quay lại sau.");
        }
        throw new Error(errorData.error || 'Không thể kết nối đến máy chủ. Vui lòng thử lại.');
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
        // Preserve specific user-facing errors from the proxy
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
        // Preserve specific user-facing errors from the proxy
        throw error;
    }
    throw new Error("Không thể phân tích nhân tướng do lỗi kết nối hoặc sự cố từ máy chủ. Vui lòng thử lại.");
  }
};
