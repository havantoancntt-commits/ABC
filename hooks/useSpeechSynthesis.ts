import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechSynthesis = (text: string, lang: string) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
    
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const sentencesRef = useRef<string[]>([]);
    const sentenceBoundariesRef = useRef<{start: number, end: number}[]>([]);

    useEffect(() => {
        // This regex aims to split text into sentences, including their delimiters and the end of the string.
        const sentenceRegex = /[^.!?\n]+(?:[.!?\n]|$)+/g;
        const matches = [...text.matchAll(sentenceRegex)];

        const newSentences: string[] = [];
        const newBoundaries: {start: number, end: number}[] = [];

        for (const match of matches) {
            const sentenceText = match[0].trim();
            if (sentenceText.length > 0) {
                newSentences.push(sentenceText);
                newBoundaries.push({
                    start: match.index!,
                    end: match.index! + match[0].length,
                });
            }
        }
        
        sentencesRef.current = newSentences;
        sentenceBoundariesRef.current = newBoundaries;
    }, [text]);

    const handleBoundary = useCallback((event: SpeechSynthesisEvent) => {
        // Use 'word' boundary as 'sentence' is not widely supported.
        if (event.name === 'word') {
            const charIndex = event.charIndex;
            
            const sentenceIndex = sentenceBoundariesRef.current.findIndex(
                boundary => charIndex >= boundary.start && charIndex < boundary.end
            );

            // Avoid unnecessary re-renders if the sentence index hasn't changed.
            if (sentenceIndex !== -1 && sentenceIndex !== currentSentenceIndex) {
                 setCurrentSentenceIndex(sentenceIndex);
            }
        }
    }, [currentSentenceIndex]);

    const handleEnd = useCallback(() => {
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentSentenceIndex(-1);
    }, []);

    useEffect(() => {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Use 'word' boundary event for better compatibility.
        utterance.onboundary = handleBoundary;
        utterance.onend = handleEnd;
        
        utteranceRef.current = utterance;

        // Voice selection logic
        const setVoice = () => {
            if (!utteranceRef.current) return;
            const voices = synth.getVoices();
            const targetLang = lang === 'vi' ? 'vi-VN' : 'en-US';
            
            // Prefer a specific high-quality female voice if available (example)
            let preferredVoice = voices.find(v => v.name === 'Google Tiếng Việt' && v.lang === 'vi-VN');
            if (!preferredVoice) {
                 // Fallback to any female voice for the target language
                 preferredVoice = voices.find(v => v.lang === targetLang && v.name.toLowerCase().includes('female'));
            }
            if (!preferredVoice) {
                // Fallback to the first available voice for the target language
                preferredVoice = voices.find(v => v.lang === targetLang);
            }
             if (!preferredVoice) {
                // Fallback to the first vietnamese voice
                preferredVoice = voices.find(v => v.lang.startsWith('vi'));
            }
            
            if (preferredVoice) {
                utteranceRef.current.voice = preferredVoice;
            }
             utteranceRef.current.rate = 0.95;
             utteranceRef.current.pitch = 1.0;
        };

        if (synth.getVoices().length > 0) {
            setVoice();
        } else {
            synth.onvoiceschanged = setVoice;
        }

        return () => {
            synth.cancel();
            if (synth.onvoiceschanged) {
                synth.onvoiceschanged = null;
            }
        };
    }, [text, lang, handleBoundary, handleEnd]);

    const play = useCallback(() => {
        const synth = window.speechSynthesis;
        if (!utteranceRef.current) return;

        if (isPaused) {
            synth.resume();
        } else {
            // Cancel any previous speech before starting anew
            synth.cancel(); 
            setCurrentSentenceIndex(0);
            synth.speak(utteranceRef.current);
        }
        setIsSpeaking(true);
        setIsPaused(false);
    }, [isPaused]);

    const pause = useCallback(() => {
        window.speechSynthesis.pause();
        setIsSpeaking(false);
        setIsPaused(true);
    }, []);

    const cancel = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentSentenceIndex(-1);
    }, []);

    return {
        isSpeaking,
        isPaused,
        currentSentenceIndex,
        sentences: sentencesRef.current,
        play,
        pause,
        cancel,
    };
};