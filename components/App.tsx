import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { BirthInfo, AstrologyChartData, SavedChart, PhysiognomyData } from '../types';
import { AppState } from '../types';
import { generateAstrologyChart, analyzePhysiognomy } from '../geminiService';
import Header from './Header';
import BirthInfoForm from './BirthInfoForm';
import DonationModal from './PaymentModal';
import AstrologyChart from './AstrologyChart';
import Spinner from './Spinner';
import SavedCharts from './SavedCharts';
import ZaloContact from './ZaloContact';
import ConfirmationModal from './ConfirmationModal';
import FaceScan from './FaceScan';
import PhysiognomyResult from './PhysiognomyResult';
import Home from './Home';
import { SUPPORT_INFO } from '../constants';

const createChartId = (info: BirthInfo): string => {
  const hourPart = info.hour === -1 ? 'unknown' : info.hour;
  return `${info.name}-${info.gender}-${info.year}-${info.month}-${info.day}-${hourPart}`.trim().replace(/\s+/g, '_');
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [birthInfo, setBirthInfo] = useState<BirthInfo | null>(null);
  const [chartData, setChartData] = useState<AstrologyChartData | null>(null);
  const [physiognomyData, setPhysiognomyData] = useState<PhysiognomyData | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedCharts, setSavedCharts] = useState<SavedChart[]>([]);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [chartToDelete, setChartToDelete] = useState<SavedChart | null>(null);
  const [visitCount, setVisitCount] = useState<number>(0);

  useEffect(() => {
    try {
      const storedCharts = localStorage.getItem('astrologyCharts');
      if (storedCharts) {
        const parsedCharts = JSON.parse(storedCharts);
        // Validate data structure before setting state to prevent crashes from corrupted data
        if (Array.isArray(parsedCharts) && parsedCharts.every(c => c.id && c.birthInfo && c.chartData)) {
            setSavedCharts(parsedCharts);
            if (parsedCharts.length > 0) {
               setAppState(AppState.SAVED_CHARTS);
            }
        } else {
            console.warn("Dữ liệu lá số trong localStorage không hợp lệ, đang xóa...");
            localStorage.removeItem('astrologyCharts');
        }
      }
    } catch (e) {
      console.error("Không thể tải lá số từ localStorage", e);
      localStorage.removeItem('astrologyCharts');
    }

    try {
        let currentCount = parseInt(localStorage.getItem('visitCount') || '0', 10);
        currentCount++;
        localStorage.setItem('visitCount', currentCount.toString());
        setVisitCount(currentCount);
    } catch (e) {
        console.error("Failed to update visit count", e);
        setVisitCount(1);
    }
  }, []);

  useEffect(() => {
    if (appState === AppState.SAVED_CHARTS && savedCharts.length === 0) {
      setAppState(AppState.HOME);
    }
  }, [savedCharts, appState]);

  const handleGenerateChart = useCallback(async (info: BirthInfo) => {
    setBirthInfo(info);
    setAppState(AppState.LOADING);
    setError(null);
    try {
      const data = await generateAstrologyChart(info);
      setChartData(data);
      
      const newChart: SavedChart = {
          id: createChartId(info),
          birthInfo: info,
          chartData: data
      };
      const updatedCharts = [...savedCharts.filter(c => c.id !== newChart.id), newChart];
      setSavedCharts(updatedCharts);
      localStorage.setItem('astrologyCharts', JSON.stringify(updatedCharts));

      setAppState(AppState.RESULT);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
      setAppState(AppState.ASTROLOGY_FORM);
    }
  }, [savedCharts]);
  
  const handleAnalyzeFace = useCallback(async () => {
    if (!capturedImage) return;
    
    setAppState(AppState.FACE_SCAN_LOADING);
    setError(null);
    const base64Data = capturedImage.split(',')[1];
    if(!base64Data) {
        setError('Dữ liệu ảnh không hợp lệ.');
        setAppState(AppState.FACE_SCAN_CAPTURE);
        return;
    }

    try {
      const data = await analyzePhysiognomy(base64Data);
      setPhysiognomyData(data);
      setAppState(AppState.FACE_SCAN_RESULT);
    } catch (err) {
       console.error(err);
       setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
       setAppState(AppState.FACE_SCAN_CAPTURE);
    }
  }, [capturedImage]);

  const handleCaptureImage = useCallback((imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
  }, []);

  const handleRetakeCapture = useCallback(() => {
    setCapturedImage(null);
    setError(null);
  }, []);
  
  const handleFormSubmit = useCallback((info: BirthInfo) => {
    const chartId = createChartId(info);
    const existingChart = savedCharts.find(chart => chart.id === chartId);

    if (existingChart) {
      setBirthInfo(existingChart.birthInfo);
      setChartData(existingChart.chartData);
      setAppState(AppState.RESULT);
    } else {
      handleGenerateChart(info);
    }
  }, [savedCharts, handleGenerateChart]);

  const handleResetToHome = useCallback(() => {
    if (savedCharts.length > 0) {
        setAppState(AppState.SAVED_CHARTS);
    } else {
        setAppState(AppState.HOME);
    }
    setBirthInfo(null);
    setChartData(null);
    setPhysiognomyData(null);
    setCapturedImage(null);
    setError(null);
  }, [savedCharts]);
  
  const handleStartAstrology = useCallback(() => setAppState(AppState.ASTROLOGY_FORM), []);
  const handleStartPhysiognomy = useCallback(() => setAppState(AppState.FACE_SCAN_CAPTURE), []);

  const handleViewChart = useCallback((chart: SavedChart) => {
    setBirthInfo(chart.birthInfo);
    setChartData(chart.chartData);
    setAppState(AppState.RESULT);
  }, []);

  const handleDeleteChart = useCallback((chart: SavedChart) => {
    setChartToDelete(chart);
  }, []);

  const confirmDeleteChart = useCallback(() => {
    if (!chartToDelete) return;
    const updatedCharts = savedCharts.filter(chart => chart.id !== chartToDelete.id);
    setSavedCharts(updatedCharts);
    localStorage.setItem('astrologyCharts', JSON.stringify(updatedCharts));
    setChartToDelete(null);
  }, [chartToDelete, savedCharts]);
  
  const handleCreateNew = useCallback(() => {
      setAppState(AppState.ASTROLOGY_FORM);
      setBirthInfo(null);
      setChartData(null);
      setError(null);
  }, []);

  const handleResetFaceScan = useCallback(() => {
      setAppState(AppState.FACE_SCAN_CAPTURE);
      setPhysiognomyData(null);
      setCapturedImage(null);
      setError(null);
  }, []);

  const MemoizedHeader = useMemo(() => <Header onHomeClick={handleResetToHome} />, [handleResetToHome]);
  const MemoizedZaloContact = useMemo(() => <ZaloContact />, []);

  const content = useMemo(() => {
    switch (appState) {
      case AppState.HOME:
        return <Home onStartAstrology={handleStartAstrology} onStartPhysiognomy={handleStartPhysiognomy} />;
      case AppState.SAVED_CHARTS:
        return <SavedCharts 
          charts={savedCharts}
          onView={handleViewChart}
          onDelete={handleDeleteChart}
          onCreateNew={handleCreateNew}
        />;
      case AppState.ASTROLOGY_FORM:
        return <BirthInfoForm onSubmit={handleFormSubmit} />;
      case AppState.LOADING:
        return <Spinner message="Hệ thống đang khởi tạo lá số tử vi cho bạn. Các vì sao đang dịch chuyển vào đúng vị trí... Quá trình này có thể mất vài phút, xin vui lòng chờ..." />;
      case AppState.RESULT:
        return chartData && <AstrologyChart data={chartData} birthInfo={birthInfo!} onReset={handleResetToHome} onOpenDonationModal={() => setIsDonationModalOpen(true)} />;
      case AppState.FACE_SCAN_CAPTURE:
        return <FaceScan 
            onAnalyze={handleAnalyzeFace} 
            onBack={handleResetToHome}
            onCapture={handleCaptureImage}
            onRetake={handleRetakeCapture}
            capturedImage={capturedImage}
        />;
      case AppState.FACE_SCAN_LOADING:
        return <Spinner message="AI đang phân tích các đường nét trên khuôn mặt bạn... Xin vui lòng giữ nguyên trang..." />;
      case AppState.FACE_SCAN_RESULT:
          return physiognomyData && capturedImage && <PhysiognomyResult analysisData={physiognomyData} imageData={capturedImage} onReset={handleResetFaceScan} onBackToHome={handleResetToHome} />;
      default:
        return null;
    }
  }, [appState, handleStartAstrology, handleStartPhysiognomy, savedCharts, handleViewChart, handleDeleteChart, handleCreateNew, handleFormSubmit, chartData, birthInfo, handleResetToHome, handleAnalyzeFace, handleCaptureImage, handleRetakeCapture, capturedImage, physiognomyData, handleResetFaceScan]);

  return (
    <div className="min-h-screen text-gray-200">
      <div className="min-h-screen bg-black bg-opacity-70 backdrop-blur-sm flex flex-col">
        {MemoizedHeader}
        <main className="container mx-auto px-4 py-8 flex-grow">
          {error && (
            <div className="bg-red-800 border border-red-600 text-white px-4 py-3 rounded-lg relative mb-6 flex items-center justify-between animate-fade-in" role="alert" aria-live="assertive">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div>
                  <strong className="font-bold">Đã xảy ra lỗi!</strong>
                  <span className="block sm:inline sm:ml-2">{error}</span>
                </div>
              </div>
              <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-red-700 transition-colors" aria-label="Đóng thông báo lỗi">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          )}
          <div className="animate-fade-in">
            {content}
          </div>
        </main>
        <footer className="text-center py-8 text-gray-400 bg-black bg-opacity-50 mt-8 border-t border-gray-700/50">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-left">
              <h4 className="font-bold text-lg text-yellow-400 font-serif mb-2">Lá Số Tử Vi & Nhân Tướng Học</h4>
              <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} - {SUPPORT_INFO.channelName}. | Lượt truy cập: {visitCount > 0 ? visitCount.toLocaleString('vi-VN') : '...'}</p>
              <p className="text-xs text-gray-600 mt-2">Mọi thông tin trong ứng dụng chỉ mang tính chất tham khảo, chiêm nghiệm và định hướng. Vận mệnh nằm trong tay bạn.</p>
            </div>
            <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-700/50 text-left md:text-right">
              <h4 className="font-bold text-lg text-yellow-400 font-serif mb-2">Hỗ Trợ & Tư Vấn Chuyên Sâu</h4>
              <p className="text-sm">Liên hệ qua Zalo để được luận giải chi tiết hơn:</p>
              <a 
                href={`https://zalo.me/${SUPPORT_INFO.zaloPhone}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.999 15.826h-2.922v-2.145h2.922v-1.125l-4.047-2.344v-2.313h4.047v-2.148h-5.242v7.929h-1.758v-7.929h-5.25v2.148h4.055v2.313l-4.055 2.344v1.125h2.922v2.145h-2.922v1.125l4.055 2.344v2.313h-4.055v2.148h5.25v-7.93h1.758v7.93h5.242v-2.148h-4.047v-2.313l4.047-2.344v-1.125z" />
                </svg>
                <span>Zalo: {SUPPORT_INFO.zaloPhone}</span>
              </a>
            </div>
          </div>
        </footer>
        <DonationModal isOpen={isDonationModalOpen} onClose={() => setIsDonationModalOpen(false)} />
        {MemoizedZaloContact}
        <ConfirmationModal
          isOpen={!!chartToDelete}
          onClose={() => setChartToDelete(null)}
          onConfirm={confirmDeleteChart}
          title="Xác nhận xóa"
          message={`Bạn có chắc chắn muốn xóa lá số của ${chartToDelete?.birthInfo.name}? Hành động này không thể hoàn tác.`}
        />
      </div>
    </div>
  );
};

export default App;