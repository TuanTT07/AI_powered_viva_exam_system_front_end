import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Sliders,
  ShieldCheck,
  Server,
  Activity,
  ArrowRight,
  Database,
  Radio,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

export function AdminDashboardPage() {
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  const handlePingAll = () => {
    setIsPinging(true);
    setPingResult(null);
    setTimeout(() => {
      setIsPinging(false);
      setPingResult('Tất cả các node máy chủ Viva AI và cơ sở dữ liệu đều hoạt động bình thường (32ms)');
    }, 700);
  };

  const activeExams = [
    {
      id: '1',
      code: 'INT2204',
      name: 'Kiến trúc & Thiết kế Phần mềm',
      leadLecturer: 'TS. Nguyễn Văn An',
      rooms: '12 / 12 phòng online',
      candidatesActive: 24,
      status: 'ĐANG THI',
    },
    {
      id: '2',
      code: 'INT3105',
      name: 'Lập trình Hướng đối tượng Nâng cao',
      leadLecturer: 'PGS.TS Trần Mai Linh',
      rooms: '8 / 8 phòng online',
      candidatesActive: 16,
      status: 'ĐANG THI',
    },
    {
      id: '3',
      code: 'INT3306',
      name: 'Phát triển Ứng dụng Di động',
      leadLecturer: 'ThS. Hoàng Quốc Bảo',
      rooms: '6 / 6 phòng online',
      candidatesActive: 12,
      status: 'SẴN SÀNG',
    },
  ];

  const recentLogs = [
    { time: '16:45', event: 'Khởi tạo thành công phiên vấn đáp EXAM-1 cho thí sinh 21020485', type: 'info' },
    { time: '16:40', event: 'Mã hóa và lưu trữ khối âm thanh AES-256 (Dung lượng 42MB)', type: 'security' },
    { time: '16:32', event: 'Cập nhật cấu hình tham số AI Speech-to-Text: vi-VN Studio', type: 'config' },
    { time: '16:15', event: 'Giảng viên duyệt điểm chính thức cho ca thi INT2204-OOP', type: 'info' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* 1. Top Header */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 text-xs text-stone-500 mb-2">
            <span className="font-semibold text-stone-700">Cổng Quản trị Khảo thí AIVES</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Hệ thống: Sẵn sàng (99.98% Uptime)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[var(--navy-dark)] mb-2">
            Tổng quan Quản trị & Sức khỏe Hệ thống
          </h1>
          <p className="text-sm text-stone-600 max-w-2xl">
            Giám sát thời gian thực tài nguyên máy chủ khảo thí, động cơ nhận diện giọng nói Viva AI và tình hình các phòng thi vấn đáp trực tiếp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handlePingAll}
            disabled={isPinging}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-stone-700 hover:text-stone-900 border border-[var(--border)] hover:bg-stone-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Activity className={`w-4 h-4 text-indigo-600 ${isPinging ? 'animate-spin' : ''}`} />
            <span>{isPinging ? 'Đang kiểm tra...' : 'Kiểm tra kết nối (Ping all)'}</span>
          </button>

          <button
            type="button"
            onClick={() => alert('Báo cáo vận hành hệ thống AIVES đã được chuẩn bị tải về.')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--navy)] hover:bg-[var(--navy-dark)] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất báo cáo vận hành (.PDF)</span>
          </button>
        </div>
      </section>

      {/* Ping Notification */}
      {pingResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{pingResult}</span>
          </div>
          <button type="button" onClick={() => setPingResult(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">×</button>
        </div>
      )}

      {/* 2. KPI Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            <span>Kỳ thi đang chạy</span>
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
          </div>
          <div className="text-3xl font-mono font-bold text-[var(--navy-dark)]">
            03 <span className="text-sm font-sans font-normal text-stone-500">kỳ thi</span>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-stone-500">
            <span>26 phòng thi song song</span>
            <span className="text-emerald-700 font-semibold">Bình thường</span>
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            <span>Thí sinh vấn đáp</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-mono font-bold text-[var(--navy-dark)]">
            52 <span className="text-sm font-sans font-normal text-stone-500">/ 120 slot</span>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-stone-500">
            <span>Tải hệ thống: 43%</span>
            <span className="text-indigo-700 font-semibold">Dự trữ: 68</span>
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            <span>AI Copilot Latency</span>
            <Server className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-mono font-bold text-[var(--navy-dark)]">
            1.1s <span className="text-sm font-sans font-normal text-stone-500">độ trễ gộp</span>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-stone-500">
            <span>Độ chính xác STT:</span>
            <span className="text-amber-800 font-semibold">96.5% chuẩn hóa</span>
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            <span>Kho Audio & Dữ liệu</span>
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-mono font-bold text-[var(--navy-dark)]">
            142 <span className="text-sm font-sans font-normal text-stone-500">/ 500 GB</span>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-stone-500">
            <span>Mã hóa AES-256</span>
            <span className="text-blue-700 font-semibold">Node HN-01</span>
          </div>
        </div>
      </section>

      {/* 3. Main Content: Active Exams Table + Admin Quick Actions Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Exams Table (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-[var(--navy-dark)]">
                  Kỳ thi vấn đáp đang hoạt động
                </h2>
                <p className="text-xs text-stone-500">
                  Điều phối và theo dõi trực tiếp các ca thi đang diễn ra
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--muted)] text-stone-700 border border-[var(--border)] font-mono">
                {activeExams.length} KỲ THI
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-stone-500 uppercase font-mono tracking-wider">
                    <th className="pb-3 font-semibold">Học phần / Khóa thi</th>
                    <th className="pb-3 font-semibold">Chủ tịch Hội đồng</th>
                    <th className="pb-3 font-semibold">Phòng thi</th>
                    <th className="pb-3 font-semibold">Trạng thái</th>
                    <th className="pb-3 font-semibold text-right">Điều phối</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {activeExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-4">
                        <strong className="text-sm text-[var(--navy-dark)] block">{exam.code}</strong>
                        <span className="text-stone-500 text-[11px]">{exam.name}</span>
                      </td>
                      <td className="py-4 font-medium text-stone-800">
                        {exam.leadLecturer}
                      </td>
                      <td className="py-4">
                        <span className="font-semibold text-stone-800">{exam.rooms}</span>
                        <span className="block text-[11px] text-stone-500">{exam.candidatesActive} thí sinh</span>
                      </td>
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {exam.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <Link
                          to={`/lecturer/exams/${exam.id}/monitor`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--muted)] hover:bg-[var(--navy)] hover:text-white text-stone-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <span>Giám sát</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Activity Log */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-[var(--navy-dark)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Nhật ký bảo mật & Vận hành thời gian thực
            </h3>

            <div className="space-y-3">
              {recentLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-[var(--muted)]/40 rounded-xl text-xs border border-[var(--border)]/60">
                  <span className="font-mono font-bold text-stone-500 shrink-0 mt-0.5">{log.time}</span>
                  <span className="text-stone-700 leading-relaxed">{log.event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Admin Quick Navigation & Server Nodes Status */}
        <div className="space-y-6">
          {/* Quick Management Links */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[var(--navy-dark)] uppercase tracking-wider">
              Phím tắt chức năng Quản trị
            </h3>

            <div className="space-y-2">
              <Link
                to="/admin/users"
                className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--navy)] hover:bg-stone-50 transition-all text-xs font-semibold text-stone-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block">Quản lý Người dùng</span>
                    <span className="text-[11px] font-normal text-stone-500">Giảng viên, Sinh viên, Phân quyền</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </Link>

              <Link
                to="/admin/courses"
                className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--navy)] hover:bg-stone-50 transition-all text-xs font-semibold text-stone-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block">Quản lý Môn học</span>
                    <span className="text-[11px] font-normal text-stone-500">Danh mục học phần & Phân công</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </Link>

              <Link
                to="/admin/settings"
                className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--navy)] hover:bg-stone-50 transition-all text-xs font-semibold text-stone-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block">Cấu hình Tham số AI</span>
                    <span className="text-[11px] font-normal text-stone-500">STT/TTS, Ngưỡng tự tin, Quy chế</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </Link>
            </div>
          </div>

          {/* Server Nodes Health */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[var(--navy-dark)] uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-700" />
              Cụm máy chủ Khảo thí Viva
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[var(--muted)]/40 rounded-xl border border-[var(--border)] space-y-1.5">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-stone-800">Node HN-01 (Primary Audio Engine)</span>
                  <span className="text-emerald-700">Online</span>
                </div>
                <div className="flex items-center justify-between text-stone-500 text-[11px]">
                  <span>CPU: 28% • RAM: 14.2GB / 32GB</span>
                  <span className="font-mono">Ping: 12ms</span>
                </div>
              </div>

              <div className="p-3 bg-[var(--muted)]/40 rounded-xl border border-[var(--border)] space-y-1.5">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-stone-800">Node HCM-02 (AI Inference Replica)</span>
                  <span className="text-emerald-700">Online</span>
                </div>
                <div className="flex items-center justify-between text-stone-500 text-[11px]">
                  <span>CPU: 35% • RAM: 18.1GB / 32GB</span>
                  <span className="font-mono">Ping: 34ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
