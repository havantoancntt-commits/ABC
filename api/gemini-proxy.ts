// This is a Vercel serverless function that acts as a secure proxy to the Google Gemini API.
import { GoogleGenAI, Type, BlockedReason } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
// FIX: Corrected the import path to resolve to the correct types file which exports CastResult.
import type { BirthInfo, CastResult } from '../lib/types';

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

const iChingSchema = {
    type: Type.OBJECT,
    properties: {
        tongQuan: { type: Type.STRING, description: 'Luận giải tổng quan, sâu sắc về quẻ trong bối cảnh câu hỏi của người dùng. Diễn giải hiện đại, dễ hiểu.' },
        thoanTu: { type: Type.STRING, description: 'Diễn giải Thoán từ (lời quẻ) của quẻ chính.' },
        hinhTuong: { type: Type.STRING, description: 'Diễn giải Hình tượng (lời tượng) của quẻ chính.' },
        haoDong: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    line: { type: Type.INTEGER, description: 'Thứ tự của hào động (1-6).' },
                    interpretation: { type: Type.STRING, description: 'Luận giải chi tiết ý nghĩa của hào động này.' }
                },
                required: ['line', 'interpretation']
            }
        },
        queBienDoi: { type: Type.STRING, description: 'Luận giải về quẻ biến đổi, mô tả xu hướng và kết quả tương lai. Nếu không có hào động thì trả về null.' }
    },
    required: ['tongQuan', 'thoanTu', 'hinhTuong', 'haoDong', 'queBienDoi']
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

const VI_ICHING_SYSTEM_INSTRUCTION = `Bạn là một bậc thầy uyên thâm về Kinh Dịch. Nhiệm vụ của bạn là luận giải một quẻ Dịch và trả về kết quả dưới dạng JSON theo schema đã định sẵn.
Yêu cầu:
1. Luận giải phải sâu sắc, kết hợp triết lý cổ xưa với góc nhìn hiện đại, phù hợp với câu hỏi của người dùng.
2. 'tongQuan': Luận giải tổng quát ý nghĩa của quẻ chính trong bối cảnh câu hỏi. Đây là phần quan trọng nhất, cần phải rõ ràng, mang tính định hướng.
3. 'thoanTu': Diễn giải ngắn gọn ý nghĩa của Thoán từ (lời quẻ).
4. 'hinhTuong': Diễn giải ngắn gọn ý nghĩa của Hình tượng (lời tượng).
5. 'haoDong': Luận giải từng hào động. Đây là chìa khóa của quẻ, cần phân tích kỹ lưỡng nhất. Giải thích tại sao hào đó động và nó báo hiệu điều gì.
6. 'queBienDoi': Luận giải ý nghĩa của quẻ biến, cho thấy xu hướng và kết quả cuối cùng của sự việc. Nếu không có hào động, trả về null cho trường này.
7. Giữ giọng văn trang trọng, uyên bác nhưng dễ hiểu.`;

const EN_ICHING_SYSTEM_INSTRUCTION = `You are a profound master of the I Ching. Your task is to interpret a hexagram and return the result as a JSON object following the predefined schema.
Requirements:
1. The interpretation must be insightful, combining ancient philosophy with a modern perspective relevant to the user's question.
2. 'tongQuan' (Overall Interpretation): Provide a general interpretation of the primary hexagram in the context of the question. This is the most crucial part and should be clear and guiding.
3. 'thoanTu' (The Judgment): Briefly explain the meaning of the Judgment text.
4. 'hinhTuong' (The Image): Briefly explain the meaning of the Image text.
5. 'haoDong' (Changing Lines): Interpret each changing line. This is the key to the reading and requires the most thorough analysis. Explain why the line is changing and what it signifies.
6. 'queBienDoi' (Transformed Hexagram): Interpret the meaning of the transformed hexagram, indicating the trend and final outcome. If there are no changing lines, return null for this field.
7. Maintain a formal, wise, yet understandable tone.`;


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
    } else if (operation === 'getIChingInterpretation') {
        const { castResult, question, language }: { castResult: CastResult, question: string, language: 'vi' | 'en' } = payload;
        const systemInstruction = language === 'en' ? EN_ICHING_SYSTEM_INSTRUCTION : VI_ICHING_SYSTEM_INSTRUCTION;
        
        const primaryName = castResult.primaryHexagram.name[language];
        const secondaryName = castResult.secondaryHexagram?.name[language] || (language === 'en' ? 'None' : 'Không có');
        const changingLines = castResult.changingLinesIndices.map(i => i + 1).join(', ') || (language === 'en' ? 'None' : 'Không có');
        
        const userPrompt = language === 'en'
        ? `Interpret the following I Ching reading:\n- User's Question: "${question || 'A general question about my current situation.'}"\n- Primary Hexagram: ${castResult.primaryHexagram.number}. ${primaryName}\n- Changing Lines: ${changingLines}\n- Secondary Hexagram: ${secondaryName}`
        : `Luận giải quẻ Kinh Dịch sau:\n- Câu hỏi: "${question || 'Một câu hỏi chung về tình hình hiện tại.'}"\n- Quẻ Chính: ${castResult.primaryHexagram.number}. ${primaryName}\n- Hào Động: ${changingLines}\n- Quẻ Biến: ${secondaryName}`;

        response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: iChingSchema,
                temperature: 0.8,
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