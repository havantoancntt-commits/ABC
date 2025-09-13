import React from 'react';
import Card from './Card';

interface Props {
  title: string;
  content: string;
  icon: React.ReactNode;
  colorClass?: string;
}

const AnalysisSection: React.FC<Props> = React.memo(({ title, content, icon, colorClass = 'text-yellow-400' }) => (
    <Card className="p-6">
        <h3 className={`text-xl font-bold font-serif mb-4 flex items-center gap-3 ${colorClass}`}>
            {icon}
            {title}
        </h3>
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-justify" style={{lineHeight: 1.8}}>{content}</p>
    </Card>
));

export default AnalysisSection;
