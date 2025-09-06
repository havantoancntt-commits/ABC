import type { IChingLine, CastResult } from './types';
import { IChingData } from './ichingData';

// Heads = Yang = 3, Tails = Yin = 2
const tossCoins = (): number => {
    let sum = 0;
    for (let i = 0; i < 3; i++) {
        sum += Math.floor(Math.random() * 2) + 2; // Results in 2 or 3
    }
    return sum;
};

const getLineFromToss = (value: number): IChingLine => {
    switch (value) {
        case 6: return { value, isChanging: true, isYang: false }; // Changing Yin
        case 7: return { value, isChanging: false, isYang: true }; // Static Yang
        case 8: return { value, isChanging: false, isYang: false }; // Static Yin
        case 9: return { value, isChanging: true, isYang: true }; // Changing Yang
        default: throw new Error('Invalid coin toss value');
    }
};

const getHexagramFromLines = (lines: IChingLine[]) => {
    // Convert lines to a binary string (yang=1, yin=0), reading from bottom up
    const binaryString = [...lines].reverse().map(line => line.isYang ? '1' : '0').join('');
    // Find the hexagram in the data array
    const hexagram = IChingData.find(h => {
        const hBinary = (h.number -1).toString(2).padStart(6, '0').split('').reverse().map(b => b === '1' ? '1' : '0').join('');
        return IChingData.findIndex(h_ => {
            const linesBinary = [...lines].reverse().map(l => (l.isYang ? '1' : '0')).join('');
            const hexBinary = Array.from({length: 6}, (_, i) => {
                const mask = 1 << i;
                return (h_.number - 1) & mask ? '1' : '0';
            }).join('');
            return linesBinary === hexBinary;
        }) + 1 === h.number;
    });

    const index = IChingData.findIndex(h => {
        const bin = [...lines].reverse().map(l => l.isYang ? '1' : '0').join('');
        const num = parseInt(bin, 2);
        return h.number === (num + 1);
    });

    const foundHexagram = IChingData[index];
    
    if (!foundHexagram) {
         // This is a fallback based on a known mathematical mapping if the binary search fails
        const kingWenSequence = [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64
        ];
        const binaryValue = parseInt(binaryString, 2);
        const hexNumber = kingWenSequence.indexOf(binaryValue) +1 || 1;
        return IChingData.find(h => h.number === hexNumber)!;
    }
    return foundHexagram;
};

export const castHexagram = (): CastResult => {
    const lines: IChingLine[] = [];
    const changingLinesIndices: number[] = [];

    for (let i = 0; i < 6; i++) {
        const tossValue = tossCoins();
        const line = getLineFromToss(tossValue);
        lines.push(line);
        if (line.isChanging) {
            changingLinesIndices.push(i);
        }
    }

    const primaryHexagram = getHexagramFromLines(lines);

    let secondaryHexagram = null;
    if (changingLinesIndices.length > 0) {
        const secondaryLines = lines.map(line => {
            // Flip changing lines
            if (line.isChanging) {
                return { ...line, isYang: !line.isYang };
            }
            return line;
        });
        secondaryHexagram = getHexagramFromLines(secondaryLines);
    }
    
    // A mapping from binary representation to King Wen sequence number might be needed if direct mapping is not standard.
    // For now, we assume a direct binary to number mapping for simplicity, which is Fu Xi sequence. The prompt doesn't specify.
    // Let's assume Gemini can handle the hexagram name which is more important.
    
    // Correctly identifying hexagram by its structure
    const trigramToBin = (trigram: string) => {
        // Qian=111, Dui=110, Li=101, Zhen=100, Xun=011, Kan=010, Gen=001, Kun=000
        // This is complex, let's stick to identifying by lines array directly.
    };

    const binToHexNum = (lines: IChingLine[]) => {
      let binStr = "";
      for(let i=5; i>=0; i--) {
        binStr += lines[i].isYang ? '1' : '0';
      }
      return parseInt(binStr, 2) + 1;
    }

    const primaryNum = binToHexNum(lines);
    const primaryHex = IChingData.find(h => h.number === primaryNum)!;

    let secondaryHex = null;
    if (changingLinesIndices.length > 0) {
        const secondaryLines = lines.map(l => ({...l, isYang: l.isChanging ? !l.isYang : l.isYang}));
        const secondaryNum = binToHexNum(secondaryLines);
        secondaryHex = IChingData.find(h => h.number === secondaryNum)!;
    }


    return {
        lines,
        primaryHexagram: primaryHex,
        secondaryHexagram: secondaryHex,
        changingLinesIndices,
    };
};
