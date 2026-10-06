import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface Exam {
  id: string;
  subjectName: string;
  examCode: string;
  date: string;
  time: string;
  durationMinutes: number;
  status: 'upcoming' | 'completed';
  score?: number;
}

interface ExamCardProps {
  exam: Exam;
}

export const ExamCard: React.FC<ExamCardProps> = ({ exam }) => {
  const navigate = useNavigate();
  const isUpcoming = exam.status === 'upcoming';

  const handleAction = () => {
    if (isUpcoming) {
      navigate(`/student/exams/${exam.id}/session`);
    } else {
      navigate(`/student/exams/${exam.id}/report`);
    }
  };

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--surface)' }}>
      <div style={{ padding: '16px', flexGrow: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span className="badge info">{exam.examCode}</span>
          {exam.status === 'completed' && exam.score !== undefined && (
            <span className="badge success">{exam.score} / 10</span>
          )}
        </div>
        <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontFamily: 'var(--font)' }}>{exam.subjectName}</h3>
        <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
          <div>📅 {exam.date}</div>
          <div style={{ marginTop: '4px' }}>⏰ {exam.time} ({exam.durationMinutes} phút)</div>
        </div>
      </div>
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--muted)' }}>
        <button 
          onClick={handleAction} 
          className={`button ${isUpcoming ? 'primary' : 'outline'}`} 
          style={{ width: '100%' }}
        >
          {isUpcoming ? 'Vào thi' : 'Xem báo cáo'}
        </button>
      </div>
    </div>
  );
};
