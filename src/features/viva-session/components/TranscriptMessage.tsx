import React from 'react';

interface TranscriptMessageProps {
  role: 'ai' | 'student';
  text: string;
  timestamp: string;
  isPartial?: boolean;
}

export const TranscriptMessage: React.FC<TranscriptMessageProps> = ({ role, text, timestamp, isPartial }) => {
  const isAI = role === 'ai';

  return (
    <div className={`flex w-full mb-4 ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
        isAI 
          ? 'bg-white border border-gray-100 rounded-tl-none' 
          : 'bg-blue-50 border border-blue-100 rounded-tr-none'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-semibold uppercase tracking-wider ${isAI ? 'text-blue-600' : 'text-slate-600'}`}>
            {isAI ? '🤖 Giám khảo AI' : '👤 Sinh viên'}
          </span>
          <span className="text-xs text-gray-400 ml-auto">{timestamp}</span>
        </div>
        
        <p className={`text-gray-800 leading-relaxed ${isPartial ? 'opacity-50 italic' : ''}`}>
          {text}
        </p>
        
        {isPartial && (
          <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
            <span className="animate-pulse">●</span> Đang nghe...
          </div>
        )}
      </div>
    </div>
  );
};
