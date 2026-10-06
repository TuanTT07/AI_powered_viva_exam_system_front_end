import React, { useEffect, useState } from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  status: 'ai_speaking' | 'student_speaking' | 'idle';
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isActive, status }) => {
  const [bars, setBars] = useState<number[]>(Array(40).fill(10));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(40).fill(10));
      return;
    }

    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.floor(Math.random() * 80) + 20));
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  const getColor = () => {
    if (status === 'ai_speaking') return '#60a5fa'; // blue
    if (status === 'student_speaking') return '#4ade80'; // green
    return '#64748b'; // gray
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', height: '120px', width: '100%', background: 'var(--navy-dark)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
      {bars.map((height, i) => (
        <div
          key={i}
          style={{
            width: '6px',
            borderRadius: '4px',
            background: getColor(),
            transition: 'height 75ms ease',
            height: `${isActive ? height : 10}%`,
            boxShadow: isActive ? `0 0 10px ${getColor()}` : 'none'
          }}
        />
      ))}
    </div>
  );
};
