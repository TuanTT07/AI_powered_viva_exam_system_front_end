import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const StudentExamResultPage: React.FC = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  // Mock data for the exam result
  const result = {
    examName: 'Thi Cuối Kỳ Vấn Đáp',
    subject: 'CS101 - Nhập môn Khoa học Máy tính',
    date: '20/11/2026',
    duration: '15 phút',
    aiScore: 8.5,
    finalScore: 8.8,
    feedback: 'Sinh viên nắm vững kiến thức cơ bản về OOP và cấu trúc dữ liệu. Trả lời lưu loát, tuy nhiên cần cải thiện một chút ở phần giải thích thuật toán sắp xếp.',
    status: 'Công bố chính thức',
    transcript: [
      { role: 'ai', text: 'Chào bạn, câu hỏi đầu tiên: Hãy giải thích tính đa hình trong OOP.', time: '09:00' },
      { role: 'student', text: 'Dạ, tính đa hình cho phép các đối tượng thuộc các lớp khác nhau có thể phản hồi lại cùng một lời gọi phương thức theo những cách riêng biệt...', time: '09:01' },
      { role: 'ai', text: 'Tốt lắm, bạn có thể cho một ví dụ thực tế không?', time: '09:02' },
      { role: 'student', text: 'Ví dụ ta có class Animal với method MakeSound(). Class Dog sẽ sủa gâu gâu, còn class Cat sẽ kêu meo meo.', time: '09:02' },
    ]
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button 
            className="button outline" 
            onClick={() => navigate('/student/exams')}
            style={{ marginBottom: '16px', padding: '6px 12px', fontSize: '0.85rem' }}
          >
            ← Quay lại danh sách
          </button>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--navy-dark)', margin: '0 0 8px 0', fontFamily: 'var(--display)' }}>
            Biên bản Kết quả: {result.examName} {examId ? `(Mã: EXAM-${examId})` : ''}
          </h1>
          <p style={{ margin: 0, color: 'var(--secondary)' }}>Môn học: {result.subject} • Ngày thi: {result.date}</p>
        </div>
        <span className="badge success" style={{ padding: '6px 12px', fontSize: '0.9rem' }}>{result.status}</span>
      </div>

      {/* Score and Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        
        {/* Score Card */}
        <div className="panel" style={{ background: 'var(--navy-dark)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '32px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Điểm chính thức</h3>
          <div style={{ fontSize: '3.5rem', fontWeight: 700, fontFamily: 'var(--display)', color: '#4ade80', lineHeight: 1 }}>
            {result.finalScore}
          </div>
          <div style={{ marginTop: '16px', fontSize: '0.85rem', color: '#94a3b8', display: 'flex', gap: '16px' }}>
            <span>AI đề xuất: {result.aiScore}</span>
            <span style={{ color: '#475569' }}>|</span>
            <span>Thang điểm 10</span>
          </div>
        </div>

        {/* Feedback Card */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--navy-dark)', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Nhận xét từ Giảng viên</h3>
          <p style={{ margin: 0, color: 'var(--text)', lineHeight: 1.6, flex: 1 }}>
            "{result.feedback}"
          </p>
        </div>
      </div>

      {/* Transcript Log */}
      <div className="panel" style={{ background: 'var(--surface)' }}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', color: 'var(--navy-dark)', borderBottom: '1px solid var(--border)', paddingBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Biên bản Hội thoại</span>
          <span className="badge info" style={{ fontSize: '0.75rem' }}>{result.duration}</span>
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {result.transcript.map((msg, index) => {
            const isAI = msg.role === 'ai';
            return (
              <div key={index} style={{ display: 'flex', width: '100%', justifyContent: isAI ? 'flex-start' : 'flex-end' }}>
                <div style={{ 
                  maxWidth: '85%', 
                  padding: '16px', 
                  background: isAI ? '#f8fafc' : '#eff6ff', 
                  border: `1px solid ${isAI ? 'var(--border)' : '#bfdbfe'}`,
                  borderRadius: '16px',
                  borderTopLeftRadius: isAI ? '0' : '16px',
                  borderTopRightRadius: !isAI ? '0' : '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isAI ? 'var(--navy)' : '#1d4ed8' }}>
                      {isAI ? '🤖 Giám khảo AI' : '👤 Sinh viên'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{msg.time}</span>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text)', lineHeight: 1.5 }}>{msg.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
};
