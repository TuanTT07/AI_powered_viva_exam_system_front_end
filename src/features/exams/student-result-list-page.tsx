import React from 'react';
import { useNavigate } from 'react-router-dom';

export const StudentResultListPage: React.FC = () => {
  const navigate = useNavigate();

  const results = [
    {
      id: '1',
      examCode: 'EXAM-1',
      subject: 'CS101 - Nhập môn Khoa học Máy tính',
      date: '20/11/2026',
      score: 8.8,
      status: 'Đã công bố'
    },
    {
      id: '2',
      examCode: 'EXAM-2',
      subject: 'ENG201 - Tiếng Anh Giao tiếp',
      date: '15/10/2026',
      score: 9.2,
      status: 'Đã công bố'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--navy-dark)', margin: '0 0 8px 0', fontFamily: 'var(--display)' }}>
          Kết quả và biên bản
        </h1>
        <p style={{ margin: 0, color: 'var(--secondary)' }}>
          Danh sách kết quả các kỳ thi vấn đáp đã được công bố chính thức.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {results.map(res => (
          <div key={res.id} className="panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span className="badge success" style={{ background: '#dcfce7', color: '#166534', border: 'none' }}>{res.status}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}>{res.date}</span>
              </div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: 'var(--navy-dark)', fontWeight: 700 }}>{res.subject}</h3>
              <p style={{ margin: 0, color: 'var(--secondary)', fontFamily: 'var(--mono)' }}>Mã đề: {res.examCode}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Điểm số</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#16a34a', fontFamily: 'var(--display)', lineHeight: 1 }}>{res.score}</span>
              </div>
              <button 
                className="button outline"
                onClick={() => navigate(`/student/exams/${res.id}/result`)}
                style={{ padding: '10px 24px', borderColor: 'var(--navy-dark)', color: 'var(--navy-dark)', borderRadius: '8px' }}
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
