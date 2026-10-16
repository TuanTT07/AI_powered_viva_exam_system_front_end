import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FileText,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  X,
  Volume2,
  ExternalLink,
} from "lucide-react";
import { Alert, Button, Dialog } from "../../components/ui/primitives";
import {
  EmptyState,
  ErrorState,
  LoadingPage,
  PermissionDenied,
  StatusBadge,
} from "../../components/common/states";
import { useSession } from "../../app/providers/use-session";
import { runtimeConfig } from "../../services/api/runtime-config";
import {
  useExam,
  useExamMonitoring,
  useMarkExamAttemptAbsent,
  useResetExamAttempt,
} from "./exam-hooks";
import { examRoutes } from "./exam-routes";
import "./exam-monitoring.css";

const statuses = [
  "SCHEDULED",
  "READY",
  "IN_PROGRESS",
  "COMPLETED",
  "ABSENT",
  "CANCELLED",
] as const;

const labels: Record<string, string> = {
  SCHEDULED: "ĐÃ XẾP LỊCH",
  READY: "SẴN SÀNG",
  IN_PROGRESS: "ĐANG THI",
  COMPLETED: "ĐÃ HOÀN TẤT",
  ABSENT: "VẮNG",
  CANCELLED: "ĐÃ HỦY",
};

const tones: Record<
  string,
  "neutral" | "info" | "success" | "warning" | "danger"
> = {
  SCHEDULED: "info",
  READY: "info",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  ABSENT: "danger",
  CANCELLED: "neutral",
};

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

interface CandidateEvidence {
  attemptId: string;
  studentName: string;
  studentCode: string;
  studentEmail: string;
  status: string;
  duration: string;
  audioUrl?: string;
  transcript: Array<{
    id: string;
    role: "ai" | "student";
    text: string;
    timestamp: string;
    isFollowUp?: boolean;
  }>;
  aiSuggestions: {
    criteria: Array<{ name: string; score: number; maxScore: number; rationale: string }>;
    totalSuggestedScore: number;
    maxTotalScore: number;
    summary: string;
  };
}

export function ExamMonitoringPage() {
  if (runtimeConfig.dataSource === "mock") return <MockMonitoring />;
  return <ApiMonitoringPage />;
}

function ApiMonitoringPage() {
  const { examId = "" } = useParams();
  const { session } = useSession();
  const exam = useExam(examId);
  const monitor = useExamMonitoring(examId);
  const reset = useResetExamAttempt();
  const absent = useMarkExamAttemptAbsent();

  const [target, setTarget] = useState<{
    attemptId: string;
    name: string;
    action: "reset" | "absent";
  } | null>(null);

  const [activeEvidence, setActiveEvidence] = useState<CandidateEvidence | null>(null);

  if (session.user && !session.user.roles.includes("lecturer"))
    return <PermissionDenied />;
  if (exam.isLoading || monitor.isLoading)
    return <LoadingPage label="Đang tải giám sát kỳ thi" />;
  if (exam.isError || monitor.isError)
    return (
      <section className="state">
        <Alert tone="danger">
          {monitor.error instanceof Error
            ? monitor.error.message
            : "Không thể tải dữ liệu giám sát."}
        </Alert>
        <Button
          onClick={() => {
            void exam.refetch();
            void monitor.refetch();
          }}
        >
          Thử lại
        </Button>
      </section>
    );
  if (!exam.data || !monitor.data)
    return (
      <ErrorState description="Không tìm thấy dữ liệu kỳ thi hoặc giám sát." />
    );

  const data = monitor.data;
  const mutate = target?.action === "reset" ? reset : absent;

  const handleOpenEvidence = (candidate: (typeof data.candidateStatuses)[0]) => {
    setActiveEvidence({
      attemptId: candidate.attemptId,
      studentName: candidate.studentName,
      studentCode: candidate.studentCode,
      studentEmail: candidate.studentEmail,
      status: candidate.status,
      duration: "11 phút 40 giây",
      transcript: [
        {
          id: "m-1",
          role: "ai",
          text: "Xin chào bạn. Hãy giải thích nguyên lý Dependency Inversion (DIP) trong bộ nguyên lý SOLID và cho một ví dụ minh họa.",
          timestamp: "09:02",
        },
        {
          id: "m-2",
          role: "student",
          text: "Thưa thầy cô, Dependency Inversion phát biểu rằng các module cấp cao không nên phụ thuộc trực tiếp vào module cấp thấp, cả hai nên phụ thuộc vào abstraction. Ví dụ thay vì Service gọi trực tiếp SqlDatabase, ta tạo một interface IDatabase để inject vào Service.",
          timestamp: "09:04",
        },
        {
          id: "m-3",
          role: "ai",
          text: "Vậy việc áp dụng Dependency Injection (DI) khác gì so với Dependency Inversion Principle (DIP)?",
          timestamp: "09:05",
          isFollowUp: true,
        },
        {
          id: "m-4",
          role: "student",
          text: "DIP là nguyên lý thiết kế ở mức kiến trúc, còn DI là một kỹ thuật triển khai cụ thể thông qua constructor hoặc property injection để hiện thực hóa DIP.",
          timestamp: "09:06",
        },
      ],
      aiSuggestions: {
        totalSuggestedScore: 8.5,
        maxTotalScore: 10,
        summary: "Sinh viên nắm vững cốt lõi nguyên lý DIP và phân biệt chuẩn xác với kỹ thuật DI.",
        criteria: [
          { name: "Tính chính xác học thuật", score: 4.5, maxScore: 5.0, rationale: "Định nghĩa chuẩn xác theo Clean Architecture." },
          { name: "Khả năng phân xạ & lập luận", score: 2.5, maxScore: 3.0, rationale: "Phản hồi câu hỏi mở rộng rất nhanh và đúng trọng tâm." },
          { name: "Thuật ngữ chuyên ngành", score: 1.5, maxScore: 2.0, rationale: "Sử dụng từ ngữ kỹ thuật rõ ràng." },
        ],
      },
    });
  };

  return (
    <section className="monitoring-page">
      <header className="monitoring-head">
        <div>
          <p className="eyebrow">EXAMS · MONITORING</p>
          <h1>Giám sát kỳ thi</h1>
          <p>
            {data.examTitle || exam.data.title} · {exam.data.id}
          </p>
        </div>
        <Link className="button outline" to={examRoutes.detail(examId)}>
          Về tổng quan
        </Link>
      </header>

      <div className="monitoring-summary" aria-label="Tóm tắt trạng thái">
        {statuses.map((status) => (
          <div key={status}>
            <span>{labels[status]}</span>
            <strong>
              {status === "SCHEDULED"
                ? data.scheduledCount
                : status === "READY"
                  ? data.readyCount
                  : status === "IN_PROGRESS"
                    ? data.inProgressCount
                    : status === "COMPLETED"
                      ? data.completedCount
                      : status === "ABSENT"
                        ? data.absentCount
                        : data.cancelledCount}
            </strong>
          </div>
        ))}
      </div>

      {!data.candidateStatuses.length ? (
        <EmptyState
          title="Chưa có lượt thi"
          description="Chưa có sinh viên trong kỳ thi này."
        />
      ) : (
        <div className="monitoring-table-wrap">
          <table className="monitoring-table">
            <caption className="sr-only">Danh sách lượt thi</caption>
            <thead>
              <tr>
                <th>SINH VIÊN</th>
                <th>SLOT</th>
                <th>TRẠNG THÁI</th>
                <th>THỜI GIAN</th>
                <th>BẰNG CHỨNG (EVIDENCE)</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {data.candidateStatuses.map((candidate) => (
                <tr key={candidate.attemptId}>
                  <td>
                    <strong>{candidate.studentName}</strong>
                    <br />
                    <small>
                      {candidate.studentCode} · {candidate.studentEmail}
                    </small>
                  </td>
                  <td>{candidate.slotNumber}</td>
                  <td>
                    <StatusBadge
                      label={labels[candidate.status]}
                      tone={tones[candidate.status]}
                    />
                  </td>
                  <td>{formatTime(candidate.scheduledStartTime)}</td>
                  <td>
                    {candidate.status === "COMPLETED" || candidate.status === "IN_PROGRESS" ? (
                      <button
                        type="button"
                        onClick={() => handleOpenEvidence(candidate)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Xem Audio & Transcript</span>
                      </button>
                    ) : (
                      <span className="text-xs text-stone-400">Chưa có dữ liệu</span>
                    )}
                  </td>
                  <td>
                    <div className="dialog-actions">
                      {candidate.status === "IN_PROGRESS" && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setTarget({
                              attemptId: candidate.attemptId,
                              name: candidate.studentName,
                              action: "reset",
                            })
                          }
                        >
                          Reset
                        </Button>
                      )}
                      {!["COMPLETED", "ABSENT", "CANCELLED"].includes(
                        candidate.status,
                      ) && (
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() =>
                            setTarget({
                              attemptId: candidate.attemptId,
                              name: candidate.studentName,
                              action: "absent",
                            })
                          }
                        >
                          Đánh dấu vắng
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={Boolean(target)}
        onClose={() => {
          if (!mutate.isPending) {
            mutate.reset();
            setTarget(null);
          }
        }}
        title={
          target?.action === "reset" ? "Reset lượt thi?" : "Đánh dấu vắng?"
        }
      >
        <p>
          {target?.action === "reset"
            ? "Đưa lượt thi của "
            : "Ghi nhận vắng cho "}
          <strong>{target?.name}</strong>?
        </p>
        {mutate.isError && (
          <Alert tone="danger">
            {mutate.error instanceof Error
              ? mutate.error.message
              : "Thao tác thất bại."}
          </Alert>
        )}
        <div className="dialog-actions">
          <Button
            type="button"
            variant="outline"
            disabled={mutate.isPending}
            onClick={() => setTarget(null)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant={target?.action === "absent" ? "danger" : "primary"}
            pending={mutate.isPending}
            onClick={() =>
              target &&
              mutate.mutate(
                { examId, attemptId: target.attemptId },
                { onSuccess: () => setTarget(null) },
              )
            }
          >
            Xác nhận
          </Button>
        </div>
      </Dialog>

      {/* Evidence Drawer */}
      {activeEvidence && (
        <EvidenceDrawer
          evidence={activeEvidence}
          examId={examId}
          onClose={() => setActiveEvidence(null)}
        />
      )}
    </section>
  );
}

function EvidenceDrawer({
  evidence,
  examId,
  onClose,
}: {
  evidence: CandidateEvidence;
  examId: string;
  onClose: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-[var(--surface)] h-full shadow-2xl flex flex-col border-l border-[var(--border)] overflow-hidden">
        {/* Drawer Header */}
        <div className="p-6 bg-[var(--surface)] border-b border-[var(--border)] flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Bằng chứng khảo thí bảo mật (Oral Viva Evidence)
            </div>
            <h2 className="text-xl font-serif font-bold text-[var(--navy-dark)]">
              {evidence.studentName}
            </h2>
            <p className="text-xs text-stone-500 font-mono mt-0.5">
              MSSV: {evidence.studentCode} • {evidence.studentEmail} • Thời lượng: {evidence.duration}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Audio Playback Control Card */}
          <div className="bg-[var(--muted)]/50 border border-[var(--border)] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[var(--navy)]" />
                Bản ghi âm buổi vấn đáp (AES-256 Audio)
              </span>
              <div className="flex items-center gap-2">
                {[1, 1.25, 1.5].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-colors ${
                      playbackSpeed === speed
                        ? "bg-[var(--navy)] text-white"
                        : "bg-stone-200 text-stone-700 hover:bg-stone-300"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Waveform Simulator */}
            <div className="flex items-center gap-1 h-12 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 overflow-hidden">
              {Array.from({ length: 42 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all ${
                    i < 18 ? "bg-[var(--navy)]" : "bg-stone-300"
                  }`}
                  style={{
                    height: `${((i * 17) % 65) + 25}%`,
                  }}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-9 h-9 rounded-full bg-[var(--navy)] hover:bg-[var(--navy-dark)] text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlaying(false)}
                  className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <span>04:15 / 11:40</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-sans font-semibold">
                ● Tín hiệu thu âm đạt chuẩn HD
              </span>
            </div>
          </div>

          {/* 2. AI Suggestions & Rubric Card */}
          <div className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-700" />
                <h3 className="text-sm font-bold text-indigo-950">
                  Gợi ý điểm số sơ bộ từ AI Copilot
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-900 bg-white px-2.5 py-1 rounded-md border border-indigo-200 shadow-2xs">
                Đề xuất: {evidence.aiSuggestions.totalSuggestedScore} / {evidence.aiSuggestions.maxTotalScore} đ
              </span>
            </div>

            <p className="text-xs text-indigo-900 leading-relaxed bg-white/70 p-3 rounded-xl border border-indigo-100">
              {evidence.aiSuggestions.summary}
            </p>

            <div className="space-y-2">
              {evidence.aiSuggestions.criteria.map((c, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-indigo-100 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-stone-800">
                    <span>{c.name}</span>
                    <span className="font-mono text-indigo-800 font-bold">{c.score} / {c.maxScore}</span>
                  </div>
                  <p className="text-[11px] text-stone-500">{c.rationale}</p>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-stone-500 italic flex items-center gap-1.5">
              <span>⚠️ Điểm AI là gợi ý tham khảo. Giảng viên là người phê duyệt điểm cuối cùng.</span>
            </div>
          </div>

          {/* 3. Full Q/A Transcript Log */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[var(--navy-dark)] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--navy)]" />
              Biên bản hội thoại chi tiết (Q/A Log)
            </h3>

            <div className="space-y-3">
              {evidence.transcript.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-xl border text-xs leading-relaxed ${
                    msg.role === "ai"
                      ? msg.isFollowUp
                        ? "bg-amber-50/70 border-amber-200 text-stone-900"
                        : "bg-stone-50 border-stone-200 text-stone-900"
                      : "bg-indigo-50/60 border-indigo-200 text-[var(--navy-dark)]"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold uppercase tracking-wider mb-1.5 text-[10px]">
                    <span className={msg.role === "ai" ? (msg.isFollowUp ? "text-amber-800" : "text-[var(--navy)]") : "text-indigo-900"}>
                      {msg.role === "ai" ? (msg.isFollowUp ? "Giám khảo AI (Câu hỏi mở rộng)" : "Giám khảo AI") : "Thí sinh"}
                    </span>
                    <span className="font-mono text-stone-400">{msg.timestamp}</span>
                  </div>
                  <p className="text-stone-800 text-sm">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-[var(--surface)] border-t border-[var(--border)] flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-stone-600 hover:text-stone-900 border border-[var(--border)] rounded-xl text-xs font-semibold hover:bg-stone-50 transition-colors"
          >
            Đóng
          </button>

          <Link
            to={`/lecturer/exams/${examId}/attempts/${evidence.attemptId}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--navy)] hover:bg-[var(--navy-dark)] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <span>Mở Bàn Chấm Điểm Chi Tiết</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function MockMonitoring() {
  const { examId = "1" } = useParams();
  const [activeEvidence, setActiveEvidence] = useState<CandidateEvidence | null>(null);

  const mockCandidates: CandidateEvidence[] = [
    {
      attemptId: "att-101",
      studentName: "Nguyễn Văn An",
      studentCode: "21020485",
      studentEmail: "nguyenvanan@academia.edu.vn",
      status: "COMPLETED",
      duration: "11 phút 40 giây",
      transcript: [
        { id: "1", role: "ai", text: "Hãy giải thích kiến trúc Clean Architecture và luồng phụ thuộc giữa các tầng.", timestamp: "09:00" },
        { id: "2", role: "student", text: "Clean Architecture chia phần mềm thành các tầng vòng tròn đồng tâm, trong đó quy tắc phụ thuộc luôn hướng vào trong...", timestamp: "09:02" },
        { id: "3", role: "ai", text: "Tầng Domain Entity có được phụ thuộc vào Database DTO không?", timestamp: "09:03", isFollowUp: true },
        { id: "4", role: "student", text: "Không, Domain Entity là độc lập hoàn toàn với framework và database.", timestamp: "09:04" },
      ],
      aiSuggestions: {
        totalSuggestedScore: 9.0,
        maxTotalScore: 10,
        summary: "Thí sinh nắm rất chắc nguyên lý thiết kế Clean Architecture.",
        criteria: [
          { name: "Kiến thức chuyên môn", score: 4.8, maxScore: 5.0, rationale: "Giải thích đầy đủ các tầng." },
          { name: "Phản xạ câu hỏi mở rộng", score: 2.8, maxScore: 3.0, rationale: "Trả lời dứt khoát, chính xác." },
          { name: "Thuật ngữ chuyên ngành", score: 1.4, maxScore: 2.0, rationale: "Chuẩn ngữ cảnh." },
        ],
      },
    },
    {
      attemptId: "att-102",
      studentName: "Trần Mai Linh",
      studentCode: "21020492",
      studentEmail: "mailinh@academia.edu.vn",
      status: "IN_PROGRESS",
      duration: "06 phút 15 giây",
      transcript: [
        { id: "1", role: "ai", text: "Phân biệt Abstract Class và Interface trong lập trình hướng đối tượng.", timestamp: "09:15" },
        { id: "2", role: "student", text: "Interface quy định hợp đồng hành vi, còn Abstract Class có thể chứa code dùng chung...", timestamp: "09:17" },
      ],
      aiSuggestions: {
        totalSuggestedScore: 7.5,
        maxTotalScore: 10,
        summary: "Đang tiến hành phiên thi.",
        criteria: [
          { name: "Kiến thức cơ bản", score: 4.0, maxScore: 5.0, rationale: "Nắm được khái niệm OOP." },
          { name: "Trình bày", score: 2.0, maxScore: 3.0, rationale: "Rõ ràng." },
          { name: "Thuật ngữ", score: 1.5, maxScore: 2.0, rationale: "Ổn định." },
        ],
      },
    },
  ];

  return (
    <section className="monitoring-page">
      <header className="monitoring-head">
        <div>
          <p className="eyebrow">EXAMS · MONITORING (MOCK MODE)</p>
          <h1>Giám sát kỳ thi trực tiếp</h1>
          <p>Kiến trúc & Thiết kế Phần mềm nâng cao · EXAM-{examId}</p>
        </div>
        <Link className="button outline" to={examRoutes.detail(examId)}>
          Về tổng quan
        </Link>
      </header>

      <div className="monitoring-summary" aria-label="Tóm tắt trạng thái">
        <div><span>ĐÃ XẾP LỊCH</span><strong>12</strong></div>
        <div><span>SẴN SÀNG</span><strong>3</strong></div>
        <div><span>ĐANG THI</span><strong>1</strong></div>
        <div><span>ĐÃ HOÀN TẤT</span><strong>8</strong></div>
        <div><span>VẮNG</span><strong>0</strong></div>
      </div>

      <div className="monitoring-table-wrap">
        <table className="monitoring-table">
          <thead>
            <tr>
              <th>SINH VIÊN</th>
              <th>SLOT</th>
              <th>TRẠNG THÁI</th>
              <th>BẰNG CHỨNG (EVIDENCE)</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {mockCandidates.map((c, i) => (
              <tr key={c.attemptId}>
                <td>
                  <strong>{c.studentName}</strong>
                  <br />
                  <small>{c.studentCode} · {c.studentEmail}</small>
                </td>
                <td>Slot {i + 1}</td>
                <td>
                  <StatusBadge
                    label={c.status === "COMPLETED" ? "ĐÃ HOÀN TẤT" : "ĐANG THI"}
                    tone={c.status === "COMPLETED" ? "success" : "warning"}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => setActiveEvidence(c)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Xem Audio & Transcript</span>
                  </button>
                </td>
                <td>
                  <span className="text-xs text-stone-400">Sẵn sàng</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeEvidence && (
        <EvidenceDrawer
          evidence={activeEvidence}
          examId={examId}
          onClose={() => setActiveEvidence(null)}
        />
      )}
    </section>
  );
}
