// @ts-ignore
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { BirthInfo } from '../types';

// This is a Vercel serverless function that acts as a secure proxy to the Google Gemini API.
// Create a folder named 'api' in your project root and place this file inside it.

export const config = {
  runtime: 'edge', // Use the Vercel Edge runtime for speed
};

// --- Schemas for Gemini API response validation ---
const palaceSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    stars: { type: Type.ARRAY, items: { type: Type.STRING } },
    interpretation: { type: Type.STRING },
  },
  required: ['name', 'stars', 'interpretation']
};

const astrologySchema = {
  type: Type.OBJECT,
  properties: {
    anSao: { type: Type.STRING, description: "Bảng an sao đầy đủ." },
    tongQuan: {
        type: Type.OBJECT,
        properties: {
            menh: { type: Type.STRING, description: "Luận giải tổng quan về cung Mệnh." },
            than: { type: Type.STRING, description: "Luận giải tổng quan về cung Thân." },
            thanCungName: { type: Type.STRING, description: "Tên của cung an Thân." },
        },
        required: ['menh', 'than', 'thanCungName']
    },
    cungMenh: palaceSchema, cungPhuMau: palaceSchema, cungPhucDuc: palaceSchema,
    cungDienTrach: palaceSchema, cungQuanLoc: palaceSchema, cungNoBoc: palaceSchema,
    cungThienDi: palaceSchema, cungTatAch: palaceSchema, cungTaiBach: palaceSchema,
    cungTuTuc: palaceSchema, cungPhuThe: palaceSchema, cungHuynhDe: palaceSchema,
    tongKet: { type: Type.STRING, description: "Tổng kết toàn bộ lá số và đưa ra lời khuyên." },
  },
  required: [
    'anSao', 'tongQuan', 'cungMenh', 'cungPhuMau', 'cungPhucDuc', 'cungDienTrach',
    'cungQuanLoc', 'cungNoBoc', 'cungThienDi', 'cungTatAch', 'cungTaiBach',
    'cungTuTuc', 'cungPhuThe', 'cungHuynhDe', 'tongKet'
  ]
};

const physiognomySchema = {
    type: Type.OBJECT,
    properties: {
        tongQuan: { type: Type.STRING, description: 'Luận giải tổng quan về thần thái, khí sắc.' },
        tamDinh: { type: Type.STRING, description: 'Phân tích chi tiết về Tam Đình (Thượng, Trung, Hạ).' },
        nguQuan: { type: Type.STRING, description: 'Phân tích chi tiết về Ngũ Quan (Mắt, Mũi, Miệng, Tai, Lông mày).' },
        loiKhuyen: { type: Type.STRING, description: 'Đưa ra lời khuyên hữu ích, mang tính xây dựng.' },
    },
    required: ['tongQuan', 'tamDinh', 'nguQuan', 'loiKhuyen']
};

// --- System Instructions for the AI Model ---
const ASTROLOGY_SYSTEM_INSTRUCTION = `Bạn là một chuyên gia Tử Vi Đẩu Số bậc thầy. Nhiệm vụ của bạn là lập một lá số tử vi chi tiết dựa trên thông tin được cung cấp và trả về kết quả dưới dạng JSON theo schema đã định sẵn. 
Yêu cầu:
1. Luận giải một cách sâu sắc, chính xác và dễ hiểu.
2. An sao phải chính xác. Nếu không rõ giờ sinh, hãy an theo giờ Tý và ghi chú điều này trong phần luận giải nếu cần.
3. Luận giải tổng quan Mệnh, Thân và xác định chính xác cung an Thân.
4. Luận giải chi tiết tất cả 12 cung.
5. Cung cấp một đoạn "Tổng kết" súc tích, tóm lược những điểm chính và đưa ra lời khuyên hữu ích, mang tính xây dựng.`;

const PHYSIOGNOMY_SYSTEM_INSTRUCTION = `Bạn là một bậc thầy về Nhân tướng học phương Đông. Nhiệm vụ của bạn là phân tích hình ảnh khuôn mặt được cung cấp và trả về kết quả dưới dạng JSON theo schema đã định sẵn.
Yêu cầu:
1. Phân tích tổng quan thần thái, khí sắc một cách sâu sắc.
2. Phân tích chi tiết Tam Đình (Thượng đình, Trung đình, Hạ đình).
3. Phân tích chi tiết Ngũ Quan (Mắt, Mũi, Miệng, Tai, Lông mày).
4. Đưa ra lời khuyên hữu ích, mang tính xây dựng và tích cực dựa trên phân tích.`;


// --- Main Handler ---
export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    const errorMessage = 'API Key chưa được cấu hình trên máy chủ. Vui lòng kiểm tra lại biến môi trường `API_KEY` trong cài đặt dự án và triển khai lại (redeploy).';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const { operation, payload } = await req.json();

    let response: GenerateContentResponse;

    if (operation === 'generateAstrologyChart') {
        const info: BirthInfo = payload.info;
        const hourString = info.hour === -1 ? 'Không rõ' : `${info.hour} giờ`;
        const userPrompt = `Lập lá số tử vi chi tiết cho người có thông tin sau:\n- Tên: ${info.name}\n- Giới tính: ${info.gender}\n- Ngày sinh (Dương Lịch): ${info.day}/${info.month}/${info.year}\n- Giờ sinh: ${hourString}`;
        
        response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: ASTROLOGY_SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: astrologySchema,
                temperature: 0.7,
            },
        });

    } else if (operation === 'analyzePhysiognomy') {
        const { base64Image } = payload;
        const promptText = "Phân tích nhân tướng học cho khuôn mặt trong ảnh này.";
        const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image } };
        response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, { text: promptText }] },
            config: {
                systemInstruction: PHYSIOGNOMY_SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: physiognomySchema,
                temperature: 0.6,
            },
        });
    } else {
        return new Response(JSON.stringify({ error: 'Invalid operation' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    const responseText = response.text;

    if (!responseText) {
        const feedback = response.promptFeedback;
        console.error('Gemini response was blocked or empty.', feedback);
        let userMessage = 'Không thể tạo nội dung. Phản hồi từ AI trống hoặc đã bị chặn bởi bộ lọc an toàn.';
        if (feedback?.blockReason) {
            userMessage = `Yêu cầu của bạn đã bị chặn vì lý do an toàn (${feedback.blockReason}). Vui lòng thử lại với thông tin khác.`;
        }
        return new Response(JSON.stringify({ error: userMessage }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        JSON.parse(responseText);
    } catch (e) {
        console.error('Gemini response is not valid JSON:', responseText);
        const userMessage = 'Hệ thống AI đã trả về một định dạng dữ liệu không hợp lệ. Xin lỗi vì sự bất tiện này, vui lòng thử lại.';
        return new Response(JSON.stringify({ error: userMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(responseText, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in Gemini proxy:', error);

    let userMessage = 'Đã xảy ra lỗi không mong muốn khi xử lý yêu cầu của bạn.';
    let statusCode = 500;
    
    const errorDetails = (error as any)?.details || (error as any)?.message || '';
    const errorString = (typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails)).toLowerCase();

    if (errorString.includes('api key not valid')) {
        userMessage = 'Lỗi xác thực API Key. Vui lòng kiểm tra lại giá trị API Key trên máy chủ.';
        statusCode = 401;
    } else if (errorString.includes('503') || errorString.includes('unavailable')) {
        userMessage = 'Hệ thống AI hiện đang quá tải. Xin vui lòng thử lại sau giây lát.';
        statusCode = 503;
    } else if (error instanceof Error) {
        userMessage = `Lỗi từ hệ thống AI: ${error.message}`;
    } else if (errorString) {
        userMessage = `Lỗi từ hệ thống AI: ${errorString}`;
    }
    
    return new Response(JSON.stringify({ error: userMessage }), { 
        status: statusCode, 
        headers: { 'Content-Type': 'application/json' } 
    });
  }
}
