import type { IChingLine, CastResult, IChingHexagram } from './types';
import { IChingData } from './ichingData';

// This mapping array correctly converts the Fu Xi sequence number (derived from the binary value of the lines, 0-63)
// to the traditional King Wen sequence number (1-64), fixing a critical bug in hexagram identification.
const fuXiToKingWen = [
    2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 
    40, 64, 47, 6, 46, 18, 48, 57, 50, 32, 55, 63, 43, 28, 49, 30, 41, 19, 61, 
    38, 54, 17, 25, 26, 36, 22, 60, 51, 21, 10, 58, 14, 9, 27, 44, 13, 1, 34, 5
];

const getHexagramFromLines = (lines: IChingLine[]): IChingHexagram => {
    let binStr = "";
    // Build the binary string from the lines, reading from bottom (index 0) to top (index 5)
    for (let i = 0; i < 6; i++) {
        binStr = (lines[i].isYang ? '1' : '0') + binStr;
    }
    const fuXiNumber = parseInt(binStr, 2); // This is the Fu Xi number (0-63)
    const kingWenNumber = fuXiToKingWen[fuXiNumber];
    
    const hexagram = IChingData.find(h => h.number === kingWenNumber);
    if (!hexagram) {
        console.error(`Could not find hexagram for Fu Xi number ${fuXiNumber} (King Wen: ${kingWenNumber})`);
        // Fallback to avoid a crash, though this would indicate a data error.
        return IChingData[0];
    }
    return hexagram;
};

export const getCastResultFromLines = (lines: IChingLine[]): CastResult => {
    const changingLinesIndices: number[] = [];
    lines.forEach((line, index) => {
        if (line.isChanging) {
            changingLinesIndices.push(index);
        }
    });

    const primaryHexagram = getHexagramFromLines(lines);

    let secondaryHexagram = null;
    if (changingLinesIndices.length > 0) {
        const secondaryLines = lines.map(line => ({
            ...line,
            // The isYang property of a changing line is flipped to get the secondary hexagram
            isYang: line.isChanging ? !line.isYang : line.isYang,
        }));
        secondaryHexagram = getHexagramFromLines(secondaryLines);
    }

    return {
        lines,
        primaryHexagram,
        secondaryHexagram,
        changingLinesIndices,
    };
};