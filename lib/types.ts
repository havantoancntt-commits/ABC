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


export enum AppState {
  HOME,
  SAVED_CHARTS,
  ASTROLOGY_FORM,
  LOADING,
  RESULT,
  FACE_SCAN_CAPTURE,
  FACE_SCAN_LOADING,
  FACE_SCAN_RESULT,
  ZODIAC_HOUR_FINDER,
}