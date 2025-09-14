import React, { useState, useRef, useCallback, useEffect } from 'react';
import Card from './Card';
import Button from './Button';
import Spinner from './Spinner';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
  onAnalyze: (frames: string[], thumbnail: string) => void;
  onBack: () => void;
}

const MAX_FRAMES = 5;
const MAX_RECORDING_SECONDS = 30;

const FengShuiCapture: React.FC<Props> = ({ onAnalyze, onBack }) => {
  const { t } = useLocalization();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'starting_camera' | 'ready' | 'recording' | 'preview'>('idle');
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [selectedFrames, setSelectedFrames] = useState<string[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);

  const stopCamera = useCallback(() => {
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
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
        // FIX: Replaced invalid translation key 'errorCameraUnknown' with 'errorUnknown'.
        let message = t('errorUnknown');
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
       if (recordedVideoUrl) {
            URL.revokeObjectURL(recordedVideoUrl);
        }
    };
  }, [stopCamera, recordedVideoUrl]);


  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && status === 'recording') {
        mediaRecorderRef.current.stop();
        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    }
  }, [status]);


  const startRecording = useCallback(() => {
    if (status !== 'ready' || !streamRef.current) return;
    setStatus('recording');
    recordedChunksRef.current = [];
    const options = { mimeType: 'video/webm' };
    try {
        mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
    } catch (e) {
        console.error("MediaRecorder error:", e);
        setError("Video recording is not supported on your browser or device.");
        setStatus('ready');
        return;
    }
    mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
    };
    mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setStatus('preview');
        stopCamera();
    };
    mediaRecorderRef.current.start();
    setRecordingTime(0);
    recordingIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
            if (prev >= MAX_RECORDING_SECONDS - 1) {
                stopRecording();
                return MAX_RECORDING_SECONDS;
            }
            return prev + 1;
        });
    }, 1000);
  }, [status, stopCamera]);

  const handleCaptureFrameFromVideo = useCallback(() => {
      if (selectedFrames.length >= MAX_FRAMES || !videoPreviewRef.current || !canvasRef.current) return;
      const video = videoPreviewRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if(context) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frameData = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
          setSelectedFrames(prev => [...prev, frameData]);
      }
  }, [selectedFrames.length]);

  const handleRemoveFrame = useCallback((indexToRemove: number) => {
      setSelectedFrames(prev => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  const handleAnalyzeClick = () => {
      if(selectedFrames.length === 0) return;
      onAnalyze(selectedFrames, selectedFrames[0]);
  };

  const handleRetake = useCallback(() => {
      stopCamera();
      if(recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);
      setSelectedFrames([]);
      setRecordingTime(0);
      setStatus('idle');
  }, [stopCamera, recordedVideoUrl]);


  return (
    <Card className="max-w-4xl mx-auto flex flex-col items-center">
      <h2 className="text-3xl font-bold text-center mb-4 text-green-300 font-serif">{t('fengShuiCaptureTitle')}</h2>
      <p className="text-center text-gray-400 mb-6 max-w-lg">
          {status === 'preview' ? t('fengShuiPreviewSubtitle', { max: MAX_FRAMES }) : t('fengShuiCaptureSubtitle')}
      </p>
      
      {error && (
        <div className="my-4 p-4 w-full bg-red-900/50 border border-red-600 rounded-lg text-center">
          <p className="font-semibold text-red-300">{error}</p>
        </div>
      )}
      
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-950/80 border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-400 group">
        <canvas ref={canvasRef} className="hidden" />
        <video ref={videoRef} autoPlay playsInline muted
            className={`w-full h-full object-cover transition-opacity duration-500 ${status === 'ready' || status === 'recording' ? 'opacity-100' : 'opacity-0'}`} />
        
        {status === 'preview' && recordedVideoUrl && (
             <video ref={videoPreviewRef} src={recordedVideoUrl} controls className="w-full h-full object-contain" />
        )}
        
        {status === 'starting_camera' && <Spinner initialMessageKey='spinnerCamera' />}
        
        {status === 'idle' && (
             <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10 bg-gray-950/50">
                <Button onClick={startCamera} variant="fengshui" size="lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    {t('fengShuiStartCamera')}
                </Button>
            </div>
        )}

        {status === 'recording' && (
             <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white font-bold text-xs px-2 py-1 rounded-full"><div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>{t('fengShuiRecording', {time: recordingTime})}</div>
        )}
      </div>

      <div className="mt-8 w-full max-w-2xl">
        {status === 'ready' && <Button onClick={startRecording} variant="fengshui" size="lg" className="w-full">{t('fengShuiStartRecording')}</Button>}
        {status === 'recording' && <Button onClick={stopRecording} variant="danger" size="lg" className="w-full">{t('fengShuiStopRecording')}</Button>}

        {status === 'preview' && (
            <div className="space-y-6">
                 <div>
                    <h3 className="text-xl font-semibold text-center text-gray-300 mb-4">{t('fengShuiSelectedFrames')} ({selectedFrames.length}/{MAX_FRAMES})</h3>
                    <div className="flex justify-center gap-2 h-20 bg-black/20 p-2 rounded-lg">
                        {selectedFrames.map((frame, index) => (
                           <div key={index} className="relative h-full aspect-video">
                             <img src={`data:image/jpeg;base64,${frame}`} alt={`Capture ${index + 1}`}
                                className="h-full w-full object-cover rounded-md border-2 border-green-400" />
                            <button onClick={() => handleRemoveFrame(index)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center border-2 border-gray-900 text-sm font-bold">&times;</button>
                           </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <Button onClick={handleCaptureFrameFromVideo} disabled={selectedFrames.length >= MAX_FRAMES} variant="secondary" className="w-full sm:col-span-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {t('fengShuiCaptureFrame')}
                    </Button>
                    <Button onClick={handleAnalyzeClick} disabled={selectedFrames.length === 0} variant="fengshui" size="lg" className="w-full sm:col-span-2">
                        {t('fengShuiAnalyzeFrames', { count: selectedFrames.length })}
                    </Button>
                </div>
                 <Button onClick={handleRetake} variant="secondary" className="w-full">{t('fengShuiVideoRetake')}</Button>
            </div>
        )}

        {(status !== 'preview' && status !== 'recording') && <Button onClick={onBack} variant="secondary" className="w-full mt-4">{t('back')}</Button>}
      </div>
    </Card>
  );
};

export default FengShuiCapture;