import React, { useEffect, useState } from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  status: 'ai_speaking' | 'student_speaking' | 'idle';
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isActive, status }) => {
  const [bars, setBars] = useState<number[]>(Array(36).fill(12));

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.floor(Math.random() * 75) + 25));
    }, 90);

    return () => {
      clearInterval(interval);
      setBars(Array(36).fill(12));
    };
  }, [isActive]);

  const getBarColor = () => {
    if (status === 'ai_speaking') return 'bg-indigo-600';
    if (status === 'student_speaking') return 'bg-emerald-600';
    return 'bg-stone-300';
  };

  return (
    <div className="w-full max-w-xl bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center gap-3">
      <div className="flex items-center justify-center gap-1.5 h-20 w-full overflow-hidden px-4">
        {bars.map((height, i) => (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-all duration-75 ${getBarColor()}`}
            style={{
              height: `${isActive ? height : 14}%`,
              opacity: isActive ? 0.9 : 0.4,
            }}
          />
        ))}
      </div>
      <div className="text-xs font-medium text-stone-500 flex items-center gap-2">
        {status === 'student_speaking' && (
          <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Đang thu nhận âm thanh từ micro của bạn
          </span>
        )}
        {status === 'ai_speaking' && (
          <span className="text-indigo-700 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            Giám khảo AI đang trình bày câu hỏi
          </span>
        )}
        {status === 'idle' && (
          <span>Âm lượng micro: Sẵn sàng</span>
        )}
      </div>
    </div>
  );
};
