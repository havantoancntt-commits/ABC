import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import Card from './Card';
import Button from './Button';
import Spinner from './Spinner';

const AdminHistoryLog = lazy(() => import('./AdminHistoryLog'));

interface Props {
    visitCount: number;
    onAdminAction: (action: 'clear_charts' | 'clear_history') => void;
    onBack: () => void;
}

const AdminDashboard: React.FC<Props> = ({ visitCount, onAdminAction, onBack }) => {
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState<'stats' | 'history'>('stats');
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
    
    const TabButton: React.FC<{ tabId: 'stats' | 'history'; children: React.ReactNode }> = ({ tabId, children }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-6 py-3 font-bold text-lg transition-colors duration-300 ${activeTab === tabId ? 'text-yellow-300 border-b-2 border-yellow-300' : 'text-gray-400 hover:text-white'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-yellow-300 font-serif">{t('adminDashboardTitle')}</h2>
            </div>
            
            <div className="border-b border-gray-700/50 mb-8 flex justify-center">
                <TabButton tabId="stats">{t('adminTabStats')}</TabButton>
                <TabButton tabId="history">{t('adminTabHistory')}</TabButton>
            </div>

            {activeTab === 'stats' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
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
                             <Button onClick={() => onAdminAction('clear_charts')} variant="danger" className="w-full mb-4">
                                {t('adminClearCharts')}
                            </Button>
                            <Button onClick={() => onAdminAction('clear_history')} variant="danger" className="w-full">
                                {t('adminClearHistory')}
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
            )}
            
            {activeTab === 'history' && (
                // FIX: Changed 'message' prop to 'initialMessageKey' and passed the translation key.
                <Suspense fallback={<Spinner initialMessageKey='processing' />}>
                    <AdminHistoryLog />
                </Suspense>
            )}

            <div className="text-center mt-12">
                <Button onClick={onBack} variant="secondary">{t('home')}</Button>
            </div>
        </div>
    );
};

export default AdminDashboard;
