// @ts-ignore
import { GoogleGenAI, Type } from "@google/genai";
import type { BirthInfo } from '../types';

// This is a Vercel serverless function that acts as a secure proxy to the Google Gemini API.
// Create a folder named 'api' in your project root and place this file inside it.

export const config = {
  runtime: 'edge', // Use the Vercel Edge runtime for speed
};

// Schemas for Gemini API response validation (kept on the server)
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
        tongQuan: { type: Type.STRING, description: 'Luận giải tổng quan về thần thái.' },
        tamDinh: { type: Type.STRING, description: 'Phân tích chi tiết về Tam Đình.' },
        nguQuan: { type: Type.STRING, description: 'Phân tích chi tiết về Ngũ Quan.' },
        loiKhuyen: { type: Type.STRING, description: 'Đưa ra lời khuyên hữu ích.' },
    },
    required: ['tongQuan', 'tamDinh', 'nguQuan', 'loiKhuyen']
};


const getAstrologyPrompt = (info: BirthInfo) => {
    const hourString = info.hour === -1 ? 'Không rõ' : `${info.hour} giờ`;
    return `Bạn là một chuyên gia Tử Vi Đẩu Số bậc thầy. Lập lá số tử vi chi tiết cho:
        - Tên: ${info.name}
        - Giới tính: ${info.gender}
        - Ngày sinh (Dương Lịch): ${info.day}/${info.month}/${info.year}
        - Giờ sinh: ${hourString}
    Yêu cầu:
    1. Lập lá số đầy đủ, an sao chính xác. Nếu không rõ giờ sinh, an theo giờ Tý và ghi chú rõ ràng.
    2. Luận giải tổng quan Mệnh, Thân và xác định cung an Thân.
    3. Luận giải chi tiết 12 cung.
    4. Viết một đoạn "Tổng kết" tóm lược và đưa ra lời khuyên.
    5. Cung cấp kết quả dưới định dạng JSON theo schema.`;
}

const getPhysiognomyPrompt = () => `
    Bạn là một bậc thầy về Nhân tướng học phương Đông. Phân tích hình ảnh khuôn mặt được cung cấp.
    Yêu cầu:
    1. Phân tích tổng quan thần thái, khí sắc.
    2. Phân tích Tam Đình.
    3. Phân tích Ngũ Quan.
    4. Đưa ra lời khuyên hữu ích.
    5. Cung cấp kết quả dưới định dạng JSON theo schema.`;


export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured on server' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const { operation, payload } = await req.json();

    let response;

    if (operation === 'generateAstrologyChart') {
        const { info } = payload;
        const prompt = getAstrologyPrompt(info);
        response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: astrologySchema,
                temperature: 0.7,
            },
        });

    } else if (operation === 'analyzePhysiognomy') {
        const { base64Image } = payload;
        const prompt = getPhysiognomyPrompt();
        const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image } };
        response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: physiognomySchema,
                temperature: 0.6,
            },
        });
    } else {
        return new Response(JSON.stringify({ error: 'Invalid operation' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Check for blocked or empty response to prevent serverless function from crashing
    if (!response || !response.candidates || response.candidates.length === 0) {
        const feedback = response?.promptFeedback;
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

    // The SDK's response.text is already a stringified JSON when a schema is used.
    // Accessing .text might throw if the response was blocked, which we now handle above.
    return new Response(response.text, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in Gemini proxy:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: `An error occurred while processing your request: ${errorMessage}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
