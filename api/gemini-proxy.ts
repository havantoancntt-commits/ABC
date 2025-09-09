import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import type { BirthInfo, CastResult, NumerologyInfo, TarotCard, FlowAstrologyInfo, AuspiciousDayInfo, CareerInfo, TalismanInfo, AuspiciousNamingInfo, BioEnergyInfo, BioEnergyCard } from '../lib/types';

// Initialize the Gemini client. Ensure API_KEY is set in Vercel environment variables.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

// --- Default Safety Settings ---
const defaultSafetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

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

const palmReadingSchema = {
    type: Type.OBJECT,
    properties: {
        tongQuan: { type: Type.STRING, description: 'Luận giải tổng quan về hình dáng bàn tay, gò, và các dấu hiệu đặc biệt.' },
        duongTamDao: { type: Type.STRING, description: 'Phân tích chi tiết về đường Tâm Đạo (tình duyên, cảm xúc).' },
        duongTriDao: { type: Type.STRING, description: 'Phân tích chi tiết về đường Trí Đạo (trí tuệ, tư duy, sự nghiệp).' },
        duongSinhDao: { type: Type.STRING, description: 'Phân tích chi tiết về đường Sinh Đạo (sức khỏe, năng lượng sống).' },
        loiKhuyen: { type: Type.STRING, description: 'Đưa ra lời khuyên hữu ích dựa trên toàn bộ phân tích.' },
    },
    required: ['tongQuan', 'duongTamDao', 'duongTriDao', 'duongSinhDao', 'loiKhuyen']
};

const handwritingSchema = {
    type: Type.OBJECT,
    properties: {
        tongQuan: { type: Type.STRING, description: 'Luận giải tổng quan về năng lượng, nhịp điệu, tốc độ và sự rõ ràng của chữ viết.' },
        khongGian: { type: Type.STRING, description: 'Phân tích cách sử dụng không gian: lề, khoảng cách giữa các từ, dòng.' },
        netChu: { type: Type.STRING, description: 'Phân tích các đặc điểm chi tiết: độ nghiêng, kích thước, độ đậm nhạt, các vòng lặp.' },
        chuKy: { type: Type.STRING, description: 'Phân tích chữ ký, so sánh với chữ viết và ý nghĩa về con người xã hội.' },
        loiKhuyen: { type: Type.STRING, description: 'Đưa ra lời khuyên hữu ích, mang tính xây dựng dựa trên phân tích.' },
    },
    required: ['tongQuan', 'khongGian', 'netChu', 'chuKy', 'loiKhuyen']
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

const numerologyNumberSchema = {
    type: Type.OBJECT,
    properties: {
        number: { type: Type.INTEGER, description: "Con số chủ đạo (ví dụ: 8, 11, 22)." },
        interpretation: { type: Type.STRING, description: "Luận giải chi tiết về ý nghĩa của con số này và ảnh hưởng của nó." }
    },
    required: ['number', 'interpretation']
};

const numerologyArrowSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Tên của mũi tên (ví dụ: Mũi tên Quyết tâm)." },
        interpretation: { type: Type.STRING, description: "Luận giải ngắn gọn về ý nghĩa và ảnh hưởng của mũi tên này." }
    },
    required: ['name', 'interpretation']
};

const birthdayChartSchema = {
    type: Type.OBJECT,
    properties: {
        numberCounts: {
            type: Type.ARRAY,
            items: { type: Type.INTEGER },
            description: "Một mảng 9 phần tử (index 0-8 tương ứng với số 1-9) chứa số lần xuất hiện của mỗi chữ số trong ngày sinh."
        },
        strengthArrows: {
            type: Type.ARRAY,
            items: numerologyArrowSchema,
            description: "Danh sách các mũi tên sức mạnh được hình thành trong biểu đồ."
        },
        weaknessArrows: {
            type: Type.ARRAY,
            items: numerologyArrowSchema,
            description: "Danh sách các mũi tên trống (điểm yếu cần cải thiện)."
        }
    },
    required: ['numberCounts', 'strengthArrows', 'weaknessArrows']
};


const numerologySchema = {
    type: Type.OBJECT,
    properties: {
        lifePathNumber: numerologyNumberSchema,
        destinyNumber: numerologyNumberSchema,
        soulUrgeNumber: numerologyNumberSchema,
        personalityNumber: numerologyNumberSchema,
        birthdayNumber: numerologyNumberSchema,
        birthdayChart: birthdayChartSchema,
        summary: { type: Type.STRING, description: "Tổng kết toàn bộ các chỉ số, mối liên kết giữa chúng và đưa ra lời khuyên tổng thể." }
    },
    required: ['lifePathNumber', 'destinyNumber', 'soulUrgeNumber', 'personalityNumber', 'birthdayNumber', 'birthdayChart', 'summary']
};

const tarotReadingSchema = {
    type: Type.OBJECT,
    properties: {
        past: { type: Type.STRING, description: 'Luận giải lá bài đại diện cho Quá Khứ, những ảnh hưởng nền tảng dẫn đến tình huống hiện tại. (Khoảng 150-200 từ)' },
        present: { type: Type.STRING, description: 'Luận giải lá bài đại diện cho Hiện Tại, mô tả tình hình, thách thức và cơ hội cốt lõi lúc này. (Khoảng 150-200 từ)' },
        future: { type: Type.STRING, description: 'Luận giải lá bài đại diện cho Tương Lai, chỉ ra xu hướng, kết quả tiềm năng và lời khuyên để định hướng. (Khoảng 150-200 từ)' },
        summary: { type: Type.STRING, description: 'Tổng kết toàn bộ 3 lá bài, kết nối chúng thành một câu chuyện mạch lạc và đưa ra lời khuyên chiến lược cuối cùng cho người hỏi. (Khoảng 200-250 từ)' }
    },
    required: ['past', 'present', 'future', 'summary']
};

const talismanSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Tên của lá bùa, ví dụ: 'Bùa Bình An Hộ Mệnh'." },
        description: { type: Type.STRING, description: "Mô tả ngắn gọn về lá bùa (khoảng 50-70 từ)." },
        svg: { type: Type.STRING, description: "Một chuỗi SVG hoàn chỉnh, uy nghiêm, có thể hiển thị. Trung tâm là hình ảnh cách điệu của một vị thần hộ mệnh phương Đông (Tướng nhà trời, Long Thần, Bồ Tát...). SVG phải có viewBox='0 0 200 280' và nền tối. Thiết kế phải trang trọng, linh thiêng." },
        cauChu: { type: Type.STRING, description: "Một câu chú ngắn (5-10 từ) bằng Hán-Việt hoặc Phạn, dùng để trì tụng, khuếch đại năng lượng." },
        interpretation: { type: Type.STRING, description: "Luận giải chi tiết ý nghĩa của các biểu tượng và năng lượng của lá bùa (khoảng 150-200 từ)." },
        usage: { type: Type.STRING, description: "Hướng dẫn cách sử dụng lá bùa để phát huy hiệu quả tốt nhất, ví dụ: lưu trong ví, đặt ở bàn làm việc, thiền định cùng lá bùa... (khoảng 100 từ)." }
    },
    required: ['name', 'description', 'svg', 'cauChu', 'interpretation', 'usage']
};

const flowAstrologySchema = {
    type: Type.OBJECT,
    properties: {
        flow: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    period: { type: Type.STRING, enum: ['7days', '1month', '6months'] },
                    energyType: { type: Type.STRING, enum: ['luck', 'love', 'challenge', 'helper'], description: "Loại năng lượng chính: may mắn (luck), tình duyên (love), thử thách (challenge), quý nhân (helper)." },
                    intensity: { type: Type.INTEGER, description: "Cường độ năng lượng từ 1 (thấp) đến 10 (cao)." },
                    symbols: { type: Type.ARRAY, items: { type: Type.STRING, enum: ['goldfish', 'lotus', 'dragon', 'none'] }, description: "Các biểu tượng may mắn xuất hiện." },
                    interpretation: { type: Type.STRING, description: "Luận giải ngắn gọn về dòng chảy năng lượng trong giai đoạn này." }
                },
                required: ['period', 'energyType', 'intensity', 'symbols', 'interpretation']
            }
        },
        predictions: {
            type: Type.OBJECT,
            properties: {
                '7days': { type: Type.STRING, description: "Dự báo chi tiết cho 7 ngày tới." },
                '1month': { type: Type.STRING, description: "Dự báo chi tiết cho 1 tháng tới." },
                '6months': { type: Type.STRING, description: "Dự báo chi tiết cho 6 tháng tới." }
            },
            required: ['7days', '1month', '6months']
        },
        talisman: talismanSchema
    },
    required: ['flow', 'predictions', 'talisman']
};

const auspiciousDaySchema = {
    type: Type.OBJECT,
    properties: {
        gregorianDate: { type: Type.STRING, description: "Ngày dương lịch đầy đủ." },
        lunarDate: { type: Type.STRING, description: "Ngày âm lịch đầy đủ." },
        dayCanChi: { type: Type.STRING, description: "Can Chi của ngày." },
        monthCanChi: { type: Type.STRING, description: "Can Chi của tháng." },
        yearCanChi: { type: Type.STRING, description: "Can Chi của năm." },
        tietKhi: { type: Type.STRING, description: "Tiết khí hiện tại." },
        truc: { type: Type.STRING, description: "Trực của ngày." },
        goodStars: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Danh sách các sao tốt." },
        badStars: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Danh sách các sao xấu." },
        recommendedActivities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các việc nên làm trong ngày." },
        avoidActivities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các việc cần tránh trong ngày." },
        overallAnalysis: { type: Type.STRING, description: "Luận giải tổng quan về mức độ tốt xấu của ngày." },
        eventAnalysis: { type: Type.STRING, description: "Phân tích sự phù hợp của ngày với sự việc cụ thể mà người dùng nhập vào." },
        auspiciousHours: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Danh sách các giờ hoàng đạo trong ngày." }
    },
    required: ['gregorianDate', 'lunarDate', 'dayCanChi', 'monthCanChi', 'yearCanChi', 'tietKhi', 'truc', 'goodStars', 'badStars', 'recommendedActivities', 'avoidActivities', 'overallAnalysis', 'eventAnalysis', 'auspiciousHours']
};

const careerSuggestionSchema = {
    type: Type.OBJECT,
    properties: {
        careerTitle: { type: Type.STRING, description: "Tên ngành nghề hoặc lĩnh vực." },
        compatibilityScore: { type: Type.INTEGER, description: "Điểm tương thích từ 1-100." },
        summary: { type: Type.STRING, description: "Tóm tắt ngắn gọn về ngành nghề này." },
        rationale: { type: Type.STRING, description: "Luận giải tại sao ngành nghề này phù hợp, kết nối với lá số tử vi và thông tin người dùng." },
        careerPath: { type: Type.STRING, description: "Gợi ý các bước hoặc lộ trình phát triển trong ngành nghề." },
        suggestedFields: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các lĩnh vực, chuyên môn cụ thể trong ngành." }
    },
    required: ['careerTitle', 'compatibilityScore', 'summary', 'rationale', 'careerPath', 'suggestedFields']
};

const careerAdviceSchema = {
    type: Type.OBJECT,
    properties: {
        overallAnalysis: { type: Type.STRING, description: "Phân tích tổng quan về tiềm năng sự nghiệp dựa trên cung Quan Lộc, Mệnh và các yếu tố khác." },
        topSuggestions: {
            type: Type.ARRAY,
            items: careerSuggestionSchema,
            description: "Danh sách 3 gợi ý nghề nghiệp hàng đầu."
        }
    },
    required: ['overallAnalysis', 'topSuggestions']
};

const nameSuggestionSchema = {
    type: Type.OBJECT,
    properties: {
        fullName: { type: Type.STRING, description: "Họ và tên đầy đủ được gợi ý." },
        meaningAnalysis: { type: Type.STRING, description: "Phân tích ý nghĩa của tên." },
        fiveElementsAnalysis: { type: Type.STRING, description: "Phân tích tên theo Ngũ hành, xem có bổ trợ cho bản mệnh của bé không." },
        phoneticsAnalysis: { type: Type.STRING, description: "Phân tích âm vận, sự hài hòa khi đọc tên." },
        overall: { type: Type.STRING, description: "Đánh giá tổng kết về cái tên này." }
    },
    required: ['fullName', 'meaningAnalysis', 'fiveElementsAnalysis', 'phoneticsAnalysis', 'overall']
};

const auspiciousNamingSchema = {
    type: Type.OBJECT,
    properties: {
        analysisSummary: { type: Type.STRING, description: "Phân tích tổng quan về bản mệnh của bé dựa trên Tứ trụ, Ngũ hành, Dụng thần." },
        nameSuggestions: {
            type: Type.ARRAY,
            items: nameSuggestionSchema,
            description: "Danh sách 3-5 tên được gợi ý."
        }
    },
    required: ['analysisSummary', 'nameSuggestions']
};

const bioEnergySchema = {
    type: Type.OBJECT,
    properties: {
        colorAnalysis: { type: Type.STRING, description: "Luận giải sâu sắc về ý nghĩa của màu năng lượng, liên kết nó với tính cách và tình trạng hiện tại của người dùng." },
        cardAnalysis: { type: Type.STRING, description: "Luận giải chi tiết về thông điệp của lá bài được rút, đặt trong bối cảnh màu năng lượng và thông tin ngày sinh." },
        synthesizedPrediction: { type: Type.STRING, description: "Tổng hợp các yếu tố (màu, lá bài, ngày sinh) để đưa ra một dự báo hoặc lời khuyên tổng thể cho tương lai gần." }
    },
    required: ['colorAnalysis', 'cardAnalysis', 'synthesizedPrediction']
};


// --- Helper Functions ---
function getSystemInstruction(operation: string, language: string): string {
    const langInstruction = language === 'vi' 
        ? "Luôn luôn trả lời bằng tiếng Việt. Giọng văn phải uyên bác, sâu sắc, mang đậm màu sắc huyền học phương Đông, nhưng vẫn phải rõ ràng, dễ hiểu và mang tính xây dựng."
        : "Always respond in English. The tone should be scholarly, profound, with an Eastern mysticism flavor, yet clear, understandable, and constructive.";

    const instructions: Record<string, string> = {
        generateAstrologyChart: "Bạn là một chuyên gia Tử Vi Đẩu Số. Hãy lập và luận giải lá số dựa trên thông tin được cung cấp.",
        analyzePhysiognomy: "Bạn là một chuyên gia Nhân Tướng Học. Hãy phân tích hình ảnh khuôn mặt và đưa ra luận giải chi tiết.",
        analyzePalm: "Bạn là một chuyên gia xem tướng tay (chỉ tay). Hãy phân tích hình ảnh lòng bàn tay và đưa ra luận giải chi tiết.",
        analyzeHandwriting: "Bạn là một chuyên gia bút tích học (graphology). Hãy phân tích hình ảnh chữ viết tay và đưa ra luận giải về tính cách.",
        getIChingInterpretation: "Bạn là một học giả Kinh Dịch. Hãy luận giải quẻ và các hào động một cách sâu sắc dựa trên câu hỏi của người dùng.",
        generateNumerologyChart: "Bạn là một chuyên gia Thần Số Học Pythagoras. Hãy tính toán và luận giải biểu đồ thần số học từ họ tên và ngày sinh.",
        getTarotReading: "Bạn là một Tarot reader am hiểu. Hãy luận giải trải bài 3 lá (Quá Khứ - Hiện Tại - Tương Lai) một cách sâu sắc.",
        generateFlowAstrology: "Bạn là một nhà chiêm tinh độc đáo, kết hợp Tử Vi và Trực giác. Hãy tạo ra một bản đồ dòng chảy năng lượng và một lá bùa hộ mệnh.",
        getAuspiciousDayAnalysis: "Bạn là một chuyên gia Trạch Nhật. Hãy phân tích ngày được chọn để xem xét mức độ tốt xấu cho một sự kiện cụ thể.",
        getCareerAdvice: "Bạn là một chuyên gia tư vấn hướng nghiệp kết hợp Tử Vi. Hãy phân tích lá số và thông tin người dùng để đưa ra gợi ý nghề nghiệp.",
        generateTalisman: "Bạn là một bậc thầy huyền học phương Đông. Hãy tạo ra một lá bùa (linh phù) độc đáo dưới dạng SVG dựa trên thông tin người dùng.",
        generateAuspiciousName: "Bạn là một chuyên gia đặt tên hợp phong thủy. Hãy phân tích Tứ Trụ, Ngũ Hành của bé và gợi ý những cái tên tốt đẹp.",
        generateBioEnergyReading: "Bạn là một nhà ngoại cảm có khả năng đọc năng lượng sinh học. Hãy luận giải sự kết hợp giữa màu sắc năng lượng, lá bài và ngày sinh."
    };
    return `${instructions[operation]} ${langInstruction}`;
}

async function handleRequest(res: VercelResponse, handler: () => Promise<any>) {
    try {
        const result = await handler();
        res.status(200).json(result);
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        let statusCode = 500;
        let errorCode = "error_server_generic";

        if (error.message.includes("429")) {
            statusCode = 429;
            errorCode = "error_ai_overloaded";
        } else if (error.message.includes("API key not valid")) {
            statusCode = 500;
            errorCode = "error_api_key_invalid";
        } else if (error.message.includes("SAFETY")) {
             statusCode = 400;
             errorCode = "error_ai_blocked_safety";
        } else if (error.message.includes("Failed to parse")) {
            statusCode = 500;
            errorCode = "error_ai_invalid_json";
        }
        
        res.status(statusCode).json({ error: errorCode });
    }
}

async function parseJsonResponse(response: GenerateContentResponse) {
    const text = response.text?.trim();
    if (!text) {
        throw new Error("error_ai_blocked_unknown: Empty response from AI.");
    }
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse JSON response from AI:", text);
        throw new Error(`error_ai_invalid_json: ${e}`);
    }
}

// --- Main Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'invalid_method' });
    }

    const { operation, payload } = req.body;
    if (!operation || !payload) {
        return res.status(400).json({ error: 'bad_request' });
    }

    const { language, ...params } = payload;

    const commonConfig = {
        model,
        config: {
            responseMimeType: "application/json",
            safetySettings: defaultSafetySettings,
        }
    };

    await handleRequest(res, async () => {
        switch (operation) {
            case 'generateAstrologyChart': {
                const info: BirthInfo = params.info;
                // FIX: Moved systemInstruction into the config object.
                const response = await ai.models.generateContent({
                    ...commonConfig,
                    config: { ...commonConfig.config, responseSchema: astrologySchema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: `Hãy lập lá số tử vi cho: Tên: ${info.name}, Giới tính: ${info.gender}, Năm sinh: ${info.year}, Tháng: ${info.month}, Ngày: ${info.day}, Giờ: ${info.hour === -1 ? 'Không rõ' : info.hour}.`,
                });
                return parseJsonResponse(response);
            }
            case 'analyzePhysiognomy':
            case 'analyzePalm':
            case 'analyzeHandwriting': {
                 const { base64Image } = params;
                 const schema = operation === 'analyzePhysiognomy' ? physiognomySchema : (operation === 'analyzePalm' ? palmReadingSchema : handwritingSchema);
                 const promptText = operation === 'analyzePhysiognomy' ? 'Phân tích khuôn mặt trong ảnh này.' : (operation === 'analyzePalm' ? 'Phân tích lòng bàn tay trong ảnh này.' : 'Phân tích chữ viết tay trong ảnh này.');
                 // FIX: Moved systemInstruction into the config object.
                 const response = await ai.models.generateContent({
                    ...commonConfig,
                    config: { ...commonConfig.config, responseSchema: schema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: { parts: [{ inlineData: { mimeType: 'image/jpeg', data: base64Image } }, { text: promptText }] },
                });
                return parseJsonResponse(response);
            }
            case 'getIChingInterpretation': {
                const { castResult, question } = params as { castResult: CastResult, question: string };
                // FIX: Moved systemInstruction into the config object.
                const response = await ai.models.generateContent({
                     ...commonConfig,
                    config: { ...commonConfig.config, responseSchema: iChingSchema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: `Câu hỏi: "${question || 'Không có câu hỏi cụ thể'}". Quẻ chính: ${castResult.primaryHexagram.name.vi}. Các hào động: ${castResult.changingLinesIndices.map(i => i + 1).join(', ') || 'Không có'}. Quẻ biến: ${castResult.secondaryHexagram?.name.vi || 'Không có'}.`,
                });
                return parseJsonResponse(response);
            }
            case 'generateNumerologyChart': {
                const info: NumerologyInfo = params.info;
                 // FIX: Moved systemInstruction into the config object.
                 const response = await ai.models.generateContent({
                    ...commonConfig,
                    config: { ...commonConfig.config, responseSchema: numerologySchema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: `Luận giải thần số học cho: Họ tên: ${info.fullName}, Ngày sinh: ${info.day}/${info.month}/${info.year}.`,
                });
                return parseJsonResponse(response);
            }
            case 'getTarotReading': {
                const { cards, question } = params as { cards: TarotCard[], question: string };
                // FIX: Moved systemInstruction into the config object.
                const response = await ai.models.generateContent({
                    ...commonConfig,
                    config: { ...commonConfig.config, responseSchema: tarotReadingSchema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: `Câu hỏi: "${question || 'Tổng quan'}". Lá bài Quá Khứ: ${cards[0].name.vi}. Lá bài Hiện Tại: ${cards[1].name.vi}. Lá bài Tương Lai: ${cards[2].name.vi}.`,
                });
                return parseJsonResponse(response);
            }
            case 'generateFlowAstrology': {
                const info: FlowAstrologyInfo = params.info;
                 // FIX: Moved systemInstruction into the config object.
                 const response = await ai.models.generateContent({
                    ...commonConfig,
                    config: { ...commonConfig.config, responseSchema: flowAstrologySchema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: `Tạo bản đồ dòng chảy năng lượng và bùa hộ mệnh cho: Tên: ${info.name}, Ngày sinh: ${info.day}/${info.month}/${info.year}, Số trực giác: ${info.intuitiveNumber}.`,
                });
                return parseJsonResponse(response);
            }
            case 'getAuspiciousDayAnalysis': {
                 const info: AuspiciousDayInfo = params.info;
                 // FIX: Moved systemInstruction into the config object.
                 const response = await ai.models.generateContent({
                    ...commonConfig,
                    config: { ...commonConfig.config, responseSchema: auspiciousDaySchema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: `Phân tích ngày ${info.day}/${info.month}/${info.year} để thực hiện sự việc: "${info.event}".`,
                });
                return parseJsonResponse(response);
            }
            case 'getCareerAdvice': {
                const info: CareerInfo = params.info;
                 // FIX: Moved systemInstruction into the config object.
                 const response = await ai.models.generateContent({
                    ...commonConfig,
                    config: { ...commonConfig.config, responseSchema: careerAdviceSchema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: `Tư vấn hướng nghiệp cho người có thông tin lá số: ${JSON.stringify(info)}. Sở thích: ${info.interests.join(', ')}. Kỹ năng: ${info.skills.join(', ')}. Nguyện vọng: ${info.aspiration || 'Không có'}.`,
                });
                return parseJsonResponse(response);
            }
            case 'generateTalisman': {
                const info: TalismanInfo = params.info;
                 // FIX: Moved systemInstruction into the config object.
                 const response = await ai.models.generateContent({
                    ...commonConfig,
                    config: { ...commonConfig.config, responseSchema: talismanSchema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: `Tạo một lá bùa may mắn cho: Tên: ${info.name}, Ngày sinh: ${info.day}/${info.month}/${info.year}.`,
                });
                return parseJsonResponse(response);
            }
            case 'generateAuspiciousName': {
                const info: AuspiciousNamingInfo = params.info;
                 // FIX: Moved systemInstruction into the config object.
                 const response = await ai.models.generateContent({
                    ...commonConfig,
                    config: { ...commonConfig.config, responseSchema: auspiciousNamingSchema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: `Gợi ý tên cho bé: ${JSON.stringify(info)}.`,
                });
                return parseJsonResponse(response);
            }
            case 'generateBioEnergyReading': {
                const { info, color, card } = params as { info: BioEnergyInfo, color: string, card: BioEnergyCard };
                 // FIX: Moved systemInstruction into the config object.
                 const response = await ai.models.generateContent({
                    ...commonConfig,
                    config: { ...commonConfig.config, responseSchema: bioEnergySchema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: `Luận giải năng lượng cho người có thông tin: ${JSON.stringify(info)}. Màu năng lượng đo được: ${color}. Lá bài rút được: ${card.name.vi}.`,
                });
                return parseJsonResponse(response);
            }
            default:
                res.status(400).json({ error: 'invalid_operation' });
                return;
        }
    });
}