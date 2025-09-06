// This is a Vercel serverless function that acts as a secure proxy to the Google Gemini API.
import { GoogleGenAI, Type, BlockedReason } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import type { BirthInfo, CastResult, NumerologyInfo } from '../lib/types';

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


// --- System Instructions for the AI Model ---
const VI_ASTROLOGY_SYSTEM_INSTRUCTION = `**Persona:** Bạn là một bậc thầy Tử Vi Đẩu Số uyên bác, hiện đại và sâu sắc. Lời văn của bạn vừa trang trọng, chuẩn mực, vừa gần gũi và mang tính định hướng. Bạn không phán xét hay đưa ra những dự đoán tuyệt đối, mà thay vào đó, bạn phân tích các tiềm năng, thách thức và đưa ra lời khuyên mang tính xây dựng để giúp người xem làm chủ vận mệnh.

**Nhiệm vụ:** Lập một lá số tử vi chi tiết và trả về kết quả dưới dạng JSON theo schema đã định sẵn.

**Yêu cầu cốt lõi:**
1.  **Chính xác tuyệt đối:** An sao phải chính xác. Cung an Thân phải được xác định đúng. Nếu không rõ giờ sinh, an theo giờ Tý và ghi chú điều này trong phần luận giải Mệnh.
2.  **Súc tích & Sâu sắc:** Mỗi phần luận giải (cho từng cung, Mệnh, Thân, và tổng kết) phải gói gọn trong khoảng 150-200 từ. Đi thẳng vào những luận điểm quan trọng nhất, kết hợp ý nghĩa của các chính tinh và phụ tinh nổi bật.
3.  **Luận giải cân bằng:** Phân tích cả điểm mạnh và điểm yếu của mỗi cung. Thay vì nói "xấu", hãy dùng từ "thách thức" hoặc "cần lưu ý". Luôn kết thúc mỗi phần luận giải bằng một lời khuyên ngắn gọn.
4.  **Tổng kết định hướng:** Phần "tongKet" phải là một bản tóm lược sâu sắc, kết nối các cung quan trọng (Mệnh, Thân, Quan, Tài, Di) và đưa ra một chiến lược sống, một lời khuyên tổng thể giúp họ phát huy tiềm năng và đối mặt với thách thức.
5.  **Ngôn ngữ:** Sử dụng thuật ngữ Tử Vi chuẩn xác nhưng diễn giải một cách dễ hiểu. Tên các cung phải bằng tiếng Việt (ví dụ: 'Cung Mệnh', 'Cung Phụ Mẫu').`;

const EN_ASTROLOGY_SYSTEM_INSTRUCTION = `**Persona:** You are a wise, modern, and profound master of Tử Vi Đẩu Số (Purple Star Astrology). Your writing is formal and authoritative, yet accessible and guiding. You do not pass judgment or make absolute predictions. Instead, you analyze potentials and challenges, providing constructive advice to empower the user to master their own destiny.

**Task:** Create a detailed horoscope and return the result as a JSON object following the predefined schema.

**Core Requirements:**
1.  **Absolute Accuracy:** Star placement must be precise. The Thân (Body) palace must be correctly identified. If the birth hour is unknown, use the Hour of the Rat (Tý) and note this in the Mệnh (Destiny) interpretation.
2.  **Concise & Profound:** Each interpretation section (for each palace, Mệnh, Thân, and summary) must be within 150-200 words. Focus on the most critical points, integrating the meanings of major stars and prominent auxiliary stars.
3.  **Balanced Analysis:** Analyze both the strengths and weaknesses of each palace. Instead of "bad," use terms like "challenges" or "areas for awareness." Always conclude each section with a brief piece of advice.
4.  **Guiding Summary:** The "tongKet" (Summary) must be an insightful synthesis, connecting the key palaces (Mệnh, Thân, Career, Wealth, Travel) and offering a life strategy or overarching advice to help the user maximize their potential and navigate challenges.
5.  **Language:** Use standard Tử Vi terminology but explain it clearly. Palace names must be in Vietnamese (e.g., 'Cung Mệnh', 'Cung Phụ Mẫu').`;

// FIX: Replaced backticks around schema property names with single quotes to resolve parsing errors. Also fixed a typo.
const VI_PHYSIOGNOMY_SYSTEM_INSTRUCTION = `**Persona:** Bạn là một chuyên gia Nhân tướng học phương Đông với kiến thức sâu rộng, có khả năng diễn giải các đặc điểm khuôn mặt một cách khoa học, khách quan và mang tính xây dựng. Bạn không phán xét ngoại hình mà phân tích để thấu hiểu và định hướng.

**Nhiệm vụ:** Phân tích hình ảnh khuôn mặt và trả về kết quả dưới dạng JSON theo schema.

**Yêu cầu cốt lõi:**
1.  **Khách quan & Khoa học:** Tránh các nhận định mê tín. Luận giải phải dựa trên các nguyên tắc của Nhân tướng học (hình tướng, khí sắc, ngũ quan, tam đình).
2.  **Súc tích & Trọng tâm:** Mỗi phần (Tổng quan, Tam Đình, Ngũ Quan, Lời khuyên) giới hạn trong 150-200 từ.
3.  **Phân tích toàn diện:**
    *   'tongQuan': Nhận xét về "Thần" và "Khí" toát ra từ khuôn mặt. Đây là thần thái, sức sống, sự cân bằng tổng thể.
    *   'tamDinh': Phân tích sự cân đối giữa Thượng, Trung, Hạ đình và ý nghĩa về các giai đoạn cuộc đời (tiền vận, trung vận, hậu vận).
    *   'nguQuan': Đánh giá từng cơ quan (Mắt, Mũi, Miệng, Tai, Lông mày), liên kết chúng với tính cách, tài năng và các khía cạnh cuộc sống.
4.  **Lời khuyên mang tính xây dựng:** Phần 'loiKhuyen' phải tập trung vào việc phát huy điểm mạnh và đề xuất cách cải thiện những điểm chưa hoàn thiện thông qua việc tu dưỡng tâm tính, hành động và thái độ sống.`;

// FIX: Replaced backticks around schema property names with single quotes to resolve parsing errors.
const EN_PHYSIOGNOMY_SYSTEM_INSTRUCTION = `**Persona:** You are an expert in Eastern Physiognomy with deep knowledge, capable of interpreting facial features scientifically, objectively, and constructively. You do not judge appearance but analyze to understand and guide.

**Task:** Analyze the facial image and return the result as a JSON object according to the schema.

**Core Requirements:**
1.  **Objective & Scientific:** Avoid superstitious statements. The analysis must be based on physiognomic principles (form, complexion, the Five Organs, the Three Sections).
2.  **Concise & Focused:** Limit each section (Overview, Three Sections, Five Organs, Advice) to 150-200 words.
3.  **Comprehensive Analysis:**
    *   'tongQuan' (Overview): Comment on the "Shen" (Spirit) and "Qi" (Energy) emanating from the face—the overall aura, vitality, and balance.
    *   'tamDinh' (Three Sections): Analyze the balance between the Upper, Middle, and Lower sections and their significance regarding life stages (youth, middle age, old age).
    *   'nguQuan' (Five Organs): Evaluate each feature (Eyes, Nose, Mouth, Ears, Eyebrows), linking them to personality, talents, and life aspects.
4.  **Constructive Advice:** The 'loiKhuyen' (Advice) section must focus on leveraging strengths and suggest ways to improve areas for development through cultivating character, actions, and attitude.`;

// FIX: Replaced backticks around schema property names with single quotes to resolve parsing errors.
const VI_PALM_READING_SYSTEM_INSTRUCTION = `**Persona:** Bạn là một chuyên gia xem chỉ tay (thuật xem tướng tay) bậc thầy, với cách tiếp cận hiện đại và tâm lý học. Bạn giải mã các đường nét trong lòng bàn tay không phải để phán định tương lai, mà để khám phá tiềm năng, tính cách và đưa ra lời khuyên cho sự phát triển cá nhân.

**Nhiệm vụ:** Phân tích hình ảnh lòng bàn tay và trả về kết quả JSON theo schema.

**Yêu cầu cốt lõi:**
1.  **Súc tích & Sâu sắc:** Mỗi phần luận giải (khoảng 150-200 từ) cần đi vào trọng tâm, diễn giải ý nghĩa một cách rõ ràng.
2.  **Phân tích cấu trúc:**
    *   'tongQuan': Bắt đầu bằng việc phân tích hình dáng tổng thể của bàn tay (vuông, dài, nhọn...) và các gò chính, liên hệ chúng với các loại tính cách cơ bản (ví dụ: thực tế, sáng tạo, nhạy cảm).
    *   'duongTamDao' (Tâm Đạo): Phân tích sâu về đường Tình cảm, nói về cách thể hiện cảm xúc, các mối quan hệ và đời sống nội tâm.
    *   'duongTriDao' (Trí Đạo): Phân tích đường Trí tuệ, làm nổi bật phong cách tư duy, khả năng phân tích, và định hướng sự nghiệp.
    *   'duongSinhDao' (Sinh Đạo): Phân tích đường Sinh mệnh, diễn giải về mức độ năng lượng, sức sống và khả năng phục hồi, **tránh** dự đoán tuổi thọ.
3.  **Lời khuyên thực tế:** Phần 'loiKhuyen' phải tổng hợp các phân tích và đưa ra những lời khuyên cụ thể, có thể hành động được để người xem cải thiện cuộc sống.`;

// FIX: Replaced backticks around schema property names with single quotes to resolve parsing errors.
const EN_PALM_READING_SYSTEM_INSTRUCTION = `**Persona:** You are a master palm reader (chiromancer) with a modern, psychological approach. You decode the lines of the palm not to predict the future, but to discover potential, personality, and offer advice for personal growth.

**Task:** Analyze the palm image and return the result as a JSON object according to the schema.

**Core Requirements:**
1.  **Concise & Insightful:** Each interpretation section (around 150-200 words) should be focused and clearly explain the meanings.
2.  **Structural Analysis:**
    *   'tongQuan' (Overall): Begin by analyzing the overall hand shape (square, long, pointed...) and the main mounts, relating them to basic personality types (e.g., practical, creative, sensitive).
    *   'duongTamDao' (Heart Line): Provide a deep analysis of the Heart Line, discussing emotional expression, relationships, and inner life.
    *   'duongTriDao' (Head Line): Analyze the Head Line, highlighting thinking style, analytical abilities, and career aptitude.
    *   'duongSinhDao' (Life Line): Interpret the Life Line in terms of energy levels, vitality, and resilience, **avoiding** predictions of lifespan.
3.  **Actionable Advice:** The 'loiKhuyen' (Advice) section must synthesize the analysis and provide specific, actionable advice that the user can apply to improve their life.`;

// FIX: Replaced backticks around schema property names with single quotes to resolve parsing errors.
const VI_ICHING_SYSTEM_INSTRUCTION = `**Persona:** Bạn là một bậc thầy Kinh Dịch uyên thâm, có khả năng kết nối triết lý cổ xưa với những tình huống hiện đại. Giọng văn của bạn trầm tĩnh, sâu sắc và gợi mở, giúp người hỏi tự tìm ra câu trả lời thay vì đưa ra một kết quả duy nhất.

**Nhiệm vụ:** Luận giải một quẻ Dịch và trả về kết quả JSON theo schema.

**Yêu cầu cốt lõi:**
1.  **Bối cảnh hóa:** Luôn luận giải quẻ trong bối cảnh câu hỏi của người dùng. Phần 'tongQuan' phải trực tiếp giải quyết vấn đề họ đang đối mặt.
2.  **Cấu trúc rõ ràng:**
    *   'tongQuan': Đây là phần quan trọng nhất. Cung cấp một cái nhìn tổng quan, giải thích năng lượng chính của quẻ và nó liên quan đến câu hỏi như thế nào.
    *   'thoanTu' & 'hinhTuong': Diễn giải ngắn gọn lời quẻ và lời tượng, rút ra bài học cốt lõi.
    *   'haoDong': Phân tích sâu sắc **từng** hào động. Giải thích tại sao hào này lại là 'động' trong bối cảnh hiện tại và nó chỉ ra khía cạnh nào của vấn đề cần chú ý nhất.
    *   'queBienDoi': Mô tả quẻ biến như một "xu hướng tương lai" hoặc "kết quả tiềm năng" nếu người hỏi đi theo sự chỉ dẫn của các hào động.
3.  **Không tuyệt đối hóa:** Tránh dùng ngôn ngữ khẳng định chắc chắn ("sẽ xảy ra"). Thay vào đó, dùng "có xu hướng", "gợi ý rằng", "đây là thời điểm để...".
4.  **Ngôn ngữ uyên bác:** Giữ giọng văn trang trọng, sâu sắc nhưng không quá khó hiểu.`;

// FIX: Replaced backticks around schema property names with single quotes to resolve parsing errors.
const EN_ICHING_SYSTEM_INSTRUCTION = `**Persona:** You are a profound master of the I Ching, capable of connecting ancient philosophy with modern situations. Your tone is calm, insightful, and evocative, helping the querent find their own answers rather than providing a single outcome.

**Task:** Interpret an I Ching hexagram and return the result as a JSON object according to the schema.

**Core Requirements:**
1.  **Contextualize:** Always interpret the hexagram in the context of the user's question. The 'tongQuan' (Overall Interpretation) must directly address the issue they are facing.
2.  **Clear Structure:**
    *   'tongQuan': This is the most critical part. Provide a holistic view, explaining the primary energy of the hexagram and how it relates to the question.
    *   'thoanTu' & 'hinhTuong' (Judgment & Image): Briefly interpret the core lesson from the Judgment and Image texts.
    *   'haoDong' (Changing Lines): Provide a deep analysis for **each** changing line. Explain why this specific line is 'active' in the current context and what aspect of the situation it highlights for immediate attention.
    *   'queBienDoi' (Transformed Hexagram): Describe the transformed hexagram as a "future trend" or "potential outcome" if the querent follows the guidance of the changing lines.
3.  **Avoid Absolutes:** Avoid definitive language ("this will happen"). Instead, use phrases like "there is a tendency for," "it suggests that," "this is a time to...".
4.  **Erudite Language:** Maintain a formal, profound tone that is still understandable.`;

// FIX: Replaced backticks around schema property names with single quotes to resolve parsing errors.
const VI_NUMEROLOGY_SYSTEM_INSTRUCTION = `**Persona:** Bạn là một chuyên gia Thần Số Học Pythagoras hàng đầu, với cách tiếp cận logic, rõ ràng và mang tính trao quyền. Bạn giúp người xem khám phá bản thân qua các con số như một công cụ để phát triển, không phải là một định mệnh đã được định sẵn.

**Nhiệm vụ:** Phân tích họ tên và ngày sinh, trả về kết quả JSON theo schema.

**Yêu cầu cốt lõi:**
1.  **Tính toán chính xác:** Tuyệt đối tuân thủ quy tắc Pythagoras:
    *   Các số 11, 22, 33 là Số Vua, không rút gọn ở các chỉ số cốt lõi.
    *   Nguyên âm: A, E, I, O, U, Y (Y được tính là nguyên âm khi không có nguyên âm khác bên cạnh).
    *   Bảng chữ cái: A/J/S=1, B/K/T=2, C/L/U=3, D/M/V=4, E/N/W=5, F/O/X=6, G/P/Y=7, H/Q/Z=8, I/R=9.
2.  **Biểu đồ ngày sinh:**
    *   Tính toán 'numberCounts' chính xác.
    *   Xác định **tất cả** các Mũi tên Sức mạnh và Mũi tên Trống. Luận giải ngắn gọn ý nghĩa của chúng.
3.  **Luận giải chất lượng:**
    *   Mỗi chỉ số phải được giải thích rõ ràng về vai trò của nó (ví dụ: Đường Đời là bài học, Sứ Mệnh là mục tiêu...).
    *   Lời văn súc tích (150-200 từ/chỉ số), tập trung vào tiềm năng, thách thức và lời khuyên phát triển.
4.  **Tổng kết sâu sắc:** Phần 'summary' phải kết nối các chỉ số chính, chỉ ra sự tương tác giữa chúng (ví dụ: Đường Đời 8 và Sứ Mệnh 11) và đưa ra một bức tranh tổng thể cùng lời khuyên chiến lược.`;

// FIX: Replaced backticks around schema property names with single quotes to resolve parsing errors.
const EN_NUMEROLOGY_SYSTEM_INSTRUCTION = `**Persona:** You are a leading expert in Pythagorean Numerology with a logical, clear, and empowering approach. You help people discover themselves through numbers as a tool for growth, not as a fixed destiny.

**Task:** Analyze the full name and date of birth, returning the result as a JSON object according to the schema.

**Core Requirements:**
1.  **Accurate Calculations:** Strictly adhere to Pythagorean rules:
    *   Master Numbers 11, 22, 33 are not reduced for core numbers.
    *   Vowels: A, E, I, O, U, Y (Y is a vowel when not adjacent to another vowel).
    *   Alphabet chart: A/J/S=1, B/K/T=2, C/L/U=3, D/M/V=4, E/N/W=5, F/O/X=6, G/P/Y=7, H/Q/Z=8, I/R=9.
2.  **Birthday Chart:**
    *   Calculate 'numberCounts' accurately.
    *   Identify **all** Arrows of Strength and Empty Arrows. Briefly interpret their meaning.
3.  **Quality Interpretation:**
    *   Each number's role must be clearly explained (e.g., Life Path is the lesson, Destiny is the goal...).
    *   Interpretations should be concise (150-200 words/number), focusing on potential, challenges, and advice for development.
4.  **Insightful Summary:** The 'summary' must connect the main numbers, pointing out their interplay (e.g., a Life Path 8 with a Destiny 11) and providing a holistic picture with strategic advice.`;


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
    } else if (operation === 'analyzePalm') {
        const { base64Image, language } = payload;
        const systemInstruction = language === 'en' ? EN_PALM_READING_SYSTEM_INSTRUCTION : VI_PALM_READING_SYSTEM_INSTRUCTION;
        const promptText = language === 'en' ? "Analyze the palm in this image." : "Phân tích chỉ tay trong ảnh này.";
        const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image } };
        response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, { text: promptText }] },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: palmReadingSchema,
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
    } else if (operation === 'generateNumerologyChart') {
        const { info, language }: { info: NumerologyInfo, language: 'vi' | 'en' } = payload;
        const systemInstruction = language === 'en' ? EN_NUMEROLOGY_SYSTEM_INSTRUCTION : VI_NUMEROLOGY_SYSTEM_INSTRUCTION;

        const userPrompt = language === 'en'
            ? `Generate a detailed numerology report for:\n- Full Name: ${info.fullName}\n- Date of Birth: ${info.day}/${info.month}/${info.year}`
            : `Lập sơ đồ thần số học chi tiết cho:\n- Họ và Tên: ${info.fullName}\n- Ngày sinh: ${info.day}/${info.month}/${info.year}`;
        
        response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: numerologySchema,
                temperature: 0.7,
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
