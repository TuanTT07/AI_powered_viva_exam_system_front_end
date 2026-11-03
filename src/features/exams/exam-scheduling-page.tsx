import { InlineNotice } from '../../components/common/inline-notice'
import { useState } from "react";
import { Link, useBlocker, useParams } from "react-router-dom";
import { Alert, Button, Dialog, Input } from "../../components/ui/primitives";
import {
  EmptyState,
  ErrorState,
  LoadingPage,
  PermissionDenied,
  StatusBadge,
} from "../../components/common/states";
import { useSession } from "../../app/providers/use-session";
import {
  useExam,
  useExamRoster,
  useExamSchedule,
  useSaveExamSchedule,
  useApiExamSchedule,
  useAssignApiCandidates,
  useAutoScheduleApiExam,
  useRescheduleApiExam,
} from "./exam-hooks";
import { examStatusMeta } from "./exam-types";
import { examRoutes } from "./exam-routes";
import { generateScheduleSlots } from "./schedule-generator";
import { validateSchedule } from "./schedule-validation";
import {
  editableScheduleStatuses,
  type AssignmentStrategy,
  type ScheduleDraft,
} from "./schedule-types";
import type { RosterStudent } from "./roster-types";
import "./exam-scheduling.css";
import { runtimeConfig } from "../../services/api/runtime-config";
import {
  isExamUuid,
  type CandidateScheduleDto,
} from "./api-exam-scheduling-repository";

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
// <input type="datetime-local"> expects local time without timezone. Slicing the UTC ISO string
// shifted the time by the browser offset (7h in Vietnam) and pushed it outside the exam window.
const toLocalInput = (value: string) => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
export function ExamSchedulingPage() {
  if (runtimeConfig.dataSource === "api") return <ApiExamSchedulingPage />;
  return <MockExamSchedulingPage />;
}

function MockExamSchedulingPage() {
  const { examId = "" } = useParams();
  const { session } = useSession();
  const exam = useExam(examId);
  const roster = useExamRoster(examId);
  const saved = useExamSchedule(examId);
  const save = useSaveExamSchedule();
  const [draft, setDraft] = useState<ScheduleDraft | null>(null);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [strategy, setStrategy] = useState<AssignmentStrategy>("ROSTER_ORDER");
  const [dirty, setDirty] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const currentDraft =
    draft ??
    (saved.data
      ? {
          breakMinutes: saved.data.breakMinutes,
          strategy: saved.data.strategy,
          slots: saved.data.slots,
        }
      : null);
  const visibleBreak = draft
    ? breakMinutes
    : (saved.data?.breakMinutes ?? breakMinutes);
  const visibleStrategy = draft ? strategy : (saved.data?.strategy ?? strategy);
  const editable = Boolean(
    exam.data && editableScheduleStatuses.includes(exam.data.status),
  );
  const blocker = useBlocker(dirty && !save.isPending);
  const assigned = new Set(
    (currentDraft?.slots ?? []).flatMap((slot) =>
      slot.rosterStudentId ? [slot.rosterStudentId] : [],
    ),
  );
  const issues =
    exam.data && currentDraft
      ? validateSchedule(exam.data, roster.data ?? [], currentDraft)
      : [];
  const unassigned = (roster.data ?? []).filter(
    (student) => !assigned.has(student.id),
  );
  if (session.user && !session.user.roles.includes("lecturer"))
    return <PermissionDenied />;
  if (exam.isLoading || roster.isLoading || saved.isLoading)
    return <LoadingPage label="Đang tải lịch vấn đáp" />;
  if (exam.isError || roster.isError || saved.isError)
    return (
      <section className="state">
        <Alert tone="danger">Không thể tải dữ liệu lịch vấn đáp.</Alert>
        <Button
          onClick={() => {
            void exam.refetch();
            void roster.refetch();
            void saved.refetch();
          }}
        >
          Thử lại
        </Button>
      </section>
    );
  if (!exam.data) return <ErrorState description="Không tìm thấy kỳ thi." />;
  const meta = examStatusMeta[exam.data.status];
  const hasRoster = Boolean(roster.data?.length);
  const generate = (nextStrategy = strategy, nextBreak = breakMinutes) => {
    if (
      !hasRoster ||
      nextBreak < 0 ||
      nextBreak > 30 ||
      !Number.isInteger(nextBreak)
    )
      return;
    setDraft({
      breakMinutes: nextBreak,
      strategy: nextStrategy,
      slots: generateScheduleSlots(
        examId,
        exam.data!.scheduledAt,
        exam.data!.durationMinutes,
        nextBreak,
        roster.data ?? [],
        nextStrategy,
      ),
    });
    setBreakMinutes(nextBreak);
    setStrategy(nextStrategy);
    setDirty(true);
  };
  const requestGenerate = () => {
    if (currentDraft?.slots.length) setConfirmRegenerate(true);
    else generate();
  };
  const assign = (slotId: string, studentId: string) => {
    if (!currentDraft) return;
    if (
      studentId &&
      currentDraft.slots.some(
        (slot) => slot.id !== slotId && slot.rosterStudentId === studentId,
      )
    )
      return;
    setDraft({
      ...currentDraft,
      slots: currentDraft.slots.map((slot) =>
        slot.id === slotId
          ? { ...slot, rosterStudentId: studentId || undefined }
          : slot,
      ),
    });
    setDirty(true);
  };
  const saveDraft = () => {
    if (!currentDraft || issues.length || save.isPending) return;
    save.mutate(
      { examId, draft: currentDraft },
      {
        onSuccess: (result) => {
          setDraft({
            breakMinutes: result.breakMinutes,
            strategy: result.strategy,
            slots: result.slots,
          });
          setDirty(false);
        },
      },
    );
  };
  return (
    <section className="schedule-page">
      <nav className="schedule-breadcrumb" aria-label="Breadcrumb">
        <Link to={examRoutes.list}>Kỳ thi</Link>
        <span>/</span>
        <Link to={examRoutes.detail(examId)}>{exam.data.id}</Link>
        <span>/</span>
        <span>Lịch vấn đáp</span>
      </nav>
      <header className="schedule-head">
        <div>
          <p className="eyebrow">EXAMS · SCHEDULING</p>
          <h1>Lịch vấn đáp</h1>
          <p>
            {exam.data.title} · {exam.data.subjectName}
          </p>
        </div>
        <div className="schedule-head-meta">
          <StatusBadge label={meta.label} tone={meta.tone} />
          <Link className="button outline" to={examRoutes.edit(examId)}>
            Sửa cấu hình
          </Link>
          <Link className="button outline" to={examRoutes.questions(examId)}>
            Câu hỏi
          </Link>
        </div>
      </header>
      {!editable && (
        <InlineNotice>
          <strong>Chế độ chỉ đọc.</strong> Kỳ thi{" "}
          {meta.label.toLocaleLowerCase()} không thể tạo, sửa hoặc lưu lịch.
        </InlineNotice>
      )}
      <section
        className="schedule-summary"
        aria-label="Thông tin cấu hình kỳ thi"
      >
        <div>
          <span>Bắt đầu</span>
          <strong>{formatTime(exam.data.scheduledAt)}</strong>
        </div>
        <div>
          <span>Thời lượng / sinh viên</span>
          <strong>{exam.data.durationMinutes} phút</strong>
        </div>
        <div>
          <span>Sinh viên trong roster</span>
          <strong>{roster.data?.length ?? 0}</strong>
        </div>
      </section>
      {!hasRoster ? (
        <section className="state">
          <EmptyState
            title="Chưa có sinh viên để xếp lịch"
            description="Hãy thêm sinh viên vào roster trước khi tạo time slot."
          />
          <Link className="button primary" to={examRoutes.students(examId)}>
            Mở danh sách sinh viên
          </Link>
        </section>
      ) : (
        <>
          <section className="schedule-config">
            <div>
              <h2>Tạo time slot</h2>
              <p>
                Slot bắt đầu từ giờ thi, nối tiếp theo thời lượng và thời gian
                nghỉ.
              </p>
            </div>
            <div className="schedule-config-grid">
              <label htmlFor="schedule-break">
                Thời gian nghỉ giữa các slot (phút)
                <Input
                  id="schedule-break"
                  min={0}
                  max={30}
                  step={1}
                  type="number"
                  value={visibleBreak}
                  disabled={!editable}
                  onChange={(event) => {
                    setBreakMinutes(Number(event.target.value));
                    setDirty(true);
                  }}
                />
              </label>
              <label htmlFor="schedule-strategy">
                Cách gán sinh viên
                <select
                  id="schedule-strategy"
                  disabled={!editable}
                  value={visibleStrategy}
                  onChange={(event) => {
                    setStrategy(event.target.value as AssignmentStrategy);
                    setDirty(true);
                  }}
                >
                  <option value="ROSTER_ORDER">Theo thứ tự roster</option>
                  <option value="UNASSIGNED">Để trống để gán thủ công</option>
                </select>
              </label>
            </div>
            {visibleBreak < 0 ||
            visibleBreak > 30 ||
            !Number.isInteger(visibleBreak) ? (
              <Alert tone="danger">
                Thời gian nghỉ phải là số nguyên từ 0 đến 30 phút.
              </Alert>
            ) : null}
            <div className="schedule-actions">
              <Button disabled={!editable} onClick={requestGenerate}>
                Tạo / tạo lại time slot
              </Button>
              {currentDraft && (
                <Button
                  disabled={!editable || Boolean(issues.length)}
                  pending={save.isPending}
                  onClick={saveDraft}
                >
                  Lưu lịch
                </Button>
              )}
            </div>
            {save.isError && (
              <Alert tone="danger">
                Không thể lưu lịch. Bản nháp vẫn được giữ lại để thử lại.
              </Alert>
            )}
            {save.data && !dirty && (
              <Alert tone="success">Lịch đã được lưu thành công.</Alert>
            )}
          </section>
          <section className="schedule-status" aria-live="polite">
            <strong>{currentDraft?.slots.length ?? 0} slot</strong>
            <span> · </span>
            <strong>{assigned.size} đã gán</strong>
            <span> · </span>
            <strong>{unassigned.length} chưa gán</strong>
            {!currentDraft && (
              <p>
                Chưa có lịch được tạo. Cấu hình thời gian nghỉ rồi tạo slot.
              </p>
            )}
          </section>
          {issues.length > 0 && (
            <Alert tone="danger">
              <strong>Lịch chưa hợp lệ:</strong>
              <ul>
                {issues.map((issue) => (
                  <li key={issue.code + (issue.slotId ?? "")}>
                    {issue.message}
                  </li>
                ))}
              </ul>
            </Alert>
          )}
          {currentDraft && (
            <SlotTable
              draft={currentDraft}
              roster={roster.data ?? []}
              editable={editable}
              onAssign={assign}
            />
          )}
        </>
      )}
      <Dialog
        open={confirmRegenerate}
        onClose={() => setConfirmRegenerate(false)}
        title="Tạo lại lịch?"
      >
        <p>
          Các slot và phân công hiện tại có thể bị thay thế. Sẽ tạo{" "}
          <strong>{roster.data?.length ?? 0}</strong> slot với thời gian nghỉ{" "}
          <strong>{visibleBreak}</strong> phút.
        </p>
        <div className="dialog-actions">
          <Button variant="outline" onClick={() => setConfirmRegenerate(false)}>
            Giữ lịch hiện tại
          </Button>
          <Button
            onClick={() => {
              setConfirmRegenerate(false);
              generate();
            }}
          >
            Xác nhận tạo lại
          </Button>
        </div>
      </Dialog>
      <Dialog
        open={blocker.state === "blocked"}
        onClose={() => blocker.reset?.()}
        title="Rời trang lịch chưa lưu?"
      >
        <p>Bản nháp lịch hoặc phân công chưa được lưu sẽ bị mất.</p>
        <div className="dialog-actions">
          <Button variant="outline" onClick={() => blocker.reset?.()}>
            Ở lại
          </Button>
          <Button onClick={() => blocker.proceed?.()}>Rời trang</Button>
        </div>
      </Dialog>
    </section>
  );
}

function ApiExamSchedulingPage() {
  const { examId = "" } = useParams();
  const validExamId = isExamUuid(examId) ? examId : undefined;
  const exam = useExam(validExamId);
  const schedule = useApiExamSchedule(validExamId);
  const assign = useAssignApiCandidates();
  const auto = useAutoScheduleApiExam();
  const reschedule = useRescheduleApiExam();
  const [studentIds, setStudentIds] = useState(
    runtimeConfig.demoCandidateIds.join("\n"),
  );
  const [slotDuration, setSlotDuration] = useState("15");
  const [breakMinutes, setBreakMinutes] = useState("5");
  const [selected, setSelected] = useState<CandidateScheduleDto | null>(null);
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  if (!isExamUuid(examId))
    return (
      <section className="state">
        <h2>Không tìm thấy dữ liệu yêu cầu</h2>
        <p>Vui lòng chọn một kỳ thi hợp lệ để tiếp tục.</p>
        <Link className="button outline" to={examRoutes.list}>
          Về danh sách kỳ thi
        </Link>
      </section>
    );
  if (schedule.isLoading) return <LoadingPage label="Đang tải lịch vấn đáp" />;
  if (schedule.isError)
    return (
      <section className="state">
        <Alert tone="danger">
          {schedule.error instanceof Error
            ? schedule.error.message
            : "Không thể tải lịch vấn đáp."}
        </Alert>
        <Button onClick={() => schedule.refetch()}>Thử lại</Button>
      </section>
    );
  const slots = schedule.data ?? [];
  const ids = studentIds
    .split(/[\s,;]+/)
    .map((value) => value.trim())
    .filter(Boolean);
  const assignedIds = slots.map((slot) => slot.studentId);
  const submitAssign = () => {
    if (!ids.length || assign.isPending) return;
    assign.mutate(
      { examId, studentIds: ids },
      { onSuccess: () => setStudentIds("") },
    );
  };
  const submitAuto = () => {
    if (!assignedIds.length || auto.isPending) return;
    auto.mutate({
      examId,
      request: {
        studentIds: assignedIds,
        slotDurationMinutes: Number(slotDuration),
        breakDurationMinutes: Number(breakMinutes),
      },
    });
  };
  const submitReschedule = () => {
    if (!selected || reschedule.isPending) return;
    const start = new Date(newStart);
    const end = new Date(newEnd);
    if (
      !Number.isFinite(start.getTime()) ||
      !Number.isFinite(end.getTime()) ||
      end <= start
    )
      return;
    reschedule.mutate(
      {
        examId,
        request: {
          studentId: selected.studentId,
          newScheduledStartTime: start.toISOString(),
          newScheduledEndTime: end.toISOString(),
        },
      },
      {
        onSuccess: () => {
          setSelected(null);
          setNewStart("");
          setNewEnd("");
        },
      },
    );
  };
  return (
    <section className="schedule-page">
      <nav className="schedule-breadcrumb" aria-label="Breadcrumb">
        <Link to={examRoutes.list}>Kỳ thi</Link>
        <span>/</span>
        <span>{examId}</span>
        <span>/</span>
        <span>Lịch vấn đáp</span>
      </nav>
      <header className="schedule-head">
        <div>
          <p className="eyebrow">EXAMS · SCHEDULING</p>
          <h1>Lịch vấn đáp</h1>
          <p>Điều phối ca thi và thời gian phỏng vấn cho sinh viên.</p>
        </div>
        <Link className="button outline" to={examRoutes.list}>
          Về danh sách kỳ thi
        </Link>
      </header>
      <section className="schedule-summary" aria-label="Thông tin kỳ thi">
        <div>
          <span>Kỳ thi</span>
          <strong>{exam.data?.title ?? examId}</strong>
        </div>
        <div>
          <span>Giờ bắt đầu ca đầu tiên</span>
          <strong>
            {exam.data?.scheduledAt ? formatTime(exam.data.scheduledAt) : "Chưa đặt"}
          </strong>
        </div>
        <div>
          <span>Sinh viên đã thêm</span>
          <strong>{slots.length}</strong>
        </div>
      </section>
      <Alert tone="info">
        <strong>Cách xếp lịch gồm 3 bước:</strong>
        <ol style={{ margin: "6px 0 0 18px", padding: 0 }}>
          <li>
            <strong>Thêm sinh viên</strong>: dán ID sinh viên rồi bấm “Gán ứng viên”.
          </li>
          <li>
            <strong>Tự động xếp lịch</strong>: hệ thống chia ca nối tiếp, bắt đầu từ giờ
            bắt đầu của kỳ thi ở trên.
          </li>
          <li>
            <strong>Đổi ca</strong> (nếu cần): chỉnh giờ từng sinh viên ở bảng bên dưới.
            Giờ mới phải nằm trong khung thời gian của kỳ thi.
          </li>
        </ol>
      </Alert>
      <section className="schedule-config">
        <h2>Bước 1 · Thêm sinh viên</h2>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const demoIds = runtimeConfig.demoCandidateIds.length
                ? runtimeConfig.demoCandidateIds
                : [
                    "a1fe2001-0000-4000-8000-000000000001",
                    "a1fe2001-0000-4000-8000-000000000002",
                    "a1fe2001-0000-4000-8000-000000000003",
                  ];
              setStudentIds(demoIds.join("\n"));
            }}
          >
            Chèn nhanh sinh viên mẫu
          </Button>
          {slots.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const existingIds = [...new Set(slots.map((s) => s.studentId))];
                setStudentIds(existingIds.join("\n"));
              }}
            >
              Lấy lại {slots.length} sinh viên đã có trong ca
            </Button>
          )}
        </div>
        <label>
          ID sinh viên (ngăn cách bằng dấu phẩy hoặc xuống dòng)
          <textarea
            value={studentIds}
            onChange={(event) => setStudentIds(event.target.value)}
            placeholder="11111111-1111-4111-8111-111111111111"
          />
        </label>
        <p className="form-help">
          {ids.length
            ? `Đã nhập ${ids.length} ID sinh viên.`
            : "Nhập ít nhất 1 ID sinh viên để bật nút “Gán ứng viên”."}
        </p>
        <Button
          pending={assign.isPending}
          disabled={!ids.length}
          onClick={submitAssign}
        >
          Gán ứng viên
        </Button>
        {assign.isError && (
          <Alert tone="danger">
            {assign.error instanceof Error
              ? assign.error.message
              : "Không thể gán ứng viên."}
          </Alert>
        )}
        {assign.data && (
          <Alert tone="success">Đã gán sinh viên thành công. Chuyển sang Bước 2.</Alert>
        )}
      </section>
      <section className="schedule-config">
        <h2>Bước 2 · Tự động xếp lịch</h2>
        <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "12px", fontSize: "13px" }}>
          <div><strong>Mốc thời gian kỳ thi:</strong> {exam.data?.scheduledAt ? formatTime(exam.data.scheduledAt) : "Chưa đặt lịch"} {exam.data?.durationMinutes ? `(Thời lượng toàn kỳ thi: ${exam.data.durationMinutes} phút)` : ""}</div>
          <div style={{ color: "#64748b", marginTop: "4px" }}>Hệ thống backend tự động chia ca nối tiếp bắt đầu từ mốc thời gian trên, mỗi ca {slotDuration || 15} phút + {breakMinutes || 5} phút nghỉ.</div>
        </div>
        <div className="schedule-config-grid">
          <label>
            Thời lượng mỗi sinh viên (phút)
            <Input
              min={5}
              type="number"
              value={slotDuration}
              onChange={(event) => setSlotDuration(event.target.value)}
            />
          </label>
          <label>
            Thời gian nghỉ giữa các ca (phút)
            <Input
              min={0}
              type="number"
              value={breakMinutes}
              onChange={(event) => setBreakMinutes(event.target.value)}
            />
          </label>
        </div>
        <p className="form-help">
          {assignedIds.length
            ? `Sẽ xếp lịch cho ${assignedIds.length} sinh viên, mỗi người ${slotDuration || 0} phút, nghỉ ${breakMinutes || 0} phút, bắt đầu từ ${exam.data?.scheduledAt ? formatTime(exam.data.scheduledAt) : "giờ bắt đầu của kỳ thi"}.`
            : "Chưa có sinh viên nào. Hãy hoàn thành Bước 1 trước thì nút bên dưới mới dùng được."}
        </p>
        <Button
          pending={auto.isPending}
          disabled={!assignedIds.length}
          onClick={submitAuto}
        >
          Tự động xếp lịch
        </Button>
        {auto.isError && (
          <Alert tone="danger">
            {auto.error instanceof Error
              ? auto.error.message
              : "Không thể tự động xếp lịch."}
          </Alert>
        )}
        {auto.data && (
          <Alert tone="success">Lịch mới đã được lưu thành công.</Alert>
        )}
      </section>
      <section className="schedule-status">
        <strong>Bước 3 · Lịch đã xếp:</strong>
        <span> </span>
        <strong>{slots.length} ca</strong>
        <span> · </span>
        <strong>
          {
            slots.filter(
              (slot) => slot.status !== "ABSENT" && slot.status !== "CANCELLED",
            ).length
          }{" "}
          đang hoạt động
        </strong>
      </section>
      {!slots.length ? (
        <EmptyState
          title="Chưa có lịch"
          description="Chưa tạo lịch cho kỳ thi này."
        />
      ) : (
        <div className="schedule-table-wrap">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>SINH VIÊN</th>
                <th>BẮT ĐẦU</th>
                <th>KẾT THÚC</th>
                <th>TRẠNG THÁI</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.attemptId}>
                  <td>{slot.slotNumber}</td>
                  <td>
                    {slot.studentCode} · {slot.studentName}
                    <br />
                    <small>{slot.studentEmail}</small>
                  </td>
                  <td>{formatTime(slot.scheduledStartTime)}</td>
                  <td>{formatTime(slot.scheduledEndTime)}</td>
                  <td>{slot.status}</td>
                  <td>
                    <Button
                      variant="outline"
                      onClick={() => {
                        reschedule.reset();
                        setSelected(slot);
                        setNewStart(toLocalInput(slot.scheduledStartTime));
                        setNewEnd(toLocalInput(slot.scheduledEndTime));
                      }}
                    >
                      Đổi ca
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {reschedule.isError && (
        <Alert tone="danger">
          {reschedule.error instanceof Error
            ? reschedule.error.message
            : "Không thể đổi ca."}
        </Alert>
      )}
      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Đổi ca thi"
      >
        <p>
          Thay đổi lịch cho <strong>{selected?.studentName}</strong>.
        </p>
        <p className="form-help">
          Giờ mới phải nằm trong khung thời gian của kỳ thi
          {exam.data?.scheduledAt
            ? ` (bắt đầu từ ${formatTime(exam.data.scheduledAt)})`
            : ""}
          . Nếu hệ thống báo lỗi, hãy chọn giờ gần với giờ hiện tại của ca.
        </p>
        {newStart && newEnd && new Date(newEnd) <= new Date(newStart) && (
          <Alert tone="danger">Giờ kết thúc phải sau giờ bắt đầu.</Alert>
        )}
        <label>
          Bắt đầu mới
          <Input
            type="datetime-local"
            value={newStart}
            onChange={(event) => setNewStart(event.target.value)}
          />
        </label>
        <label>
          Kết thúc mới
          <Input
            type="datetime-local"
            value={newEnd}
            onChange={(event) => setNewEnd(event.target.value)}
          />
        </label>
        {reschedule.isError && (
          <Alert tone="danger">
            {reschedule.error instanceof Error
              ? reschedule.error.message
              : "Không thể đổi ca."}
          </Alert>
        )}
        <div className="dialog-actions">
          <Button variant="outline" onClick={() => setSelected(null)}>
            Huỷ
          </Button>
          <Button pending={reschedule.isPending} onClick={submitReschedule}>
            Xác nhận đổi ca
          </Button>
        </div>
      </Dialog>
    </section>
  );
}
function SlotTable({
  draft,
  roster,
  editable,
  onAssign,
}: {
  draft: ScheduleDraft;
  roster: RosterStudent[];
  editable: boolean;
  onAssign: (slotId: string, studentId: string) => void;
}) {
  return (
    <div className="schedule-table-wrap">
      <table className="schedule-table">
        <caption className="sr-only">Các time slot của kỳ thi</caption>
        <thead>
          <tr>
            <th>STT</th>
            <th>BẮT ĐẦU</th>
            <th>KẾT THÚC</th>
            <th>SINH VIÊN</th>
          </tr>
        </thead>
        <tbody>
          {draft.slots.map((slot, index) => (
            <tr key={slot.id}>
              <td>{index + 1}</td>
              <td>{formatTime(slot.startAt)}</td>
              <td>{formatTime(slot.endAt)}</td>
              <td>
                <label className="sr-only" htmlFor={"slot-" + slot.id}>
                  Sinh viên cho slot {index + 1}
                </label>
                <select
                  id={"slot-" + slot.id}
                  disabled={!editable}
                  value={slot.rosterStudentId ?? ""}
                  onChange={(event) => onAssign(slot.id, event.target.value)}
                >
                  <option value="">Chưa gán</option>
                  {roster.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.studentCode} · {student.fullName}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
