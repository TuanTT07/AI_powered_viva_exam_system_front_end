import { Badge, Button } from '../../../components/ui/primitives';

export function AdminDashboardPage() {
  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Top Header & Actions */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Cổng Quản trị Khảo thí &gt; Đại học Quốc gia</span>
            <Badge tone="success">Hệ thống: Sẵn sàng (99.98% uptime)</Badge>
          </div>
          <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--navy-dark)' }}>Tổng quan Quản trị & Sức khỏe Hệ thống</h1>
          <p style={{ margin: '8px 0 0 0', color: 'var(--secondary)' }}>Giám sát thời gian thực tài nguyên AI và tiến độ các kỳ thi.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Button variant="outline">Kiểm tra kết nối (Ping all)</Button>
          <Button variant="primary">Xuất báo cáo vận hành (.PDF)</Button>
        </div>
      </section>

      {/* Metrics Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '8px' }}>KỲ THI ĐANG CHẠY</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--navy-dark)' }}>03 <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>đang chạy</span></div>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>28 phòng song song</span>
            <Badge tone="success">Bình thường</Badge>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '8px' }}>THÍ SINH VẤN ĐÁP</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--navy-dark)' }}>42 <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/ 120 slot</span></div>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Tải: 35%</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Dự trữ: 78</span>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '8px' }}>AI COPILOT</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--navy-dark)' }}>1.1 <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>s độ trễ gộp</span></div>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Độ tin cậy:</span>
            <Badge tone="neutral">95% chuẩn hóa</Badge>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '8px' }}>KHO AUDIO & DATA</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--navy-dark)' }}>142 <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/ 500 GB</span></div>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Mã hóa AES-256 Node HN-01</span>
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar */}
      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: '24px' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Active Exams Table */}
          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--navy-dark)' }}>Kỳ thi đang hoạt động</h2>
              <Badge tone="neutral">3 KỲ THI</Badge>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--secondary)', textTransform: 'uppercase' }}>Học phần / Khóa thi</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--secondary)', textTransform: 'uppercase' }}>Chủ tịch HĐ</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--secondary)', textTransform: 'uppercase' }}>Phòng thi</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--secondary)', textTransform: 'uppercase' }}>Trạng thái</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--secondary)', textTransform: 'uppercase', textAlign: 'right' }}>Điều phối</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--navy-dark)', fontSize: '1.1rem' }}>OOP - SE01</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>INT2204 • CNTT</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>VA</div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--navy-dark)' }}>TS. Nguyễn Văn A</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>12/12</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>online</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <Badge tone="danger">Đang diễn ra</Badge>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <Button variant="outline">Chi tiết</Button>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--navy-dark)', fontSize: '1.1rem' }}>Kiến trúc Máy tính</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>INT2208 • ĐTQT</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>HB</div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--navy-dark)' }}>ThS. Lê Hoàng B</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>10/10</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>online</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <Badge tone="danger">Đang diễn ra</Badge>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <Button variant="outline">Chi tiết</Button>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--navy-dark)', fontSize: '1.1rem' }}>Cơ sở Dữ liệu</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>INT2210 • CNTT</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>TC</div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--navy-dark)' }}>PGS. Trần Mai C</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>6/8</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>online</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <Badge tone="neutral">Chuẩn bị (11:00)</Badge>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <Button variant="outline">Chi tiết</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Infrastructure Health */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--navy-dark)' }}>Sức khỏe hạ tầng dịch vụ (AI & Microservices)</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Cập nhật mỗi 10 giây</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--secondary)', textTransform: 'uppercase' }}>Speech-To-Text</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--navy-dark)' }}>99.9%</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--navy-dark)' }}>Whisper Large-v3</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--secondary)' }}>Độ trễ:</span>
                  <span style={{ fontWeight: 'bold' }}>420ms</span>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--secondary)', textTransform: 'uppercase' }}>Scoring Engine</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--navy-dark)' }}>99.8%</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--navy-dark)' }}>Llama-3-70B</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--secondary)' }}>GPU:</span>
                  <span style={{ fontWeight: 'bold' }}>45% ổn định</span>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--secondary)', textTransform: 'uppercase' }}>Text-To-Speech</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--navy-dark)' }}>100%</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--navy-dark)' }}>Vietnamese Neural</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--secondary)' }}>Trạng thái:</span>
                  <span style={{ fontWeight: 'bold' }}>Sẵn sàng</span>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--secondary)', textTransform: 'uppercase' }}>Data Security</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--navy-dark)' }}>Khóa cứng</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--navy-dark)' }}>Storage & Encryption</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--secondary)' }}>Chuẩn hóa:</span>
                  <span style={{ fontWeight: 'bold' }}>AES-256 GCM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Logs */}
          <div style={{ backgroundColor: 'var(--muted)', borderRadius: '8px', padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--navy-dark)' }}>Nhật ký vận hành gần đây</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--secondary)' }}>10:14</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--navy-dark)' }}>Phòng 04: Chuyển dự phòng WebRTC node 2</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--secondary)' }}>09:30</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--navy-dark)' }}>Cấp quyền chấm thi 2 giảng viên</div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', textAlign: 'right' }}>Hoàng Minh</div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--secondary)' }}>08:15</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--navy-dark)' }}>Khóa cấu hình rubric 28 phòng thi</div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', textAlign: 'right' }}>Hội đồng</div>
              </div>
            </div>
            
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <a href="#" style={{ fontSize: '0.85rem', fontWeight: 'bold', textDecoration: 'none', color: 'var(--navy)' }}>Xem toàn bộ Audit Log &rarr;</a>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--navy-dark)' }}>Thao tác nhanh</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--navy-dark)' }}>Đồng bộ Đào tạo</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Lần cuối: 06:00 hôm nay</div>
              </div>
              <Button variant="outline">Đồng bộ</Button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--navy-dark)' }}>Sao lưu CSDL</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Bản lưu: 03:00 • An toàn</div>
              </div>
              <Button variant="outline">Sao lưu</Button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--navy-dark)' }}>Chế độ bảo trì</div>
              <input type="checkbox" style={{ transform: 'scale(1.5)', cursor: 'pointer' }} />
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}
