import type { ZodiacHour, ZodiacHourData } from './types';

const CAN_VI = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI_VI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const CAN_EN = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'];
const CHI_EN = ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'];

const HOURS_DATA = [
    { vi: 'Tý', en: 'Zi', timeRange: '23:00-01:00' }, { vi: 'Sửu', en: 'Chou', timeRange: '01:00-03:00' },
    { vi: 'Dần', en: 'Yin', timeRange: '03:00-05:00' }, { vi: 'Mão', en: 'Mao', timeRange: '05:00-07:00' },
    { vi: 'Thìn', en: 'Chen', timeRange: '07:00-09:00' }, { vi: 'Tỵ', en: 'Si', timeRange: '09:00-11:00' },
    { vi: 'Ngọ', en: 'Wu', timeRange: '11:00-13:00' }, { vi: 'Mùi', en: 'Wei', timeRange: '13:00-15:00' },
    { vi: 'Thân', en: 'Shen', timeRange: '15:00-17:00' }, { vi: 'Dậu', en: 'You', timeRange: '17:00-19:00' },
    { vi: 'Tuất', en: 'Xu', timeRange: '19:00-21:00' }, { vi: 'Hợi', en: 'Hai', timeRange: '21:00-23:00' }
];

const AUSPICIOUS_STARS_VI = ['Thanh Long', 'Minh Đường', 'Kim Quỹ', 'Thiên Đức', 'Ngọc Đường', 'Tư Mệnh'];
const INAUSPICIOUS_STARS_VI = ['Thiên Hình', 'Chu Tước', 'Bạch Hổ', 'Thiên Lao', 'Nguyên Vũ', 'Câu Trận'];
const AUSPICIOUS_STARS_EN = ['Azure Dragon', 'Bright Hall', 'Golden Chest', 'Celestial Virtue', 'Jade Hall', 'Commanding Destiny'];
const INAUSPICIOUS_STARS_EN = ['Celestial Punishment', 'Vermilion Bird', 'White Tiger', 'Celestial Prison', 'Mysterious Warrior', 'Hook Array'];

// Maps day branch index to the starting auspicious hour index (0=Tý, 1=Sửu...)
const AUSPICIOUS_START_HOUR_MAP: { [key: number]: number } = {
    0: 8,  // Tý, Ngọ -> Thân
    1: 10, // Sửu, Mùi -> Tuất
    2: 0,  // Dần, Thân -> Tý
    3: 2,  // Mão, Dậu -> Dần
    4: 4,  // Thìn, Tuất -> Thìn
    5: 6,  // Tỵ, Hợi -> Ngọ
    6: 8,
    7: 10,
    8: 0,
    9: 2,
    10: 4,
    11: 6,
};

// Epoch: Feb 4, 1984 (UTC) was a Giáp Tý day (Can 0, Chi 0)
const EPOCH_DATE_UTC = Date.UTC(1984, 1, 4); // Month is 0-indexed
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function calculateZodiacData(
  date: { day: number; month: number; year: number },
  language: 'vi' | 'en'
): ZodiacHourData {
    const { day, month, year } = date;
    const targetDateUTC = Date.UTC(year, month - 1, day);
    const dayDiff = Math.floor((targetDateUTC - EPOCH_DATE_UTC) / ONE_DAY_MS);

    const canIndex = (dayDiff % 10 + 10) % 10;
    const chiIndex = (dayDiff % 12 + 12) % 12;

    const CAN = language === 'vi' ? CAN_VI : CAN_EN;
    const CHI = language === 'vi' ? CHI_VI : CHI_EN;
    const dayCanChi = `${CAN[canIndex]} ${CHI[chiIndex]}`;

    const startHourIndex = AUSPICIOUS_START_HOUR_MAP[chiIndex];
    
    const AUSPICIOUS_STARS = language === 'vi' ? AUSPICIOUS_STARS_VI : AUSPICIOUS_STARS_EN;
    const INAUSPICIOUS_STARS = language === 'vi' ? INAUSPICIOUS_STARS_VI : INAUSPICIOUS_STARS_EN;

    const auspiciousHoursIndices = new Set(
        Array.from({ length: 6 }, (_, i) => (startHourIndex + i * 2) % 12)
    );

    let auspiciousStarCounter = 0;
    let inauspiciousStarCounter = 0;

    const hours: ZodiacHour[] = HOURS_DATA.map((hourData, i) => {
        const isAuspicious = auspiciousHoursIndices.has(i);
        let governingStar: string;
        
        if (isAuspicious) {
            governingStar = AUSPICIOUS_STARS[auspiciousStarCounter++];
        } else {
            governingStar = INAUSPICIOUS_STARS[inauspiciousStarCounter++];
        }
        
        return {
            name: language === 'vi' ? hourData.vi : hourData.en,
            timeRange: hourData.timeRange,
            isAuspicious,
            governingStar,
        };
    });

    return { dayCanChi, hours };
}
