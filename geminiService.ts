import { GoogleGenAI, Type } from "@google/genai";
import type { BirthInfo, AstrologyChartData, PhysiognomyData } from './types';

// Helper function to lazily initialize the AI client and handle missing API key
const getAiClient = () => {
    if (!process.env.TUVI_API) {
        // This error will be caught by the calling function's try/catch block
        throw new Error("TUVI_API is not configured.");
    }
    return new GoogleGenAI({ apiKey: process.env.TUVI_API });
};

const palaceSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    stars: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    interpretation: { type: Type.STRING },
  },
  required: ['name', 'stars', 'interpretation']
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    anSao: {
        type: Type.STRING,
        description: "Bảng an sao đầy đủ, trình bày dưới dạng một chuỗi văn bản có định dạng."
    },
    tongQuan: {
        type: Type.OBJECT,
        properties: {
            menh: { type: Type.STRING, description: "Luận giải tổng quan về cung Mệnh." },
            than: { type: Type.STRING, description: "Luận giải tổng quan về cung Thân." },
            thanCungName: { type: Type.STRING, description: "Tên của cung an Thân, ví dụ: 'Cung Quan Lộc'." },
        },
        required: ['menh', 'than', 'thanCungName']
    },
    cungMenh: palaceSchema,
    cungPhuMau: palaceSchema,
    cungPhucDuc: palaceSchema,
    cungDienTrach: palaceSchema,
    cungQuanLoc: palaceSchema,
    cungNoBoc: palaceSchema,
    cungThienDi: palaceSchema,
    cungTatAch: palaceSchema,
    cungTaiBach: palaceSchema,
    cungTuTuc: palaceSchema,
    cungPhuThe: palaceSchema,
    cungHuynhDe: palaceSchema,
    tongKet: {
        type: Type.STRING,
        description: "Tổng kết toàn bộ lá số, nêu bật những điểm chính, ưu nhược điểm, và đưa ra lời khuyên tổng quan cho đương số."
    },
  },
  required: [
    'anSao', 'tongQuan', 'cungMenh', 'cungPhuMau', 'cungPhucDuc', 'cungDienTrach',
    'cungQuanLoc', 'cungNoBoc', 'cungThienDi', 'cungTatAch', 'cungTaiBach',
    'cungTuTuc', 'cungPhuThe', 'cungHuynhDe', 'tongKet'
  ]
};

export const generateAstrologyChart = async (info: BirthInfo): Promise<AstrologyChartData> => {
  const hourString = info.hour === -1 ? 'Không rõ' : `${info.hour} giờ`;
  
  const prompt = `
    Bạn là một chuyên gia Tử Vi Đẩu Số bậc thầy, uyên bác và có khả năng luận giải sâu sắc.
    Nhiệm vụ của bạn là lập một lá số tử vi chi tiết, chuyên nghiệp và chính xác dựa trên thông tin được cung cấp.

    Thông tin đương số:
    - Họ và tên: ${info.name}
    - Giới tính: ${info.gender}
    - Ngày sinh (Dương Lịch): ${info.day}/${info.month}/${info.year}
    - Giờ sinh: ${hourString}

    Yêu cầu:
    1.  Lập lá số tử vi đầy đủ, xác định chính xác Mệnh, Cục, và an tất cả các chính tinh, phụ tinh vào 12 cung. Nếu không rõ giờ sinh, hãy an lá số theo giờ Tý (0 giờ) và ghi chú rõ ràng trong phần luận giải rằng lá số được an theo giờ Tý do không có thông tin giờ sinh chính xác, và các cung an Thân, cũng như một số sao phụ thuộc giờ sinh có thể không chính xác.
    2.  Luận giải tổng quan về Mệnh và Thân của đương số. Xác định rõ Cung an Thân là cung nào trong 12 cung (ví dụ: Mệnh Thân đồng cung, Thân cư Quan Lộc, v.v.) và trả về tên cung đó trong trường 'thanCungName'.
    3.  Luận giải chi tiết 12 cung số: Mệnh, Phụ Mẫu, Phúc Đức, Điền Trạch, Quan Lộc, Nô Bộc, Thiên Di, Tật Ách, Tài Bạch, Tử Tức, Phu Thê, Huynh Đệ.
    4.  Phần luận giải phải sâu sắc, logic, sử dụng thuật ngữ tử vi chuẩn xác nhưng phải diễn giải một cách rõ ràng, dễ hiểu cho người không chuyên.
    5.  Sau khi luận giải 12 cung, hãy viết một đoạn "Tổng kết" để tóm lược những điểm quan trọng nhất của lá số, bao gồm ưu điểm, nhược điểm và đưa ra lời khuyên hữu ích cho đương số.
    6.  Cung cấp kết quả dưới định dạng JSON theo schema đã cho.

    Hãy tiến hành lập và luận giải lá số.
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AstrologyChartData;
  } catch (error) {
    console.error("Error generating astrology chart:", error);
    throw new Error("Không thể kết nối đến chuyên gia tử vi. Vui lòng kiểm tra lại kết nối mạng và thử lại sau.");
  }
};

const physiognomySchema = {
    type: Type.OBJECT,
    properties: {
        tongQuan: { type: Type.STRING, description: 'Luận giải tổng quan về thần thái, khí sắc và cốt cách toát ra từ khuôn mặt.' },
        tamDinh: { type: Type.STRING, description: 'Phân tích chi tiết về Tam Đình (Thượng Đình, Trung Đình, Hạ Đình), đánh giá sự cân đối và ý nghĩa của từng phần.' },
        nguQuan: { type: Type.STRING, description: 'Phân tích chi tiết về Ngũ Quan (Mắt, Lông Mày, Mũi, Miệng, Tai), luận giải về tính cách, vận mệnh liên quan.' },
        loiKhuyen: { type: Type.STRING, description: 'Đưa ra lời khuyên hữu ích dựa trên những đặc điểm nhân tướng đã phân tích, giúp đương số phát huy ưu điểm và khắc phục nhược điểm.' },
    },
    required: ['tongQuan', 'tamDinh', 'nguQuan', 'loiKhuyen']
};

export const analyzePhysiognomy = async (base64Image: string): Promise<PhysiognomyData> => {
    const prompt = `
        Bạn là một bậc thầy về Nhân tướng học của phương Đông, với kiến thức uyên thâm và khả năng quan sát tinh tường.
        Nhiệm vụ của bạn là phân tích hình ảnh khuôn mặt được cung cấp và đưa ra một bản luận giải chi tiết, sâu sắc và chuyên nghiệp.

        Yêu cầu:
        1.  Phân tích tổng quan về thần thái, khí sắc, và cốt cách toát ra từ khuôn mặt.
        2.  Phân tích chi tiết về Tam Đình (Thượng Đình, Trung Đình, Hạ Đình), đánh giá sự cân đối và ý nghĩa của từng phần.
        3.  Phân tích chi tiết về Ngũ Quan (Mắt, Lông Mày, Mũi, Miệng, Tai), luận giải về tính cách, vận mệnh liên quan.
        4.  Đưa ra lời khuyên hữu ích dựa trên những đặc điểm nhân tướng đã phân tích, giúp đương số phát huy ưu điểm và khắc phục nhược điểm.
        5.  Sử dụng ngôn ngữ trang trọng, chuẩn mực của một chuyên gia nhân tướng học, nhưng diễn giải rõ ràng, dễ hiểu.
        6.  Cung cấp kết quả dưới định dạng JSON theo schema đã cho.
    `;

    try {
        const ai = getAiClient();
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
            },
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: physiognomySchema,
                temperature: 0.6,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as PhysiognomyData;
    } catch (error) {
        console.error("Error analyzing physiognomy:", error);
        throw new Error("Không thể kết nối đến chuyên gia nhân tướng. Vui lòng kiểm tra lại kết nối mạng và thử lại sau.");
    }
};