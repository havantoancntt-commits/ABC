import React, { useState, useRef, useCallback, useEffect } from 'react';
import Card from './Card';
import Button from './Button';
import Spinner from './Spinner';

// Note: The FaceDetector API is experimental and may not be available in all browsers.
// We declare it here to avoid TypeScript errors.
declare var FaceDetector: any;

interface Props {
  onAnalyze: () => void;
  onBack: () => void;
  onCapture: (imageDataUrl: string) => void;
  onRetake: () => void;
  capturedImage: string | null;
}

type OverlayStatus = 'idle' | 'detecting' | 'good_position' | 'capturing';

const FaceScan: React.FC<Props> = ({ onAnalyze, onBack, onCapture, onRetake, capturedImage }) => {
  const [error, setError] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [feedback, setFeedback] = useState('Hướng camera về phía khuôn mặt của bạn.');
  const [overlayStatus, setOverlayStatus] = useState<OverlayStatus>('idle');
  const [isCapturing, setIsCapturing] = useState(false);
  const [showManualCapture, setShowManualCapture] = useState(false);
  const isAutoDetectSupported = 'FaceDetector' in window;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any | null>(null);
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const manualCaptureTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // FIX: Initialize useRef with null and update type to allow null to fix "Expected 1 arguments, but got 0" error.
  const animationFrameRef = useRef<number | null>(null);

  const stopDetectionLoop = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
        detectionTimeoutRef.current = null;
    }
  };

  const stopCamera = useCallback(() => {
    stopDetectionLoop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (manualCaptureTimeoutRef.current) {
        clearTimeout(manualCaptureTimeoutRef.current);
    }
    setIsCameraOn(false);
    setOverlayStatus('idle');
    setShowManualCapture(false);
  }, []);

  const handleCapture = useCallback(() => {
    if (isCapturing || !videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    stopDetectionLoop();

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
      stopCamera();
      setIsCapturing(false);
    }, 500); // Allow shutter animation to play
  }, [onCapture, stopCamera, isCapturing]);

  const runFaceDetection = useCallback(async () => {
    const video = videoRef.current;
    if (video && !video.paused && detectorRef.current) {
        const faces = await detectorRef.current.detect(video);
        let newFeedback = 'Không tìm thấy khuôn mặt. Vui lòng căn chỉnh lại.';
        let newStatus: OverlayStatus = 'idle';

        if (faces.length === 1) {
            const face = faces[0].boundingBox;
            const videoWidth = video.videoWidth;
            const targetWidth = videoWidth * 0.55; // Face should occupy ~55% of the frame width
            const tolerance = 0.15; // 15% tolerance

            const faceCenterX = face.x + face.width / 2;
            const frameCenterX = video.videoWidth / 2;
            
            const positionOffset = Math.abs(faceCenterX - frameCenterX) / frameCenterX;
            
            if (face.width < targetWidth * (1 - tolerance)) {
                newFeedback = 'Vui lòng tiến lại gần hơn một chút.';
                newStatus = 'detecting';
            } else if (face.width > targetWidth * (1 + tolerance)) {
                newFeedback = 'Vui lòng lùi ra xa hơn một chút.';
                newStatus = 'detecting';
            } else if (positionOffset > 0.2) {
                newFeedback = 'Căn khuôn mặt vào giữa khung hình.';
                newStatus = 'detecting';
            } else {
                newFeedback = 'Tuyệt vời! Giữ yên trong giây lát...';
                newStatus = 'good_position';
                if (!detectionTimeoutRef.current) {
                    detectionTimeoutRef.current = setTimeout(handleCapture, 1500); // Capture after 1.5s of holding steady
                }
            }
        } else if (faces.length > 1) {
            newFeedback = 'Vui lòng chỉ để một người trong khung hình.';
            newStatus = 'detecting';
        }

        if (newStatus !== 'good_position' && detectionTimeoutRef.current) {
            clearTimeout(detectionTimeoutRef.current);
            detectionTimeoutRef.current = null;
        }

        setFeedback(newFeedback);
        setOverlayStatus(newStatus);
    }
    animationFrameRef.current = requestAnimationFrame(runFaceDetection);
  }, [handleCapture]);

  const startCamera = useCallback(async () => {
    if(isCameraOn) return;
    stopCamera();
    setError(null);
    setIsStartingCamera(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1080 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraOn(true);

      if (isAutoDetectSupported) {
        detectorRef.current = new FaceDetector({ fastMode: true });
        runFaceDetection();
        manualCaptureTimeoutRef.current = setTimeout(() => {
            if (!capturedImage) {
                setShowManualCapture(true);
                setFeedback('Gặp sự cố? Bạn có thể chụp ảnh thủ công.');
            }
        }, 15000); // Show manual capture button after 15s
      } else {
         setShowManualCapture(true);
         setFeedback('Trình duyệt không hỗ trợ tự động nhận diện. Vui lòng chụp thủ công.');
      }
    } catch (err) {
      console.error("Camera error:", err);
      let message = 'Đã xảy ra lỗi không xác định với camera.';
      if (err instanceof Error) {
          if (err.name === 'NotAllowedError') message = 'Bạn đã từ chối quyền truy cập camera. Vui lòng cấp quyền trong cài đặt trình duyệt.';
          else if (err.name === 'NotFoundError') message = 'Không tìm thấy camera trên thiết bị của bạn.';
          else message = 'Không thể khởi động camera. Vui lòng thử lại.';
      }
      setError(message);
    } finally {
      setIsStartingCamera(false);
    }
  }, [stopCamera, isAutoDetectSupported, runFaceDetection, capturedImage]);

  useEffect(() => {
    return () => {
      stopCamera(); // Cleanup on unmount
    };
  }, [stopCamera]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => { onCapture(reader.result as string); setError(null); };
      reader.onerror = () => { setError('Không thể đọc file ảnh.'); };
      reader.readAsDataURL(file);
    } else {
      setError('Vui lòng chọn một file ảnh hợp lệ.');
    }
  };
  
  const handleRetake = useCallback(() => {
      onRetake();
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  }, [onRetake]);
  
  const triggerFileSelect = () => fileInputRef.current?.click();
  
  const overlayBorderColor = {
      idle: 'border-gray-500/80',
      detecting: 'border-yellow-400/80 animate-pulse',
      good_position: 'border-green-400/90 shadow-[0_0_20px_rgba(74,222,128,0.7)]',
      capturing: 'border-white',
  }[overlayStatus];

  return (
    <Card className="max-w-3xl mx-auto flex flex-col items-center">
      <h2 className="text-3xl font-bold text-center mb-4 text-yellow-400 font-serif">Xem Nhân Tướng Qua Ảnh</h2>
      
      {error && (
        <div className="my-4 p-4 w-full bg-red-900/50 border border-red-600 rounded-lg text-center">
          <p className="font-semibold text-red-300">{error}</p>
        </div>
      )}
      
      <div className="relative w-full max-w-lg mx-auto aspect-square rounded-lg overflow-hidden bg-gray-900/50 border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-400 group">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        <canvas ref={canvasRef} className="hidden" />
        
        {isStartingCamera && <Spinner message="Đang khởi động camera..." />}
        
        {capturedImage && <img src={capturedImage} alt="Ảnh đã chụp" className="w-full h-full object-contain" />}

        {!capturedImage && !isStartingCamera && (
            <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transform -scale-x-100 ${isCameraOn ? 'opacity-100' : 'opacity-0'}`} />
        )}
        
        {isCameraOn && !capturedImage && (
            <>
                <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300`}></div>
                <div className={`absolute inset-[10%] rounded-full border-4 ${overlayBorderColor} transition-all duration-300`}></div>
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/60 rounded-lg text-center text-white font-semibold text-sm">
                    {feedback}
                </div>
            </>
        )}
        
        {isCapturing && <div className="absolute inset-0 bg-white animate-shutter-flash" />}

        {!isCameraOn && !capturedImage && !isStartingCamera && (
             <div className="text-center p-4 flex flex-col items-center justify-center h-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <p className="font-semibold text-gray-300">Sử dụng camera hoặc tải ảnh lên</p>
                <p className="text-sm mt-1 text-gray-400">Ảnh chân dung rõ nét, chính diện sẽ cho kết quả tốt nhất.</p>
            </div>
        )}
      </div>

      <div className="mt-8 w-full max-w-lg">
        {capturedImage ? (
            <div className="flex gap-4">
                <Button onClick={handleRetake} variant="secondary" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5m9-1-9 9-9-9" /></svg>
                  Chọn Lại
                </Button>
                <Button onClick={onAnalyze} variant="primary" className="text-lg w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Luận Giải
                </Button>
            </div>
        ) : (
            <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={onBack} variant="secondary" className="w-full">Quay Lại</Button>
                <Button onClick={triggerFileSelect} variant="special" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Tải Ảnh Lên
                </Button>
                 <Button onClick={isCameraOn ? handleCapture : startCamera} variant="primary" className="w-full" disabled={isStartingCamera}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {isCameraOn ? (showManualCapture ? 'Chụp Thủ Công' : 'Dừng Camera') : 'Dùng Camera'}
                </Button>
            </div>
        )}
      </div>
    </Card>
  );
};

export default FaceScan;