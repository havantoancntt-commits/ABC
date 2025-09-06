import React from 'react';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
  message: string;
}

const Spinner: React.FC<Props> = ({ message }) => {
  const { t } = useLocalization();
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="max-w-2xl text-center">
            <svg className="animate-spin h-16 w-16 text-yellow-500 mb-6 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="text-2xl font-bold font-serif mb-2">{t('processing')}</h2>
            <p className="text-gray-300">{message}</p>
        </Card>
    </div>
  );
};

export default Spinner;
