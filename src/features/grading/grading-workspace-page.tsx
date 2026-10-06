import React from 'react';
import './grading-workspace.css';

export const GradingWorkspacePage: React.FC = () => {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header */}
      <div className="grading-header-wrapper">
        <div className="grading-top-bar">
          <div>Khảo Thí Học Thuật &rsaquo; Khoa CNTT &rsaquo; Hội đồng vấn đáp Viva</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontWeight: 'bold' }}>📅 Học kỳ 1 2026-2027</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--navy-dark)' }}>ThS. Nguyễn Văn An</div>
                <div style={{ fontSize: '0.7rem' }}>Khoa Công nghệ Thông tin</div>
              </div>
              <div style={{ width: '32px', height: '32px', background: 'var(--navy-dark)', borderRadius: '50%', color: '#fff', display: 'grid', placeItems: 'center' }}>N</div>
            </div>
          </div>
        </div>

        <div className="grading-student-bar">
          <div className="student-info">
            <div style={{ width: '48px', height: '48px', background: 'var(--navy)', color: '#fff', borderRadius: '8px', display: 'grid', placeItems: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>TL</div>
            <div>
              <h2>Trần Mai Linh <span style={{ fontSize: '1rem', color: 'var(--secondary)', fontWeight: 'normal' }}>MSSV: 21020485 | K66-CNTT</span></h2>
              <div className="student-meta" style={{ marginTop: '4px' }}>
                <span style={{ background: 'var(--muted)', padding: '2px 6px', borderRadius: '4px' }}>#EXAM-2024-OOP-SV21020485</span>
                <span style={{ color: 'var(--secondary)' }}>Nộp: 09:30 - 24/10/2026</span>
                <span style={{ color: 'var(--secondary)' }}>• Tiến độ: <span style={{ fontWeight: 'bold', color: 'var(--danger)' }}>1/5 câu</span></span>
              </div>
            </div>
          </div>

          <div className="grading-actions">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', borderRight: '1px solid var(--border)', paddingRight: '12px', marginRight: '4px' }}>
              <button className="button" style={{ background: 'transparent', border: 'none', color: 'var(--secondary)' }}>&lt; Trước</button>
              <span style={{ fontWeight: 'bold', fontFamily: 'var(--mono)' }}>04 / 28</span>
              <button className="button" style={{ background: 'transparent', border: 'none', color: 'var(--navy-dark)', fontWeight: 'bold' }}>Kế tiếp &gt;</button>
            </div>
            <button className="button outline">Lưu nháp</button>
            <button className="button primary">Chốt điểm cho này</button>
            <button className="button" style={{ background: '#8d4233', color: '#fff' }}>Tổng kết hồ sơ &rarr;</button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grading-layout">
        
        {/* Left Column: Questions List */}
        <div className="grading-col">
          <div className="q-list-header">
            <h3 style={{ margin: 0, fontFamily: 'var(--display)', fontSize: '1.1rem' }}>DANH SÁCH CÂU HỎI</h3>
            <span style={{ background: 'var(--muted)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>5 câu</span>
          </div>

          <div className="q-item">
            <div className="q-item-header">
              <span>CÂU 01</span>
              <span style={{ color: 'var(--secondary)', fontWeight: 'normal' }}>Đã chấm (tự động)</span>
            </div>
            <div className="q-item-title">Cơ chế HashMap vs TreeMap</div>
            <div className="q-item-meta">
              <span>1 tiểu mục</span>
              <span style={{ fontWeight: 'bold', color: 'var(--navy-dark)' }}>8.5 / 10</span>
            </div>
          </div>

          <div className="q-item active">
            <div className="q-item-header">
              <span>CÂU 02</span>
              <span className="badge danger" style={{ background: '#d45b3a', color: '#fff', fontSize: '0.7rem' }}>Đang chấm</span>
            </div>
            <div className="q-item-title">Arraylist vs LinkedList & Truy cập ngẫu nhiên</div>
            <div className="q-item-meta">
              <span>2 tiểu mục (AI)</span>
              <span style={{ fontWeight: 'bold', color: 'var(--navy-dark)' }}>-- / 10</span>
            </div>
          </div>

          <div className="q-item">
            <div className="q-item-header">
              <span>CÂU 03</span>
              <span className="badge warning">Gợi ý AI nhất</span>
            </div>
            <div className="q-item-title">Exception Handling Hierarchy</div>
            <div className="q-item-meta">
              <span>1 tiểu mục</span>
              <span style={{ fontWeight: 'bold', color: 'var(--navy-dark)' }}>9.0 / 10</span>
            </div>
          </div>

          <div className="q-item">
            <div className="q-item-header">
              <span>CÂU 04</span>
              <span className="badge danger" style={{ background: '#ffdad6', color: '#ba1a1a' }}>Thử thách AI</span>
            </div>
            <div className="q-item-title">Interface vs Abstract Class</div>
            <div className="q-item-meta">
              <span>1 tiểu mục</span>
              <span style={{ fontWeight: 'bold', color: '#ba1a1a' }}>Cần xác nhận</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button className="button outline" style={{ fontSize: '0.7rem', minHeight: '24px', padding: '0 8px' }}>Nghe lại</button>
              <button className="button outline" style={{ fontSize: '0.7rem', minHeight: '24px', padding: '0 8px' }}>Chấm tay</button>
            </div>
          </div>

          <div className="q-item" style={{ opacity: 0.7 }}>
            <div className="q-item-header">
              <span>CÂU 05</span>
              <span style={{ color: 'var(--secondary)', fontWeight: 'normal' }}>Chưa mở</span>
            </div>
            <div className="q-item-title">Garbage Collection & Memory...</div>
            <div className="q-item-meta">
              <span>2 tiểu mục</span>
              <span style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>-- / 10</span>
            </div>
          </div>

          <div style={{ marginTop: 'auto', padding: '16px', border: '1px dashed var(--border)', borderRadius: '8px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--secondary)' }}>
            HỘI ĐỒNG: VIVA-CNTT-01<br />
            GV: Nguyễn Văn An
          </div>
        </div>

        {/* Middle Column: Transcript & Question Info */}
        <div className="grading-col">
          <div className="transcript-box" style={{ marginBottom: '0' }}>
            <div className="t-meta-row">
              <span className="t-meta-item" style={{ background: 'var(--navy)', color: '#fff' }}>CÂU CHÍNH 02</span>
              <span className="t-meta-item" style={{ background: '#fdf5f3', color: '#d45b3a' }}>Bloom: Phân tích (Level 4)</span>
              <span className="t-meta-item" style={{ marginLeft: 'auto' }}>Trọng số: 10đ</span>
            </div>
            <h2 className="t-title">Cơ chế ArrayList & LinkedList trong Java</h2>
            <div className="t-content">
              Phân tích bản chất cấu trúc lưu trữ nội tại giữa mảng động (dynamic array) và danh sách liên kết đôi (doubly-linked list). Đánh giá độ phức tạp thuật toán và hành vi khi truy xuất ngẫu nhiên hoặc biến đổi dữ liệu.
            </div>
            <div className="t-resources">
              <button className="button outline" style={{ background: '#fdf5f3', borderColor: '#f9d8cf', color: '#d45b3a' }}>📄 Đáp án tham khảo</button>
              <button className="button outline" style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}>🎞️ Slide bài giảng (Slide 19 - Ch.4)</button>
            </div>
          </div>

          <div className="audio-player">
            <div style={{ background: '#d45b3a', borderRadius: '50%', width: '40px', height: '40px', display: 'grid', placeItems: 'center' }}>▶</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', color: '#a0a6c0' }}>
                <span style={{ fontWeight: 'bold', color: '#d45b3a' }}>GHI ÂM VẤN ĐÁP TRỰC TIẾP</span>
                <span>FLAC Hi-Fi • 48kHz</span>
              </div>
              <div style={{ height: '24px', display: 'flex', gap: '2px', alignItems: 'center' }}>
                {Array(40).fill(0).map((_, i) => (
                  <div key={i} style={{ flex: 1, background: i < 15 ? '#d45b3a' : '#4a5375', height: `${Math.random() * 100}%`, borderRadius: '2px' }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '4px', fontFamily: 'var(--mono)' }}>
                <span>00:15</span>
                <span>1.0x / 01:15</span>
              </div>
            </div>
          </div>

          <div className="transcript-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--display)', fontSize: '1.1rem' }}>BIÊN BẢN HỘI THOẠI & TRANSCRIPT THỰC TẾ</h3>
              <div style={{ fontSize: '0.7rem', color: 'var(--secondary)', textAlign: 'right' }}>Đồng bộ tự<br/>động từ STT</div>
            </div>

            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--border)' }}></span> LƯỢT THOẠI 01 - CÂU HỎI CHÍNH <span style={{ marginLeft: 'auto' }}>00:00</span>
            </div>

            <div className="chat-bubble">
              <div className="chat-bubble-header">
                <span>🤖 Giảng viên AI Viva</span>
                <span>00:00</span>
              </div>
              <div className="chat-bubble-content">
                "Em hãy phân biệt giữa ArrayList và LinkedList trong ngôn ngữ lập trình Java?"
              </div>
            </div>

            <div className="chat-bubble student">
              <div className="chat-bubble-header">
                <span style={{ color: '#d45b3a' }}>👤 Thí sinh Trần Mai Linh</span>
                <span>00:10</span>
              </div>
              <div className="chat-bubble-content">
                "Dạ, ArrayList triển khai trên mảng động nên kích thước có thể thay đổi được, còn LinkedList triển khai bằng cấu trúc liên kết đôi (doubly-linked nodes)... Khi thêm xóa ở đầu danh sách thì LinkedList tối ưu hơn vì không cần dịch chuyển mảng..."
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--secondary)', margin: '32px 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d45b3a' }}></span> LƯỢT THOẠI 02 - CÂU HỎI FOLLOW-UP 01 <span style={{ marginLeft: 'auto' }}>01:10</span>
            </div>

            <div className="chat-bubble">
              <div className="chat-bubble-header">
                <span>🤖 Giảng viên AI Viva</span>
                <span>01:10</span>
              </div>
              <div className="chat-bubble-content">
                "Nếu thường xuyên truy cập phần tử ngẫu nhiên theo chỉ số (index-based access), em sẽ chọn cấu trúc dữ liệu nào giữa ArrayList và LinkedList, và giải thích vì sao?"
              </div>
            </div>

            <div className="chat-bubble student">
              <div className="chat-bubble-header">
                <span style={{ color: '#d45b3a' }}>👤 Thí sinh Trần Mai Linh (Transcript trực tiếp)</span>
                <span>01:15</span>
              </div>
              <div className="chat-bubble-content" style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', top: '-10px', right: '10px', background: '#d45b3a', color: '#fff', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>🪄 Bằng chứng Tiêu chí 2</span>
                "Dạ thưa thầy cô, trong trường hợp này em sẽ <span className="highlight">ưu tiên chọn ArrayList</span> ạ... Bởi vì ArrayList được xây dựng dựa trên mảng tĩnh mở rộng nội bộ, cho phép <span className="highlight">truy xuất phần tử theo chỉ số với độ phức tạp hằng số O(1)</span> nhờ <span className="highlight">khả năng tính toán trực tiếp địa chỉ ô nhớ</span>... Còn LinkedList phải duyệt tuần tự từ đầu hoặc cuối tới vị trí index nên mất chi phí thời gian là O(n)..."
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '32px', background: 'var(--muted)', padding: '12px', borderRadius: '8px' }}>
              Transcript nguyên văn đổi xuất tự động từ AI. Doanh trục tiếp của thí sinh, đã ký số điện tử.
            </div>
          </div>
        </div>

        {/* Right Column: Rubric & Scoring */}
        <div className="grading-col">
          <div className="rubric-header">
            <span>RUBRIC & AI COPILOT CHẤM ĐIỂM</span>
            <span style={{ color: '#d45b3a' }}>3 tiêu chí</span>
          </div>

          <div className="rubric-item">
            <div className="rubric-item-header">
              <span>Tiêu chí 1: Mảng động vs Node liên kết</span>
              <span style={{ color: 'var(--secondary)', fontWeight: 'normal' }}>Tối đa: 3.0đ</span>
            </div>
            <div className="rubric-ai-score">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                <span>🤖 AI: 3.0 / 3.0</span>
                <span style={{ color: '#2e7d32' }}>✓ Khớp 100%</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                ✓ Nêu chính xác mảng động và doubly-linked list (Khớp Lượt thoại 1: 00:10)
              </div>
            </div>
            <div className="rubric-input-row">
              <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Điểm Giảng viên:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="text" defaultValue="3.0" />
                <span style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>/ 3.0</span>
              </div>
            </div>
          </div>

          <div className="rubric-item" style={{ borderColor: '#d45b3a' }}>
            <div className="rubric-item-header">
              <span style={{ color: '#d45b3a' }}>Tiêu chí 2: Truy cập ngẫu nhiên theo index</span>
              <span style={{ color: '#d45b3a', background: '#fdf5f3', padding: '2px 6px', borderRadius: '4px' }}>Tối đa: 3.0đ</span>
            </div>
            <div className="rubric-ai-score">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '8px' }}>
                <span>🤖 AI gợi ý: 2.5 / 3.0</span>
                <span style={{ color: '#d45b3a' }}>Thiếu 1 ý nâng cao</span>
              </div>
              <div style={{ fontSize: '0.75rem', display: 'grid', gap: '4px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '16px 1fr' }}>
                  <span>✓</span>
                  <span>Chọn đúng ArrayList và nêu O(1).</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '16px 1fr' }}>
                  <span style={{ color: '#d45b3a' }}>!</span>
                  <span style={{ color: '#d45b3a' }}>Chưa giải thích cụ thể CPU cache locality.</span>
                </div>
                <div style={{ marginTop: '8px', fontStyle: 'italic', color: 'var(--secondary)', borderLeft: '2px solid var(--border)', paddingLeft: '8px' }}>
                  Bằng chứng: "...truy xuất phần tử theo chỉ số với độ phức tạp hằng số O(1)..."
                </div>
              </div>
            </div>
            <div className="rubric-input-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Điểm GV điều chỉnh: <br/><span style={{ fontSize: '0.7rem', color: '#d45b3a', fontWeight: 'normal' }}>+0.5đ so với AI</span></span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="text" defaultValue="2.5" style={{ borderColor: '#d45b3a', color: '#d45b3a' }} />
                  <span style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>/ 3.0</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px' }}>Lý do điều chỉnh (ngắn gọn):</div>
                <input type="text" defaultValue="Sinh viên đã nêu được cách tính trực tiếp địa chỉ" style={{ width: '100%', padding: '6px', fontSize: '0.75rem', fontStyle: 'italic', background: 'var(--muted)', border: 'none' }} />
              </div>
            </div>
          </div>

          <div className="rubric-item">
            <div className="rubric-item-header">
              <span>Tiêu chí 3: Thêm / xóa phần tử</span>
              <span style={{ color: 'var(--secondary)', fontWeight: 'normal' }}>Tối đa: 4.0đ</span>
            </div>
            <div className="rubric-ai-score">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                <span>🤖 AI: 3.5 / 4.0</span>
                <span style={{ color: 'var(--secondary)' }}>Phân tích O(n) & O(1)</span>
              </div>
            </div>
            <div className="rubric-input-row">
              <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Điểm Giảng viên:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="text" defaultValue="3.5" />
                <span style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>/ 4.0</span>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <h3>TỔNG KẾT ĐIỂM CÂU 02</h3>
            <div className="score-compare">
              <div className="score-box">
                <div className="label">AI Đề xuất</div>
                <div className="val">8.5<span style={{ fontSize: '0.8rem', fontWeight: 'normal', opacity: 0.7 }}>/10</span></div>
              </div>
              <div className="score-box final">
                <div className="label">GV Chốt</div>
                <div className="val">9.0<span style={{ fontSize: '0.8rem', fontWeight: 'normal', opacity: 0.7 }}>/10</span></div>
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '8px' }}>Ghi chú nhận xét của Giảng viên:</div>
            <textarea placeholder="Nhập nhận xét..." defaultValue="Nắm vững lý thuyết Array/List, giải thích phân hiệu bộ nhớ tốt." />
            <button className="button" style={{ width: '100%', background: '#d45b3a', color: '#fff', border: 'none', marginBottom: '8px' }}>✓ Chốt điểm Câu 2</button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="button outline" style={{ flex: 1, borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>Lưu nháp</button>
              <button className="button outline" style={{ flex: 1, borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>Trả lại AI</button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
