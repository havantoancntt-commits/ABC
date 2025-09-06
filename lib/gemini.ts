import { GoogleGenAI, Type, BlockedReason } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import type { BirthInfo, AstrologyChartData, PhysiognomyData, ZodiacHourData } from './types';


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
        dayCanChi: { type: Type.STRING, description: 'Can Chi của ngày được chọn, ví dụ: "Ngày Canh Thân".' },
        hours: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: 'Tên giờ, ví dụ: "Tý", "Sửu".' },
                    timeRange: { type: Type.STRING, description: 'Khoảng thời gian, ví dụ: "23:00-01:00".' },
                    isAuspicious: { type: Type.BOOLEAN, description: 'True nếu là giờ Hoàng Đạo, false nếu là giờ Hắc Đạo.' },
                    governingStar: { type: Type.STRING, description: 'Tên sao cai quản giờ đó, ví dụ: "Thanh Long" hoặc "Thiên Hình".' },
                },
                required: ['name', 'timeRange', 'isAuspicious', 'governingStar'],
            },
        },
    },
    required: ['dayCanChi', 'hours'],
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

const VI_ZODIAC_HOUR_SYSTEM_INSTRUCTION = `Bạn là chuyên gia về lịch Can Chi và thuật chọn ngày giờ. Nhiệm vụ của bạn là xác định chính xác ngày Can Chi và các giờ Hoàng Đạo, Hắc Đạo cho một ngày dương lịch cụ thể, sau đó trả về kết quả dưới dạng JSON theo schema.
Quy tắc xác định giờ Hoàng Đạo:
- Dần, Thân khởi Tý.
- Mão, Dậu khởi Dần.
- Thìn, Tuất khởi Thìn.
- Tỵ, Hợi khởi Ngọ.
- Tý, Ngọ khởi Thân.
- Sửu, Mùi khởi Tuất.
Các sao Hoàng Đạo: Thanh Long, Minh Đường, Kim Quỹ, Thiên Đức, Ngọc Đường, Tư Mệnh.
Các sao Hắc Đạo: Thiên Hình, Chu Tước, Bạch Hổ, Thiên Lao, Nguyên Vũ, Câu Trận.
Yêu cầu:
1. Tính chính xác Can Chi cho ngày được cung cấp.
2. Liệt kê TẤT CẢ 12 giờ (từ Tý đến Hợi), mỗi giờ kèm theo khoảng thời gian 24h tương ứng.
3. Đánh dấu đúng 6 giờ Hoàng Đạo và 6 giờ Hắc Đạo.
4. Gán đúng tên sao cai quản cho từng giờ.`;

const EN_ZODIAC_HOUR_SYSTEM_INSTRUCTION = `You are an expert in the Can Chi (Stem-Branch) calendar and the art of date selection. Your task is to accurately determine the Can Chi day and the Auspicious (Hoàng Đạo) and Inauspicious (Hắc Đạo) hours for a specific Gregorian date, then return the result as a JSON object following the schema.
Rule for determining Auspicious Hours:
- Dần, Thân days start with Tý.
- Mão, Dậu days start with Dần.
- Thìn, Tuất days start with Thìn.
- Tỵ, Hợi days start with Ngọ.
- Tý, Ngọ days start with Thân.
- Sửu, Mùi days start with Tuất.
Auspicious Stars: Thanh Long, Minh Đường, Kim Quỹ, Thiên Đức, Ngọc Đường, Tư Mệnh.
Inauspicious Stars: Thiên Hình, Chu Tước, Bạch Hổ, Thiên Lao, Nguyên Vũ, Câu Trận.
Requirements:
1. Accurately calculate the Can Chi for the provided date.
2. List ALL 12 hours (from Tý to Hợi), each with its corresponding 24h time range.
3. Correctly identify the 6 Auspicious hours and 6 Inauspicious hours.
4. Assign the correct governing star name to each hour.`;


let ai: GoogleGenAI | null = null;
const getAI = () => {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set.");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
}

async function handleApiCall<T>(call: () => Promise<GenerateContentResponse>): Promise<T> {
    try {
        const response = await call();
        const responseText = response.text;

        if (!responseText) {
            const feedback = response.promptFeedback;
            console.error('Gemini response was blocked or empty. Feedback:', JSON.stringify(feedback, null, 2));
            let userMessage = 'Could not generate content. The response from the AI was empty or blocked by safety filters.';
            if (feedback?.blockReason) {
                const reason = feedback.blockReason === BlockedReason.SAFETY ? 'safety' : `other (${feedback.blockReason})`;
                userMessage = `Your request was blocked for ${reason} reasons. Please try again with different information.`;
            }
            throw new Error(userMessage);
        }

        try {
            return JSON.parse(responseText) as T;
        } catch (e) {
            console.error('Gemini response is not valid JSON:', responseText);
            throw new Error('The AI system returned an invalid data format. This may be a temporary issue, please try again.');
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            if (error.message.includes('API key not valid')) {
                throw new Error('The configured API key is invalid. Please contact the administrator.');
            }
            throw error;
        }
        throw new Error("An unexpected error occurred while communicating with the AI. Please try again.");
    }
}


export const generateAstrologyChart = async (info: BirthInfo, language: string): Promise<AstrologyChartData> => {
    const ai = getAI();
    const systemInstruction = language === 'en' ? EN_ASTROLOGY_SYSTEM_INSTRUCTION : VI_ASTROLOGY_SYSTEM_INSTRUCTION;
    const hourString = info.hour === -1 ? (language === 'en' ? 'Unknown' : 'Không rõ') : `${info.hour}:00`;
    const genderString = info.gender === 'male' ? (language === 'en' ? 'Male' : 'Nam') : (language === 'en' ? 'Female' : 'Nữ');
    const userPrompt = language === 'en'
        ? `Generate a detailed horoscope for:\n- Name: ${info.name}\n- Gender: ${genderString}\n- DOB: ${info.day}/${info.month}/${info.year}\n- TOB: ${hourString}`
        : `Lập lá số tử vi cho:\n- Tên: ${info.name}\n- Giới tính: ${genderString}\n- Ngày sinh: ${info.day}/${info.month}/${info.year}\n- Giờ sinh: ${hourString}`;

    return handleApiCall<AstrologyChartData>(() => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: astrologySchema,
            temperature: 0.7,
        },
    }));
};

export const analyzePhysiognomy = async (base64Image: string, language: string): Promise<PhysiognomyData> => {
    const ai = getAI();
    const systemInstruction = language === 'en' ? EN_PHYSIOGNOMY_SYSTEM_INSTRUCTION : VI_PHYSIOGNOMY_SYSTEM_INSTRUCTION;
    const promptText = language === 'en' ? "Analyze the physiognomy of the face in this image." : "Phân tích nhân tướng học cho khuôn mặt trong ảnh này.";
    const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image } };

    return handleApiCall<PhysiognomyData>(() => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [imagePart, { text: promptText }] },
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: physiognomySchema,
            temperature: 0.6,
        },
    }));
};

export const findZodiacHours = async (date: { day: number, month: number, year: number }, language: string): Promise<ZodiacHourData> => {
    const ai = getAI();
    const systemInstruction = language === 'en' ? EN_ZODIAC_HOUR_SYSTEM_INSTRUCTION : VI_ZODIAC_HOUR_SYSTEM_INSTRUCTION;
    const promptText = language === 'en'
        ? `Find the auspicious hours for the date: ${date.day}/${date.month}/${date.year}.`
        : `Tìm giờ hoàng đạo cho ngày: ${date.day}/${date.month}/${date.year}.`;

    return handleApiCall<ZodiacHourData>(() => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptText,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: zodiacHourSchema,
            temperature: 0.2,
        },
    }));
};