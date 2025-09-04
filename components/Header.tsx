import React from 'react';

interface Props {
  onHomeClick: () => void;
}

const Header: React.FC<Props> = ({ onHomeClick }) => {
  return (
    <header className="py-6 bg-black bg-opacity-30 backdrop-blur-md border-b border-gray-700/50 shadow-lg">
      <div className="container mx-auto text-center">
        <h1 
          className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-300 font-serif animate-fade-in-down cursor-pointer"
          style={{ textShadow: '0 2px 10px rgba(250, 204, 21, 0.3)' }}
          onClick={onHomeClick}
          role="button"
          aria-label="Trở về trang chủ"
        >
          Lá Số Tử Vi &amp; Nhân Tướng Học
        </h1>
        <p className="text-gray-400 mt-2 text-lg">Khám phá vận mệnh - Thấu hiểu bản thân</p>
      </div>
    </header>
  );
};

export default React.memo(Header);