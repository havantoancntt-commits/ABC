// This is a Vercel serverless function that acts as a secure proxy to the Google Gemini API.
import { GoogleGenAI, Type, BlockedReason } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import type { BirthInfo } from '../types';

// By removing the `export const config = { runtime: 'edge' };`, this function
// will default to the standard Node.js serverless runtime, which has a longer
// timeout. This is necessary because Gemini API calls for complex tasks can
// exceed the short timeout of the Edge runtime, causing a 504 error.
// The handler signature has been updated to match the Node.js runtime.

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
const ASTROLOGY_SYSTEM_INSTRUCTION = `Bạn là một chuyên gia Tử Vi Đẩu Số bậc thầy. Nhiệm vụ của bạn là lập một lá số tử vi chi tiết và trả về kết quả dưới dạng JSON theo schema đã định sẵn.
Yêu cầu:
1. Luận giải phải thật súc tích và ngắn gọn nhưng vẫn sâu sắc. Cố gắng giới hạn mỗi phần luận giải (cho từng cung, Mệnh, Thân, và tổng kết) trong khoảng 100-150 từ để đảm bảo phản hồi nhanh chóng.
2. An sao phải chính xác. Nếu không rõ giờ sinh, hãy an theo giờ Tý.
3. Luận giải tổng quan Mệnh, Thân và xác định chính xác cung an Thân.
4. Luận giải chi tiết tất cả 12 cung.
5. Cung cấp một đoạn "Tổng kết" ngắn gọn, tóm lược điểm chính và đưa ra lời khuyên hữu ích.`;

const PHYSIOGNOMY_SYSTEM_INSTRUCTION = `Bạn là một bậc thầy về Nhân tướng học phương Đông. Nhiệm vụ của bạn là phân tích hình ảnh khuôn mặt được cung cấp và trả về kết quả dưới dạng JSON theo schema đã định sẵn.
Yêu cầu:
1. Phân tích phải thật súc tích và đi thẳng vào vấn đề. Cố gắng giới hạn mỗi phần luận giải (Tổng quan, Tam Đình, Ngũ Quan, Lời khuyên) trong khoảng 100-150 từ.
2. Phân tích tổng quan thần thái, khí sắc.
3. Phân tích chi tiết Tam Đình (Thượng đình, Trung đình, Hạ đình).
4. Phân tích chi tiết Ngũ Quan (Mắt, Mũi, Miệng, Tai, Lông mày).
5. Đưa ra lời khuyên hữu ích, ngắn gọn, mang tính xây dựng và tích cực.`;

// --- Main Handler ---
// Corrected signature for Vercel's Node.js runtime
export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY environment variable not set on Vercel.");
      const errorMessage = 'API Key chưa được cấu hình trên máy chủ. Quản trị viên cần kiểm tra lại biến môi trường `API_KEY` trong cài đặt dự án và triển khai lại (redeploy).';
      return res.status(500).json({ error: errorMessage });
    }

    if (!req.body) {
      return res.status(400).json({ error: 'Yêu cầu không có nội dung.' });
    }

    const { operation, payload } = req.body;
    
    if(!operation || !payload) {
      return res.status(400).json({ error: 'Yêu cầu thiếu "operation" hoặc "payload".' });
    }

    const ai = new GoogleGenAI({ apiKey });
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
      return res.status(400).json({ error: 'Invalid operation specified' });
    }

    const responseText = response.text;

    if (!responseText) {
      const feedback = response.promptFeedback;
      console.error('Gemini response was blocked or empty. Feedback:', JSON.stringify(feedback, null, 2));
      let userMessage = 'Không thể tạo nội dung. Phản hồi từ AI trống hoặc đã bị chặn bởi bộ lọc an toàn.';
      if (feedback?.blockReason) {
        const reason = feedback.blockReason === BlockedReason.SAFETY ? 'an toàn' : `khác (${feedback.blockReason})`;
        userMessage = `Yêu cầu của bạn đã bị chặn vì lý do ${reason}. Vui lòng thử lại với thông tin khác.`;
      }
      return res.status(400).json({ error: userMessage });
    }

    let parsedJson;
    try {
      parsedJson = JSON.parse(responseText);
    } catch (e) {
      console.error('Gemini response is not valid JSON:', responseText);
      const userMessage = 'Hệ thống AI đã trả về một định dạng dữ liệu không hợp lệ. Đây có thể là sự cố tạm thời, vui lòng thử lại.';
      return res.status(500).json({ error: userMessage });
    }

    return res.status(200).json(parsedJson);

  } catch (error: unknown) {
    console.error('Critical error in Gemini proxy function:', error);
    let userMessage = 'Đã xảy ra lỗi không mong muốn khi xử lý yêu cầu của bạn.';
    let statusCode = 500;

    if (error instanceof Error) {
      const errorString = error.toString().toLowerCase();
      if (errorString.includes('api key not valid')) {
        userMessage = 'Lỗi xác thực API Key. Vui lòng kiểm tra lại giá trị API Key trên máy chủ.';
        statusCode = 401;
      } else if (errorString.includes('503') || errorString.includes('unavailable') || errorString.includes('resource has been exhausted')) {
        userMessage = 'Hệ thống AI hiện đang quá tải hoặc đã hết tài nguyên. Xin vui lòng thử lại sau giây lát.';
        statusCode = 503;
      } else {
        userMessage = `Đã xảy ra lỗi phía máy chủ. Vui lòng thử lại sau.`;
      }
    }
    
    if (!res.headersSent) {
      return res.status(statusCode).json({ error: userMessage });
    }
  }
}