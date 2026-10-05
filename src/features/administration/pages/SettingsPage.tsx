import { useState } from 'react';
import { Badge, Button } from '../../../components/ui/primitives';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Tham số Mô hình AI Khảo thí');
  
  const tabs = [
    'Tham số Mô hình AI Khảo thí',
    'Quy chế & An toàn Học thuật',
    'Giới hạn Phòng thi & Băng thông',
    'Tích hợp Hệ thống (LMS/SIS)'
  ];

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Top Breadcrumb & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Cổng Quản trị Khảo thí &gt; Đại học Quốc gia</span>
          <Badge tone="success">Hệ thống: Sẵn sàng (99.98% uptime)</Badge>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Badge tone="neutral">Kỳ thi: ĐGNL Sau đại học 2024 • Cập nhật: 10:42 Hôm nay</Badge>
          <Badge tone="success">Hoạt động</Badge>
        </div>
      </div>

      {/* Header & Actions */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--secondary)', letterSpacing: '0.05em' }}>CFG-VNU-2024.08</span>
          <h1 style={{ margin: '4px 0 8px 0', fontSize: '2rem', color: 'var(--navy-dark)' }}>Cấu hình Tham số AI</h1>
          <p style={{ margin: 0, color: 'var(--secondary)' }}>Thiết lập động cơ AI, ngưỡng tự tin và quy chuẩn bảo mật.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none' }}>
            <span style={{ fontSize: '1.2rem' }}>↺</span> Mặc định
          </Button>
          <Button variant="primary">Lưu thay đổi</Button>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '8px', overflowX: 'auto' }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              border: 'none',
              backgroundColor: activeTab === tab ? 'var(--navy)' : 'transparent',
              color: activeTab === tab ? '#fff' : 'var(--secondary)',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            {tab}
            {activeTab === tab && <span style={{ backgroundColor: 'var(--danger)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px' }}>Đang chỉnh</span>}
          </button>
        ))}
      </div>

      {/* Main Configuration Layout */}
      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: '24px' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Mô hình khảo thí */}
          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--navy-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>🤖</span> Mô hình Khảo thí
              </h2>
              <Badge tone="neutral">V4.1</Badge>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '12px', textTransform: 'uppercase' }}>Mô hình suy luận chính (PRIMARY LLM)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                
                <div style={{ border: '2px solid var(--navy)', backgroundColor: 'var(--soft)', borderRadius: '8px', padding: '12px', cursor: 'pointer', position: 'relative' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--navy-dark)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Viva-Llama 3 70B <span style={{ color: 'var(--danger)' }}>✔</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Nội bộ VNU • Tối ưu tiếng Việt</div>
                </div>

                <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', cursor: 'pointer' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--navy-dark)', marginBottom: '4px' }}>
                    GPT-4o Enterprise
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Azure OpenAI • Độ trễ 1.1s</div>
                </div>

                <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', cursor: 'pointer' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--navy-dark)', marginBottom: '4px' }}>
                    Mistral-Nemo-12B
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>On-Premise • Bảo mật cao</div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--muted)', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--navy-dark)' }}>Ngưỡng tự tin chấm tự động: <span style={{ fontSize: '1.2rem' }}>85%</span></div>
                <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 'bold' }}>Khuyến nghị BGDĐT</div>
              </div>
              <div style={{ position: 'relative', height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px', marginBottom: '8px' }}>
                <div style={{ position: 'absolute', left: '0', top: '0', height: '100%', width: '85%', backgroundColor: 'var(--navy)', borderRadius: '2px' }}></div>
                <div style={{ position: 'absolute', left: '85%', top: '50%', transform: 'translate(-50%, -50%)', width: '16px', height: '16px', backgroundColor: 'var(--danger)', borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--secondary)' }}>
                <span>40% (Lỏng)</span>
                <span>85% (Chuẩn)</span>
                <span>95% (Chặt)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--navy-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💬</span> Bắt buộc trích bằng chứng từ transcript
                </div>
                {/* Toggle switch mock */}
                <div style={{ width: '40px', height: '24px', backgroundColor: 'var(--navy)', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                  <div style={{ position: 'absolute', right: '2px', top: '2px', width: '20px', height: '20px', backgroundColor: '#fff', borderRadius: '50%' }}></div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--muted)', borderRadius: '8px', padding: '16px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--navy-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--danger)' }}>■</span> Câu hỏi đào sâu
              </h3>
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginBottom: '8px', fontWeight: 'bold' }}>Tối đa / câu hỏi: 2</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'var(--surface)' }}>
                    <button style={{ border: 'none', background: 'transparent', padding: '8px 12px', cursor: 'pointer', color: 'var(--secondary)', fontWeight: 'bold' }}>-</button>
                    <span style={{ padding: '8px 16px', fontWeight: 'bold', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>2</span>
                    <button style={{ border: 'none', background: 'transparent', padding: '8px 12px', cursor: 'pointer', color: 'var(--secondary)', fontWeight: 'bold' }}>+</button>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginBottom: '8px', fontWeight: 'bold' }}>Điều kiện kích hoạt:</div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="checkbox" defaultChecked style={{ transform: 'scale(1.2)' }} />
                    <span style={{ fontWeight: 'bold', color: 'var(--navy-dark)' }}>Khi thiếu ý trong rubric</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="checkbox" defaultChecked style={{ transform: 'scale(1.2)' }} />
                    <span style={{ fontWeight: 'bold', color: 'var(--navy-dark)' }}>Khi mâu thuẫn lý thuyết</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Xử lý Giọng nói */}
          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--navy-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>🎙️</span> Xử lý Giọng nói
              </h2>
              <Badge tone="info">ASR</Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', backgroundColor: 'var(--muted)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginBottom: '16px', fontWeight: 'bold' }}>Lọc ồn: Tự động (Trung bình)</div>
                <div style={{ position: 'relative', height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px', marginBottom: '8px' }}>
                  <div style={{ position: 'absolute', left: '0', top: '0', height: '100%', width: '50%', backgroundColor: 'var(--danger)', borderRadius: '2px' }}></div>
                  <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '16px', height: '16px', backgroundColor: 'var(--danger)', borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--secondary)' }}>
                  <span>Nhẹ</span>
                  <span>Trung bình</span>
                  <span>Triệt để</span>
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginBottom: '8px', fontWeight: 'bold' }}>Độ trễ tối đa: 2.0s</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 16px', fontWeight: 'bold', color: 'var(--navy-dark)' }}>2.0</div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--navy-dark)', fontWeight: 'bold' }}>giây</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginLeft: '8px' }}>(Khuyến nghị: 1.8s - 2.4s)</span>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--muted)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--navy-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--danger)' }}>⚖</span> Không trừ điểm theo ngữ điệu địa phương
              </div>
              <div style={{ width: '40px', height: '24px', backgroundColor: 'var(--danger)', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                <div style={{ position: 'absolute', right: '2px', top: '2px', width: '20px', height: '20px', backgroundColor: '#fff', borderRadius: '50%' }}></div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Lưu trữ dữ liệu */}
          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', color: 'var(--navy-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>0</span> Lưu trữ dữ liệu
            </h2>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>FILE ÂM THANH: 01 NĂM</div>
              <div style={{ padding: '12px', backgroundColor: 'var(--muted)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', color: 'var(--navy-dark)' }}>
                01 năm (Chuẩn Bộ GD&ĐT)
                <span style={{ fontSize: '0.8rem' }}>▼</span>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>TRANSCRIPT & BẢNG ĐIỂM: 05 NĂM</div>
              <div style={{ padding: '12px', backgroundColor: 'var(--muted)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', color: 'var(--navy-dark)' }}>
                05 năm (Sổ cái điện tử)
                <span style={{ fontSize: '0.8rem' }}>▼</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--danger-soft)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>🔒 Bảo mật dữ liệu</span>
                <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--danger)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>ĐÃ KHÓA</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--danger)', opacity: 0.9 }}>
                Dữ liệu thí sinh được bảo mật tuyệt đối, không chia sẻ bên ngoài.
              </p>
            </div>
          </div>

          {/* Cảnh báo thời gian thực */}
          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', color: 'var(--navy-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🚨</span> Cảnh báo thời gian thực
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ transform: 'scale(1.2)' }} />
                <span style={{ fontWeight: 'bold', color: 'var(--navy-dark)' }}>Mất kết nối phòng thi (&gt; 5%)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ transform: 'scale(1.2)' }} />
                <span style={{ fontWeight: 'bold', color: 'var(--navy-dark)' }}>Gửi báo cáo sau kỳ thi</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" style={{ transform: 'scale(1.2)' }} />
                <span style={{ fontWeight: 'bold', color: 'var(--navy-dark)' }}>Lệch điểm AI & Giảng viên (≥ 2.0đ)</span>
              </label>
            </div>
          </div>

          {/* GPU Status */}
          <div style={{ backgroundColor: 'var(--muted)', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--navy-dark)' }}>
              <span style={{ fontWeight: 'bold' }}>Cụm GPU: 8/8 Sẵn sàng • VRAM: 42% • Latency: 1.2s</span>
            </div>
          </div>

        </div>

      </section>

      {/* Footer / Actions */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📝</span> Thay đổi được lưu vào sổ nhật ký (PKI Quản trị viên).
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="outline">Hủy</Button>
          <Button variant="primary" style={{ backgroundColor: 'var(--danger)', color: '#fff', border: 'none' }}>
            <span style={{ marginRight: '8px' }}>⚙</span> Áp dụng cấu hình
          </Button>
        </div>
      </section>

    </div>
  );
}
