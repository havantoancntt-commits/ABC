import React from 'react';
import Card from './Card';
import Button from './Button';

interface Props {
    onStartAstrology: () => void;
    onStartPhysiognomy: () => void;
}

const FeatureCard: React.FC<{
    title: string;
    description: string;
    buttonText: string;
    icon: React.ReactNode;
    onClick: () => void;
    buttonVariant: 'primary' | 'special';
}> = ({ title, description, buttonText, icon, onClick, buttonVariant }) => (
    <div className="group relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-500"></div>
        <Card className="relative flex flex-col text-center items-center h-full">
            <div className="p-4 bg-gray-900/50 rounded-full mb-4">
                {icon}
            </div>
            <h3 className="text-2xl font-bold font-serif text-yellow-300 mb-3">{title}</h3>
            <p className="text-gray-300 flex-grow mb-6">{description}</p>
            <Button onClick={onClick} variant={buttonVariant} className="w-full mt-auto">
                {buttonText}
            </Button>
        </Card>
    </div>
);


const Home: React.FC<Props> = ({ onStartAstrology, onStartPhysiognomy }) => {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center my-10">
                <h2 className="text-4xl font-bold text-gray-100 font-serif leading-tight">
                    Chào mừng bạn đến với Kho Tàng Huyền Học
                </h2>
                <p className="mt-4 text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
                    Khám phá những kiến thức uyên thâm từ hai bộ môn kinh điển của văn hóa phương Đông.
                    Lựa chọn một trong các công cụ dưới đây để bắt đầu hành trình thấu hiểu bản thân và định hướng tương lai.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                <FeatureCard
                    title="Tử Vi Đẩu Số"
                    description="Lập và luận giải lá số tử vi chi tiết dựa trên ngày giờ sinh. Khám phá bản đồ vận mệnh, các cung số và nhận định hướng cho tương lai."
                    buttonText="Lập Lá Số Ngay"
                    onClick={onStartAstrology}
                    buttonVariant="primary"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-12v4m-2-2h4m5 4v4m-2-2h4M5 11h14M5 11a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2M5 11v2a2 2 0 002 2h10a2 2 0 002-2v-2" /></svg>}
                />
                 <FeatureCard
                    title="Nhân Tướng Học"
                    description="Phân tích các đặc điểm trên khuôn mặt bạn thông qua ảnh chân dung. Luận giải về tính cách, vận số qua Tam Đình, Ngũ Quan."
                    buttonText="Xem Nhân Tướng"
                    onClick={onStartPhysiognomy}
                    buttonVariant="special"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                />
            </div>
        </div>
    );
};

export default Home;