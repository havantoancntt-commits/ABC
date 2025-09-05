import React, { useState, useEffect } from 'react';
import type { BirthInfo } from '../types';
import Button from './Button';
import Card from './Card';
import DonationInfo from './DonationInfo';

interface Props {
  onSubmit: (data: BirthInfo) => void;
}

const BirthInfoForm: React.FC<Props> = ({ onSubmit }) => {
  const currentYear = new Date().getFullYear();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(currentYear - 20);
  const [hour, setHour] = useState(12);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) {
      setDay(daysInMonth);
    }
  }, [year, month, day]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (name.trim() === '') {
      newErrors.name = 'Vui lòng nhập họ và tên.';
    }
    if (year > currentYear) {
      newErrors.year = 'Năm sinh không thể ở tương lai.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ name, gender, year, month, day, hour });
    }
  };
  
  const renderOptions = (start: number, end: number) => {
    const options = [];
    for (let i = start; i <= end; i++) {
      options.push(<option key={i} value={i}>{i}</option>);
    }
    return options;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10 max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-100 font-serif leading-tight">
              Kiến Tạo Bản Đồ Vận Mệnh
          </h2>
          <p className="mt-4 text-lg text-gray-300 leading-relaxed">
              Tử Vi Đẩu Số là một môn nghệ thuật cổ xưa, giải mã vị trí các vì sao tại thời khắc bạn chào đời để vẽ nên một tấm bản đồ chi tiết về vận mệnh. Hãy nhập thông tin của bạn để khám phá những luận giải sâu sắc, thấu hiểu bản thân và nắm bắt tương lai.
          </p>
      </div>
      <Card>
        <h2 className="text-3xl font-bold text-center mb-8 text-yellow-400 font-serif">Nhập thông tin của bạn</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Họ và tên</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({...prev, name: ''}));
              }}
              className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all ${errors.name ? 'border-red-500' : 'border-gray-600'}`}
              placeholder="Ví dụ: Nguyễn Văn A"
              required
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && <p id="name-error" className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-2">Giới tính</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as 'Nam' | 'Nữ')}
              className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
            >
              <option>Nam</option>
              <option>Nữ</option>
            </select>
          </div>

          <div>
              <label htmlFor="hour" className="block text-sm font-medium text-gray-300 mb-2">Giờ sinh</label>
              <select
                  id="hour"
                  value={hour}
                  onChange={(e) => setHour(parseInt(e.target.value))}
                  className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
              >
                  <option value={-1}>Không rõ giờ sinh</option>
                  {renderOptions(0, 23).map(option => React.cloneElement(option, { children: `${option.props.value} giờ` }))}
              </select>
          </div>
          
          <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Ngày tháng năm sinh (Dương Lịch)</label>
              <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="day" className="sr-only">Ngày</label>
                    <select
                        id="day"
                        value={day}
                        onChange={(e) => setDay(parseInt(e.target.value))}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                    >
                        {renderOptions(1, 31)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="month" className="sr-only">Tháng</label>
                    <select
                        id="month"
                        value={month}
                        onChange={(e) => setMonth(parseInt(e.target.value))}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                    >
                        {renderOptions(1, 12)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="year" className="sr-only">Năm</label>
                    <select
                        id="year"
                        value={year}
                        onChange={(e) => {
                            setYear(parseInt(e.target.value));
                            if (errors.year) setErrors(prev => ({...prev, year: ''}));
                        }}
                        className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all ${errors.year ? 'border-red-500' : 'border-gray-600'}`}
                        aria-invalid={!!errors.year}
                        aria-describedby={errors.year ? "year-error" : undefined}
                    >
                        {renderOptions(1920, currentYear).reverse()}
                    </select>
                  </div>
              </div>
              {errors.year && <p id="year-error" className="text-red-500 text-xs mt-1 md:col-span-3 text-right">{errors.year}</p>}
          </div>
          
          <div className="md:col-span-2">
              <DonationInfo />
          </div>

          <div className="md:col-span-2 mt-4">
            <Button type="submit" variant="primary" className="w-full text-lg py-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Xem Lá Số
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default BirthInfoForm;