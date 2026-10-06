import React from 'react';

interface TranscriptMessageProps {
  role: 'ai' | 'student';
  text: string;
  timestamp: string;
  isPartial?: boolean;
  isFollowUp?: boolean;
}

export const TranscriptMessage: React.FC<TranscriptMessageProps> = ({ role, text, timestamp, isPartial, isFollowUp }) => {
  const isAI = role === 'ai';

  let bgClass = isAI ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100';
  if (isAI && isFollowUp) {
    bgClass = 'bg-amber-50 border-amber-200';
  }

  return (
    <div className={`flex w-full mb-4 ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm border ${bgClass} ${isAI ? 'rounded-tl-none' : 'rounded-tr-none'}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-semibold uppercase tracking-wider ${isAI ? (isFollowUp ? 'text-amber-600' : 'text-blue-600') : 'text-slate-600'}`}>
            {isAI ? '🤖 Giám khảo AI' : '👤 Sinh viên'}
          </span>
          {isFollowUp && <span className="text-xs px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full font-medium">Câu hỏi phụ (Làm rõ ý)</span>}
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
