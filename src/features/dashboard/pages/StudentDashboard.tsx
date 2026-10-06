import React, { useState } from 'react';
import { ExamCard } from '../components/ExamCard';
import type { Exam } from '../components/ExamCard';

// Mock Data
const MOCK_UPCOMING_EXAMS: Exam[] = [
  {
    id: '123',
    subjectName: 'Cơ sở dữ liệu nâng cao (Advanced Database Systems)',
    examCode: 'DB301',
    date: '10/10/2026',
    time: '08:00',
    durationMinutes: 45,
    status: 'upcoming'
  },
  {
    id: '124',
    subjectName: 'Kiến trúc máy tính (Computer Architecture)',
    examCode: 'CA201',
    date: '12/10/2026',
    time: '14:00',
    durationMinutes: 60,
    status: 'upcoming'
  }
];

const MOCK_COMPLETED_EXAMS: Exam[] = [
  {
    id: '101',
    subjectName: 'Cấu trúc dữ liệu và giải thuật (Data Structures)',
    examCode: 'DS101',
    date: '01/09/2026',
    time: '09:00',
    durationMinutes: 60,
    status: 'completed',
    score: 8.5
  },
  {
    id: '102',
    subjectName: 'Lập trình hướng đối tượng (OOP)',
    examCode: 'OOP201',
    date: '15/08/2026',
    time: '13:30',
    durationMinutes: 90,
    status: 'completed',
    score: 9.0
  },
  {
    id: '103',
    subjectName: 'Mạng máy tính (Computer Networks)',
    examCode: 'NW202',
    date: '10/07/2026',
    time: '10:00',
    durationMinutes: 45,
    status: 'completed',
    score: 7.5
  }
];

export const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');

  const upcomingCount = MOCK_UPCOMING_EXAMS.length;
  const completedCount = MOCK_COMPLETED_EXAMS.length;
  const avgScore = 8.5; // Mocked

  return (
    <>
      <div className="page-header">
        <h1>Chào mừng, Phúc Đạt 👋</h1>
        <p>Chúc bạn một ngày học tập hiệu quả!</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px', maxWidth: '760px' }}>
        <div className="panel" style={{ padding: '16px' }}>
          <div className="eyebrow">Kỳ thi sắp tới</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', fontFamily: 'var(--display)' }}>{upcomingCount}</div>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <div className="eyebrow">Đã hoàn thành</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', fontFamily: 'var(--display)' }}>{completedCount}</div>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <div className="eyebrow">Điểm trung bình</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', fontFamily: 'var(--display)' }}>{avgScore}</div>
        </div>
      </div>

      <div className="panel" style={{ padding: 0, maxWidth: '980px', gap: 0 }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--muted)', borderRadius: '8px 8px 0 0' }}>
          <button 
            onClick={() => setActiveTab('upcoming')}
            style={{ flex: 1, padding: '16px', border: 'none', background: activeTab === 'upcoming' ? 'var(--surface)' : 'transparent', fontWeight: 'bold', cursor: 'pointer', borderTopLeftRadius: '8px', borderRight: '1px solid var(--border)' }}
          >
            Kỳ thi sắp tới ({upcomingCount})
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            style={{ flex: 1, padding: '16px', border: 'none', background: activeTab === 'completed' ? 'var(--surface)' : 'transparent', fontWeight: 'bold', cursor: 'pointer', borderTopRightRadius: '8px' }}
          >
            Lịch sử thi ({completedCount})
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {activeTab === 'upcoming' ? (
              MOCK_UPCOMING_EXAMS.length > 0 ? (
                MOCK_UPCOMING_EXAMS.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} />
                ))
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--secondary)' }}>
                  Không có kỳ thi nào sắp tới.
                </div>
              )
            ) : (
              MOCK_COMPLETED_EXAMS.length > 0 ? (
                MOCK_COMPLETED_EXAMS.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} />
                ))
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--secondary)' }}>
                  Chưa có lịch sử thi nào.
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
};
