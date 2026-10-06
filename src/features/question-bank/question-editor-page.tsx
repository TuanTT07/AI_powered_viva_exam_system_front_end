import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  EmptyState,
  LoadingPage,
  PermissionDenied,
} from "../../components/common/states";
import { Alert, Button, Dialog, Input } from "../../components/ui/primitives";
import {
  useQuestion,
  useQuestionTopics,
  useSaveQuestion,
  useApiQuestion,
  useCreateApiQuestion,
  useUpdateApiQuestion,
  useApproveApiQuestion,
  useDeleteApiQuestion,
} from "./question-hooks";
import { runtimeConfig } from "../../services/api/runtime-config";
import { useRubrics } from "../rubrics/rubric-hooks";
import { useSession } from "../../app/providers/use-session";
import { ApiError } from "../../services/api/client";
import { isUuid, type QuestionWriteInput } from "./api-question-repository";
import { bloomLevels, type BloomLevel, type Question } from "./question-types";

const listPath = (subjectId: string) =>
  `/lecturer/subjects/${subjectId}/questions`;

export function QuestionEditorPage() {
  const { subjectId = "", questionId } = useParams();
  return runtimeConfig.dataSource === "api" ? (
    <ApiQuestionEditorPage subjectId={subjectId} questionId={questionId} />
  ) : (
    <MockQuestionEditorPage subjectId={subjectId} questionId={questionId} />
  );
}

function MockQuestionEditorPage({
  subjectId,
  questionId,
}: {
  subjectId: string;
  questionId?: string;
}) {
  const query = useQuestion(subjectId, questionId);
  if (!subjectId)
    return (
      <EmptyState
        title="Thiếu học phần"
        description="Không thể xác định học phần để soạn câu hỏi."
      />
    );
  if (questionId && query.isLoading)
    return <LoadingPage label="Đang tải câu hỏi" />;
  if (questionId && query.isError)
    return (
      <section className="state">
        <Alert tone="danger">Không thể tải câu hỏi.</Alert>
        <Button onClick={() => query.refetch()}>Thử lại</Button>
      </section>
    );
  if (questionId && !query.data)
    return (
      <section className="state">
        <h1>Không tìm thấy câu hỏi</h1>
        <Link className="button outline" to={listPath(subjectId)}>
          Về ngân hàng câu hỏi
        </Link>
      </section>
    );
  return (
    <MockQuestionEditorForm
      key={questionId ?? "new"}
      subjectId={subjectId}
      initial={query.data ?? null}
    />
  );
}

function MockQuestionEditorForm({
  subjectId,
  initial,
}: {
  subjectId: string;
  initial: Question | null;
}) {
  const navigate = useNavigate();
  const topics = useQuestionTopics(subjectId);
  const save = useSaveQuestion();
  const [form, setForm] = useState({
    topic: initial?.topic ?? "",
    bloom: initial?.bloom ?? "",
    duration: "3",
    content: initial?.content ?? "",
    answer: initial?.suggestedAnswer ?? "",
  });
  const [error, setError] = useState("");
  const edit = Boolean(initial);
  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.topic || !form.bloom || !form.content.trim()) {
      setError("Hoàn tất chủ đề, mức Bloom và nội dung câu hỏi trước khi lưu.");
      return;
    }
    const question: Question = {
      id: initial?.id ?? `Q-${subjectId.toUpperCase()}-${crypto.randomUUID()}`,
      subjectId,
      content: form.content.trim(),
      topic: form.topic,
      bloom: form.bloom as BloomLevel,
      suggestedAnswer: form.answer.trim() || undefined,
      rubricId: initial?.rubricId,
      rubric: initial?.rubric,
      source: initial?.source ?? "Thủ công",
      status: initial?.status ?? "BẢN NHÁP",
    };
    save.mutate(question, { onSuccess: () => navigate(listPath(subjectId)) });
  };
  return (
    <section className="question-editor">
      <EditorHeader
        subjectId={subjectId}
        title={
          edit ? "Soạn thảo câu hỏi & Thiết lập Rubric" : "Tạo câu hỏi vấn đáp"
        }
      />
      <form onSubmit={submit} noValidate>
        <section>
          <h2>Thông tin câu hỏi</h2>
          <p className="eyebrow">MÔN HỌC · {subjectId}</p>
          <label>
            Chủ đề chuyên môn
            <select
              value={form.topic}
              onChange={(event) => update("topic", event.target.value)}
            >
              <option value="">Chọn chủ đề</option>
              {(topics.data ?? []).map((topic) => (
                <option key={topic}>{topic}</option>
              ))}
            </select>
          </label>
          <BloomSelect
            value={form.bloom}
            onChange={(value) => update("bloom", value)}
          />
          <label>
            Thời gian trả lời (phút)
            <Input
              min="1"
              onChange={(event) => update("duration", event.target.value)}
              type="number"
              value={form.duration}
            />
          </label>
          <label>
            Nội dung câu hỏi phát vấn
            <textarea
              onChange={(event) => update("content", event.target.value)}
              value={form.content}
            />
          </label>
          <label>
            Đáp án cốt lõi & ý chính bắt buộc
            <textarea
              onChange={(event) => update("answer", event.target.value)}
              value={form.answer}
            />
          </label>
        </section>
        {error && <Alert tone="danger">{error}</Alert>}
        <EditorFooter
          pending={save.isPending}
          label={edit ? "Lưu thay đổi" : "Lưu câu hỏi"}
          onCancel={() => navigate(listPath(subjectId))}
        />
      </form>
    </section>
  );
}

export function ApiQuestionEditorPage({
  subjectId,
  questionId,
}: {
  subjectId: string;
  questionId?: string;
}) {
  const query = useApiQuestion(subjectId, questionId);
  const rubrics = useRubrics(subjectId);
  const location = useLocation();
  if (!subjectId || !isUuid(subjectId))
    return (
      <section className="state">
        <h2>Không tìm thấy dữ liệu yêu cầu</h2>
        <p>Vui lòng chọn một học phần hợp lệ để tiếp tục.</p>
        <Link className="button outline" to="/lecturer/subjects">
          Chọn học phần
        </Link>
      </section>
    );
  if (questionId && !isUuid(questionId))
    return (
      <section className="state">
        <h2>Không tìm thấy câu hỏi</h2>
        <p>Vui lòng quay lại ngân hàng câu hỏi và chọn lại.</p>
        <Link className="button outline" to={listPath(subjectId)}>
          Về ngân hàng câu hỏi
        </Link>
      </section>
    );
  if (questionId && query.isLoading)
    return <LoadingPage label="Đang tải câu hỏi" />;
  if (questionId && query.isError)
    return (
      <section className="state">
        <Alert tone="danger">
          {query.error instanceof Error
            ? query.error.message
            : "Không thể tải câu hỏi."}
        </Alert>
        <Button onClick={() => query.refetch()}>Thử lại</Button>
      </section>
    );
  if (questionId && !query.data)
    return (
      <section className="state">
        <h1>Không tìm thấy câu hỏi</h1>
        <Link className="button outline" to={listPath(subjectId)}>
          Về ngân hàng câu hỏi
        </Link>
      </section>
    );
  return (
    <>
      <div className="question-editor-rubric-link">
        <Link
          className="button outline"
          to="/lecturer/rubrics/new"
          state={{ returnTo: location.pathname }}
        >
          Tạo Rubric mới
        </Link>
      </div>
      <ApiQuestionForm
        key={questionId ?? "new"}
        subjectId={subjectId}
        initial={query.data ?? null}
        rubrics={rubrics.data ?? []}
        rubricLoading={rubrics.isLoading}
        rubricError={rubrics.isError}
        onRetryRubrics={() => rubrics.refetch()}
      />
    </>
  );
}

function ApiQuestionForm({
  subjectId,
  initial,
  rubrics,
  rubricLoading,
  rubricError,
  onRetryRubrics,
}: {
  subjectId: string;
  initial: Question | null;
  rubrics: { id: string; name: string }[];
  rubricLoading: boolean;
  rubricError: boolean;
  onRetryRubrics: () => void;
}) {
  const navigate = useNavigate();
  const { session } = useSession();
  const create = useCreateApiQuestion();
  const update = useUpdateApiQuestion();
  const approve = useApproveApiQuestion();
  const remove = useDeleteApiQuestion();
  const edit = Boolean(initial);
  const [content, setContent] = useState(initial?.content ?? "");
  const [bloom, setBloom] = useState<BloomLevel | "">(initial?.bloom ?? "");
  const [rubricId, setRubricId] = useState(initial?.rubricId ?? "");
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const updateField = (setter: (value: string) => void, value: string) => {
    setter(value);
    setDirty(true);
    setErrors({});
  };
  const exit = () =>
    dirty ? setConfirmCancel(true) : navigate(listPath(subjectId));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!content.trim()) next.content = "Nhập nội dung câu hỏi.";
    if (!bloom) next.bloom = "Chọn mức Bloom.";
    if (!session.user)
      next.auth = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    else if (!isUuid(session.user.id))
      next.auth = "Không xác định được tài khoản đăng nhập. Vui lòng đăng nhập lại.";
    if (!session.user?.roles.includes("lecturer"))
      next.auth = "Tài khoản không có quyền giảng viên.";
    if (rubricId && !isUuid(rubricId))
      next.rubric = "Vui lòng chọn một Rubric hợp lệ.";
    setErrors(next);
    if (Object.keys(next).length) return;
    const input: QuestionWriteInput = {
      courseId: subjectId,
      rubricId: rubricId || null,
      createdById: initial?.createdById ?? session.user!.id,
      content: content.trim(),
      bloomLevel: bloom as BloomLevel,
      aiGenerated: initial?.aiGenerated ?? false,
    };
    const onSuccess = () => {
      setDirty(false);
      navigate(listPath(subjectId));
    };
    if (edit) update.mutate({ questionId: initial!.id, input }, { onSuccess });
    else create.mutate(input, { onSuccess });
  };
  const pending = create.isPending || update.isPending;
  const mutationError = create.error ?? update.error;
  const deleteQuestion = () => {
    if (initial)
      remove.mutate(
        { subjectId, questionId: initial.id },
        { onSuccess: () => navigate(listPath(subjectId)) },
      );
  };
  if (session.status === "loading")
    return <LoadingPage label="Đang xác minh phiên đăng nhập" />;
  if (!session.user || !session.user.roles.includes("lecturer"))
    return <PermissionDenied />;
  return (
    <section className="question-editor">
      <EditorHeader
        subjectId={subjectId}
        title={edit ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi vấn đáp"}
      />
      <Alert tone="info">
        Câu hỏi mới sẽ được lưu ở trạng thái bản nháp để bạn kiểm tra trước khi
        duyệt.
      </Alert>
      <form onSubmit={submit} noValidate>
        <section>
          <h2>{edit ? "Cập nhật câu hỏi" : "Thông tin câu hỏi"}</h2>
          {edit && (
            <p className="form-help">
              Trạng thái hiện tại: <strong>{initial?.status}</strong> ·{" "}
              {initial?.aiGenerated ? "AI đề xuất" : "Thủ công"}
            </p>
          )}
          <label htmlFor="question-content">
            Nội dung câu hỏi
            <textarea
              aria-describedby={errors.content ? "content-error" : undefined}
              aria-invalid={Boolean(errors.content)}
              id="question-content"
              value={content}
              onChange={(event) => updateField(setContent, event.target.value)}
            />
          </label>
          {errors.content && (
            <p className="field-error" id="content-error">
              {errors.content}
            </p>
          )}
          <BloomSelect
            value={bloom}
            error={errors.bloom}
            onChange={(value) =>
              updateField((next) => setBloom(next as BloomLevel), value)
            }
          />
          <label htmlFor="question-rubric">
            Rubric{rubricLoading && " · đang tải"}
            <select
              aria-invalid={Boolean(errors.rubric)}
              id="question-rubric"
              value={rubricId}
              onChange={(event) => updateField(setRubricId, event.target.value)}
            >
              <option value="">Không gắn rubric</option>
              {rubrics.map((rubric) => (
                <option key={rubric.id} value={rubric.id}>
                  {rubric.name}
                </option>
              ))}
            </select>
          </label>
          {rubricError && (
            <Alert tone="danger">
              Không thể tải danh mục Rubric.{" "}
              <Button type="button" variant="outline" onClick={onRetryRubrics}>
                Thử lại
              </Button>
            </Alert>
          )}
          {errors.auth && <Alert tone="danger">{errors.auth}</Alert>}
          {mutationError && (
            <Alert tone="danger">
              {mutationError instanceof ApiError
                ? mutationError.message
                : "Không thể lưu câu hỏi. Vui lòng thử lại."}
            </Alert>
          )}
          {approve.isError && (
            <Alert tone="danger">
              Không thể duyệt câu hỏi. Vui lòng thử lại.
            </Alert>
          )}
          {remove.isError && (
            <Alert tone="danger">
              Không thể xoá câu hỏi. Vui lòng thử lại.
            </Alert>
          )}
          <p className="form-help">
            Bạn có thể gắn Rubric để thống nhất tiêu chí chấm điểm cho câu hỏi.
          </p>
        </section>
        {edit && (
          <div className="dialog-actions">
            <Button
              type="button"
              pending={approve.isPending}
              disabled={initial?.status !== "BẢN NHÁP"}
              onClick={() =>
                approve.mutate({ subjectId, questionId: initial!.id })
              }
            >
              Duyệt câu hỏi
            </Button>
            <Button
              type="button"
              variant="danger"
              pending={remove.isPending}
              onClick={() => setConfirmDelete(true)}
            >
              Xoá câu hỏi
            </Button>
          </div>
        )}
        <EditorFooter
          pending={pending}
          label={edit ? "Lưu thay đổi" : "Lưu bản nháp"}
          onCancel={exit}
        />
      </form>
      <Dialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Rời trang soạn câu hỏi?"
      >
        <p>Các thay đổi chưa lưu sẽ bị mất.</p>
        <div className="dialog-actions">
          <Button
            type="button"
            variant="outline"
            onClick={() => setConfirmCancel(false)}
          >
            Ở lại
          </Button>
          <Button type="button" onClick={() => navigate(listPath(subjectId))}>
            Rời trang
          </Button>
        </div>
      </Dialog>
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Xác nhận xoá câu hỏi"
      >
        <p>Thao tác này không thể hoàn tác.</p>
        <div className="dialog-actions">
          <Button
            type="button"
            variant="outline"
            onClick={() => setConfirmDelete(false)}
          >
            Huỷ
          </Button>
          <Button
            type="button"
            variant="danger"
            pending={remove.isPending}
            onClick={deleteQuestion}
          >
            Xoá câu hỏi
          </Button>
        </div>
      </Dialog>
    </section>
  );
}

function EditorHeader({
  subjectId,
  title,
}: {
  subjectId: string;
  title: string;
}) {
  return (
    <header className="qe-head">
      <div>
        <p className="eyebrow">QUESTION BANK · {subjectId}</p>
        <h1>{title}</h1>
        <p>Soạn nội dung, mức độ tư duy Bloom và rubric đánh giá.</p>
      </div>
      <Link className="button outline" to={listPath(subjectId)}>
        Quay lại
      </Link>
    </header>
  );
}
function BloomSelect({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <label htmlFor="question-bloom">
      Mức độ nhận thức (Bloom)
      <select
        aria-describedby={error ? "bloom-error" : undefined}
        aria-invalid={Boolean(error)}
        id="question-bloom"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Chọn mức Bloom</option>
        {bloomLevels.map((level) => (
          <option key={level}>{level}</option>
        ))}
      </select>
      {error && (
        <span className="field-error" id="bloom-error">
          {error}
        </span>
      )}
    </label>
  );
}
function EditorFooter({
  pending,
  label,
  onCancel,
}: {
  pending: boolean;
  label: string;
  onCancel: () => void;
}) {
  return (
    <footer>
      <Button type="button" variant="outline" onClick={onCancel}>
        Hủy bỏ
      </Button>
      <Button pending={pending} type="submit">
        {label}
      </Button>
    </footer>
  );
}
