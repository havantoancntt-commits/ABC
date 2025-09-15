
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import type { BirthInfo, CastResult, NumerologyInfo, TarotCard, FlowAstrologyInfo, AuspiciousDayInfo, CareerInfo, TalismanInfo, AuspiciousNamingInfo, BioEnergyInfo, BioEnergyCard, FortuneStickInfo, GodOfWealthInfo, PrayerRequestInfo, FengShuiInfo } from '../lib/types';

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
    key: { 
        type: Type.STRING, 
        description: "A stable, language-agnostic key for the palace.",
        enum: [
            'menh', 'phuMau', 'phucDuc', 'dienTrach', 'quanLoc', 'noBoc', 
            'thienDi', 'tatAch', 'taiBach', 'tuTuc', 'phuThe', 'huynhDe'
        ]
    },
    name: { type: Type.STRING },
    branchName: { type: Type.STRING, description: "The name of the earthly branch for this palace (e.g., Tý, Sửu, Dần)." },
    stars: { type: Type.ARRAY, items: { type: Type.STRING } },
    interpretation: { type: Type.STRING },
  },
  required: ['key', 'name', 'branchName', 'stars', 'interpretation']
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
            thanCungKey: { 
                type: Type.STRING, 
                description: "The stable key of the palace where Thân resides.",
                enum: [
                    'menh', 'phuMau', 'phucDuc', 'dienTrach', 'quanLoc', 'noBoc', 
                    'thienDi', 'tatAch', 'taiBach', 'tuTuc', 'phuThe', 'huynhDe'
                ]
            },
        },
        required: ['menh', 'than', 'thanCungKey']
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
        notRuoiVaTanNhang: { type: Type.STRING, description: 'Phân tích chi tiết về vị trí, hình dáng, màu sắc của các nốt ruồi và tàn nhang (nếu có) trên khuôn mặt và luận giải ý nghĩa của chúng. Nếu không có, có thể bỏ qua.' },
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

const hoaTaySchema = {
    type: Type.OBJECT,
    properties: {
        leftHandWhorls: { type: Type.INTEGER, description: "Số lượng hoa tay (vân xoáy) trên bàn tay trái." },
        rightHandWhorls: { type: Type.INTEGER, description: "Số lượng hoa tay (vân xoáy) trên bàn tay phải." },
        totalWhorls: { type: Type.INTEGER, description: "Tổng số lượng hoa tay trên cả hai bàn tay." },
        leftHandInterpretation: { type: Type.STRING, description: "Luận giải chi tiết về tính cách, vận mệnh dựa trên số hoa tay của bàn tay trái." },
        rightHandInterpretation: { type: Type.STRING, description: "Luận giải chi tiết về tính cách, vận mệnh dựa trên số hoa tay của bàn tay phải." },
        overallInterpretation: { type: Type.STRING, description: "Luận giải tổng hợp, kết nối ý nghĩa của cả hai bàn tay để đưa ra một cái nhìn toàn diện về tính cách, sự nghiệp, tình duyên." },
        advice: { type: Type.STRING, description: "Đưa ra lời khuyên hữu ích, mang tính xây dựng để phát huy điểm mạnh và cải thiện điểm yếu." },
    },
    required: ['leftHandWhorls', 'rightHandWhorls', 'totalWhorls', 'leftHandInterpretation', 'rightHandInterpretation', 'overallInterpretation', 'advice']
};

const fingerprintSchema = {
    type: Type.OBJECT,
    properties: {
        pattern: {
            type: Type.STRING,
            enum: ['whorl', 'loop'],
            description: "The classified fingerprint pattern. 'whorl' for vân xoáy, 'loop' for vân móc/lưu vân."
        },
        confidence: {
            type: Type.NUMBER,
            description: "Confidence score of the classification from 0.0 to 1.0."
        },
    },
    required: ['pattern', 'confidence']
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

const fortuneStickSchema = {
    type: Type.OBJECT,
    properties: {
        stickNumber: { type: Type.INTEGER, description: "Số của quẻ xăm được gieo." },
        poem: { type: Type.STRING, description: "Một bài thơ cổ (lục bát hoặc song thất lục bát) chứa đựng ý nghĩa của quẻ xăm." },
        interpretation: { type: Type.STRING, description: "Luận giải chi tiết ý nghĩa của bài thơ và quẻ xăm, áp dụng vào các khía cạnh: Gia đạo, Công danh, Tình duyên, Sức khỏe." },
        summary: { type: Type.STRING, description: "Một câu tổng kết ngắn gọn, súc tích về điềm báo của quẻ xăm (Cát, Hung, Bình)." }
    },
    required: ['stickNumber', 'poem', 'interpretation', 'summary']
};

const godOfWealthSchema = {
    type: Type.OBJECT,
    properties: {
        luckyNumber: { type: Type.STRING, description: "Một con số may mắn (ví dụ: 68, 79, 86, 88). Luôn là dạng chuỗi." },
        blessingMessage: { type: Type.STRING, description: "Một câu chúc ngắn gọn, súc tích, linh thiêng (khoảng 10-20 từ)." },
        interpretation: { type: Type.STRING, description: "Luận giải chi tiết ý nghĩa của con số và lời chúc, đưa ra lời khuyên về tài lộc, kinh doanh (khoảng 150-200 từ)." }
    },
    required: ['luckyNumber', 'blessingMessage', 'interpretation']
};

const prayerSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Tiêu đề của bài văn khấn (ví dụ: 'Văn khấn Thần Tài ngày mùng 1')." },
        prayerText: { type: Type.STRING, description: "Toàn bộ nội dung bài văn khấn, viết theo văn phong cổ, trang trọng, có đầy đủ các phần." },
        interpretation: { type: Type.STRING, description: "Giải thích ngắn gọn về ý nghĩa, các lễ vật cần chuẩn bị và những lưu ý khi thực hiện bài khấn này." }
    },
    required: ['title', 'prayerText', 'interpretation']
};

const fengShuiSchema = {
    type: Type.OBJECT,
    properties: {
        tongQuan: { type: Type.STRING, description: "Đánh giá tổng quan về không gian, dòng chảy năng lượng (khí), và các yếu tố chính." },
        uuDiem: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Danh sách các điểm mạnh, các yếu tố hợp phong thủy." },
        nhuocDiem: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Danh sách các điểm yếu, các lỗi phong thủy cần khắc phục." },
        giaiPhap: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    khuVuc: { type: Type.STRING, description: "Khu vực cần cải thiện (ví dụ: Cửa chính, Phòng ngủ...)." },
                    deXuat: { type: Type.STRING, description: "Đề xuất giải pháp, cách hóa giải hoặc cải thiện cụ thể, có tính thực tiễn." }
                },
                required: ['khuVuc', 'deXuat']
            },
            description: "Danh sách các giải pháp cụ thể cho từng khu vực hoặc vấn đề."
        }
    },
    required: ['tongQuan', 'uuDiem', 'nhuocDiem', 'giaiPhap']
};


// --- Helper Functions ---
function getSystemInstruction(operation: string, language: string): string {
    const langInstruction = language === 'vi' 
        ? "Luôn luôn trả lời bằng tiếng Việt. Giọng văn phải uyên bác, sâu sắc, mang đậm màu sắc huyền học phương Đông, nhưng vẫn phải rõ ràng, dễ hiểu và mang tính xây dựng. Luận giải phải chi tiết, chuyên nghiệp và đẳng cấp."
        : "Always respond in English. The tone should be scholarly, profound, with an Eastern mysticism flavor, yet clear, understandable, and constructive. The analysis must be detailed, professional, and sophisticated.";

    const instructions: Record<string, string> = {
        generateAstrologyChart: "Bạn là một Đại sư Tử Vi Đẩu Số với kiến thức uyên thâm. Hãy lập và luận giải lá số một cách chi tiết, cẩn trọng, với văn phong trang trọng, mang đến cho người xem một cái nhìn toàn diện và những lời khuyên hữu ích, đẳng cấp. QUAN TRỌNG: Để đảm bảo phản hồi nhanh, hãy giữ mỗi phần luận giải (Mệnh, Thân, các cung, tổng kết) súc tích, chỉ khoảng 100-150 từ mỗi phần.",
        analyzePhysiognomy: "Bạn là một Đại sư Nhân Tướng Học. Hãy phân tích hình ảnh khuôn mặt với sự tinh tế và sâu sắc, luận giải về thần khí, cốt cách và các bộ vị một cách toàn diện. Đặc biệt, hãy chú trọng phân tích vị trí, hình dáng, màu sắc của các nốt ruồi và tàn nhang để luận giải ý nghĩa của chúng. Cung cấp những nhận định mang tính xây dựng.",
        analyzePalm: "Bạn là một chuyên gia tướng tay bậc thầy. Phân tích hình ảnh lòng bàn tay, từ các đường chỉ chính đến các gò và dấu hiệu đặc biệt. Luận giải phải sâu sắc, kết nối các yếu tố để đưa ra một cái nhìn tổng thể về vận mệnh và tính cách.",
        analyzeHandwriting: "Bạn là một chuyên gia bút tích học (graphology) hàng đầu. Hãy phân tích mẫu chữ viết để khám phá những tầng sâu trong tính cách, tư duy và nội tâm của người viết. Luận giải cần tinh tế và sâu sắc.",
        analyzeHoaTay: "Bạn là một chuyên gia xem hoa tay bậc thầy với kiến thức uyên bác. Dựa vào số lượng hoa tay trên mỗi bàn tay được cung cấp, hãy luận giải một cách chi tiết, sâu sắc và đẳng cấp về tính cách, vận mệnh, tình duyên và sự nghiệp. Giọng văn phải chuyên nghiệp, mang tính xây dựng.",
        analyzeFingerprint: "You are an expert fingerprint analyst. Your task is to classify a close-up image of a fingertip. Determine if the primary pattern is a 'whorl' (vân xoáy, a circular or spiral pattern) or a 'loop' (vân móc, lines enter from one side, curve, and exit on the same side). Respond ONLY with the JSON schema. Be precise.",
        getIChingInterpretation: "Bạn là một học giả Kinh Dịch uyên bác. Hãy luận giải quẻ và các hào động một cách sâu sắc dựa trên câu hỏi của người dùng, kết nối ý nghĩa cổ xưa với bối cảnh hiện đại để đưa ra lời chỉ dẫn rõ ràng, minh triết.",
        generateNumerologyChart: "Bạn là một chuyên gia Thần Số Học Pythagoras. Hãy tính toán và luận giải biểu đồ thần số học một cách chi tiết, chuyên nghiệp. Kết nối ý nghĩa của các con số để vẽ nên một bức tranh toàn cảnh về cuộc đời và sứ mệnh của một người.",
        getTarotReading: "Bạn là một Tarot reader có trực giác nhạy bén và kiến thức sâu rộng. Hãy luận giải trải bài 3 lá (Quá Khứ - Hiện Tại - Tương Lai) một cách sâu sắc, kết nối chúng thành một câu chuyện mạch lạc và đưa ra lời khuyên chiến lược, đầy cảm hứng.",
        generateFlowAstrology: "Bạn là một nhà chiêm tinh độc đáo, kết hợp Tử Vi và Trực giác. Hãy tạo ra một bản đồ dòng chảy năng lượng và một lá bùa hộ mệnh. Luận giải phải sáng tạo, truyền cảm hứng và mang tính ứng dụng cao.",
        getAuspiciousDayAnalysis: "Bạn là một chuyên gia Trạch Nhật Cát Hung. Phân tích ngày dựa trên Can Chi, Ngũ Hành, Thần Sát và các yếu tố khác để đưa ra kết luận chính xác về mức độ tốt xấu cho sự kiện cụ thể.",
        getCareerAdvice: "Bạn là một chuyên gia tư vấn hướng nghiệp kết hợp Tử Vi. Hãy phân tích lá số và thông tin người dùng để đưa ra những gợi ý nghề nghiệp sâu sắc, phù hợp nhất với tiềm năng và vận mệnh của họ.",
        generateTalisman: "Bạn là một bậc thầy huyền học phương Đông. Hãy sáng tạo một lá bùa (linh phù) SVG độc đáo, trang trọng và linh thiêng, dựa trên thông tin người dùng để tối ưu hóa năng lượng hộ mệnh.",
        generateAuspiciousName: "Bạn là một chuyên gia đặt tên hợp phong thủy. Hãy phân tích Tứ Trụ, Ngũ Hành của bé và gợi ý những cái tên không chỉ hay, ý nghĩa mà còn bổ trợ tốt nhất cho vận mệnh của bé.",
        generateBioEnergyReading: "Bạn là một nhà ngoại cảm có khả năng đọc năng lượng sinh học. Luận giải sự kết hợp giữa màu sắc hào quang, lá bài và ngày sinh để đưa ra một thông điệp sâu sắc, ý nghĩa và mang tính chữa lành.",
        getFortuneStickInterpretation: "Bạn là một bậc thầy uyên bác tại một ngôi chùa cổ, chuyên giải quẻ xăm. Luận giải lá xăm với văn phong trang trọng, cổ xưa nhưng dễ hiểu, mang lại sự sáng tỏ và bình an cho người xin xăm.",
        getGodOfWealthBlessing: "Bạn là Hoàng Thần Tài, vị thần cai quản tài lộc. Hãy ban phước cho người cầu xin một cách uy nghiêm và linh thiêng, mang lại cho họ niềm tin và hy vọng về sự thịnh vượng.",
        generatePrayer: "Bạn là một chuyên gia văn hóa tín ngưỡng. Hãy soạn một bài văn khấn trang trọng, đúng nghi lễ, với lời văn thành kính và cổ xưa nhưng vẫn dễ đọc, thể hiện trọn vẹn tấm lòng của người khấn.",
        analyzeFengShui: "Bạn là một Đại sư Phong Thủy, bậc thầy về cả Bát Trạch và Huyền Không Phi Tinh. Hãy vận dụng kiến thức uyên thâm để phân tích không gian, đưa ra một bản luận giải toàn diện, chuyên nghiệp và đẳng cấp, với các giải pháp thực tiễn, dễ áp dụng."
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
    let text = response.text?.trim();
    if (!text) {
        throw new Error("error_ai_blocked_unknown: Empty response from AI.");
    }

    // Attempt to clean markdown formatting
    const jsonRegex = /```(json)?\s*([\s\S]*?)\s*```/;
    const match = text.match(jsonRegex);
    if (match && match[2]) {
        text = match[2];
    }
    
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse JSON response from AI:", text);
        // Add the problematic text to the error for better debugging.
        throw new Error(`error_ai_invalid_json: Failed to parse the following content: ${text}`);
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
                const genderInVietnamese = info.gender === 'male' ? 'Nam' : 'Nữ';

                const response = await ai.models.generateContent({
                    model: commonConfig.model,
                    config: { 
                        ...commonConfig.config, 
                        responseSchema: astrologySchema, 
                        systemInstruction: getSystemInstruction(operation, language),
                        thinkingConfig: { thinkingBudget: 0 } 
                    },
                    contents: `Hãy lập lá số tử vi cho một người có thông tin sinh theo LỊCH DƯƠNG (Gregorian calendar) như sau. Bạn phải tự chuyển đổi ngày này sang LỊCH ÂM (Lunar calendar) để tính toán lá số cho chính xác. Tên: ${info.name}, Giới tính: ${genderInVietnamese}, Năm sinh: ${info.year}, Tháng: ${info.month}, Ngày: ${info.day}, Giờ: ${info.hour === -1 ? 'Không rõ' : info.hour}.`,
                });
                return parseJsonResponse(response);
            }
            case 'analyzePhysiognomy':
            case 'analyzePalm':
            case 'analyzeHandwriting': {
                 const { base64Image } = params;
                 let schema;
                 let promptText;
                 switch (operation) {
                    case 'analyzePhysiognomy':
                        schema = physiognomySchema;
                        promptText = 'Phân tích khuôn mặt trong ảnh này.';
                        break;
                    case 'analyzePalm':
                        schema = palmReadingSchema;
                        promptText = 'Phân tích lòng bàn tay trong ảnh này.';
                        break;
                    case 'analyzeHandwriting':
                        schema = handwritingSchema;
                        promptText = 'Phân tích chữ viết tay trong ảnh này.';
                        break;
                 }

                 const response = await ai.models.generateContent({
                    model: commonConfig.model,
                    config: { ...commonConfig.config, responseSchema: schema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: { parts: [{ inlineData: { mimeType: 'image/jpeg', data: base64Image } }, { text: promptText }] },
                });
                return parseJsonResponse(response);
            }
            case 'analyzeFingerprint': {
                const { base64Image } = params;
                const response = await ai.models.generateContent({
                    model: commonConfig.model,
                    config: { ...commonConfig.config, responseSchema: fingerprintSchema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: { parts: [
                        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                        { text: "Analyze the fingerprint in this image. Classify it as 'whorl' or 'loop'." }
                    ] },
                });
                return parseJsonResponse(response);
            }
            case 'analyzeHoaTay': {
                const { counts } = params as { counts: { leftHandWhorls: number, rightHandWhorls: number } };
                const response = await ai.models.generateContent({
                    model: commonConfig.model,
                    config: { ...commonConfig.config, responseSchema: hoaTaySchema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: `Luận giải về một người có ${counts.leftHandWhorls} hoa tay ở bàn tay trái và ${counts.rightHandWhorls} hoa tay ở bàn tay phải. Hãy đảm bảo các trường leftHandWhorls, rightHandWhorls, và totalWhorls trong JSON response khớp với các con số này.`,
                });
                return parseJsonResponse(response);
            }
            case 'analyzeFengShui': {
                const { info, videoFrames } = params as { info: FengShuiInfo, videoFrames: string[] };
                const imageParts = videoFrames.map(frame => ({
                    inlineData: { mimeType: 'image/jpeg', data: frame }
                }));
                const textPart = { text: `Phân tích phong thủy không gian này với thông tin sau: Loại không gian: ${info.spaceType}, Năm sinh gia chủ: ${info.ownerBirthYear}, Vấn đề quan tâm: ${info.question || 'Tổng quan'}. Các hình ảnh sau là khung hình từ video quay không gian, hãy phân tích chúng như một chuỗi để hiểu bố cục.` };
                
                const response = await ai.models.generateContent({
                    model: commonConfig.model,
                    config: { ...commonConfig.config, responseSchema: fengShuiSchema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: { parts: [textPart, ...imageParts] },
                });
                return parseJsonResponse(response);
            }
            case 'getIChingInterpretation': {
                const { castResult, question } = params as { castResult: CastResult, question: string };
                const response = await ai.models.generateContent({
                    model: commonConfig.model,
                    config: { ...commonConfig.config, responseSchema: iChingSchema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: `Câu hỏi: "${question || 'Không có câu hỏi cụ thể'}". Quẻ chính: ${castResult.primaryHexagram.name.vi}. Các hào động: ${castResult.changingLinesIndices.map(i => i + 1).join(', ') || 'Không có'}. Quẻ biến: ${castResult.secondaryHexagram?.name.vi || 'Không có'}.`,
                });
                return parseJsonResponse(response);
            }
            case 'generateNumerologyChart': {
                const info: NumerologyInfo = params.info;
                 const response = await ai.models.generateContent({
                    model: commonConfig.model,
                    config: { ...commonConfig.config, responseSchema: numerologySchema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: `Luận giải thần số học cho: Họ tên: ${info.fullName}, Ngày sinh: ${info.day}/${info.month}/${info.year}.`,
                });
                return parseJsonResponse(response);
            }
            case 'getTarotReading': {
                const { cards, question } = params as { cards: TarotCard[], question: string };
                const response = await ai.models.generateContent({
                    model: commonConfig.model,
                    config: { ...commonConfig.config, responseSchema: tarotReadingSchema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: `Câu hỏi: "${question || 'Tổng quan'}". Lá bài Quá Khứ: ${cards[0].name.vi}. Lá bài Hiện Tại: ${cards[1].name.vi}. Lá bài Tương Lai: ${cards[2].name.vi}.`,
                });
                return parseJsonResponse(response);
            }
            case 'generateFlowAstrology': {
                const info: FlowAstrologyInfo = params.info;
                 const response = await ai.models.generateContent({
                    model: commonConfig.model,
                    config: { ...commonConfig.config, responseSchema: flowAstrologySchema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: `Tạo bản đồ dòng chảy năng lượng và bùa hộ mệnh cho: Tên: ${info.name}, Ngày sinh: ${info.day}/${info.month}/${info.year}, Số trực giác: ${info.intuitiveNumber}.`,
                });
                return parseJsonResponse(response);
            }
            case 'getAuspiciousDayAnalysis': {
                 const info: AuspiciousDayInfo = params.info;
                 const response = await ai.models.generateContent({
                    model: commonConfig.model,
                    config: { ...commonConfig.config, responseSchema: auspiciousDaySchema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: `Phân tích ngày ${info.day}/${info.month}/${info.year} để thực hiện sự việc: "${info.event}".`,
                });
                return parseJsonResponse(response);
            }
            case 'getCareerAdvice': {
                const info: CareerInfo = params.info;
                 const response = await ai.models.generateContent({
                    model: commonConfig.model,
                    config: { ...commonConfig.config, responseSchema: careerAdviceSchema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: `Tư vấn hướng nghiệp cho người có thông tin lá số: ${JSON.stringify(info)}. Sở thích: ${info.interests.join(', ')}. Kỹ năng: ${info.skills.join(', ')}. Nguyện vọng: ${info.aspiration || 'Không có'}.`,
                });
                return parseJsonResponse(response);
            }
            case 'generateTalisman': {
                const info: TalismanInfo = params.info;
                 const response = await ai.models.generateContent({
                    model: commonConfig.model,
                    config: { ...commonConfig.config, responseSchema: talismanSchema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: `Tạo một lá bùa may mắn cho: Tên: ${info.name}, Ngày sinh: ${info.day}/${info.month}/${info.year}.`,
                });
                return parseJsonResponse(response);
            }
            case 'generateAuspiciousName': {
                const info: AuspiciousNamingInfo = params.info;
                 const response = await ai.models.generateContent({
                    model: commonConfig.model,
                    config: { ...commonConfig.config, responseSchema: auspiciousNamingSchema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: `Gợi ý tên cho bé: ${JSON.stringify(info)}.`,
                });
                return parseJsonResponse(response);
            }
            case 'generateBioEnergyReading': {
                const { info, color, card } = params as { info: BioEnergyInfo, color: string, card: BioEnergyCard };
                 const response = await ai.models.generateContent({
                    model: commonConfig.model,
                    config: { ...commonConfig.config, responseSchema: bioEnergySchema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: `Luận giải năng lượng cho người có thông tin: ${JSON.stringify(info)}. Màu năng lượng đo được: ${color}. Lá bài rút được: ${card.name.vi}.`,
                });
                return parseJsonResponse(response);
            }
            case 'getFortuneStickInterpretation': {
                const { info } = params as { info: FortuneStickInfo };
                const response = await ai.models.generateContent({
                    model: commonConfig.model,
                    config: { ...commonConfig.config, responseSchema: fortuneStickSchema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: `Hãy luận giải lá xăm số ${info.stickNumber} cho câu hỏi: "${info.question || 'Vấn đề chung'}".`,
                });
                return parseJsonResponse(response);
            }
            case 'getGodOfWealthBlessing': {
                const info: GodOfWealthInfo = params.info;
                const response = await ai.models.generateContent({
                    model: commonConfig.model,
                    config: { ...commonConfig.config, responseSchema: godOfWealthSchema, systemInstruction: getSystemInstruction(operation, language) },
                    contents: `Tên người cầu xin: ${info.name}. Mong muốn: "${info.wish || 'Cầu xin tài lộc, kinh doanh thuận lợi'}". Hãy ban cho họ một con số lộc và lời chúc phúc.`,
                });
                return parseJsonResponse(response);
            }
            case 'generatePrayer': {
                const info: PrayerRequestInfo = params.info;
                const response = await ai.models.generateContent({
                    model: commonConfig.model,
                    config: {
                        ...commonConfig.config,
                        responseSchema: prayerSchema,
                        systemInstruction: getSystemInstruction(operation, language),
                        thinkingConfig: { thinkingBudget: 0 },
                    },
                    contents: `Soạn bài văn khấn cho: Tên tín chủ: ${info.name}. Dịp: ${info.occasion}. Đối tượng khấn: ${info.deity}.`,
                });
                return parseJsonResponse(response);
            }
            default:
                res.status(400).json({ error: 'invalid_operation' });
                return;
        }
    });
}