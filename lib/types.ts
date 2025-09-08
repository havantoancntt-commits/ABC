export interface BirthInfo {
  name: string;
  gender: 'male' | 'female';
  year: number;
  month: number;
  day: number;
  hour: number;
}

export interface Palace {
  name:string;
  stars: string[];
  interpretation: string;
}

export interface AstrologyChartData {
  anSao: string;
  tongQuan: {
    menh: string;
    than: string;
    thanCungName: string;
  };
  cungMenh: Palace;
  cungPhuMau: Palace;
  cungPhucDuc: Palace;
  cungDienTrach: Palace;
  cungQuanLoc: Palace;
  cungNoBoc: Palace;
  cungThienDi: Palace;
  cungTatAch: Palace;
  cungTaiBach: Palace;
  cungTuTuc: Palace;
  cungPhuThe: Palace;
  cungHuynhDe: Palace;
  tongKet: string;
}

export interface SavedChart {
  id: string;
  birthInfo: BirthInfo;
  chartData: AstrologyChartData;
}

export interface PhysiognomyData {
    tongQuan: string;
    tamDinh: string;
    nguQuan: string;
    loiKhuyen: string;
}

export interface PalmReadingData {
    tongQuan: string;
    duongTamDao: string;
    duongTriDao: string;
    duongSinhDao: string;
    loiKhuyen: string;
}

export interface HandwritingData {
    tongQuan: string;
    khongGian: string;
    netChu: string;
    chuKy: string;
    loiKhuyen: string;
}

export interface ZodiacHour {
    name: string;
    timeRange: string;
    isAuspicious: boolean;
    governingStar: string;
}

export interface ZodiacHourData {
    dayCanChi: string;
    hours: ZodiacHour[];
}

export interface IChingLine {
    value: 6 | 7 | 8 | 9;
    isChanging: boolean;
    isYang: boolean;
}

export interface IChingHexagram {
    number: number;
    name: { vi: string, en: string, pinyin: string };
    judgment: { vi: string, en: string };
    image: { vi: string, en: string };
}

export interface CastResult {
    lines: IChingLine[];
    primaryHexagram: IChingHexagram;
    secondaryHexagram: IChingHexagram | null;
    changingLinesIndices: number[]; // 0-5 for lines 1-6
}

export interface IChingInterpretation {
    tongQuan: string;
    thoanTu: string;
    hinhTuong: string;
    haoDong: {
        line: number; // 1-6
        interpretation: string;
    }[];
    queBienDoi: string | null;
}

export interface NumerologyNumber {
  number: number;
  interpretation: string;
}

export interface NumerologyInfo {
  fullName: string;
  year: number;
  month: number;
  day: number;
}

export interface NumerologyArrow {
  name: string;
  interpretation: string;
}

export interface BirthdayChartData {
  numberCounts: number[]; // Array of 9 numbers, index 0 is count for 1, index 8 is count for 9
  strengthArrows: NumerologyArrow[];
  weaknessArrows: NumerologyArrow[];
}

export interface NumerologyData {
  lifePathNumber: NumerologyNumber;
  destinyNumber: NumerologyNumber;
  soulUrgeNumber: NumerologyNumber;
  personalityNumber: NumerologyNumber;
  birthdayNumber: NumerologyNumber;
  birthdayChart: BirthdayChartData;
  summary: string;
}

export interface TarotCard {
    id: number;
    name: {
        vi: string;
        en: string;
    };
}

export interface TarotReadingData {
    past: string;
    present: string;
    future: string;
    summary: string;
}

export interface FlowAstrologyInfo extends BirthInfo {
  intuitiveNumber: number;
}

export interface FlowSegment {
    period: '7days' | '1month' | '6months';
    energyType: 'luck' | 'love' | 'challenge' | 'helper';
    intensity: number; // 1 to 10
    symbols: ('goldfish' | 'lotus' | 'dragon' | 'none')[];
    interpretation: string;
}

export interface TalismanData {
    name: string;
    description: string;
    svg: string;
}

export interface FlowAstrologyData {
    flow: FlowSegment[];
    predictions: {
        '7days': string;
        '1month': string;
        '6months': string;
    };
    talisman: TalismanData;
}

export interface AuspiciousDayInfo {
    day: number;
    month: number;
    year: number;
    event: string;
}

export interface AuspiciousDayData {
    gregorianDate: string;
    lunarDate: string;
    dayCanChi: string;
    monthCanChi: string;
    yearCanChi: string;
    tietKhi: string;
    truc: string;
    goodStars: string[];
    badStars: string[];
    recommendedActivities: string[];
    avoidActivities: string[];
    overallAnalysis: string;
    eventAnalysis: string;
    auspiciousHours: string[];
}

export interface CareerInfo extends BirthInfo {
  interests: string[];
  skills: string[];
  aspiration?: string;
}

export interface CareerSuggestion {
  careerTitle: string;
  compatibilityScore: number;
  summary: string;
  rationale: string;
  careerPath: string;
  suggestedFields: string[];
}

export interface CareerAdviceData {
  overallAnalysis: string;
  topSuggestions: CareerSuggestion[];
}


export enum AppState {
  HOME,
  SAVED_CHARTS,
  ASTROLOGY_PASSWORD,
  ASTROLOGY_FORM,
  LOADING,
  RESULT,
  FACE_SCAN_CAPTURE,
  FACE_SCAN_LOADING,
  FACE_SCAN_RESULT,
  ZODIAC_HOUR_FINDER,
  ICHING_DIVINATION,
  SHOP,
  NUMEROLOGY_FORM,
  NUMEROLOGY_LOADING,
  NUMEROLOGY_RESULT,
  PALM_SCAN_CAPTURE,
  PALM_SCAN_LOADING,
  PALM_SCAN_RESULT,
  TAROT_READING,
  FLOW_ASTROLOGY_FORM,
  FLOW_ASTROLOGY_LOADING,
  FLOW_ASTROLOGY_RESULT,
  AUSPICIOUS_DAY_FINDER,
  HANDWRITING_ANALYSIS_CAPTURE,
  HANDWRITING_ANALYSIS_LOADING,
  HANDWRITING_ANALYSIS_RESULT,
  CAREER_ADVISOR_FORM,
  CAREER_ADVISOR_LOADING,
  CAREER_ADVISOR_RESULT,
}