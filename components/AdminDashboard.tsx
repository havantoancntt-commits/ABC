import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import Card from './Card';
import Button from './Button';

interface Props {
    visitCount: number;
    onClearCharts: () => void;
    onBack: () => void;
}

const AdminDashboard: React.FC<Props> = ({ visitCount, onClearCharts, onBack }) => {
    const { t } = useLocalization();
    const [featureUsage, setFeatureUsage] = useState<Record<string, number>>({});
    const [isAstrologyUnlocked, setIsAstrologyUnlocked] = useState(false);
    const [isCareerUnlocked, setIsCareerUnlocked] = useState(false);

    useEffect(() => {
        try {
            const storedUsage = localStorage.getItem('featureUsage');
            if (storedUsage) {
                setFeatureUsage(JSON.parse(storedUsage));
            }
            setIsAstrologyUnlocked(sessionStorage.getItem('astrology_unlocked') === 'true');
            setIsCareerUnlocked(sessionStorage.getItem('career_unlocked') === 'true');
        } catch (e) {
            console.error("Could not load admin stats from storage", e);
        }
    }, []);

    const toggleFeatureLock = (feature: 'astrology' | 'career') => {
        if (feature === 'astrology') {
            if (isAstrologyUnlocked) {
                sessionStorage.removeItem('astrology_unlocked');
                setIsAstrologyUnlocked(false);
            } else {
                sessionStorage.setItem('astrology_unlocked', 'true');
                setIsAstrologyUnlocked(true);
            }
        } else {
            if (isCareerUnlocked) {
                sessionStorage.removeItem('career_unlocked');
                setIsCareerUnlocked(false);
            } else {
                sessionStorage.setItem('career_unlocked', 'true');
                setIsCareerUnlocked(true);
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-yellow-300 font-serif">{t('adminDashboardTitle')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <h3 className="text-2xl font-bold font-serif text-teal-300 mb-4">{t('adminStatsTitle')}</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300">{t('adminTotalVisits')}:</span>
                            <span className="font-bold text-white text-lg">{visitCount.toLocaleString()}</span>
                        </div>
                        <hr className="border-gray-700/50" />
                        <h4 className="font-semibold text-gray-300 pt-2">{t('adminFeatureUsage')}:</h4>
                        <div className="max-h-60 overflow-y-auto pr-2">
                            {Object.entries(featureUsage).length > 0 ? (
                                Object.entries(featureUsage).sort(([,a],[,b]) => b-a).map(([feature, count]) => (
                                    <div key={feature} className="flex justify-between items-center text-sm py-1">
                                        <span className="text-gray-400 capitalize">{feature.replace(/([A-Z])/g, ' $1')}</span>
                                        <span className="font-mono text-white">{count.toLocaleString()}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">{t('adminNotAvailable')}</p>
                            )}
                        </div>
                    </div>
                </Card>
                <div className="space-y-8">
                    <Card>
                        <h3 className="text-2xl font-bold font-serif text-teal-300 mb-4">{t('adminActionsTitle')}</h3>
                         <Button onClick={onClearCharts} variant="danger" className="w-full">
                            {t('adminClearCharts')}
                        </Button>
                    </Card>
                     <Card>
                        <h3 className="text-2xl font-bold font-serif text-teal-300 mb-4">{t('adminUnlockFeatures')}</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">{t('adminUnlockAstrology')}</span>
                                <Button size="sm" variant={isAstrologyUnlocked ? 'secondary' : 'primary'} onClick={() => toggleFeatureLock('astrology')}>
                                    {isAstrologyUnlocked ? t('adminLock') : t('passwordSubmit')}
                                </Button>
                            </div>
                             <div className="flex items-center justify-between">
                                <span className="text-gray-300">{t('adminUnlockCareer')}</span>
                                <Button size="sm" variant={isCareerUnlocked ? 'secondary' : 'primary'} onClick={() => toggleFeatureLock('career')}>
                                    {isCareerUnlocked ? t('adminLock') : t('passwordSubmit')}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
            <div className="text-center mt-8">
                <Button onClick={onBack} variant="secondary">{t('home')}</Button>
            </div>
        </div>
    );
};

export default AdminDashboard;
