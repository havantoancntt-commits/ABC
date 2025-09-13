import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechSynthesis = (text: string, lang: string) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
    
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const sentencesRef = useRef<string[]>([]);

    useEffect(() => {
        const sentences = text.match(/[^.!?]+[.!?\n]+/g) || [text];
        sentencesRef.current = sentences.map(s => s.trim()).filter(s => s.length > 0);
    }, [text]);

    const handleBoundary = useCallback((event: SpeechSynthesisEvent) => {
        if (event.name === 'sentence') {
            const spokenText = text.substring(0, event.charIndex + event.charLength);
            const completedSentences = (spokenText.match(/[.!?\n]/g) || []).length;
            setCurrentSentenceIndex(Math.max(0, completedSentences -1));
        }
    }, [text]);

    const handleEnd = useCallback(() => {
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentSentenceIndex(-1);
    }, []);

    useEffect(() => {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        
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
