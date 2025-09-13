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
const CAPTURE_INTERVAL_MS = 1500;

const FengShuiCapture: React.FC<Props> = ({ onAnalyze, onBack }) => {
  const { t } = useLocalization();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'starting_camera' | 'ready' | 'scanning'>('idle');
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);

  const stopCamera = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
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
            else if (err.name === 'errorCameraInUse') message = t('errorCameraInUse');
        }
        setError(message);
        setStatus('idle');
    }
  }, [status, t]);

  useEffect(() => {
    return () => { // Cleanup on unmount
      stopCamera();
    };
  }, [stopCamera]);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Return base64 data only, without the prefix
        return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    }
    return null;
  }, []);

  const startScan = useCallback(() => {
    if (status !== 'ready') return;
    setStatus('scanning');
    setCapturedFrames([]);

    // Capture first frame immediately to give instant feedback
    const firstFrame = captureFrame();
    if(firstFrame) {
      setCapturedFrames([firstFrame]);
    }

    intervalRef.current = window.setInterval(() => {
      const frame = captureFrame();
      if(frame) {
        setCapturedFrames(prev => [...prev, frame]);
      }
    }, CAPTURE_INTERVAL_MS);
  }, [status, captureFrame]);
  
  // Effect to handle completion of scanning
  useEffect(() => {
    if (capturedFrames.length >= FRAME_COUNT) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        stopCamera();
        // The first frame captured serves as a good thumbnail.
        onAnalyze(capturedFrames, capturedFrames[0]);
    }
  }, [capturedFrames, onAnalyze, stopCamera]);

  return (
    <Card className="max-w-4xl mx-auto flex flex-col items-center">
      <h2 className="text-3xl font-bold text-center mb-4 text-green-300 font-serif">{t('fengShuiCaptureTitle')}</h2>
      <p className="text-center text-gray-400 mb-6 max-w-lg">{t('fengShuiCaptureSubtitle')}</p>
      
      {error && (
        <div className="my-4 p-4 w-full bg-red-900/50 border border-red-600 rounded-lg text-center">
          <p className="font-semibold text-red-300">{error}</p>
        </div>
      )}
      
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-950/80 border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-400 group">
        <canvas ref={canvasRef} className="hidden" />
        <video ref={videoRef} autoPlay playsInline muted
            className={`w-full h-full object-cover transition-opacity duration-500 ${status === 'idle' || status === 'starting_camera' ? 'opacity-0' : 'opacity-100'}`} />
        
        {/* Overlays based on status */}
        {status === 'starting_camera' && <Spinner initialMessageKey='spinnerCamera' />}
        
        {status === 'idle' && (
             <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10 bg-gray-950/50">
                <Button onClick={startCamera} variant="fengshui" size="lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    {t('fengShuiStartCamera')}
                </Button>
            </div>
        )}

        {status === 'ready' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10 bg-black/50">
                <Button onClick={startScan} variant="fengshui" size="lg" className="animate-pulse-button">
                    {t('fengShuiStartScan')}
                </Button>
            </div>
        )}

        {status === 'scanning' && (
             <div className="absolute inset-0 flex flex-col justify-between p-4 z-10 bg-black/40 backdrop-blur-sm">
                <div className="text-center bg-black/50 p-2 rounded-lg">
                    <p className="font-bold text-white">{t('fengShuiScanning')}</p>
                    <p className="text-sm text-gray-300">{t('fengShuiScanningProgress', { current: capturedFrames.length, total: FRAME_COUNT })}</p>
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                        <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(capturedFrames.length / FRAME_COUNT) * 100}%` }}></div>
                    </div>
                </div>
                <div className="flex justify-center gap-2 h-16">
                    {capturedFrames.map((frame, index) => (
                        <img key={index} src={`data:image/jpeg;base64,${frame}`} alt={`Capture ${index + 1}`}
                            className="h-full aspect-video object-cover rounded-md border-2 border-green-400 animate-fade-in" />
                    ))}
                </div>
             </div>
        )}
      </div>

      <div className="mt-8 w-full max-w-lg">
        {(status === 'idle' || status === 'ready') && (
            <Button onClick={onBack} variant="secondary" className="w-full mt-4">{t('back')}</Button>
        )}
      </div>
    </Card>
  );
};

export default FengShuiCapture;