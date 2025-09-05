import React, { useState, useRef, useCallback } from 'react';
import Card from './Card';
import Button from './Button';

interface Props {
  onAnalyze: () => void;
  onBack: () => void;
  onCapture: (imageDataUrl: string) => void;
  onRetake: () => void;
  capturedImage: string | null;
}

const FaceScan: React.FC<Props> = ({ onAnalyze, onBack, onCapture, onRetake, capturedImage }) => {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleRetakeClick = useCallback(() => {
    onRetake();
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }, [onRetake]);
  
  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <Card className="max-w-3xl mx-auto flex flex-col items-center">
      <h2 className="text-3xl font-bold text-center mb-4 text-yellow-400 font-serif">Xem Nhân Tướng Qua Ảnh</h2>
      
      {error && (
        <div className="my-4 p-4 w-full bg-red-900/50 border border-red-600 rounded-lg text-center">
          <p className="font-semibold text-red-300">{error}</p>
        </div>
      )}
      
      <div 
        className="relative w-full max-w-lg mx-auto aspect-square rounded-lg overflow-hidden bg-gray-900/50 border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-400 cursor-pointer hover:border-yellow-500 hover:text-yellow-500 transition-colors"
        onClick={triggerFileSelect}
        onDrop={(e) => { e.preventDefault(); handleFileChange({ target: e.dataTransfer } as any); }}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        {capturedImage ? (
          <img src={capturedImage} alt="Ảnh đã chọn" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            <p className="font-semibold">Nhấn để chọn hoặc kéo thả ảnh vào đây</p>
            <p className="text-sm mt-1">Sử dụng ảnh chân dung rõ nét để có kết quả tốt nhất.</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4 w-full justify-center">
        {capturedImage ? (
          <>
            <Button onClick={handleRetakeClick} variant="secondary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5m9-1-9 9-9-9" /></svg>
              Chọn Ảnh Khác
            </Button>
            <Button onClick={onAnalyze} variant="primary" className="text-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Luận Giải
            </Button>
          </>
        ) : (
          <Button onClick={onBack} variant="secondary">
            Quay Lại
          </Button>
        )}
      </div>
    </Card>
  );
};

export default FaceScan;
