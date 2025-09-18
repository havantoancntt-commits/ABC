// --- App State Management ---
export enum AppState {
  HOME,
  ALL_FEATURES,
  SAVED_ITEMS,
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
  TALISMAN_GENERATOR,
  TALISMAN_LOADING,
  TALISMAN_RESULT,
  AUSPICIOUS_NAMING_FORM,
  AUSPICIOUS_NAMING_LOADING,
  AUSPICIOUS_NAMING_RESULT,
  BIO_ENERGY_FORM,
  BIO_ENERGY_CAPTURE,
  BIO_ENERGY_CARD_DRAW,
  BIO_ENERGY_LOADING,
  BIO_ENERGY_RESULT,
  FORTUNE_STICKS_SHAKE,
  FORTUNE_STICKS_LOADING,
  FORTUNE_STICKS_RESULT,
  GOD_OF_WEALTH_BLESSING,
  GOD_OF_WEALTH_LOADING,
  GOD_OF_WEALTH_RESULT,
  PRAYER_GENERATOR_FORM,
  PRAYER_GENERATOR_LOADING,
  PRAYER_GENERATOR_RESULT,
  FENG_SHUI_FORM,
  FENG_SHUI_CAPTURE,
  FENG_SHUI_LOADING,
  FENG_SHUI_RESULT,
  HOA_TAY_SCAN_CAPTURE,
  HOA_TAY_SCAN_LOADING,
  HOA_TAY_SCAN_RESULT,
  NHAT_MENH_FORM,
  NHAT_MENH_LOADING,
  NHAT_MENH_RESULT,
}

export interface AppStateStructure {
  data: {
    birthInfo: BirthInfo | null;
    chartData: AstrologyChartData | null;
    physiognomyData: PhysiognomyData | null;
    numerologyInfo: NumerologyInfo | null;
    numerologyData: NumerologyData | null;
    palmReadingData: PalmReadingData | null;
    handwritingData: HandwritingData | null;
    tarotReadingData: TarotReadingData | null;
    flowAstrologyInfo: FlowAstrologyInfo | null;
    flowAstrologyData: FlowAstrologyData | null;
    careerInfo: CareerInfo | null;
    careerAdviceData: CareerAdviceData | null;
    talismanInfo: TalismanInfo | null;
    talismanData: TalismanData | null;
    auspiciousNamingInfo: AuspiciousNamingInfo | null;
    auspiciousNamingData: AuspiciousNamingData | null;
    bioEnergyInfo: BioEnergyInfo | null;
    bioEnergyData: BioEnergyData | null;
    fortuneStickInfo: FortuneStickInfo | null;
    fortuneStickData: FortuneStickData | null;
    godOfWealthInfo: GodOfWealthInfo | null;
    godOfWealthData: GodOfWealthData | null;
    prayerRequestInfo: PrayerRequestInfo | null;
    prayerData: PrayerData | null;
    fengShuiInfo: FengShuiInfo | null;
    fengShuiData: FengShuiData | null;
    hoaTayData: HoaTayData | null;
    nhatMenhInfo: NhatMenhInfo | null;
    nhatMenhData: NhatMenhData | null;
    capturedImage: string | null;
    capturedPalmImage: string | null;
    capturedHandwritingImage: string | null;
    capturedEnergyColor: string | null;
    drawnBioEnergyCard: BioEnergyCard | null;
    fengShuiThumbnail: string | null;
  };
  currentView: AppState;
  error: string | null;
}

export type ConfirmationModalState = 
    | { type: 'deleteItem'; item: SavedItem; title: string; message: string; };


// --- Feature-Specific Types ---

export interface NhatMenhInfo {
  day: number;
  month: number;
  year: number;
  hour?: number;
  spiritualMark: string;
}

export interface NhatMenhData {
  destinyNumber: number;
  dominantElement: 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';
  overallReading: string;
  luckyZodiac: string;
  unluckyZodiac: string;
  luckyColorName: string;
  luckyColorHex: string;
  dailyMessage: string;
  spiritualMarkInterpretation: string;
}

export interface BirthInfo {
  name: string;
  gender: 'male' | 'female';
  year: number;
  month: number;
  day: number;
  hour: number;
}

export interface Palace {
  key: string;
  name: string;
  branchName: string;
  stars: string[];
  interpretation: string;
}

export interface AstrologyChartData {
  anSao: string;
  tongQuan: {
    menh: string;
    than: string;
    thanCungKey: string;
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

export interface PhysiognomyData {
    tongQuan: string;
    tamDinh: string;
    nguQuan: string;
    notRuoiVaTanNhang?: string; // Optional field for moles & freckles
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

export interface HoaTayData {
    leftHandWhorls: number;
    rightHandWhorls: number;
    totalWhorls: number;
    leftHandInterpretation: string;
    rightHandInterpretation: string;
    overallInterpretation: string;
    advice: string;
}

export interface FingerprintAnalysisData {
    pattern: 'whorl' | 'loop';
    confidence: number;
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

export interface TalismanInfo {
  name: string;
  year: number;
  month: number;
  day: number;
}

export interface TalismanData {
    name: string;
    description: string;
    svg: string;
    cauChu: string;
    interpretation: string;
    usage: string;
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

export interface AuspiciousNamingInfo {
    childLastName: string;
    childGender: 'male' | 'female';
    childYear: number;
    childMonth: number;
    childDay: number;
    isBorn: boolean;
    fatherName: string;
    motherName: string;
    desiredQualities: string[];
    otherConstraints: string;
}

export interface NameSuggestion {
    fullName: string;
    meaningAnalysis: string;
    fiveElementsAnalysis: string;
    phoneticsAnalysis: string;
    overall: string;
}

export interface AuspiciousNamingData {
    analysisSummary: string;
    nameSuggestions: NameSuggestion[];
}

export interface BioEnergyInfo {
    name: string;
    year: number;
    month: number;
    day: number;
}

export interface BioEnergyCard {
    id: number;
    group: { vi: string; en: string };
    name: { vi: string; en: string };
}

export interface BioEnergyData {
    colorAnalysis: string;
    cardAnalysis: string;
    synthesizedPrediction: string;
}

export interface FortuneStickInfo {
    stickNumber: number;
    question: string;
}

export interface FortuneStickData {
    stickNumber: number;
    poem: string;
    interpretation: string;
    summary: string;
    gregorianDate: string;
    lunarDate: string;
}

export interface GodOfWealthInfo {
  name: string;
  wish: string;
}

export interface GodOfWealthData {
  luckyNumber: string;
  blessingMessage: string;
  interpretation: string;
}

export interface PrayerRequestInfo {
    name: string;
    occasion: string;
    deity: string;
}

export interface PrayerData {
    title: string;
    prayerText: string;
    interpretation: string;
}

export interface FengShuiInfo {
    spaceType: string;
    ownerBirthYear: number;
    question: string;
}

export interface FengShuiRecommendation {
    khuVuc: string;
    deXuat: string;
}

export interface FengShuiData {
    tongQuan: string;
    uuDiem: string[];
    nhuocDiem: string[];
    giaiPhap: FengShuiRecommendation[];
}


// --- Saved Item Data Structures ---

export interface SavedAstrologyPayload {
    type: 'astrology';
    birthInfo: BirthInfo;
    chartData: AstrologyChartData;
}

export interface SavedPhysiognomyPayload {
    type: 'physiognomy';
    name: string; // e.g., "Physiognomy Analysis - 2024-07-29"
    imageData: string;
    analysisData: PhysiognomyData;
}

export interface SavedPalmReadingPayload {
    type: 'palmReading';
    name: string;
    imageData: string;
    analysisData: PalmReadingData;
}

export interface SavedHandwritingPayload {
    type: 'handwriting';
    name: string;
    imageData: string;
    analysisData: HandwritingData;
}

export interface SavedHoaTayPayload {
    type: 'hoaTay';
    name: string;
    analysisData: HoaTayData;
}

export interface SavedNumerologyPayload {
    type: 'numerology';
    info: NumerologyInfo;
    data: NumerologyData;
}

export interface SavedFlowAstrologyPayload {
    type: 'flowAstrology';
    info: FlowAstrologyInfo;
    data: FlowAstrologyData;
}

export interface SavedAuspiciousNamingPayload {
    type: 'auspiciousNaming';
    info: AuspiciousNamingInfo;
    data: AuspiciousNamingData;
}

export interface SavedBioEnergyPayload {
    type: 'bioEnergy';
    info: BioEnergyInfo;
    color: string;
    card: BioEnergyCard;
    data: BioEnergyData;
}

export interface SavedGodOfWealthPayload {
    type: 'godOfWealth';
    info: GodOfWealthInfo;
    data: GodOfWealthData;
}

export interface SavedPrayerPayload {
    type: 'prayer';
    info: PrayerRequestInfo;
    data: PrayerData;
}

export interface SavedFengShuiPayload {
    type: 'fengShui';
    info: FengShuiInfo;
    data: FengShuiData;
    thumbnail: string;
}

export interface SavedNhatMenhPayload {
    type: 'nhatMenh';
    info: NhatMenhInfo;
    data: NhatMenhData;
}

export type SavedItemPayload = 
    | SavedAstrologyPayload 
    | SavedPhysiognomyPayload 
    | SavedNumerologyPayload 
    | SavedPalmReadingPayload 
    | SavedHandwritingPayload
    | SavedHoaTayPayload
    | SavedFlowAstrologyPayload 
    | SavedAuspiciousNamingPayload
    | SavedBioEnergyPayload
    | SavedGodOfWealthPayload
    | SavedPrayerPayload
    | SavedFengShuiPayload
    | SavedNhatMenhPayload;

export interface SavedItem {
    id: string;
    timestamp: string; // ISO string for sorting
    payload: SavedItemPayload;
}

// --- Admin & User Management Types ---

export interface AdminLogEntry {
    timestamp: string;
    user: string;
    action: string;
    details: string;
}

export interface GoogleUser {
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  sub: string; // User ID
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    createdAt: string;
    userId: string;
}
