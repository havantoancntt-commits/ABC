import React, { useState, useRef, useCallback, useEffect } from 'react';
import Card from './Card';
import Button from './Button';
import Spinner from './Spinner';

interface Props {
  onAnalyze: () => void;
  onBack: () => void;
  onCapture: (imageDataUrl: string) => void;
  onRetake: () => void;
  capturedImage: string | null;
}

const FaceScan: React.FC<Props> = ({ onAnalyze, onBack, onCapture, onRetake, capturedImage }) => {
  const [error, setError] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraOn(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setError(null);
    setIsStartingCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1080 },
          height: { ideal: 1080 }
        }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
    } catch (err) {
      console.error("Camera error:", err);
      if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
              setError('Bạn đã từ chối quyền truy cập camera. Vui lòng cấp quyền trong cài đặt trình duyệt.');
          } else if (err.name === 'NotFoundError') {
              setError('Không tìm thấy camera trên thiết bị của bạn.');
          } else {
              setError('Không thể khởi động camera. Vui lòng thử lại.');
          }
      } else {
          setError('Đã xảy ra lỗi không xác định với camera.');
      }
    } finally {
      setIsStartingCamera(false);
    }
  }, [stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleCaptureFromVideo = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        onCapture(canvas.toDataURL('image/jpeg'));
        stopCamera();
      }
    }
  }, [onCapture, stopCamera]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn một file ảnh.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onCapture(reader.result as string);
      setError(null);
    };
    reader.onerror = () => {
      setError('Không thể đọc file ảnh.');
    };
    reader.readAsDataURL(file);
  };
  
  const handleRetake = useCallback(() => {
      onRetake();
      setError(null);
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  }, [onRetake]);
  
  const triggerFileSelect = () => fileInputRef.current?.click();
  
  const renderContent = () => {
    if (capturedImage) {
      return (
        <>
          <img src={capturedImage} alt="Ảnh đã chụp" className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <p className="text-white font-bold text-lg">Ảnh đã sẵn sàng để phân tích</p>
          </div>
        </>
      );
    }
    if (isCameraOn && videoRef.current) {
      return <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />;
    }
    return (
      <div className="text-center p-4 flex flex-col items-center justify-center h-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        <p className="font-semibold text-gray-300">Sử dụng camera hoặc tải ảnh lên</p>
        <p className="text-sm mt-1 text-gray-400">Ảnh chân dung rõ nét sẽ cho kết quả tốt nhất.</p>
      </div>
    );
  };
  
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
        {isStartingCamera ? <Spinner message="Đang khởi động camera..." /> : renderContent()}
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
        ) : isCameraOn ? (
            <div className="flex gap-4">
                <Button onClick={() => { stopCamera(); triggerFileSelect(); }} variant="secondary" className="w-full">Tải ảnh lên</Button>
                <Button onClick={handleCaptureFromVideo} variant="primary" className="w-full text-lg">Chụp Ảnh</Button>
            </div>
        ) : (
            <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={onBack} variant="secondary" className="w-full">Quay Lại</Button>
                <Button onClick={triggerFileSelect} variant="special" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Tải Ảnh Lên
                </Button>
                 <Button onClick={startCamera} variant="primary" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Dùng Camera
                </Button>
            </div>
        )}
      </div>
    </Card>
  );
};

export default FaceScan;