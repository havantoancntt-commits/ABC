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

const zodiacHourSchema = {
  type: Type.OBJECT,
  properties: {
    dayCanChi: { type: Type.STRING, description: "Can Chi (Thiên Can, Địa Chi) của ngày được chọn." },
    hours: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Tên giờ theo Địa Chi (ví dụ: Tý, Sửu)." },
          timeRange: { type: Type.STRING, description: "Khoảng thời gian của giờ (ví dụ: 23:00-01:00)." },
          isAuspicious: { type: Type.BOOLEAN, description: "True nếu là giờ Hoàng Đạo (tốt), false nếu là giờ Hắc Đạo (xấu)." },
          governingStar: { type: Type.STRING, description: "Tên sao chủ quản giờ đó (ví dụ: Thanh Long, Bạch Hổ)." },
        },
        required: ['name', 'timeRange', 'isAuspicious', 'governingStar']
      }
    }
  },
  required: ['dayCanChi', 'hours']
};


// --- System Instructions for the AI Model ---
const VI_ASTROLOGY_SYSTEM_INSTRUCTION = `Bạn là một chuyên gia Tử Vi Đẩu Số bậc thầy. Nhiệm vụ của bạn là lập một lá số tử vi chi tiết và trả về kết quả dưới dạng JSON theo schema đã định sẵn.
Yêu cầu:
1. Luận giải phải thật súc tích và ngắn gọn nhưng vẫn sâu sắc. Cố gắng giới hạn mỗi phần luận giải (cho từng cung, Mệnh, Thân, và tổng kết) trong khoảng 100-150 từ để đảm bảo phản hồi nhanh chóng.
2. An sao phải chính xác. Nếu không rõ giờ sinh, hãy an theo giờ Tý. Cung an Thân phải được xác định chính xác.
3. Luận giải tổng quan Mệnh, Thân và xác định chính xác cung an Thân ('thanCungName').
4. Luận giải chi tiết tất cả 12 cung. Tên các cung phải bằng tiếng Việt (ví dụ: 'Cung Mệnh', 'Cung Phụ Mẫu').
5. Cung cấp một đoạn "Tổng kết" ngắn gọn, tóm lược điểm chính và đưa ra lời khuyên hữu ích.`;

const EN_ASTROLOGY_SYSTEM_INSTRUCTION = `You are a master astrologer of Tử Vi Đẩu Số (Purple Star Astrology). Your task is to create a detailed horoscope and return the result as a JSON object following the predefined schema.
Requirements:
1. The interpretation must be concise yet profound. Limit each interpretation section (for each palace, Mệnh, Thân, and summary) to about 100-150 words to ensure a quick response.
2. The star placement must be accurate. If the birth hour is unknown, use the Hour of the Rat (Tý). The Thân palace must be identified correctly.
3. Provide a general interpretation of Mệnh (Destiny) and Thân (Body), and accurately identify the palace where Thân resides ('thanCungName').
4. Provide detailed interpretations for all 12 palaces. The palace names must be in Vietnamese (e.g., 'Cung Mệnh', 'Cung Phụ Mẫu').
5. Provide a brief "Summary" that highlights the key points and offers useful advice.`;

const VI_PHYSIOGNOMY_SYSTEM_INSTRUCTION = `Bạn là một bậc thầy về Nhân tướng học phương Đông. Nhiệm vụ của bạn là phân tích hình ảnh khuôn mặt được cung cấp và trả về kết quả dưới dạng JSON theo schema đã định sẵn.
Yêu cầu:
1. Phân tích phải thật súc tích và đi thẳng vào vấn đề. Cố gắng giới hạn mỗi phần luận giải (Tổng quan, Tam Đình, Ngũ Quan, Lời khuyên) trong khoảng 100-150 từ.
2. Phân tích tổng quan thần thái, khí sắc.
3. Phân tích chi tiết Tam Đình (Thượng đình, Trung đình, Hạ đình).
4. Phân tích chi tiết Ngũ Quan (Mắt, Mũi, Miệng, Tai, Lông mày).
5. Đưa ra lời khuyên hữu ích, ngắn gọn, mang tính xây dựng và tích cực.`;

const EN_PHYSIOGNOMY_SYSTEM_INSTRUCTION = `You are a master of Eastern physiognomy. Your task is to analyze the provided facial image and return the result as a JSON object following the predefined schema.
Requirements:
1. The analysis must be concise and to the point. Limit each analysis section (Overview, Three Sections, Five Organs, Advice) to about 100-150 words.
2. Analyze the overall spirit and complexion (thần thái, khí sắc).
3. Provide a detailed analysis of the Three Sections (Tam Đình: Upper, Middle, Lower).
4. Provide a detailed analysis of the Five Organs (Ngũ Quan: Eyes, Nose, Mouth, Ears, Eyebrows).
5. Provide useful, concise, constructive, and positive advice.`;

const VI_ZODIAC_HOUR_SYSTEM_INSTRUCTION = `Bạn là một chuyên gia về lịch pháp Âm lịch và Can Chi. Nhiệm vụ của bạn là tính toán và trả về các giờ Hoàng Đạo và Hắc Đạo cho một ngày cụ thể.
Yêu cầu:
1. Tính chính xác Can Chi cho ngày được cung cấp.
2. Liệt kê tất cả 12 giờ trong ngày theo Địa Chi (Tý đến Hợi).
3. Xác định mỗi giờ là Hoàng Đạo (tốt) hay Hắc Đạo (xấu).
4. Gán đúng sao chủ quản cho từng giờ (ví dụ: Thanh Long, Minh Đường cho giờ tốt; Thiên Hình, Chu Tước cho giờ xấu).
5. Trả về kết quả dưới dạng JSON theo schema đã định sẵn.`;

const EN_ZODIAC_HOUR_SYSTEM_INSTRUCTION = `You are an expert in the Lunar calendar and the Heavenly Stems & Earthly Branches system. Your task is to calculate and return the auspicious (Hoàng Đạo) and inauspicious (Hắc Đạo) hours for a specific day.
Requirements:
1. Accurately calculate the Stem-Branch (Can Chi) for the given day.
2. List all 12 two-hour periods of the day according to the Earthly Branches (from Tý/Zi to Hợi/Hai).
3. Determine whether each hour is auspicious (good) or inauspicious (bad).
4. Assign the correct governing star to each hour (e.g., Azure Dragon, Bright Hall for good hours; Celestial Punishment, Vermilion Bird for bad hours).
5. Return the result as a JSON object following the predefined schema.`;

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
      const errorMessage = 'API Key is not configured on the server. The administrator needs to check the `API_KEY` environment variable in the project settings and redeploy.';
      return res.status(500).json({ error: errorMessage });
    }

    if (!req.body) {
      return res.status(400).json({ error: 'Request body is missing.' });
    }

    const { operation, payload } = req.body;
    
    if(!operation || !payload) {
      return res.status(400).json({ error: 'Request is missing "operation" or "payload".' });
    }

    const ai = new GoogleGenAI({ apiKey });
    let response: GenerateContentResponse;

    if (operation === 'generateAstrologyChart') {
      const { info, language }: { info: BirthInfo, language: 'vi' | 'en' } = payload;
      const systemInstruction = language === 'en' ? EN_ASTROLOGY_SYSTEM_INSTRUCTION : VI_ASTROLOGY_SYSTEM_INSTRUCTION;
      
      const hourString = info.hour === -1 
        ? (language === 'en' ? 'Unknown' : 'Không rõ') 
        : `${info.hour}:00`;
        
      const genderString = info.gender === 'male'
        ? (language === 'en' ? 'Male' : 'Nam')
        : (language === 'en' ? 'Female' : 'Nữ');
        
      const userPrompt = language === 'en'
        ? `Generate a detailed horoscope for the following person:\n- Name: ${info.name}\n- Gender: ${genderString}\n- Date of Birth (Gregorian): ${info.day}/${info.month}/${info.year}\n- Time of Birth: ${hourString}`
        : `Lập lá số tử vi chi tiết cho người có thông tin sau:\n- Tên: ${info.name}\n- Giới tính: ${genderString}\n- Ngày sinh (Dương Lịch): ${info.day}/${info.month}/${info.year}\n- Giờ sinh: ${hourString}`;
      
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: astrologySchema,
          temperature: 0.7,
        },
      });
    } else if (operation === 'analyzePhysiognomy') {
      const { base64Image, language } = payload;
      const systemInstruction = language === 'en' ? EN_PHYSIOGNOMY_SYSTEM_INSTRUCTION : VI_PHYSIOGNOMY_SYSTEM_INSTRUCTION;
      const promptText = language === 'en' ? "Analyze the physiognomy of the face in this image." : "Phân tích nhân tướng học cho khuôn mặt trong ảnh này.";
      const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image } };
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [imagePart, { text: promptText }] },
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: physiognomySchema,
          temperature: 0.6,
        },
      });
    } else if (operation === 'findZodiacHours') {
        const { date, language } = payload;
        const systemInstruction = language === 'en' ? EN_ZODIAC_HOUR_SYSTEM_INSTRUCTION : VI_ZODIAC_HOUR_SYSTEM_INSTRUCTION;
        
        const userPrompt = language === 'en'
            ? `Find the auspicious and inauspicious hours for the date: ${date.day}/${date.month}/${date.year}`
            : `Tìm giờ Hoàng Đạo và Hắc Đạo cho ngày: ${date.day}/${date.month}/${date.year}`;
        
        response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: zodiacHourSchema,
                temperature: 0.2,
            },
        });
    } else {
      return res.status(400).json({ error: 'Invalid operation specified' });
    }

    const responseText = response.text;

    if (!responseText) {
      const feedback = response.promptFeedback;
      console.error('Gemini response was blocked or empty. Feedback:', JSON.stringify(feedback, null, 2));
      let userMessage = 'Could not generate content. The response from the AI was empty or blocked by safety filters.';
      if (feedback?.blockReason) {
        const reason = feedback.blockReason === BlockedReason.SAFETY ? 'safety' : `other (${feedback.blockReason})`;
        userMessage = `Your request was blocked for ${reason} reasons. Please try again with different information.`;
      }
      return res.status(400).json({ error: userMessage });
    }

    let parsedJson;
    try {
      parsedJson = JSON.parse(responseText);
    } catch (e) {
      console.error('Gemini response is not valid JSON:', responseText);
      const userMessage = 'The AI system returned an invalid data format. This may be a temporary issue, please try again.';
      return res.status(500).json({ error: userMessage });
    }

    return res.status(200).json(parsedJson);

  } catch (error: unknown) {
    console.error('Critical error in Gemini proxy function:', error);
    let userMessage = 'An unexpected error occurred while processing your request.';
    let statusCode = 500;

    if (error instanceof Error) {
      const errorString = error.toString().toLowerCase();
      if (errorString.includes('api key not valid')) {
        userMessage = 'API Key validation failed. Please check the server-side API Key.';
        statusCode = 401;
      } else if (errorString.includes('503') || errorString.includes('unavailable') || errorString.includes('resource has been exhausted')) {
        userMessage = 'The AI system is currently overloaded or has exhausted its resources. Please try again in a few moments.';
        statusCode = 503;
      } else {
        userMessage = `A server-side error occurred. Please try again later.`;
      }
    }
    
    if (!res.headersSent) {
      return res.status(statusCode).json({ error: userMessage });
    }
  }
}