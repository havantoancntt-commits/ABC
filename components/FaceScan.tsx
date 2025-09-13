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

const FaceScan: React.FC<Props> = ({ onAnalyze, onBack, onCapture, onRetake, capturedImage }) => {
  const { t } = useLocalization();
  const [error, setError] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  
  // --- New state for video recording ---
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // --- Refs for video recording logic ---
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);

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
            if (!didCancel) setIsStartingCamera(false);
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
        if (facingMode === 'user') {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        onCapture(canvas.toDataURL('image/jpeg'));
        if (facingMode === 'user') context.setTransform(1, 0, 0, 1, 0, 0);
    }
    setTimeout(() => {
      setIsCameraOn(false);
      setIsCapturing(false);
    }, 400); 
  }, [onCapture, isCapturing, facingMode]);

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
  
  const handleRetakePhoto = useCallback(() => {
      onRetake();
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setIsCameraOn(true);
  }, [onRetake]);
  
  const handleSwitchCamera = () => {
    if (isStartingCamera || isRecording) return;
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  // --- Video Recording Logic ---
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    }
  }, [isRecording]);

  const startRecording = useCallback(() => {
    if (!streamRef.current || isRecording) return;
    recordedChunksRef.current = [];
    const options = { mimeType: 'video/webm' };
    try {
        mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
    } catch (e) {
        console.error("MediaRecorder error:", e);
        setError("Video recording is not supported on your browser or device.");
        return;
    }
    mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
    };
    mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setIsCameraOn(false);
    };
    mediaRecorderRef.current.start();
    setIsRecording(true);
    setRecordingTime(0);
    recordingIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
            if (prev >= 29) {
                stopRecording();
                return 30;
            }
            return prev + 1;
        });
    }, 1000);
  }, [isRecording, stopRecording]);

  const handleRetakeVideo = useCallback(() => {
    if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
    setRecordedVideoUrl(null);
    setRecordingTime(0);
    setError(null);
    setIsCameraOn(true);
  }, [recordedVideoUrl]);

  const handleCaptureFrame = useCallback(() => {
    if (!videoPreviewRef.current || !canvasRef.current) return;
    const video = videoPreviewRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        onCapture(canvas.toDataURL('image/jpeg'));
        setRecordedVideoUrl(null); // Clean up
    }
  }, [onCapture]);
  
  const triggerFileSelect = () => fileInputRef.current?.click();
  const handleOpenCamera = () => setIsCameraOn(true);

  const ModeButton: React.FC<{ targetMode: 'photo' | 'video', children: React.ReactNode }> = ({ targetMode, children }) => (
    <button onClick={() => setMode(targetMode)} className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${mode === targetMode ? 'bg-black/40 text-white' : 'text-gray-400 hover:bg-black/20'}`}>
        {children}
    </button>
  );

  return (
    <Card className="max-w-xl mx-auto flex flex-col items-center">
      <h2 className="text-3xl font-bold text-center mb-4 text-yellow-400 font-serif">{t('faceScanTitle')}</h2>
      <p className="text-center text-gray-400 mb-6 max-w-lg">{t('faceScanSubtitle')}</p>
      
      {error && (
        <div className="my-4 p-4 w-full bg-red-900/50 border border-red-600 rounded-lg text-center">
          <p className="font-semibold text-red-300">{error}</p>
        </div>
      )}
      
      <div className="relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden bg-gray-950/80 border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-400 group">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        <canvas ref={canvasRef} className="hidden" />
        
        {recordedVideoUrl && <video ref={videoPreviewRef} src={recordedVideoUrl} controls className="w-full h-full object-contain" />}
        {capturedImage && !recordedVideoUrl && <img src={capturedImage} alt={t('faceScanCapturedAlt')} className="w-full h-full object-contain" />}
        {!capturedImage && !recordedVideoUrl && <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''} ${isCameraOn ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`} />}
        
        {isCapturing && <div className="absolute inset-0 bg-white animate-shutter-flash" />}
        {isStartingCamera && <Spinner initialMessageKey='spinnerCamera' />}

        {!isCameraOn && !capturedImage && !recordedVideoUrl && !isStartingCamera && (
             <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10 bg-gray-950/50">
                <button onClick={handleOpenCamera} className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400/50 animate-pulse-glow" style={{ animationDuration: '3s' }} aria-label={t('faceScanOpenCamera')}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-14 sm:h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
                <button onClick={triggerFileSelect} className="mt-6 text-gray-300 hover:text-white transition-colors flex items-center gap-2 font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <span>{t('faceScanUpload')}</span>
                </button>
            </div>
        )}

        {isCameraOn && !capturedImage && (
            <>
                <div className="absolute inset-0" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)', maskImage: 'radial-gradient(ellipse 50% 60% at center, white 50%, transparent 100%)' }}></div>
                <div className="absolute top-14 left-4 right-4 p-2 bg-black/60 rounded-lg text-center text-white font-semibold text-sm backdrop-blur-sm border border-white/10">
                    {mode === 'photo' ? t('faceScanInitial') : t('faceScanVideoInstruction')}
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 flex bg-black/30 backdrop-blur-sm rounded-b-lg"><ModeButton targetMode="photo">{t('faceScanModePhoto')}</ModeButton><ModeButton targetMode="video">{t('faceScanModeVideo')}</ModeButton></div>
                {isRecording && <div className="absolute top-16 right-6 flex items-center gap-2 bg-red-600 text-white font-bold text-xs px-2 py-1 rounded-full"><div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>{t('faceScanRecording', {time: recordingTime})}</div>}
            </>
        )}
        
        {recordedVideoUrl && (
             <div className="absolute top-4 left-4 right-4 p-2 bg-black/60 rounded-lg text-center text-white font-semibold text-sm backdrop-blur-sm border border-white/10">{t('faceScanVideoPreview')}</div>
        )}

        {isCameraOn && !capturedImage && !isStartingCamera && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center gap-6 z-20">
                <button onClick={handleSwitchCamera} className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors" aria-label={t('cameraSwitchAria')} title={t('cameraSwitch')}><svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21H6a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2v3m-6 9.5a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 16.5L8 19l2.5 2.5" /><path strokeLinecap="round" strokeLinejoin="round" d="m16.5 16.5 2.5 2.5-2.5 2.5" /></svg></button>
                {mode === 'photo' ? (
                  <button onClick={handleManualCapture} disabled={isCapturing} className="w-20 h-20 rounded-full bg-white border-4 border-white/50 p-1 transition-transform hover:scale-105 active:scale-95" aria-label={t('faceScanManualCapture')}><div className="w-full h-full rounded-full bg-white/80"></div></button>
                ) : (
                  <button onClick={isRecording ? stopRecording : startRecording} disabled={isCapturing} className="w-20 h-20 rounded-full bg-white border-4 border-white/50 p-1 transition-transform hover:scale-105 active:scale-95" aria-label={isRecording ? t('faceScanStopRecord') : t('faceScanRecord')}><div className={`w-full h-full rounded-full bg-red-600 transition-all ${isRecording ? 'rounded-md' : ''}`}></div></button>
                )}
                <div className="w-14 h-14"></div>
            </div>
        )}
      </div>

      <div className="mt-8 w-full max-w-lg space-y-4">
        {capturedImage ? (
            <div className="grid grid-cols-2 gap-4">
                <Button onClick={handleRetakePhoto} variant="secondary" className="w-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5m9-1-9 9-9-9" /></svg>{t('faceScanRetake')}</Button>
                <Button onClick={onAnalyze} variant="primary" className="text-lg w-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>{t('faceScanAnalyze')}</Button>
            </div>
        ) : recordedVideoUrl ? (
            <div className="grid grid-cols-2 gap-4">
                <Button onClick={handleRetakeVideo} variant="secondary" className="w-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>{t('faceScanVideoRetake')}</Button>
                <Button onClick={handleCaptureFrame} variant="primary" className="text-lg w-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{t('faceScanCaptureFrame')}</Button>
            </div>
        ) : !isCameraOn ? (
            <Button onClick={onBack} variant="secondary" className="w-full">{t('back')}</Button>
        ) : null}
      </div>
    </Card>
  );
};

export default FaceScan;