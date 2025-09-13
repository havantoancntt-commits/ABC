import React from 'react';
import { useLocalization } from '../hooks/useLocalization';

const imageBase64 = "data:image/webp;base64,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";

const MysticalHero: React.FC = () => {
    const { t } = useLocalization();
    return (
        <div className="relative mb-16 max-w-5xl mx-auto group animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 via-yellow-500 to-rose-600 rounded-3xl blur-xl opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative aspect-[16/7] w-full bg-black rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-gray-800">
                <img
                    src={imageBase64}
                    alt={t('appName')}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            </div>
        </div>
    );
};

export default MysticalHero;
