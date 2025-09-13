import React, { useState, useRef, useCallback, useEffect } from 'react';
import Card from './Card';
import Button from './Button';
import Spinner from './Spinner';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
  onAnalyze: (frames: string[], thumbnail: string) => void;
  onBack: () => void;
}

const FRAME_COUNT = 5;
const RECORDING_DURATION_S = 15;

const FengShuiCapture: React.FC<Props> = ({ onAnalyze, onBack }) => {
  const { t } = useLocalization();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'starting_camera' | 'ready' | 'recording' | 'preview' | 'extracting'>('idle');
  
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (status !== 'idle') return;
    setStatus('starting_camera');
    setError(null);
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        streamRef.current = stream;
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
        }
        setStatus('ready');
    } catch (err) {
        console.error("Camera error:", err);
        let message = t('errorCameraUnknown');
        if (err instanceof Error) {
            if (err.name === 'NotAllowedError') message = t('errorCameraPermission');
            else if (err.name === 'NotFoundError') message = t('errorCameraNotFound');
            else message = t('errorCameraInUse');
        }
        setError(message);
        setStatus('idle');
    }
  }, [status, t]);

  useEffect(() => {
    return () => { // Cleanup on unmount
      stopCamera();
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, [stopCamera]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && status === 'recording') {
        mediaRecorderRef.current.stop();
        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    }
  }, [status]);

  const startRecording = useCallback(() => {
    if (!streamRef.current || status !== 'ready') return;
    recordedChunksRef.current = [];
    try {
        mediaRecorderRef.current = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
    } catch (e) {
        setError("Video recording not supported on your browser.");
        return;
    }
    mediaRecorderRef.current.ondataavailable = (event) => { if (event.data.size > 0) recordedChunksRef.current.push(event.data); };
    mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        stopCamera();
        setStatus('preview');
    };
    mediaRecorderRef.current.start();
    setStatus('recording');
    setRecordingTime(0);
    recordingIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
            const newTime = prev + 1;
            if (newTime >= RECORDING_DURATION_S) stopRecording();
            return newTime;
        });
    }, 1000);
  }, [status, stopCamera, t]);

  const handleRetake = useCallback(() => {
    if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
    setRecordedVideoUrl(null);
    setRecordingTime(0);
    setError(null);
    startCamera();
  }, [recordedVideoUrl, startCamera]);

  const extractFrames = useCallback(async () => {
    if (!recordedVideoUrl || !canvasRef.current) return;
    setStatus('extracting');

    const video = document.createElement('video');
    video.src = recordedVideoUrl;
    video.muted = true;

    await new Promise(resolve => {
        video.onloadedmetadata = resolve;
    });
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) {
        setError("Could not process video.");
        setStatus('preview');
        return;
    }

    const duration = video.duration;
    const frames: string[] = [];
    let thumbnail = '';

    for (let i = 0; i < FRAME_COUNT; i++) {
        const time = (i + 1) * (duration / (FRAME_COUNT + 1));
        video.currentTime = time;
        await new Promise(resolve => { video.onseeked = resolve; });

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const frameDataUrl = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        if (!frameDataUrl) continue;

        frames.push(frameDataUrl);
        if (i === 0) {
            thumbnail = frameDataUrl;
        }
    }
    
    URL.revokeObjectURL(recordedVideoUrl); // Clean up blob
    onAnalyze(frames, thumbnail);

  }, [onAnalyze, recordedVideoUrl, t]);
  
  return (
    <Card className="max-w-xl mx-auto flex flex-col items-center">
      <h2 className="text-3xl font-bold text-center mb-4 text-green-300 font-serif">{t('fengShuiCaptureTitle')}</h2>
      <p className="text-center text-gray-400 mb-6 max-w-lg">{t('fengShuiCaptureSubtitle')}</p>
      
      {error && (
        <div className="my-4 p-4 w-full bg-red-900/50 border border-red-600 rounded-lg text-center">
          <p className="font-semibold text-red-300">{error}</p>
        </div>
      )}
      
      <div className="relative w-full max-w-md aspect-video rounded-2xl overflow-hidden bg-gray-950/80 border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-400 group">
        <canvas ref={canvasRef} className="hidden" />
        <video ref={videoRef} autoPlay playsInline muted src={recordedVideoUrl || ''}
            className={`w-full h-full object-cover transition-opacity duration-500 ${(status === 'ready' || status === 'recording' || status === 'preview') ? 'opacity-100' : 'opacity-0'}`} />
        
        {status === 'starting_camera' && <Spinner initialMessageKey='spinnerCamera' />}
        {status === 'extracting' && <Spinner initialMessageKey='fengShuiExtractingFrames' />}
        
        {status === 'idle' && (
             <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10 bg-gray-950/50">
                <button onClick={startCamera} className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-green-500/30 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-400/50 animate-pulse-glow" aria-label={t('faceScanOpenCamera')}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-14 sm:h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
            </div>
        )}

        {(status === 'ready' || status === 'recording') && (
            <>
                <div className="absolute top-4 left-4 right-4 p-2 bg-black/60 rounded-lg text-center text-white font-semibold text-sm backdrop-blur-sm border border-white/10">
                    {t('fengShuiCaptureInstruction')}
                </div>
                {status === 'recording' && <div className="absolute top-16 right-6 flex items-center gap-2 bg-red-600 text-white font-bold text-xs px-2 py-1 rounded-full"><div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>{t('faceScanRecording', {time: recordingTime})}</div>}
            </>
        )}
        
        {status === 'preview' && (
             <div className="absolute top-4 left-4 right-4 p-2 bg-black/60 rounded-lg text-center text-white font-semibold text-sm backdrop-blur-sm border border-white/10">{t('fengShuiCapturePreview')}</div>
        )}
      </div>

      <div className="mt-8 w-full max-w-lg">
        {status === 'ready' && (
            <div className="flex justify-center">
                <button onClick={startRecording} className="w-20 h-20 rounded-full bg-white border-4 border-white/50 p-1 transition-transform hover:scale-105 active:scale-95" aria-label={t('faceScanRecord')}><div className="w-full h-full rounded-full bg-red-600"></div></button>
            </div>
        )}
        {status === 'preview' && (
            <div className="grid grid-cols-2 gap-4">
                <Button onClick={handleRetake} variant="secondary" className="w-full">{t('faceScanVideoRetake')}</Button>
                <Button onClick={extractFrames} variant="fengshui" className="text-lg w-full">{t('faceScanAnalyze')}</Button>
            </div>
        )}
        {(status === 'idle' || status === 'ready') && (
            <Button onClick={onBack} variant="secondary" className="w-full mt-4">{t('back')}</Button>
        )}
      </div>
    </Card>
  );
};

export default FengShuiCapture;
