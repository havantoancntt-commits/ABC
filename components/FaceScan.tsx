import React, { useState, useRef, useEffect, useReducer, useCallback } from 'react';
import Card from './Card';
import Button from './Button';

declare const faceapi: any;

interface Props {
  onAnalyze: () => void;
  onBack: () => void;
  onCapture: (imageDataUrl: string) => void;
  onRetake: () => void;
  capturedImage: string | null;
}

// --- State Machine Definition ---
type CameraStatus =
  | 'idle'
  | 'loadingModels'
  | 'initializingCamera'
  | 'detecting'
  | 'stabilizing'
  | 'countdown'
  | 'capturing'
  | 'preview'
  | 'error';

interface CameraState {
  status: CameraStatus;
  feedbackMessage: string;
  feedbackColor: string;
  countdown: number | null;
  error: string | null;
  isFaceReady: boolean;
}

type CameraAction =
  | { type: 'START_INITIALIZATION' }
  | { type: 'MODELS_LOADED' }
  | { type: 'CAMERA_READY' }
  | { type: 'FACE_DETECTED'; payload: { message: string; color: string; ready: boolean } }
  | { type: 'FACE_LOST' }
  | { type: 'START_STABILIZING' }
  | { type: 'START_COUNTDOWN' }
  | { type: 'SET_COUNTDOWN'; payload: number }
  | { type: 'CAPTURE_SUCCESS' }
  | { type: 'SHOW_PREVIEW' }
  | { type: 'ERROR'; payload: string };

const initialState: CameraState = {
  status: 'idle',
  feedbackMessage: 'Chuẩn bị khởi động...',
  feedbackColor: 'text-gray-400',
  countdown: null,
  error: null,
  isFaceReady: false,
};

function cameraReducer(state: CameraState, action: CameraAction): CameraState {
  switch (action.type) {
    case 'START_INITIALIZATION':
      return { ...initialState, status: 'loadingModels', feedbackMessage: 'Đang tải mô hình AI nhận diện...' };
    case 'MODELS_LOADED':
      return { ...state, status: 'initializingCamera', feedbackMessage: 'Đang bật camera...' };
    case 'CAMERA_READY':
      return { ...state, status: 'detecting', feedbackMessage: 'Đưa khuôn mặt vào khung hình' };
    case 'FACE_DETECTED':
      if (state.status === 'detecting' || state.status === 'stabilizing' ) {
          return { ...state, feedbackMessage: action.payload.message, feedbackColor: action.payload.color, isFaceReady: action.payload.ready };
      }
      return state;
    case 'FACE_LOST':
      return { ...state, status: 'detecting', feedbackMessage: 'Đưa khuôn mặt vào khung hình', feedbackColor: 'text-yellow-400', isFaceReady: false, countdown: null };
    case 'START_STABILIZING':
       return { ...state, status: 'stabilizing', feedbackMessage: 'Giữ nguyên vị trí...', feedbackColor: 'text-green-400', isFaceReady: true };
    case 'START_COUNTDOWN':
      return { ...state, status: 'countdown', countdown: 3, feedbackMessage: 'Tuyệt vời! Giữ yên nhé...' };
    case 'SET_COUNTDOWN':
      if (state.status !== 'countdown') return state;
      return { ...state, countdown: action.payload };
    case 'CAPTURE_SUCCESS':
      return { ...state, status: 'capturing', feedbackMessage: 'Đã chụp!', countdown: null };
    case 'SHOW_PREVIEW':
        return { ...state, status: 'preview', feedbackMessage: '' };
    case 'ERROR':
      return { ...initialState, status: 'error', error: action.payload, feedbackMessage: 'Đã xảy ra lỗi' };
    default:
      return state;
  }
}

const FaceScan: React.FC<Props> = ({ onAnalyze, onBack, onCapture, onRetake, capturedImage }) => {
  const [state, dispatch] = useReducer(cameraReducer, initialState);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  useEffect(() => {
    if (capturedImage && state.status !== 'preview') {
      dispatch({ type: 'SHOW_PREVIEW' });
    }
  }, [capturedImage, state.status]);
  
  const handleRetake = useCallback(() => {
    onRetake();
    dispatch({ type: 'START_INITIALIZATION'}); // Restart the process
  }, [onRetake]);
  
  useEffect(() => {
    if (capturedImage) return;

    let isMounted = true;
    let stream: MediaStream | null = null;
    let animationFrameId: number | null = null;
    let timerStart: number | null = null;

    const stopProcesses = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      animationFrameId = null;
      stream = null;
    };

    const takePicture = () => {
        if (!isMounted) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 300);

        const context = canvas.getContext('2d');
        if (!context) return;
        
        const aspectRatio = video.videoWidth / video.videoHeight;
        canvas.width = 800;
        canvas.height = 800 / aspectRatio;
        
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        
        stopProcesses();
        dispatch({ type: 'CAPTURE_SUCCESS' });
        onCapture(imageDataUrl);
    };

    const detectionLoop = async () => {
      if (!isMounted || !videoRef.current) return;
      
      const currentState = stateRef.current;
      const video = videoRef.current;

      if (video.paused || video.ended || !['detecting', 'stabilizing', 'countdown'].includes(currentState.status)) {
        if (isMounted) animationFrameId = requestAnimationFrame(detectionLoop);
        return;
      }

      const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }));
      
      let faceIsReady = false;
      let feedbackMessage = 'Không tìm thấy khuôn mặt';
      let feedbackColor = 'text-yellow-400';

      if (detection) {
          const face = detection.box;
          const { videoWidth, videoHeight } = video;
          const faceCenterX = face.x + face.width / 2;
          const isCentered = Math.abs(faceCenterX - videoWidth / 2) < videoWidth * 0.15;
          const hasCorrectSize = face.width > videoWidth * 0.3 && face.width < videoWidth * 0.7;
          faceIsReady = isCentered && hasCorrectSize;
          
          if (!isCentered) feedbackMessage = 'Căn giữa khuôn mặt';
          else if (face.width < videoWidth * 0.3) feedbackMessage = 'Vui lòng di chuyển lại gần';
          else if (face.width > videoWidth * 0.7) feedbackMessage = 'Vui lòng di chuyển ra xa';
          else {
            feedbackMessage = 'Hoàn hảo!';
            feedbackColor = 'text-green-400';
          }
      }

      switch (currentState.status) {
        case 'detecting':
        case 'stabilizing':
            if (faceIsReady) {
                if (currentState.status !== 'stabilizing') {
                    dispatch({ type: 'START_STABILIZING' });
                }
                if (timerStart === null) timerStart = Date.now();
                if (Date.now() - timerStart > 700) {
                    dispatch({ type: 'START_COUNTDOWN' });
                    timerStart = null;
                }
            } else {
                dispatch({ type: 'FACE_DETECTED', payload: { message: feedbackMessage, color: feedbackColor, ready: false } });
                if (currentState.status === 'stabilizing') {
                     dispatch({ type: 'FACE_LOST' });
                }
                timerStart = null;
            }
            break;
        case 'countdown':
          if (faceIsReady) {
            if (timerStart === null) timerStart = Date.now();
            const elapsed = Date.now() - timerStart;
            const newCount = 3 - Math.floor(elapsed / 1000);

            if (currentState.countdown !== newCount) {
              dispatch({ type: 'SET_COUNTDOWN', payload: newCount });
            }
            if (newCount <= 0) {
              takePicture();
              return; // Exit loop
            }
          } else {
            dispatch({ type: 'FACE_LOST' });
            timerStart = null;
          }
          break;
      }
      if (isMounted) animationFrameId = requestAnimationFrame(detectionLoop);
    };

    const init = async () => {
      dispatch({ type: 'START_INITIALIZATION' });
      try {
        if (typeof faceapi === 'undefined' || !faceapi.nets.tinyFaceDetector.params) {
            await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
        }
        if (!isMounted) return;
        dispatch({ type: 'MODELS_LOADED' });

        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } });
        if (!isMounted) { stopProcesses(); return; }

        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            if (!isMounted) { stopProcesses(); return; }
            dispatch({ type: 'CAMERA_READY' });
            animationFrameId = requestAnimationFrame(detectionLoop);
        }
      } catch (err: any) {
        console.error("Camera init error:", err);
        if (isMounted) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                dispatch({ type: 'ERROR', payload: 'Quyền truy cập camera bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt và thử lại.' });
            } else {
                dispatch({ type: 'ERROR', payload: 'Không thể truy cập camera. Vui lòng kiểm tra thiết bị của bạn.' });
            }
        }
      }
    };

    init();

    return () => {
      isMounted = false;
      stopProcesses();
    };
  }, [capturedImage, onCapture]);
  
  const showCameraFeed = state.status !== 'preview' && state.status !== 'capturing' && state.status !== 'error' && state.status !== 'idle';

  return (
    <Card className="max-w-3xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl font-bold text-center mb-4 text-yellow-400 font-serif">Xem Nhân Tướng Qua Camera</h2>
        
        {state.status !== 'error' && <p className="text-gray-300 text-center mb-6">Đặt khuôn mặt vào khung oval. Hãy đảm bảo bạn ở nơi có đủ ánh sáng. Hệ thống sẽ tự động chụp khi bạn sẵn sàng.</p>}
        
        {state.error && <div className="my-4 p-4 w-full bg-red-900/50 border border-red-600 rounded-lg text-center"><p className="font-semibold text-red-300">Đã xảy ra lỗi</p><p className="text-gray-300 text-sm mt-1">{state.error}</p></div>}
        
        <div className="relative w-full max-w-lg mx-auto aspect-[4/3] rounded-lg overflow-hidden bg-black border-2 border-gray-600">
            {capturedImage ? (
                <img src={capturedImage} alt="Ảnh đã chụp" className="w-full h-full object-cover" />
            ) : (
                <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${showCameraFeed ? 'opacity-100' : 'opacity-0'}`} />
            )}

            {isFlashing && <div className="absolute inset-0 bg-white animate-flash" />}
            
            {!capturedImage && state.status !== 'error' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-3/4 h-5/6 border-4 border-dashed rounded-full transition-all duration-500 ease-in-out ${state.isFaceReady ? 'border-green-400 scale-105 shadow-[0_0_20px_rgba(74,222,128,0.5)]' : 'border-white/60'}`} 
                         style={{boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)'}}>
                    </div>
                    {state.countdown !== null && state.countdown > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-9xl font-bold text-white animate-ping-once" style={{textShadow: '0 0 20px black'}} key={state.countdown}>{state.countdown}</span>
                        </div>
                    )}
                </div>
            )}
             <canvas ref={canvasRef} className="hidden" />
        </div>
        
        <div className="mt-6 text-center h-12 flex items-center justify-center">
             {!capturedImage && state.status !== 'error' && <p className={`text-xl font-semibold transition-colors duration-300 ${state.feedbackColor}`}>{state.feedbackMessage}</p>}
        </div>

        <div className="mt-4 flex gap-4 w-full justify-center">
            {capturedImage ? (
                <>
                    <Button onClick={handleRetake} variant="secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5m9-1-9 9-9-9" /></svg>
                        Chụp Lại
                    </Button>
                    <Button onClick={onAnalyze} variant="primary" className="text-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Luận Giải
                    </Button>
                </>
            ) : (
                <Button onClick={onBack} variant="secondary" disabled={state.status === 'loadingModels' || state.status === 'initializingCamera'}>
                    Quay Lại
                </Button>
            )}
        </div>
        <style>{`
            @keyframes ping-once {
                0% { transform: scale(0.8); opacity: 0.8; }
                50% { transform: scale(1.2); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
            }
            .animate-ping-once {
                animation: ping-once 0.8s cubic-bezier(0.8, 0, 0.2, 1);
            }
            @keyframes flash-anim {
                from { opacity: 0.8; }
                to { opacity: 0; }
            }
            .animate-flash {
                animation: flash-anim 0.3s ease-out;
                pointer-events: none;
            }
        `}</style>
    </Card>
  );
};

export default FaceScan;