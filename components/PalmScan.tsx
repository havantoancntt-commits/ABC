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

const PalmScan: React.FC<Props> = ({ onAnalyze, onBack, onCapture, onRetake, capturedImage }) => {
  const { t } = useLocalization();
  const [error, setError] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOn(false);
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);
  
  const startCamera = useCallback(async () => {
    if(isCameraOn || isStartingCamera) return;
    stopCamera();
    setError(null);
    setIsStartingCamera(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => console.error("Video play failed:", err));
      }
      setIsCameraOn(true);
    } catch (err) {
      console.error("Camera error:", err);
      let message = t('errorCameraUnknown');
      if (err instanceof Error) {
          if (err.name === 'NotAllowedError') message = t('errorCameraPermission');
          else if (err.name === 'NotFoundError') message = t('errorCameraNotFound');
          else message = t('errorCameraInUse');
      }
      setError(message);
    } finally {
      setIsStartingCamera(false);
    }
  }, [isCameraOn, isStartingCamera, stopCamera, t]);
  
  const handleManualCapture = useCallback(() => {
    if (isCapturing || !videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        context.translate(canvas.width, 0);
        context.scale(-1, 1); // Flip horizontally
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        onCapture(canvas.toDataURL('image/jpeg'));
        
        context.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    }
    
    setTimeout(() => {
      stopCamera();
      setIsCapturing(false);
    }, 500); 
  }, [onCapture, stopCamera, isCapturing]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
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
  
  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <Card className="max-w-xl mx-auto flex flex-col items-center">
      <h2 className="text-3xl font-bold text-center mb-4 text-rose-400 font-serif">{t('palmScanTitle')}</h2>
      <p className="text-center text-gray-400 mb-6 max-w-lg">{t('palmScanSubtitle')}</p>
      
      {error && (
        <div className="my-4 p-4 w-full bg-red-900/50 border border-red-600 rounded-lg text-center">
          <p className="font-semibold text-red-300">{error}</p>
        </div>
      )}
      
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-gray-900/50 border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-400 group">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        <canvas ref={canvasRef} className="hidden" />
        
        {capturedImage && <img src={capturedImage} alt={t('palmReadingResultImageAlt')} className="w-full h-full object-contain" />}

        {!capturedImage && (
            <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transform -scale-x-100 ${isCameraOn ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`} />
        )}

        {isCapturing && <div className="absolute inset-0 bg-white animate-shutter-flash" />}
        {isStartingCamera && <Spinner message={t('spinnerCamera')} />}
        
        {!isCameraOn && !capturedImage && !isStartingCamera && (
             <div className="text-center p-4 flex flex-col items-center justify-center h-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0c-.454-.303-.977-.454-1.5-.454V5.454c.523 0 1.046-.151 1.5-.454a2.704 2.704 0 013 0 2.704 2.704 0 003 0 2.704 2.704 0 013 0 2.704 2.704 0 003 0c.454.303.977.454 1.5.454v10.092zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <p className="font-semibold text-gray-300 mt-2">{t('faceScanStart')}</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-xs">
                    <Button onClick={startCamera} variant="primary" className="w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        {t('faceScanOpenCamera')}
                    </Button>
                     <Button onClick={triggerFileSelect} variant="secondary" className="w-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      {t('faceScanUpload')}
                    </Button>
                </div>
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
                <Button onClick={onAnalyze} variant="palm" className="text-lg w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  {t('palmScanAnalyze')}
                </Button>
            </div>
        ) : isCameraOn ? (
            <div className="flex flex-col items-center gap-4">
               <Button onClick={handleManualCapture} variant="special" className="w-full text-lg animate-pulse-button" disabled={isCapturing}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {t('faceScanManualCapture')}
                </Button>
                <Button onClick={stopCamera} variant="secondary" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>
                  {t('faceScanStopCamera')}
                </Button>
            </div>
        ) : (
            <Button onClick={onBack} variant="secondary" className="w-full">{t('back')}</Button>
        )}
      </div>
    </Card>
  );
};

export default PalmScan;
