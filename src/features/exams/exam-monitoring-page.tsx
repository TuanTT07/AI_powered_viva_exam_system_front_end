import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const ExamMonitoringPage: React.FC = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState<string | null>('SV21020485');

  const students = [
    { id: 'SV21020485', name: 'Trần Mai Linh', status: 'Hoàn thành', time: '09:30 - 24/10/2026', hasDispute: false },
    { id: 'SV21020486', name: 'Nguyễn Văn A', status: 'Đang thi', time: '09:45 - 24/10/2026', hasDispute: false },
    { id: 'SV21020487', name: 'Lê Thị B', status: 'Đã phúc khảo', time: '08:00 - 24/10/2026', hasDispute: true },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', height: '100%', minHeight: 'calc(100vh - 64px)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button 
            className="button outline" 
            onClick={() => navigate('/lecturer/exams')}
            style={{ marginBottom: '16px', padding: '6px 12px', fontSize: '0.85rem' }}
          >
            ← Quay lại danh sách kỳ thi
          </button>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', color: 'var(--navy-dark)', fontFamily: 'var(--display)' }}>
            Giám sát & Nhật ký (Audit Log)
          </h1>
          <p style={{ margin: 0, color: 'var(--secondary)' }}>Kỳ thi: EXAM-{examId || '2024-OOP'} • Phục vụ truy vết, hậu kiểm và giải quyết khiếu nại.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="button outline">📥 Xuất nhật ký (.pdf)</button>
          <button className="button outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>🚨 Báo cáo bất thường</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flex: 1 }}>
        
        {/* Left Column: Student List */}
        <div className="panel" style={{ width: '320px', padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--navy-dark)' }}>Danh sách phiên thi</h3>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {students.map(s => (
              <div 
                key={s.id} 
                onClick={() => setSelectedStudent(s.id)}
                style={{ 
                  padding: '16px', 
                  borderBottom: '1px solid var(--border)', 
                  cursor: 'pointer',
                  background: selectedStudent === s.id ? '#eff6ff' : 'transparent',
                  borderLeft: selectedStudent === s.id ? '4px solid #2563eb' : '4px solid transparent'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--navy-dark)' }}>{s.name}</span>
                  {s.hasDispute && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }} title="Có khiếu nại"></span>}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginBottom: '8px' }}>{s.id}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge ${s.status === 'Đang thi' ? 'warning' : 'success'}`} style={{ fontSize: '0.7rem' }}>{s.status}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{s.time.split(' - ')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Audit Log & Evidence */}
        <div className="panel" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {selectedStudent ? (
            <>
              {/* Evidence Player */}
              <div style={{ background: 'var(--navy-dark)', borderRadius: '12px', padding: '24px', color: '#fff', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }}></span>
                    Bằng chứng Ghi âm (Đã mã hóa gốc)
                  </h3>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none' }}>Toàn trình (15:24)</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button style={{ width: '48px', height: '48px', borderRadius: '50%', border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: '1.2rem', display: 'grid', placeItems: 'center' }}>▶</button>
                  <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '30%', background: '#3b82f6', borderRadius: '4px' }}></div>
                    {/* Markers for key events */}
                    <div style={{ position: 'absolute', top: '-4px', left: '15%', width: '2px', height: '16px', background: '#ef4444' }} title="Câu hỏi 1"></div>
                    <div style={{ position: 'absolute', top: '-4px', left: '45%', width: '2px', height: '16px', background: '#ef4444' }} title="Câu hỏi 2"></div>
                    <div style={{ position: 'absolute', top: '-4px', left: '80%', width: '2px', height: '16px', background: '#ef4444' }} title="Câu hỏi 3"></div>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontFamily: 'var(--mono)' }}>04:15 / 15:24</span>
                </div>
              </div>

              {/* System Audit Log */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-dark)', borderBottom: '1px solid var(--border)', paddingBottom: '12px', margin: '0 0 16px 0' }}>Nhật ký Sự kiện (Event Logs)</h3>
                
                <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', color: 'var(--secondary)' }}>
                        <th style={{ padding: '12px 8px' }}>Thời gian</th>
                        <th style={{ padding: '12px 8px' }}>Phân loại</th>
                        <th style={{ padding: '12px 8px' }}>Hành động / Sự kiện</th>
                        <th style={{ padding: '12px 8px', textAlign: 'right' }}>Xác thực</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 8px', color: 'var(--secondary)' }}>09:30:05</td>
                        <td style={{ padding: '12px 8px' }}><span className="badge info" style={{ background: '#e0e7ff', color: '#3730a3', border: 'none' }}>System</span></td>
                        <td style={{ padding: '12px 8px' }}>Thí sinh kết nối thành công. Preflight Check: MIC_OK, CAM_OK.</td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', color: '#16a34a' }}>✓ Hợp lệ</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 8px', color: 'var(--secondary)' }}>09:31:10</td>
                        <td style={{ padding: '12px 8px' }}><span className="badge warning" style={{ background: '#fef3c7', color: '#92400e', border: 'none' }}>Exam-AI</span></td>
                        <td style={{ padding: '12px 8px' }}>AI phát câu hỏi chính 1: <i>"Cơ chế HashMap vs TreeMap..."</i></td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', color: '#16a34a' }}>✓ Đã log TTS</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 8px', color: 'var(--secondary)' }}>09:31:45</td>
                        <td style={{ padding: '12px 8px' }}><span className="badge success" style={{ background: '#dcfce7', color: '#166534', border: 'none' }}>Exam-Student</span></td>
                        <td style={{ padding: '12px 8px' }}>Bắt đầu ghi âm câu trả lời. STT WebSockets mở.</td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', color: '#16a34a' }}>✓ Khớp hash</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 8px', color: 'var(--secondary)' }}>09:45:20</td>
                        <td style={{ padding: '12px 8px' }}><span className="badge info" style={{ background: '#e0e7ff', color: '#3730a3', border: 'none' }}>System</span></td>
                        <td style={{ padding: '12px 8px' }}>Kết thúc phiên thi. Lưu trữ 5 audio chunks vào S3.</td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', color: '#16a34a' }}>✓ Hợp lệ</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 8px', color: 'var(--secondary)' }}>10:15:00</td>
                        <td style={{ padding: '12px 8px' }}><span className="badge" style={{ background: '#f3f4f6', color: '#1f2937', border: 'none' }}>Grading</span></td>
                        <td style={{ padding: '12px 8px' }}>AI Copilot đề xuất tổng điểm: <b>8.5/10</b></td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', color: '#16a34a' }}>✓ Signed (AI)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border)', background: '#fffbeb' }}>
                        <td style={{ padding: '12px 8px', color: 'var(--secondary)' }}>11:30:45</td>
                        <td style={{ padding: '12px 8px' }}><span className="badge" style={{ background: '#f3f4f6', color: '#1f2937', border: 'none' }}>Grading</span></td>
                        <td style={{ padding: '12px 8px' }}>Giảng viên <b>Nguyễn Văn An</b> chốt điểm: <b>9.0/10</b>. Lý do sửa: <i>"Đã giải thích rõ cache locality"</i>.</td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', color: '#16a34a' }}>✓ Signed (GV)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--secondary)' }}>
              Vui lòng chọn một phiên thi bên trái để xem nhật ký.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
