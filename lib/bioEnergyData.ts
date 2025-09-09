import type { BioEnergyCard } from './types';

const GROUPS = {
    thienMenh: { vi: 'Thiên Mệnh', en: 'Destiny' },
    nhanDuyen: { vi: 'Nhân Duyên', en: 'Connection' },
    taiLoc: { vi: 'Tài Lộc', en: 'Prosperity' },
    bienCo: { vi: 'Biến Cố', en: 'Event' },
    chuyenHoa: { vi: 'Chuyển Hóa', en: 'Transformation' },
    mayMan: { vi: 'May Mắn', en: 'Fortune' },
};

export const BIO_ENERGY_CARDS: readonly BioEnergyCard[] = [
    // Thiên Mệnh
    { id: 1, group: GROUPS.thienMenh, name: { vi: 'Mặt Trời', en: 'The Sun' } },
    { id: 2, group: GROUPS.thienMenh, name: { vi: 'Mặt Trăng', en: 'The Moon' } },
    { id: 3, group: GROUPS.thienMenh, name: { vi: 'Vì Sao', en: 'The Star' } },
    { id: 4, group: GROUPS.thienMenh, name: { vi: 'Vũ Trụ', en: 'The Cosmos' } },
    { id: 5, group: GROUPS.thienMenh, name: { vi: 'Hư Vô', en: 'The Void' } },
    { id: 6, group: GROUPS.thienMenh, name: { vi: 'Con Đường', en: 'The Path' } },
    // Nhân Duyên
    { id: 7, group: GROUPS.nhanDuyen, name: { vi: 'Lửa Thiêng', en: 'The Twin Flame' } },
    { id: 8, group: GROUPS.nhanDuyen, name: { vi: 'Tri Kỷ', en: 'The Soulmate' } },
    { id: 9, group: GROUPS.nhanDuyen, name: { vi: 'Nghiệp Duyên', en: 'The Karmic Tie' } },
    { id: 10, group: GROUPS.nhanDuyen, name: { vi: 'Gia Đình', en: 'The Family' } },
    { id: 11, group: GROUPS.nhanDuyen, name: { vi: 'Bằng Hữu', en: 'The Friendship' } },
    { id: 12, group: GROUPS.nhanDuyen, name: { vi: 'Đơn Độc', en: 'The Solitude' } },
    // Tài Lộc
    { id: 13, group: GROUPS.taiLoc, name: { vi: 'Kim Sơn', en: 'The Mountain of Gold' } },
    { id: 14, group: GROUPS.taiLoc, name: { vi: 'Trường Giang', en: 'The Flowing River' } },
    { id: 15, group: GROUPS.taiLoc, name: { vi: 'Hạt Giống', en: 'The Seed' } },
    { id: 16, group: GROUPS.taiLoc, name: { vi: 'Thương Nhân', en: 'The Merchant' } },
    { id: 17, group: GROUPS.taiLoc, name: { vi: 'Mùa Màng', en: 'The Harvest' } },
    { id: 18, group: GROUPS.taiLoc, name: { vi: 'Kho Báu', en: 'The Treasury' } },
    // Biến Cố
    { id: 19, group: GROUPS.bienCo, name: { vi: 'Ngọn Tháp', en: 'The Tower' } },
    { id: 20, group: GROUPS.bienCo, name: { vi: 'Bão Tố', en: 'The Storm' } },
    { id: 21, group: GROUPS.bienCo, name: { vi: 'Xiềng Xích', en: 'The Chains' } },
    { id: 22, group: GROUPS.bienCo, name: { vi: 'Nguyệt Thực', en: 'The Eclipse' } },
    { id: 23, group: GROUPS.bienCo, name: { vi: 'Ngã Rẽ', en: 'The Crossroads' } },
    { id: 24, group: GROUPS.bienCo, name: { vi: 'Tấm Gương', en: 'The Mirror' } },
    // Chuyển Hóa
    { id: 25, group: GROUPS.chuyenHoa, name: { vi: 'Phượng Hoàng', en: 'The Phoenix' } },
    { id: 26, group: GROUPS.chuyenHoa, name: { vi: 'Linh Xà', en: 'The Serpent' } },
    { id: 27, group: GROUPS.chuyenHoa, name: { vi: 'Hồ Điệp', en: 'The Butterfly' } },
    { id: 28, group: GROUPS.chuyenHoa, name: { vi: 'Nhà Giả Kim', en: 'The Alchemist' } },
    { id: 29, group: GROUPS.chuyenHoa, name: { vi: 'Cây Cầu', en: 'The Bridge' } },
    { id: 30, group: GROUPS.chuyenHoa, name: { vi: 'Cánh Cửa', en: 'The Doorway' } },
    // May Mắn
    { id: 31, group: GROUPS.mayMan, name: { vi: 'Cỏ Bốn Lá', en: 'The Four-Leaf Clover' } },
    { id: 32, group: GROUPS.mayMan, name: { vi: 'Sao Băng', en: 'The Shooting Star' } },
    { id: 33, group: GROUPS.mayMan, name: { vi: 'Món Quà', en: 'The Gift' } },
    { id: 34, group: GROUPS.mayMan, name: { vi: 'Suối Nguồn', en: 'The Spring' } },
    { id: 35, group: GROUPS.mayMan, name: { vi: 'Thần Hộ Mệnh', en: 'The Guardian' } },
    { id: 36, group: GROUPS.mayMan, name: { vi: 'Chìa Khóa', en: 'The Key' } },
];
