import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './exam-list.css';

export const StudentExamListPage: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');

  return (
    <div className="exam-list-page">
      <div className="page-header" style={{ maxWidth: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '20px' }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--secondary)' }}>KHẢO THÍ HỌC THUẬT • Học kỳ 1 • 2026-2027</div>
          <h1 style={{ margin: '8px 0 0', fontSize: '2.5rem' }}>Kỳ thi của tôi</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface)', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '4px' }}>
          <span className="badge warning">Đủ điều kiện dự thi</span>
          <span style={{ font: '700 .85rem var(--mono)' }}>4 / 4 môn</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
          <button 
            className="button" 
            style={{ minHeight: '32px', borderRadius: '20px', padding: '0 16px', background: filter === 'all' ? 'var(--navy)' : 'var(--surface)', color: filter === 'all' ? '#fff' : 'inherit', border: '1px solid var(--border)', fontSize: '0.85rem' }}
            onClick={() => setFilter('all')}
          >
            Tất cả <span style={{ marginLeft: '4px', opacity: 0.7 }}>4</span>
          </button>
          <button 
            className="button" 
            style={{ minHeight: '32px', borderRadius: '20px', padding: '0 16px', background: filter === 'active' ? 'var(--navy)' : 'var(--surface)', color: filter === 'active' ? '#fff' : 'inherit', border: '1px solid var(--border)', fontSize: '0.85rem' }}
            onClick={() => setFilter('active')}
          >
            <span style={{ color: filter === 'active' ? '#ffcf33' : 'var(--danger)', marginRight: '6px' }}>●</span> Đang mở phòng <span style={{ marginLeft: '4px', opacity: 0.7 }}>1</span>
          </button>
          <button 
            className="button" 
            style={{ minHeight: '32px', borderRadius: '20px', padding: '0 16px', background: filter === 'upcoming' ? 'var(--navy)' : 'var(--surface)', color: filter === 'upcoming' ? '#fff' : 'inherit', border: '1px solid var(--border)', fontSize: '0.85rem' }}
            onClick={() => setFilter('upcoming')}
          >
            Sắp diễn ra <span style={{ marginLeft: '4px', opacity: 0.7 }}>2</span>
          </button>
          <button 
            className="button" 
            style={{ minHeight: '32px', borderRadius: '20px', padding: '0 16px', background: filter === 'completed' ? 'var(--navy)' : 'var(--surface)', color: filter === 'completed' ? '#fff' : 'inherit', border: '1px solid var(--border)', fontSize: '0.85rem' }}
            onClick={() => setFilter('completed')}
          >
            Đã hoàn thành <span style={{ marginLeft: '4px', opacity: 0.7 }}>1</span>
          </button>
        </div>
        <div style={{ font: '.75rem var(--mono)', color: 'var(--secondary)' }}>
          🕒 Giờ hệ thống: 15:32:14 GMT+7
        </div>
      </div>

      {/* Active Exam Card */}
      <div className="panel" style={{ maxWidth: 'none', borderColor: 'var(--navy)', boxShadow: '0 4px 12px rgba(8, 18, 52, 0.05)', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '28px' }}>
        <div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <span className="badge danger" style={{ animation: 'pulse 2s infinite' }}>● ĐANG MỞ PHÒNG THI</span>
            <span style={{ fontSize: '.85rem', color: 'var(--secondary)' }}>Vấn đáp trực tiếp • Hội đồng #03</span>
          </div>
          <h2 style={{ fontSize: '1.8rem', margin: '0 0 6px', fontFamily: 'var(--display)' }}>Lập trình Hướng đối tượng</h2>
          <div style={{ font: '.85rem var(--mono)', color: 'var(--secondary)', marginBottom: '24px' }}>
            CS201 • Hội đồng: ThS. Lê Hoàng Mai
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ background: 'var(--muted)', padding: '10px 16px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
              <div style={{ fontSize: '1.3rem' }}>📅</div>
              <div>
                <div style={{ font: '.7rem var(--mono)', color: 'var(--secondary)', marginBottom: '2px' }}>Khung giờ bảo vệ</div>
                <div style={{ fontSize: '.85rem', fontWeight: 700 }}>Hôm nay, 14:00 - 15:30</div>
              </div>
            </div>
            <div style={{ background: 'var(--muted)', padding: '10px 16px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
              <div style={{ fontSize: '1.3rem' }}>📍</div>
              <div>
                <div style={{ font: '.7rem var(--mono)', color: 'var(--secondary)', marginBottom: '2px' }}>Địa điểm khảo thí</div>
                <div style={{ fontSize: '.85rem', fontWeight: 700 }}>Ca 2 • Phòng Viva AI 03</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gap: '12px', alignSelf: 'center' }}>
          <button className="button primary" style={{ minHeight: '48px', padding: '0 32px', fontSize: '1rem' }} onClick={() => navigate('/student/exams/1/session')}>
            Vào phòng thi ngay &rarr;
          </button>
          <button className="button outline" style={{ border: 'none', color: 'var(--navy-dark)' }}>
            🎙️ Kiểm tra mic & camera
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '16px' }}>
        <h3 style={{ margin: '0', fontFamily: 'var(--font)', fontSize: '1.1rem' }}>Hồ sơ thi đã duyệt tư cách</h3>
        <span className="eyebrow" style={{ color: 'var(--secondary)' }}>HỌC KỲ 1 (2026-2027)</span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Card 1 */}
        <div className="panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span className="eyebrow" style={{ color: 'var(--navy)' }}>CS101</span>
            <span style={{ fontSize: '.8rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: 'var(--navy)' }}>✓</span> Đã duyệt tư cách
            </span>
          </div>
          <h4 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontFamily: 'var(--display)' }}>Kiến trúc Máy tính</h4>
          <div style={{ fontSize: '.85rem', color: 'var(--secondary)', marginBottom: '28px' }}>Hình thức: Vấn đáp AI Copilot (15 phút)</div>
          
          <div style={{ background: 'var(--muted)', padding: '16px', borderRadius: '4px', display: 'flex', gap: '12px', marginBottom: '28px' }}>
            <span style={{ fontSize: '1.2rem' }}>📅</span>
            <div>
              <div style={{ fontSize: '.85rem', fontWeight: 700, marginBottom: '2px' }}>Ngày mai, 08:30</div>
              <div style={{ fontSize: '.8rem', color: 'var(--secondary)' }}>18/10/2026 • Phòng Viva AI 01</div>
            </div>
          </div>
          
          <button className="button" style={{ width: '100%', background: 'var(--muted)', marginTop: 'auto', border: '1px solid var(--border)' }}>Kiểm tra thiết bị</button>
        </div>

        {/* Card 2 */}
        <div className="panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span className="eyebrow" style={{ color: 'var(--navy)' }}>DB301</span>
            <span style={{ fontSize: '.8rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: 'var(--navy)' }}>✓</span> Đã duyệt tư cách
            </span>
          </div>
          <h4 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontFamily: 'var(--display)' }}>Cơ sở Dữ liệu Nâng cao</h4>
          <div style={{ fontSize: '.85rem', color: 'var(--secondary)', marginBottom: '28px' }}>Giảng viên: ThS. Trần Thu Hà</div>
          
          <div style={{ background: 'var(--muted)', padding: '16px', borderRadius: '4px', display: 'flex', gap: '12px', marginBottom: '28px' }}>
            <span style={{ fontSize: '1.2rem' }}>📅</span>
            <div>
              <div style={{ fontSize: '.85rem', fontWeight: 700, marginBottom: '2px' }}>18/10/2026 • 09:00</div>
              <div style={{ fontSize: '.8rem', color: 'var(--secondary)' }}>Vấn đáp chuyên đề chuẩn hóa</div>
            </div>
          </div>
          
          <button className="button" style={{ width: '100%', background: 'var(--muted)', marginTop: 'auto', border: '1px solid var(--border)' }}>Xem lịch thi & quy chế</button>
        </div>

        {/* Card 3 */}
        <div className="panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span className="eyebrow" style={{ color: 'var(--navy)' }}>NW202</span>
            <span style={{ fontSize: '.8rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: 'var(--navy)' }}>✓</span> Đã hoàn thành
            </span>
          </div>
          <h4 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontFamily: 'var(--display)' }}>Mạng Máy tính</h4>
          <div style={{ fontSize: '.85rem', color: 'var(--secondary)', marginBottom: '28px' }}>
            Điểm tổng kết: <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text)', margin: '0 4px' }}>8.5</span> /10
          </div>
          
          <div style={{ background: 'var(--muted)', padding: '16px', borderRadius: '4px', display: 'flex', gap: '12px', marginBottom: '28px' }}>
            <span style={{ fontSize: '1.2rem' }}>📝</span>
            <div>
              <div style={{ fontSize: '.85rem', fontWeight: 700, marginBottom: '2px' }}>Biên bản đã ký số</div>
              <div style={{ fontSize: '.8rem', color: 'var(--secondary)' }}>Ngày thi: 10/10/2026</div>
            </div>
          </div>
          
          <button className="button" style={{ width: '100%', background: 'var(--muted)', marginTop: 'auto', border: '1px solid var(--border)' }}>Xem biên bản & điểm</button>
        </div>
      </div>

      <div className="alert warning" style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginTop: '24px', padding: '20px' }}>
        <div style={{ fontSize: '1.5rem', alignSelf: 'center' }}>🛡️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '.9rem' }}>Lưu ý bắt buộc dành cho thí sinh</div>
          <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', gap: '28px', flexWrap: 'wrap', fontSize: '.85rem', color: 'var(--secondary)' }}>
            <li style={{ listStyleType: 'disc' }}>Chuẩn bị tai nghe có micro rõ ràng trước 15 phút.</li>
            <li style={{ listStyleType: 'disc' }}>Đảm bảo kết nối mạng internet ổn định.</li>
            <li style={{ listStyleType: 'disc' }}>Ăn mặc lịch sự theo quy chế học thuật.</li>
          </ul>
        </div>
        <div style={{ textAlign: 'right', background: 'var(--surface)', padding: '10px 16px', borderRadius: '4px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '4px' }}>Hỗ trợ kỹ thuật trực tiếp</div>
          <div style={{ fontSize: '.85rem', fontWeight: 700 }}>Hotline: 1900 6868</div>
        </div>
      </div>

    </div>
  );
};
