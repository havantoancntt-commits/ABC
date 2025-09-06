export interface BirthInfo {
  name: string;
  gender: 'male' | 'female';
  year: number;
  month: number;
  day: number;
  hour: number;
}

export interface Palace {
  name: string;
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

export interface NumerologyData {
  lifePathNumber: NumerologyNumber;
  destinyNumber: NumerologyNumber;
  soulUrgeNumber: NumerologyNumber;
  personalityNumber: NumerologyNumber;
  birthdayNumber: NumerologyNumber;
  summary: string;
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
}
