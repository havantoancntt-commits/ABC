import React, { useState, useRef, useCallback, useEffect } from 'react';
import Card from './Card';
import Button from './Button';
import Spinner from './Spinner';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
  onAnalyze: () => void;
  onBack: () => void;
  onCapture: (imageDataUrl: string) => void;
  onRetake: () => void;
  capturedImage: string | null;
}

const HandwritingScan: React.FC<Props> = ({ onAnalyze, onBack, onCapture, onRetake, capturedImage }) => {
  const { t } = useLocalization();
  const [error, setError] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isCameraOn) {
        stopCamera();
        return;
    }

    let didCancel = false;

    const startStream = async () => {
        stopCamera();
        setIsStartingCamera(true);
        setError(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            if (didCancel) {
                stream.getTracks().forEach(track => track.stop());
                return;
            }
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
        } catch (err) {
            console.error("Camera error:", err);
            let message = t('errorCameraUnknown');
            if (err instanceof Error) {
                if (err.name === 'NotAllowedError') message = t('errorCameraPermission');
                else if (err.name === 'NotFoundError') message = t('errorCameraNotFound');
                else message = t('errorCameraInUse');
            }
            setError(message);
            setIsCameraOn(false);
        } finally {
            if (!didCancel) {
                setIsStartingCamera(false);
            }
        }
    };

    startStream();

    return () => {
        didCancel = true;
        stopCamera();
    };
  }, [isCameraOn, facingMode, stopCamera, t]);
  
  const handleManualCapture = useCallback(() => {
    if (isCapturing || !videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        onCapture(canvas.toDataURL('image/jpeg'));
    }
    
    setTimeout(() => {
      setIsCameraOn(false);
      setIsCapturing(false);
    }, 400); 
  }, [onCapture, isCapturing]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setIsCameraOn(false);
      const reader = new FileReader();
      reader.onload = () => { onCapture(reader.result as string); setError(null); };
      reader.onerror = () => { setError(t('errorFileRead')); };
      reader.readAsDataURL(file);
    } else {
      setError(t('errorFileInvalid'));
    }
  };
  
  const handleRetake = useCallback(() => {
      onRetake();
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  }, [onRetake]);
  
  const handleSwitchCamera = () => {
    if (isStartingCamera) return;
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const triggerFileSelect = () => fileInputRef.current?.click();
  const handleOpenCamera = () => setIsCameraOn(true);

  return (
    <Card className="max-w-xl mx-auto flex flex-col items-center">
      <h2 className="text-3xl font-bold text-center mb-4 text-indigo-400 font-serif">{t('handwritingScanTitle')}</h2>
      <p className="text-center text-gray-400 mb-6 max-w-lg">{t('handwritingScanSubtitle')}</p>
      
      {error && (
        <div className="my-4 p-4 w-full bg-red-900/50 border border-red-600 rounded-lg text-center">
          <p className="font-semibold text-red-300">{error}</p>
        </div>
      )}
      
      <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden bg-gray-950/80 border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-400 group">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        <canvas ref={canvasRef} className="hidden" />
        
        {capturedImage && <img src={capturedImage} alt={t('handwritingResultImageAlt')} className="w-full h-full object-contain" />}

        {!capturedImage && (
            <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${isCameraOn ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`} />
        )}
        
        {isCapturing && <div className="absolute inset-0 bg-white animate-shutter-flash" />}
        {isStartingCamera && <Spinner message={t('spinnerCamera')} />}
        
        {!isCameraOn && !capturedImage && !isStartingCamera && (
             <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10 bg-gray-950/50">
                <button
                    onClick={handleOpenCamera}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-slate-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400/50 animate-pulse-glow"
                    style={{ animationDuration: '3s' }}
                    aria-label={t('faceScanOpenCamera')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-14 sm:h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button onClick={triggerFileSelect} className="mt-6 text-gray-300 hover:text-white transition-colors flex items-center gap-2 font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <span>{t('faceScanUpload')}</span>
                </button>
            </div>
        )}

        {isCameraOn && !capturedImage && !isStartingCamera && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center gap-6">
                <button 
                    onClick={handleSwitchCamera}
                    className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    aria-label={t('cameraSwitchAria')}
                    title={t('cameraSwitch')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21H6a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2v3m-6 9.5a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 16.5L8 19l2.5 2.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.5 16.5 2.5 2.5-2.5 2.5" />
                  </svg>
                </button>
                <button
                    onClick={handleManualCapture}
                    disabled={isCapturing}
                    className="w-20 h-20 rounded-full bg-white border-4 border-white/50 p-1 transition-transform hover:scale-105 active:scale-95"
                    aria-label={t('faceScanManualCapture')}
                >
                    <div className="w-full h-full rounded-full bg-white/80"></div>
                </button>
                <div className="w-14 h-14"></div>
            </div>
        )}
      </div>

      <div className="mt-8 w-full max-w-lg space-y-4">
        {capturedImage ? (
            <div className="grid grid-cols-2 gap-4">
                <Button onClick={handleRetake} variant="secondary" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5m9-1-9 9-9-9" /></svg>
                  {t('faceScanRetake')}
                </Button>
                <Button onClick={onAnalyze} variant="graphology" className="text-lg w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  {t('handwritingScanAnalyze')}
                </Button>
            </div>
        ) : !isCameraOn ? (
            <Button onClick={onBack} variant="secondary" className="w-full">{t('back')}</Button>
        ): null}
      </div>
    </Card>
  );
};

export default HandwritingScan;