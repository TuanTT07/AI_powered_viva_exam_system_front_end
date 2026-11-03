import { DemoLabel } from '../../components/common/inline-notice'
import { useAssessmentOverview } from './use-assessment-overview'
import { AttemptTable } from './views/AttemptTable'
import { SourceMetric } from '../../components/common/source-page'
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
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
import { apiExamMonitoringRepository } from "./api-exam-monitoring-repository";
import { examRoutes } from "./exam-routes";
import "./exam-monitoring.css";
import { SourcePageHeader } from "../../components/common/source-page";

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
    action: "open" | "reset" | "absent";
  } | null>(null);

  const [openAllConfirm, setOpenAllConfirm] = useState(false);
  const [isOpeningAll, setIsOpeningAll] = useState(false);
  const [openAllError, setOpenAllError] = useState<string | null>(null);

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
  const mutate = target?.action === "absent" ? absent : reset;

  const handleOpenAllScheduled = async () => {
    setIsOpeningAll(true);
    setOpenAllError(null);
    try {
      const scheduledList = data.candidateStatuses.filter((c) => c.status === "SCHEDULED");
      await Promise.all(
        scheduledList.map((c) =>
          apiExamMonitoringRepository.reset(examId, c.attemptId)
        )
      );
      setOpenAllConfirm(false);
      void monitor.refetch();
    } catch (err) {
      setOpenAllError(
        err instanceof Error ? err.message : "Không thể mở tất cả ca thi."
      );
    } finally {
      setIsOpeningAll(false);
    }
  };

  return (
    <section className="source-screen monitoring-page">
      <SourcePageHeader
        eyebrow="Khảo thí · Giám sát"
        title="Giám sát kỳ thi"
        description={data.examTitle || exam.data.title}
        actions={
          <>
            <Link className="button outline" to={examRoutes.detail(examId)}>
              Tổng quan
            </Link>
            <Link className="button outline" to={`/lecturer/exams/${examId}/attempts`}>
              Hồ sơ lượt thi
            </Link>
            <Link className="button outline" to={`/lecturer/exams/${examId}/report`}>
              Báo cáo
            </Link>
          </>
        }
      />
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
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 border border-slate-200 rounded-xl">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Danh sách lượt thi</h2>
              <p className="text-xs text-slate-500">
                Tổng cộng {data.candidateStatuses.length} thí sinh. Ca thi ở trạng thái <strong>SẴN SÀNG</strong> sẽ cho phép sinh viên đăng nhập vào thi.
              </p>
            </div>
            {data.scheduledCount > 0 && (
              <Button
                type="button"
                variant="primary"
                onClick={() => setOpenAllConfirm(true)}
              >
                Mở tất cả ca đã xếp lịch ({data.scheduledCount})
              </Button>
            )}
          </div>

          <div className="monitoring-table-wrap">
            <table className="monitoring-table">
              <caption className="sr-only">Danh sách lượt thi</caption>
              <thead>
                <tr>
                  <th>SINH VIÊN</th>
                  <th>SLOT</th>
                  <th>TRẠNG THÁI</th>
                  <th>THỜI GIAN</th>
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
                      <div className="dialog-actions flex flex-wrap gap-2 items-center">
                        {candidate.status === "SCHEDULED" && (
                          <Button
                            type="button"
                            variant="primary"
                            onClick={() =>
                              setTarget({
                                attemptId: candidate.attemptId,
                                name: candidate.studentName,
                                action: "open",
                              })
                            }
                          >
                            Mở ca thi
                          </Button>
                        )}
                        {candidate.status === "READY" && (
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
                            Làm mới ca
                          </Button>
                        )}
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
                            Reset ca thi
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
        </div>
      )}

      {/* Dialog for Single Candidate Action */}
      <Dialog
        open={Boolean(target)}
        onClose={() => {
          if (!mutate.isPending) {
            mutate.reset();
            setTarget(null);
          }
        }}
        title={
          target?.action === "open"
            ? "Mở ca thi cho sinh viên?"
            : target?.action === "reset"
              ? "Reset lượt thi?"
              : "Đánh dấu vắng?"
        }
      >
        <p>
          {target?.action === "open"
            ? "Cho phép thí sinh "
            : target?.action === "reset"
              ? "Đưa lượt thi của "
              : "Ghi nhận vắng cho "}
          <strong>{target?.name}</strong>
          {target?.action === "open"
            ? " vào phòng thi (chuyển sang trạng thái SẴN SÀNG)?"
            : target?.action === "reset"
              ? " về trạng thái SẴN SÀNG để thi lại (xử lý sự cố mạng/thiết bị)?"
              : "?"}
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
            {target?.action === "open" ? "Xác nhận mở ca" : "Xác nhận"}
          </Button>
        </div>
      </Dialog>

      {/* Dialog for Bulk Open All Scheduled */}
      <Dialog
        open={openAllConfirm}
        onClose={() => {
          if (!isOpeningAll) {
            setOpenAllConfirm(false);
            setOpenAllError(null);
          }
        }}
        title="Mở tất cả ca thi đã xếp lịch?"
      >
        <p>
          Hệ thống sẽ chuyển <strong>{data.scheduledCount}</strong> ca thi từ trạng thái{" "}
          <strong>ĐÃ XẾP LỊCH</strong> sang <strong>SẴN SÀNG</strong>.
          <br />
          Sau khi mở ca, sinh viên có thể đăng nhập vào phòng thi ngay lập tức.
        </p>
        {openAllError && <Alert tone="danger">{openAllError}</Alert>}
        <div className="dialog-actions">
          <Button
            type="button"
            variant="outline"
            disabled={isOpeningAll}
            onClick={() => setOpenAllConfirm(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="primary"
            pending={isOpeningAll}
            onClick={handleOpenAllScheduled}
          >
            Xác nhận mở tất cả
          </Button>
        </div>
      </Dialog>
    </section>
  );
}

function MockMonitoring() {
  const { examId = '' } = useParams()
  const exam = useExam(examId)
  const overview = useAssessmentOverview(examId)
  if (exam.isPending || overview.isPending) return <LoadingPage label="Đang tải giám sát" />
  if (exam.isError || overview.isError) return <><ErrorState description="Không thể tải giám sát kỳ thi." /><Button onClick={() => { void exam.refetch(); void overview.refetch() }}>Thử lại</Button></>
  if (!exam.data) return <ErrorState description="Không tìm thấy kỳ thi." />
  const data = overview.data
  return <section className="source-screen max-w-7xl mx-auto space-y-6"><SourcePageHeader eyebrow="Khảo thí · Giám sát" title="Giám sát kỳ thi" description={exam.data.title} actions={<DemoLabel />} /><div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><SourceMetric label="THÍ SINH" value={data.total} /><SourceMetric label="ĐANG THI" value={data.active ?? 0} tone="amber" /><SourceMetric label="HOÀN TẤT" value={data.completed ?? 0} tone="emerald" /><SourceMetric label="CHỜ ĐẾN LƯỢT" value={data.total - (data.completed ?? 0) - (data.active ?? 0)} tone="slate" /></div><AttemptTable rows={data.rows} examId={examId} allowReview demo /></section>
}
