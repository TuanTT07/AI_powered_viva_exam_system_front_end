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

  let bg = isAI ? 'var(--surface)' : '#eff6ff';
  let borderColor = isAI ? 'var(--border)' : '#bfdbfe';
  
  if (isAI && isFollowUp) {
    bg = '#fffbeb';
    borderColor = '#fde68a';
  }

  return (
    <div style={{ display: 'flex', width: '100%', marginBottom: '16px', justifyItems: isAI ? 'flex-start' : 'flex-end', justifyContent: isAI ? 'flex-start' : 'flex-end' }}>
      <div style={{ 
        maxWidth: '80%', 
        padding: '16px', 
        background: bg, 
        border: `1px solid ${borderColor}`,
        borderRadius: '16px',
        borderTopLeftRadius: isAI ? '0' : '16px',
        borderTopRightRadius: !isAI ? '0' : '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: isAI ? (isFollowUp ? '#d97706' : 'var(--navy)') : 'var(--secondary)' }}>
            {isAI ? '🤖 Giám khảo AI' : '👤 Sinh viên'}
          </span>
          {isFollowUp && <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#fef3c7', color: '#92400e', borderRadius: '12px', fontWeight: 600 }}>Câu hỏi phụ (Làm rõ ý)</span>}
          <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginLeft: 'auto' }}>{timestamp}</span>
        </div>
        
        <p style={{ margin: 0, color: 'var(--text)', lineHeight: 1.6, fontStyle: isPartial ? 'italic' : 'normal', opacity: isPartial ? 0.6 : 1 }}>
          {text}
        </p>
        
        {isPartial && (
          <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ animation: 'pulse 1s infinite' }}>●</span> Đang nghe...
          </div>
        )}
      </div>
    </div>
  );
};
