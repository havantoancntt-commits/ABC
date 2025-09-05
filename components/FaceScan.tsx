
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Card from './Card';
import Button from './Button';
import Spinner from './Spinner';

// Note: The FaceDetector API is experimental. We handle its absence gracefully.
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
  const [feedback, setFeedback] = useState('Căn chỉnh khuôn mặt vào trong vòng tròn.');
  const [overlayStatus, setOverlayStatus] = useState<OverlayStatus>('idle');
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const isAutoDetectSupported = typeof FaceDetector !== 'undefined';

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isCountingDownRef = useRef(false); // Ref to track countdown state in animation loop

  const stopDetectionLoop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const cancelCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
    isCountingDownRef.current = false;
  }, []);

  const stopCamera = useCallback(() => {
    stopDetectionLoop();
    cancelCountdown();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOn(false);
    setOverlayStatus('idle');
    setFeedback('Căn chỉnh khuôn mặt vào trong vòng tròn.');
  }, [stopDetectionLoop, cancelCountdown]);

  const handleManualCapture = useCallback(() => {
    if (isCapturing || !videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    stopDetectionLoop();
    cancelCountdown();

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Flip the image horizontally to match the user's mirrored view
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        onCapture(canvas.toDataURL('image/jpeg'));
        
        // Reset transform for next use
        context.setTransform(1, 0, 0, 1, 0, 0);
    }
    
    setTimeout(() => {
      stopCamera();
      setIsCapturing(false);
    }, 500); // Allow shutter animation to play
  }, [onCapture, stopCamera, isCapturing, stopDetectionLoop, cancelCountdown]);

  const startCountdown = useCallback(() => {
    if (isCountingDownRef.current) return;

    isCountingDownRef.current = true;
    setFeedback('Tuyệt vời! Giữ yên...');
    setOverlayStatus('good_position');
    setCountdown(3);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownIntervalRef.current!);
          countdownIntervalRef.current = null;
          isCountingDownRef.current = false;
          handleManualCapture();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, [handleManualCapture]);

  const runFaceDetection = useCallback(async () => {
    const video = videoRef.current;
    if (video && !video.paused && video.readyState >= 3 && detectorRef.current) {
        try {
            const faces = await detectorRef.current.detect(video);
            let newFeedback = 'Không tìm thấy khuôn mặt. Vui lòng căn chỉnh lại.';
            let isPositionGood = false;

            if (faces.length === 1) {
                const face = faces[0].boundingBox;
                const videoWidth = video.videoWidth;
                const videoHeight = video.videoHeight;
                const container = video.parentElement;
                
                if (container) {
                    const containerWidth = container.clientWidth;
                    const containerHeight = container.clientHeight;
                    const videoRatio = videoWidth / videoHeight;
                    const containerRatio = containerWidth / containerHeight;

                    let visibleVideoWidth = videoWidth;
                    
                    // The video element uses 'object-cover', which means it might be cropped.
                    // We need to calculate the actual visible area of the video to determine
                    // if the face is centered in the user's view.
                    if (videoRatio > containerRatio) { // Video is wider than its container (cropped left/right)
                        const scale = containerHeight / videoHeight;
                        visibleVideoWidth = containerWidth / scale;
                    } 
                    // If video is taller, vertical centering is symmetrical so we don't need to adjust Y calcs.
                    
                    const smallerDim = Math.min(visibleVideoWidth, videoHeight);
                    const targetSize = smallerDim * 0.45; // Ideal face size relative to the visible area.
                    const tolerance = 0.25; // How much deviation from the ideal size is acceptable.

                    const faceCenterX = face.x + face.width / 2;
                    const faceCenterY = face.y + face.height / 2;
                    
                    const frameCenterX = videoWidth / 2; // Center of the full video frame
                    const frameCenterY = videoHeight / 2;
                    
                    const distance = Math.sqrt(Math.pow(faceCenterX - frameCenterX, 2) + Math.pow(faceCenterY - frameCenterY, 2));
                    const positionOffset = distance / smallerDim; // How far from the center the face is.
                    
                    const faceSize = (face.width + face.height) / 2;
                    
                    if (faceSize < targetSize * (1 - tolerance)) {
                        newFeedback = 'Vui lòng tiến lại gần hơn một chút.';
                    } else if (faceSize > targetSize * (1 + tolerance)) {
                        newFeedback = 'Vui lòng lùi ra xa hơn một chút.';
                    } else if (positionOffset > 0.20) { // Check if face is reasonably centered.
                        newFeedback = 'Căn khuôn mặt vào giữa khung hình.';
                    } else {
                        isPositionGood = true;
                    }
                }
            } else if (faces.length > 1) {
                newFeedback = 'Vui lòng chỉ để một người trong khung hình.';
            }

            if (isPositionGood) {
                setOverlayStatus('good_position');
                if (!isCountingDownRef.current) {
                    startCountdown();
                }
            } else {
                if (isCountingDownRef.current) {
                    cancelCountdown();
                    setFeedback('Đã hủy. ' + newFeedback);
                } else {
                   setFeedback(newFeedback);
                }
                setOverlayStatus('detecting');
            }
        } catch (e) {
            console.error("Face detection failed:", e);
            stopDetectionLoop();
        }
    }

    if (streamRef.current) {
        animationFrameRef.current = requestAnimationFrame(runFaceDetection);
    }
  }, [startCountdown, cancelCountdown, stopDetectionLoop]);
  
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
        videoRef.current.onloadedmetadata = () => {
             videoRef.current?.play();
             if (isAutoDetectSupported) {
                try {
                    detectorRef.current = new FaceDetector({ fastMode: true });
                    stopDetectionLoop(); // Ensure no old loop is running
                    animationFrameRef.current = requestAnimationFrame(runFaceDetection); // Start loop
                } catch (e) {
                     console.error("FaceDetector init failed:", e);
                     setFeedback('Tự động nhận diện không được hỗ trợ. Vui lòng tự căn chỉnh và chụp.');
                }
             } else {
                setFeedback('Tự động nhận diện không được hỗ trợ. Vui lòng tự căn chỉnh và chụp.');
             }
        };
      }
      setIsCameraOn(true);
    } catch (err) {
      console.error("Camera error:", err);
      let message = 'Đã xảy ra lỗi không xác định với camera.';
      if (err instanceof Error) {
          if (err.name === 'NotAllowedError') message = 'Bạn đã từ chối quyền truy cập camera. Vui lòng cấp quyền trong cài đặt trình duyệt và tải lại trang.';
          else if (err.name === 'NotFoundError') message = 'Không tìm thấy camera trên thiết bị của bạn.';
          else message = 'Không thể khởi động camera. Thiết bị khác có thể đang sử dụng nó.';
      }
      setError(message);
    } finally {
      setIsStartingCamera(false);
    }
  }, [stopCamera, isAutoDetectSupported, runFaceDetection, isCameraOn, isStartingCamera, stopDetectionLoop]);

  useEffect(() => {
    return () => {
      stopCamera();
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
      <p className="text-center text-gray-400 mb-6 max-w-lg">Để có kết quả chính xác nhất, vui lòng sử dụng ảnh chân dung rõ nét, chính diện, đủ sáng và không bị che khuất.</p>
      
      {error && (
        <div className="my-4 p-4 w-full bg-red-900/50 border border-red-600 rounded-lg text-center">
          <p className="font-semibold text-red-300">{error}</p>
        </div>
      )}
      
      <div className="relative w-full max-w-lg mx-auto aspect-square rounded-lg overflow-hidden bg-gray-900/50 border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-400 group">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        <canvas ref={canvasRef} className="hidden" />
        
        {capturedImage && <img src={capturedImage} alt="Ảnh đã chụp" className="w-full h-full object-contain" />}

        {!capturedImage && (
            <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transform -scale-x-100 ${isCameraOn ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
        )}
        
        {isCameraOn && !capturedImage && (
            <>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className={`absolute inset-[10%] rounded-full border-4 ${overlayBorderColor} transition-all duration-300`}></div>
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/60 rounded-lg text-center text-white font-semibold text-sm">
                    {countdown === null ? feedback : `Giữ yên...`}
                </div>
                {countdown !== null && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                        <span className="text-9xl font-bold text-white animate-ping-once" style={{ textShadow: '0 0 25px rgba(0,0,0,0.8)' }}>
                            {countdown}
                        </span>
                    </div>
                )}
            </>
        )}
        
        {isCapturing && <div className="absolute inset-0 bg-white animate-shutter-flash" />}

        {isStartingCamera && <Spinner message="Đang khởi động camera..." />}
        
        {!isCameraOn && !capturedImage && !isStartingCamera && (
             <div className="text-center p-4 flex flex-col items-center justify-center h-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <p className="font-semibold text-gray-300 mt-2">Bắt đầu bằng cách mở camera hoặc tải ảnh lên</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-xs">
                    <Button onClick={startCamera} variant="primary" className="w-full">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        Mở Camera
                    </Button>
                     <Button onClick={triggerFileSelect} variant="secondary" className="w-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      Tải Ảnh
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
                  Chụp/Chọn Lại
                </Button>
                <Button onClick={onAnalyze} variant="primary" className="text-lg w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Luận Giải
                </Button>
            </div>
        ) : isCameraOn ? (
            <div className="flex flex-col items-center gap-4">
               <Button onClick={handleManualCapture} variant="special" className="w-full text-lg animate-pulse-button" disabled={isCapturing || (isAutoDetectSupported && countdown !== null)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Chụp Ảnh Thủ Công
                </Button>
                <Button onClick={stopCamera} variant="secondary" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>
                  Tắt Camera
                </Button>
            </div>
        ) : (
            <Button onClick={onBack} variant="secondary" className="w-full">Quay Lại</Button>
        )}
      </div>

       <style>{`
        @keyframes ping-once-key {
            0% { transform: scale(1.5); opacity: 0.5; }
            75%, 100% { transform: scale(1); opacity: 1; }
        }
        .animate-ping-once {
            animation: ping-once-key 1s cubic-bezier(0, 0, 0.2, 1);
        }
      `}</style>
    </Card>
  );
};

export default FaceScan;