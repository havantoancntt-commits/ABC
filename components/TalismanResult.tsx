import React, { useState } from 'react';
import type { TalismanData, TalismanInfo } from '../lib/types';
import Button from './Button';
import Card from './Card';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
  data: TalismanData;
  info: TalismanInfo;
  onReset: () => void;
  onOpenDonationModal: () => void;
}

const TalismanResult: React.FC<Props> = ({ data, info, onReset, onOpenDonationModal }) => {
    const { t } = useLocalization();
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveTalisman = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Could not get canvas context');
            
            const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data.svg)}`;
            const img = new Image();
            
            img.onload = () => {
                const desiredWidth = 600;
                const viewBoxMatch = data.svg.match(/viewBox="0 0 (\d+) (\d+)"/);
                const svgWidth = viewBoxMatch ? parseInt(viewBoxMatch[1]) : 200;
                const svgHeight = viewBoxMatch ? parseInt(viewBoxMatch[2]) : 280;

                const scale = desiredWidth / svgWidth;
                const desiredHeight = svgHeight * scale;
                canvas.width = desiredWidth;
                canvas.height = desiredHeight;
                
                ctx.fillStyle = '#0c0a1a';
                ctx.fillRect(0, 0, desiredWidth, desiredHeight);
                ctx.drawImage(img, 0, 0, desiredWidth, desiredHeight);

                const pngUrl = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.href = pngUrl;
                downloadLink.download = `${data.name.replace(/\s/g, '_')}-${info.name.replace(/\s/g, '_')}.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                
                setIsSaving(false);
            };
            img.onerror = () => {
                console.error("Failed to load SVG into image for saving.");
                alert(t('errorSaveImage'));
                setIsSaving(false);
            };
            img.src = svgDataUrl;
        } catch (error) {
            console.error("Error saving talisman:", error);
            alert(t('errorSaveImage'));
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-bold text-amber-300 font-serif leading-tight">{t('talismanResultTitle')}</h2>
                <p className="mt-2 text-lg text-gray-300">Dành cho {info.name}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="flex flex-col items-center text-center">
                    <Card className="p-4 bg-gray-950/50 border-amber-500/30">
                        <h3 className="text-2xl font-serif font-bold text-amber-300 mb-2">{data.name}</h3>
                        <p className="font-serif text-xl text-yellow-200/90 tracking-widest mb-4 drop-shadow-[0_1px_2px_rgba(250,204,21,0.5)]">"{data.cauChu}"</p>
                        <div className="w-full max-w-xs mx-auto aspect-[200/280] p-2 bg-black/30 rounded-lg shadow-inner">
                            <div
                                className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
                                dangerouslySetInnerHTML={{ __html: data.svg }}
                            />
                        </div>
                    </Card>
                    <Button onClick={handleSaveTalisman} disabled={isSaving} variant="primary" className="mt-6 w-full max-w-xs">
                        {isSaving ? t('creating') : t('talismanDownload')}
                    </Button>
                </div>
                
                <div className="space-y-6">
                    <Card>
                        <h4 className="text-xl font-serif font-bold text-amber-300 mb-3">{t('talismanDescription')}</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{data.description}</p>
                    </Card>
                    <Card>
                        <h4 className="text-xl font-serif font-bold text-amber-300 mb-3">{t('talismanInterpretation')}</h4>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{data.interpretation}</p>
                    </Card>
                    <Card>
                        <h4 className="text-xl font-serif font-bold text-amber-300 mb-3">{t('talismanUsage')}</h4>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{data.usage}</p>
                    </Card>
                </div>
            </div>

            <div className="mt-10 text-center text-amber-100/80 max-w-3xl mx-auto text-sm">
                <p>{t('resultSupportMessage')}</p>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Button onClick={onReset} variant="secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5m9-1-9 9-9-9" /></svg>
                    {t('talismanTryAgain')}
                </Button>
                <Button onClick={onOpenDonationModal} variant="primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {t('donate')}
                </Button>
            </div>
        </div>
    );
};

export default TalismanResult;