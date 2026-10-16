import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  Clock,
  FileCheck,
  Wifi,
  Mic,
  Calendar,
  Headphones,
  Bell,
  ArrowRight,
  FileText,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useSession } from '../../../app/providers/use-session';

export const StudentDashboard: React.FC = () => {
  const { session } = useSession();
  const navigate = useNavigate();
  const studentName = session.user?.displayName || 'Nguyễn Văn An';

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-[var(--text)] font-sans pb-12">
      {/* 1. Header & System Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-[var(--secondary)] mb-1">
            CỔNG KHẢO THÍ HỌC THUẬT • Học kỳ 1A Năm học 2024 - 2025
          </div>
          <h1
            className="text-3xl md:text-4xl text-[var(--navy-dark)] font-normal m-0"
            style={{ fontFamily: 'var(--display)' }}
          >
            Xin chào, {studentName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-[var(--secondary)]">
            <span>MSSV: <strong className="text-[var(--text)] font-mono">20210345</strong></span>
            <span>•</span>
            <span>Ngành Khoa học Máy tính — Khóa K66</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Hồ sơ hợp lệ
            </span>
          </div>
        </div>

        {/* System Status Box */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 flex items-center gap-3 shrink-0 self-start md:self-auto shadow-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--secondary)] block">
              TRẠNG THÁI HỆ THỐNG
            </span>
            <span className="font-semibold text-[var(--navy-dark)]">
              Máy chủ Viva AI: Hoạt động tốt
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[var(--secondary)]">
            <span className="text-xs font-bold uppercase tracking-wider">ĐIỀU KIỆN DỰ THI</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="my-2.5">
            <span className="text-3xl font-bold text-[var(--navy-dark)] font-mono">4 / 4</span>
            <span className="text-xs text-[var(--secondary)] ml-1.5">học phần</span>
          </div>
          <div>
            <span className="inline-block bg-[#e0f2fe] text-[#0369a1] text-[11px] font-semibold px-2 py-0.5 rounded">
              100% Đủ tư cách
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[var(--secondary)]">
            <span className="text-xs font-bold uppercase tracking-wider">ĐIỂM THI VẤN ĐÁP</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="my-2.5">
            <span className="text-3xl font-bold text-[var(--navy-dark)] font-mono">8.6</span>
            <span className="text-xs text-[var(--secondary)] ml-1">/ 10</span>
          </div>
          <div>
            <span className="inline-block bg-[#fef3c7] text-[#92400e] text-[11px] font-semibold px-2 py-0.5 rounded">
              Hạng Giỏi (A)
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[var(--secondary)]">
            <span className="text-xs font-bold uppercase tracking-wider">KỲ THI SẮP TỚI</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="my-2.5">
            <span className="text-3xl font-bold text-[var(--navy-dark)] font-mono">1</span>
            <span className="text-xs text-[var(--secondary)] ml-1.5">phòng thi</span>
          </div>
          <div>
            <span className="inline-block bg-[#fee2e2] text-[#991b1b] text-[11px] font-semibold px-2 py-0.5 rounded">
              Hôm nay 14:00
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[var(--secondary)]">
            <span className="text-xs font-bold uppercase tracking-wider">BIÊN BẢN & CHỮ KÝ SỐ</span>
            <FileCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-2.5">
            <span className="text-3xl font-bold text-[var(--navy-dark)] font-mono">3 / 4</span>
            <span className="text-xs text-[var(--secondary)] ml-1.5">kỳ thi</span>
          </div>
          <div>
            <span className="inline-block bg-[#f1f5f9] text-[#475569] text-[11px] font-semibold px-2 py-0.5 rounded">
              Còn 1 biên bản
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card A: Active Exam Banner */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
            {/* Alert Header Bar */}
            <div className="bg-[#fff7ed] border-b border-[#fed7aa] px-5 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-[#9a3412] font-semibold">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                </span>
                <span className="tracking-wide uppercase">ĐANG MỞ PHÒNG THI</span>
                <span className="text-[#c2410c]">• Hạn vào phòng: còn 23 phút</span>
              </div>
              <span className="font-mono font-bold text-[var(--navy-dark)] bg-white/80 px-2 py-0.5 rounded border border-[#fed7aa]">
                PHÒNG SỐ: VIVA-AI-03
              </span>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5">
              <div>
                <div className="text-xs font-mono font-semibold text-[var(--secondary)] uppercase tracking-wider">
                  HỌC PHẦN: CS202 • Vấn đáp Cuối kỳ (40%)
                </div>
                <h2
                  className="text-2xl font-bold text-[var(--navy-dark)] mt-1 mb-2"
                  style={{ fontFamily: 'var(--display)' }}
                >
                  Lập trình Hướng đối tượng & Thiết kế Mẫu
                </h2>
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-[var(--secondary)]">
                  <span>Hội đồng: <strong className="text-[var(--text)]">TS. Lê Hoàng Mai (Chủ tịch) & AI Copilot</strong></span>
                  <span>•</span>
                  <span>Thời gian: <strong className="text-[var(--text)]">14:00 - 14:20</strong> (Khung ca 2)</span>
                </div>
              </div>

              {/* Pre-check status box */}
              <div className="bg-[var(--muted)] rounded-lg p-3.5 border border-[var(--border)] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-[var(--secondary)] text-[11px]">Microphone & Cam</div>
                    <div className="font-semibold text-emerald-700">Đã hiệu chỉnh</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-[var(--border)] pt-2 sm:pt-0 sm:pl-3">
                  <Wifi className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-[var(--secondary)] text-[11px]">Độ trễ mạng</div>
                    <div className="font-semibold text-[var(--navy-dark)]">45ms (Tối ưu)</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-[var(--border)] pt-2 sm:pt-0 sm:pl-3">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <div className="text-[var(--secondary)] text-[11px]">Tư cách học thuật</div>
                    <div className="font-semibold text-indigo-800">Hợp lệ 100%</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/student/exams/1/session')}
                  className="bg-[var(--navy)] hover:bg-[var(--navy-dark)] text-white font-semibold text-sm px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <span>Vào phòng thi vấn đáp</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/student/exams/1/check')}
                  className="bg-transparent hover:bg-black/5 text-[var(--navy-dark)] border border-[var(--border)] font-medium text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Headphones className="w-4 h-4 text-[var(--secondary)]" />
                  <span>Thử nghiệm âm thanh & AI Copilot</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card B: Recent Exam Records Ledger */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--secondary)] block">
                  HỒ SƠ KHẢO THÍ
                </span>
                <h3
                  className="text-xl font-bold text-[var(--navy-dark)] m-0"
                  style={{ fontFamily: 'var(--display)' }}
                >
                  Tiến độ & Kết quả thi gần nhất
                </h3>
              </div>
              <Link
                to="/student/exams"
                className="text-xs font-semibold text-[var(--navy)] hover:underline flex items-center gap-1"
              >
                <span>Xem tất cả (4)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--secondary)] font-mono">
                    <th className="py-2.5 font-bold uppercase tracking-wider">MÃ & TÊN HỌC PHẦN</th>
                    <th className="py-2.5 font-bold uppercase tracking-wider">LỊCH THI / THỜI GIAN</th>
                    <th className="py-2.5 font-bold uppercase tracking-wider">HỘI ĐỒNG & HÌNH THỨC</th>
                    <th className="py-2.5 font-bold uppercase tracking-wider">KẾT QUẢ</th>
                    <th className="py-2.5 font-bold uppercase tracking-wider text-right">HỒ SƠ & BẢO LƯU</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {/* Row 1 */}
                  <tr className="hover:bg-[var(--muted)]/50 transition-colors">
                    <td className="py-3 pr-2">
                      <span className="font-mono font-bold text-[var(--navy)] block">INT2201</span>
                      <span className="font-semibold text-[var(--text)] text-sm">Mạng máy tính & An ninh</span>
                    </td>
                    <td className="py-3 px-2 text-[var(--secondary)]">
                      <div>10/10/2024</div>
                      <div className="font-mono text-[11px]">08:30 (45 phút)</div>
                    </td>
                    <td className="py-3 px-2 text-[var(--secondary)]">
                      <div>TS. Đặng Minh Quân</div>
                      <div className="text-[11px] text-[var(--navy)]">Đối thoại trực tiếp + Viva AI</div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-flex items-center gap-1 bg-[#e8ece5] text-[#2e5d32] font-bold font-mono px-2 py-0.5 rounded">
                        8.5 <span className="text-[10px] font-normal">[A]</span>
                      </span>
                    </td>
                    <td className="py-3 pl-2 text-right">
                      <Link
                        to="/student/results"
                        className="inline-flex items-center gap-1 bg-[var(--muted)] hover:bg-black/10 text-[var(--navy-dark)] font-medium px-2.5 py-1 rounded border border-[var(--border)] transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Biên bản & Rubric</span>
                      </Link>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-[var(--muted)]/50 transition-colors">
                    <td className="py-3 pr-2">
                      <span className="font-mono font-bold text-[var(--navy)] block">IS301</span>
                      <span className="font-semibold text-[var(--text)] text-sm">Cơ sở dữ liệu nâng cao</span>
                    </td>
                    <td className="py-3 px-2 text-[var(--secondary)]">
                      <div>18/10/2024</div>
                      <div className="font-mono text-[11px]">09:00 Sáng</div>
                    </td>
                    <td className="py-3 px-2 text-[var(--secondary)]">
                      <div>Hội đồng Khoa CNTT</div>
                      <div className="text-[11px] text-[var(--secondary)]">Bảo vệ đề án mở</div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-block bg-[var(--soft)] text-[var(--navy-dark)] font-medium px-2 py-0.5 rounded text-[11px]">
                        Đã xếp lịch (09:00)
                      </span>
                    </td>
                    <td className="py-3 pl-2 text-right text-[var(--secondary)] font-medium">
                      <span>Chờ đến ca</span>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-[var(--muted)]/50 transition-colors">
                    <td className="py-3 pr-2">
                      <span className="font-mono font-bold text-[var(--navy)] block">CS104</span>
                      <span className="font-semibold text-[var(--text)] text-sm">Cấu trúc dữ liệu & Giải thuật</span>
                    </td>
                    <td className="py-3 px-2 text-[var(--secondary)]">
                      <div>22/10/2024</div>
                      <div className="font-mono text-[11px]">Dự kiến ca chiều</div>
                    </td>
                    <td className="py-3 px-2 text-[var(--secondary)]">
                      <div>Tổ bộ môn Thuật toán</div>
                      <div className="text-[11px] text-[var(--secondary)]">Vấn đáp tiêu chuẩn</div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-block bg-[#f1f5f9] text-[#64748b] font-medium px-2 py-0.5 rounded text-[11px]">
                        Đang xử lý ca
                      </span>
                    </td>
                    <td className="py-3 pl-2 text-right text-[var(--secondary)]">
                      <span>Chưa công bố</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Widgets) */}
        <div className="space-y-6">
          {/* Widget 1: Academic Calendar */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <span className="font-bold text-sm text-[var(--navy-dark)] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--navy)]" />
                Lịch học thuật trong tuần
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--secondary)] bg-[var(--muted)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                TUẦN 08
              </span>
            </div>

            <div className="space-y-3">
              {/* Item 1 */}
              <div className="flex items-start gap-3 text-xs">
                <div className="bg-[var(--muted)] border border-[var(--border)] rounded p-1.5 text-center shrink-0 w-12 font-mono">
                  <div className="text-[10px] text-[var(--secondary)]">T.HAI</div>
                  <div className="font-bold text-base text-[var(--navy-dark)] leading-none mt-0.5">14</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[var(--text)] truncate">CS202 Vấn đáp chính thức</div>
                  <div className="text-[11px] text-[var(--secondary)] truncate">Hội đồng phòng Viva AI-03</div>
                </div>
                <span className="font-mono text-[11px] text-[var(--navy)] font-semibold shrink-0">14:00</span>
              </div>

              {/* Item 2 */}
              <div className="flex items-start gap-3 text-xs">
                <div className="bg-[var(--muted)] border border-[var(--border)] rounded p-1.5 text-center shrink-0 w-12 font-mono">
                  <div className="text-[10px] text-[var(--secondary)]">T.SÁU</div>
                  <div className="font-bold text-base text-[var(--navy-dark)] leading-none mt-0.5">18</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[var(--text)] truncate">IS301 Báo cáo đề án</div>
                  <div className="text-[11px] text-[var(--secondary)] truncate">Hội trường G2 - Phòng 102</div>
                </div>
                <span className="font-mono text-[11px] text-[var(--navy)] font-semibold shrink-0">09:00</span>
              </div>

              {/* Item 3 */}
              <div className="flex items-start gap-3 text-xs">
                <div className="bg-[var(--muted)] border border-[var(--border)] rounded p-1.5 text-center shrink-0 w-12 font-mono">
                  <div className="text-[10px] text-[var(--secondary)]">T.BẢY</div>
                  <div className="font-bold text-base text-[var(--navy-dark)] leading-none mt-0.5">26</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[var(--text)] truncate">Hạn phúc khảo HK2023</div>
                  <div className="text-[11px] text-[var(--secondary)] truncate">Nộp đơn điện tử qua cổng HV</div>
                </div>
                <span className="font-mono text-[11px] text-[var(--navy)] font-semibold shrink-0">17:00</span>
              </div>
            </div>
          </div>

          {/* Widget 2: Examination Announcements */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm p-5 space-y-4">
            <div className="pb-2 border-b border-[var(--border)]">
              <span className="font-bold text-sm text-[var(--navy-dark)] flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                Thông báo khảo thí mới
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    KẾT QUẢ THI
                  </span>
                  <span className="text-[var(--secondary)]">2 giờ trước</span>
                </div>
                <p className="m-0 text-[var(--secondary)] leading-relaxed">
                  Đã phát hành biên bản chính thức môn Mạng máy tính. Hội đồng đã hoàn tất việc ký số và đối chiếu bản ghi âm. Sinh viên có thể tải biên bản điện tử.
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-[var(--border)]/60">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    QUY CHẾ
                  </span>
                  <span className="text-[var(--secondary)]">1 ngày trước</span>
                </div>
                <p className="m-0 text-[var(--secondary)] leading-relaxed">
                  Cập nhật chuẩn đầu ra viva AI năm học 2024 - 2025. Quy định mới về việc phát triển câu hỏi gợi mở từ lý thuyết học thuật trong các môn chuyên ngành.
                </p>
              </div>
            </div>
          </div>

          {/* Widget 3: Live Tech Support Helpdesk */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--navy-dark)] pb-2 border-b border-[var(--border)]">
              <Headphones className="w-4 h-4 text-[var(--navy)]" />
              <span>Hỗ trợ kỹ thuật trực tiếp</span>
            </div>

            <p className="m-0 text-[var(--secondary)] leading-relaxed">
              Gặp sự cố kết nối camera, âm thanh hoặc gián đoạn phiên vấn đáp? Liên hệ ban kỹ thuật trực thi ngay:
            </p>

            <div className="bg-[var(--muted)] p-3 rounded-lg border border-[var(--border)] space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[var(--secondary)]">Trực ca học kỳ:</span>
                <span className="font-medium text-[var(--text)]">07:30 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--secondary)]">KTV:</span>
                <span className="font-medium text-[var(--text)]">Đào Duy Hùng (Ext 101)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--secondary)]">Email:</span>
                <span className="font-medium text-[var(--navy)]">hotro@academia.vn</span>
              </div>
              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                <span className="font-bold text-[var(--navy-dark)]">Hotline hỗ trợ:</span>
                <span className="text-base font-bold font-mono text-rose-700">1900 6868</span>
              </div>
            </div>

            <a
              href="#instructions"
              onClick={(e) => { e.preventDefault(); alert('Tài liệu hướng dẫn xử lý sự cố đã sẵn sàng trong thư viện học vụ.') }}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--navy)] font-semibold hover:underline pt-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Hướng dẫn xử lý sự cố mạng (1 trang PDF)</span>
            </a>
          </div>
        </div>
      </div>

      {/* 4. Bottom Full-Width Section: AI Copilot Viva Competency Analysis */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--secondary)] block">
              KHUNG ĐÁNH GIÁ CHUẨN HÓA
            </span>
            <h3
              className="text-xl font-bold text-[var(--navy-dark)] m-0"
              style={{ fontFamily: 'var(--display)' }}
            >
              Phân tích Năng lực Vấn đáp qua AI Copilot
            </h3>
          </div>
          <span className="text-xs text-[var(--secondary)] font-mono self-start sm:self-auto">
            Dữ liệu tổng hợp từ 3 kỳ thi gần nhất
          </span>
        </div>

        {/* 4 Competency Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Competency 1 */}
          <div className="bg-[var(--muted)]/50 rounded-lg border border-[var(--border)] p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[var(--navy-dark)]">Kiến thức lý thuyết cốt lõi</span>
              <span className="font-mono font-bold text-sm text-[var(--navy)]">9.0<span className="text-[10px] text-[var(--secondary)] font-normal">/10</span></span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-[var(--border)]/60 rounded-full h-1.5 overflow-hidden">
              <div className="bg-[var(--navy)] h-1.5 rounded-full" style={{ width: '90%' }} />
            </div>
            <p className="m-0 text-[11px] text-[var(--secondary)] leading-relaxed">
              Nắm vững nguyên lý nền tảng, trích dẫn học thuật chính xác.
            </p>
          </div>

          {/* Competency 2 */}
          <div className="bg-[var(--muted)]/50 rounded-lg border border-[var(--border)] p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[var(--navy-dark)]">Phản xạ & Luận điểm phản biện</span>
              <span className="font-mono font-bold text-sm text-[var(--navy)]">8.2<span className="text-[10px] text-[var(--secondary)] font-normal">/10</span></span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-[var(--border)]/60 rounded-full h-1.5 overflow-hidden">
              <div className="bg-[var(--navy)] h-1.5 rounded-full" style={{ width: '82%' }} />
            </div>
            <p className="m-0 text-[11px] text-[var(--secondary)] leading-relaxed">
              Phân tích có cấu trúc, thời gian suy nghĩ trung bình 4.2 giây.
            </p>
          </div>

          {/* Competency 3 */}
          <div className="bg-[var(--muted)]/50 rounded-lg border border-[var(--border)] p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[var(--navy-dark)]">Khả năng xử lý câu hỏi mở rộng</span>
              <span className="font-mono font-bold text-sm text-[var(--navy)]">8.5<span className="text-[10px] text-[var(--secondary)] font-normal">/10</span></span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-[var(--border)]/60 rounded-full h-1.5 overflow-hidden">
              <div className="bg-[var(--navy)] h-1.5 rounded-full" style={{ width: '85%' }} />
            </div>
            <p className="m-0 text-[11px] text-[var(--secondary)] leading-relaxed">
              Ứng biến tốt trước các câu hỏi thách thức cấp độ Copilot gợi ý.
            </p>
          </div>

          {/* Competency 4 */}
          <div className="bg-[var(--muted)]/50 rounded-lg border border-[var(--border)] p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[var(--navy-dark)]">Kỹ năng diễn đạt & Chuẩn mực</span>
              <span className="font-mono font-bold text-sm text-[var(--navy)]">8.8<span className="text-[10px] text-[var(--secondary)] font-normal">/10</span></span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-[var(--border)]/60 rounded-full h-1.5 overflow-hidden">
              <div className="bg-[var(--navy)] h-1.5 rounded-full" style={{ width: '88%' }} />
            </div>
            <p className="m-0 text-[11px] text-[var(--secondary)] leading-relaxed">
              Thuật ngữ chuẩn xác, phát âm mạch lạc, thái độ vấn đáp điềm tĩnh.
            </p>
          </div>
        </div>

        {/* Footer Audit Guarantee Note */}
        <div className="bg-[#fcfbf9] border border-[var(--border)] rounded-lg p-3 text-xs text-[var(--secondary)] flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Đánh giá được tổng hợp tự động từ mô hình Viva Copilot và đối soát độc lập bởi 2 thành viên hội đồng giám khảo.
          </span>
        </div>
      </div>
    </div>
  );
};
