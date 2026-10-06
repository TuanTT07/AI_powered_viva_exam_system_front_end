import { useNavigate, useParams } from 'react-router-dom';

export function ExamSuccessPage() {
  const navigate = useNavigate();
  const { examId } = useParams();

  const handleReturnHome = () => {
    navigate('/student');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', background: 'var(--bg)', padding: '24px' }}>
      <div style={{ maxWidth: '640px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        
        {/* 1. Success Header */}
        <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.1)' }}>
            <svg style={{ width: '40px', height: '40px', color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--navy-dark)', textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: '16px', fontFamily: 'var(--display)' }}>
            BÀI THI VẤN ĐÁP ĐÃ ĐƯỢC GHI NHẬN & NỘP THÀNH CÔNG
          </h1>
          <p style={{ color: 'var(--secondary)', fontSize: '1.1rem', maxWidth: '500px', lineHeight: 1.6 }}>
            Hệ thống đã lưu trữ bản ghi âm. AI đang tiến hành phân tích transcript và đánh giá kết quả...
          </p>
        </div>

        {/* 2. Exam Summary Card */}
        <div className="panel" style={{ width: '100%', padding: '32px', marginBottom: '32px', textAlign: 'left', background: 'var(--surface)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--navy-dark)', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px', fontFamily: 'var(--display)' }}>
            Tổng kết Phiên Vấn Đáp
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '4px' }}>Thí sinh</span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>Phúc Đạt</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '4px' }}>Mã đề thi</span>
              <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: '#2563eb' }}>{examId ? 'EXAM-' + examId : 'VIVA-CS101'}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '4px' }}>Thời gian làm bài</span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>12 phút 45 giây</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '4px' }}>Số câu đã trả lời</span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>5/5 câu</span>
            </div>
          </div>

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyItems: 'space-between', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#bfdbfe', padding: '6px 8px', borderRadius: '6px' }}>
                <div style={{ width: '4px', height: '12px', background: '#2563eb', borderRadius: '2px', animation: 'pulse 1s infinite', animationDelay: '0ms' }}></div>
                <div style={{ width: '4px', height: '20px', background: '#2563eb', borderRadius: '2px', animation: 'pulse 1s infinite', animationDelay: '150ms' }}></div>
                <div style={{ width: '4px', height: '16px', background: '#2563eb', borderRadius: '2px', animation: 'pulse 1s infinite', animationDelay: '300ms' }}></div>
                <div style={{ width: '4px', height: '8px', background: '#2563eb', borderRadius: '2px', animation: 'pulse 1s infinite', animationDelay: '450ms' }}></div>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#1e3a8a' }}>Bản ghi âm đã được mã hoá và lưu trữ</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#1d4ed8' }}>Dữ liệu âm thanh an toàn. Khớp nối transcript: 100%</p>
              </div>
            </div>
            <svg style={{ width: '24px', height: '24px', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* 3. Action Footer */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <button 
            className="button"
            onClick={handleReturnHome}
            style={{ padding: '16px 32px', background: 'var(--navy-dark)', color: '#fff', fontSize: '1.1rem', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(8, 18, 52, 0.2)' }}
          >
            Quay về Trang chủ
          </button>
        </div>
        
      </div>
    </div>
  );
}
