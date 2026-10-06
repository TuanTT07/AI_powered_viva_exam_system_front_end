import React, { useEffect, useState } from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  status: 'ai_speaking' | 'student_speaking' | 'idle';
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isActive, status }) => {
  const [bars, setBars] = useState<number[]>(Array(30).fill(20));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(30).fill(20));
      return;
    }

    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.floor(Math.random() * 80) + 20));
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  const getColorClass = () => {
    if (status === 'ai_speaking') return 'bg-blue-400';
    if (status === 'student_speaking') return 'bg-green-400';
    return 'bg-gray-500';
  };

  return (
    <div className="flex items-center justify-center gap-1 h-32 w-full bg-slate-900 rounded-xl p-4 overflow-hidden border border-slate-700">
      {bars.map((height, i) => (
        <div
          key={i}
          className={`w-2 rounded-full transition-all duration-75 ${getColorClass()}`}
          style={{ height: `${isActive ? height : 20}%` }}
        />
      ))}
    </div>
  );
};
