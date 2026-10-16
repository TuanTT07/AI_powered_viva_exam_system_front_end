import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  ShieldCheck,
  FileText,
  Sparkles,
  Home,
  BookOpen,
} from 'lucide-react';
import { useSession } from '../../../app/providers/use-session';

export function ExamSuccessPage() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const { session } = useSession();

  const [submissionInfo] = useState(() => ({
    time: new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'full',
      timeStyle: 'medium',
    }).format(new Date()),
    receiptId: `REC-${(examId || 'EXAM').toUpperCase()}-${Date.now().toString().slice(-6)}`,
  }));

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 flex flex-col items-center gap-8">
      {/* 1. Hero Celebration Banner */}
      <div className="flex flex-col items-center text-center gap-4 max-w-xl">
        <div className="w-20 h-20 rounded-3xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shadow-sm">
          <CheckCircle2 className="w-10 h-10 animate-bounce" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Đã ghi nhận và niêm phong an toàn
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-[var(--navy-dark)]">
            Phiên Thi Vấn Đáp Đã Nộp Thành Công
          </h1>
          <p className="text-sm sm:text-base text-stone-600 mt-2 leading-relaxed">
            Hệ thống AIVES đã lưu trữ toàn bộ bản ghi âm và biên bản hội thoại. Phiên thi của bạn đã kết thúc an toàn.
          </p>
        </div>
      </div>

      {/* 2. Official Exam Submission Receipt Card */}
      <div className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Receipt decorative top stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[var(--navy-dark)] via-[var(--navy)] to-indigo-600" />

        {/* Receipt Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border)] pb-6 mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-serif text-xl font-bold tracking-tight text-[var(--navy-dark)]">AIVES</span>
              <span className="text-xs font-semibold text-stone-400">|</span>
              <span className="text-xs uppercase font-bold tracking-wider text-stone-500">Học viện Khảo thí Số hóa</span>
            </div>
            <h2 className="text-base font-bold text-[var(--navy-dark)]">
              Biên Nhận Nộp Bài Thi Vấn Đáp Trực Tiếp
            </h2>
          </div>

          <div className="flex flex-col sm:items-end">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Mã biên nhận số</span>
            <span className="font-mono text-sm font-bold text-[var(--navy)] bg-[var(--muted)] px-2.5 py-1 rounded border border-[var(--border)]">
              {submissionInfo.receiptId}
            </span>
          </div>
        </div>

        {/* Receipt Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-stone-500">Thí sinh</span>
            <span className="text-sm font-semibold text-[var(--navy-dark)]">
              {session.user?.displayName || 'Sinh viên'}
            </span>
            <span className="text-xs text-stone-400 font-mono">
              Mã: {session.user?.id || 'SV-AIVES'}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-stone-500">Mã ca thi</span>
            <span className="text-sm font-mono font-bold text-[var(--navy)]">
              EXAM-{examId || 'TEST'}
            </span>
            <span className="text-xs text-stone-400">Hình thức: Viva AI</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-stone-500">Thời điểm nộp bài</span>
            <span className="text-xs font-semibold text-stone-800 leading-snug">
              {submissionInfo.time}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-stone-500">Trạng thái hồ sơ</span>
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đã hoàn tất
              </span>
            </div>
          </div>
        </div>

        {/* 3. Audio & Transcript Evidence Assurance Box */}
        <div className="bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[var(--navy)] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--navy-dark)]">
                Bản ghi âm & Biên bản hội thoại đã được mã hóa bảo mật
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Dữ liệu âm thanh 100% nguyên vẹn. Biên bản thoại đã được lưu vào hệ thống phục vụ hội đồng chấm thi và phúc khảo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 bg-[var(--surface)] px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-semibold text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>AES-256 Khảo thí</span>
          </div>
        </div>

        {/* 4. Next Steps Timeline */}
        <div className="border-t border-[var(--border)] pt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-4 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[var(--navy)]" />
            Quy trình xử lý kết quả tiếp theo
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)] flex flex-col gap-1.5">
              <span className="font-mono text-xs font-bold text-stone-400">01 / ĐÁNH GIÁ SƠ BỘ</span>
              <strong className="text-stone-900">AI Copilot phân tích</strong>
              <p className="text-stone-600 leading-relaxed">
                Động cơ Viva AI trích xuất bằng chứng lập luận và đề xuất điểm theo Rubric đã công bố.
              </p>
            </div>

            <div className="p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)] flex flex-col gap-1.5">
              <span className="font-mono text-xs font-bold text-stone-400">02 / DUYỆT CHÍNH THỨC</span>
              <strong className="text-stone-900">Giảng viên đối soát</strong>
              <p className="text-stone-600 leading-relaxed">
                Giảng viên phụ trách nghe lại bản ghi âm, xem xét gợi ý và quyết định điểm số chính thức.
              </p>
            </div>

            <div className="p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)] flex flex-col gap-1.5">
              <span className="font-mono text-xs font-bold text-stone-400">03 / CÔNG BỐ KẾT QUẢ</span>
              <strong className="text-stone-900">Nhận bảng điểm & Nhận xét</strong>
              <p className="text-stone-600 leading-relaxed">
                Bảng điểm chi tiết và nhận xét năng lực sẽ được hiển thị tại trang Kết quả thi của bạn.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Navigation Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2 pb-12">
        <button
          type="button"
          onClick={() => navigate('/student')}
          className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[var(--navy)] hover:bg-[var(--navy-dark)] text-white font-medium rounded-xl text-sm transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Về Bảng điều khiển Sinh viên</span>
        </button>

        <Link
          to="/student/exams"
          className="inline-flex items-center gap-2 px-5 py-3.5 text-stone-700 hover:text-stone-900 border border-[var(--border)] hover:bg-stone-50 rounded-xl text-sm font-medium transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>Xem danh sách ca thi khác</span>
        </Link>
      </div>
    </div>
  );
}
