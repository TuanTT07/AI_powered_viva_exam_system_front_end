import React from 'react';
import { Bot, User, Sparkles } from 'lucide-react';

interface TranscriptMessageProps {
  role: 'ai' | 'student';
  text: string;
  timestamp: string;
  isPartial?: boolean;
  isFollowUp?: boolean;
}

export const TranscriptMessage: React.FC<TranscriptMessageProps> = ({ role, text, timestamp, isPartial, isFollowUp }) => {
  const isAI = role === 'ai';

  return (
    <div className={`flex w-full mb-4 ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 shadow-xs transition-all ${
          isAI
            ? isFollowUp
              ? 'bg-amber-50/70 border border-amber-200 text-stone-900 rounded-tl-xs'
              : 'bg-stone-50 border border-[var(--border)] text-stone-900 rounded-tl-xs'
            : 'bg-indigo-50/70 border border-indigo-200/80 text-[var(--navy-dark)] rounded-tr-xs'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          {isAI ? (
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${isFollowUp ? 'bg-amber-100 text-amber-800' : 'bg-[var(--navy)] text-white'}`}>
              <Bot className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-lg bg-indigo-200/70 text-indigo-900 flex items-center justify-center text-xs font-bold">
              <User className="w-3.5 h-3.5" />
            </div>
          )}

          <span className={`text-xs font-bold uppercase tracking-wider ${isAI ? (isFollowUp ? 'text-amber-800' : 'text-[var(--navy)]') : 'text-indigo-900'}`}>
            {isAI ? 'Giám khảo AI' : 'Thí sinh'}
          </span>

          {isFollowUp && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-900 border border-amber-300">
              <Sparkles className="w-3 h-3" />
              Câu hỏi mở rộng
            </span>
          )}

          {timestamp && (
            <span className="text-[11px] font-medium text-stone-600 ml-auto font-mono">
              {timestamp}
            </span>
          )}
        </div>

        <p className={`text-sm leading-relaxed ${isPartial ? 'italic text-stone-600' : 'text-stone-800'}`}>
          {text}
        </p>

        {isPartial && (
          <div className="mt-2 text-xs text-indigo-600 font-medium flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
            Đang nhận diện giọng nói...
          </div>
        )}
      </div>
    </div>
  );
};
