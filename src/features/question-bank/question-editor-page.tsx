import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  EmptyState,
  LoadingPage,
  PermissionDenied,
} from "../../components/common/states";
import { Alert, Button, Dialog } from "../../components/ui/primitives";
import {
  useQuestion,
  useSaveQuestion,
  useApiQuestion,
  useCreateApiQuestion,
  useUpdateApiQuestion,
  useApproveApiQuestion,
  useDeleteApiQuestion,
} from "./question-hooks";
import { readQuestionEditorDraft } from "./question-editor-draft";
import { QuestionEditorView } from "./views/QuestionEditorView";
import { useLecturerSubject } from "../subjects/subject-hooks";
import type { Rubric } from "../rubrics/rubric-types";
import { runtimeConfig } from "../../services/api/runtime-config";
import { useRubrics, useGlobalRubrics } from "../rubrics/rubric-hooks";
import { useSession } from "../../app/providers/use-session";
import { ApiError } from "../../services/api/client";
import { isUuid, type QuestionWriteInput } from "./api-question-repository";
import { type BloomLevel, type Question } from "./question-types";

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

function MockQuestionEditorForm({ subjectId, initial }: { subjectId: string; initial: Question | null }) {
  const navigate = useNavigate(), location = useLocation(), subject = useLecturerSubject(subjectId), rubrics = useGlobalRubrics(), save = useSaveQuestion()
  const resume = readQuestionEditorDraft(location.state)
  const [content, setContent] = useState(resume?.content ?? initial?.content ?? ''), [bloom, setBloom] = useState<BloomLevel | ''>(resume?.bloom ?? initial?.bloom ?? ''), [rubricId, setRubricId] = useState(resume?.rubricId ?? initial?.rubricId ?? ''), [errors, setErrors] = useState<Record<string, string>>({}), [dirty, setDirty] = useState(Boolean(resume)), [cancelOpen, setCancelOpen] = useState(false)
  useEffect(() => { const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault() }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn) }, [dirty])
  const submit = (event: FormEvent) => {
    event.preventDefault(); const next: Record<string, string> = {}
    if (!content.trim()) next.content = 'Nhập nội dung câu hỏi.'
    if (!bloom) next.bloom = 'Chọn mức Bloom.'
    setErrors(next); if (Object.keys(next).length) return
    const rubric = rubrics.data?.find(item => item.id === rubricId)
    save.mutate({ id: initial?.id ?? 'Q-' + crypto.randomUUID(), subjectId, content: content.trim(), bloom: bloom as BloomLevel, topic: initial?.topic ?? 'Chưa phân loại', suggestedAnswer: initial?.suggestedAnswer, rubricId: rubricId || undefined, rubric: rubric?.name, status: initial?.status ?? 'BẢN NHÁP', source: initial?.source ?? 'Thủ công' }, { onSuccess: () => { setDirty(false); navigate(listPath(subjectId)) } })
  }
  return <><QuestionEditorView title={initial ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi vấn đáp'} backTo={location.pathname} rubricReturnState={{ returnTo: location.pathname, questionDraft: { content, bloom, rubricId } }} courseLabel={subject.data ? subject.data.code + ' · ' + subject.data.name : 'Học phần đang chọn'} content={content} bloom={bloom} rubricId={rubricId} rubrics={rubrics.data ?? []} rubricLoading={rubrics.isLoading} rubricError={rubrics.isError} pending={save.isPending} errors={errors} onContent={value => { setContent(value); setDirty(true) }} onBloom={value => { setBloom(value); setDirty(true) }} onRubric={value => { setRubricId(value); setDirty(true) }} onSubmit={submit} onCancel={() => dirty ? setCancelOpen(true) : navigate(listPath(subjectId))} onRetryRubrics={() => { void rubrics.refetch() }} createRubric={<Link className="button outline" to="/lecturer/rubrics/new" state={{ returnTo: location.pathname, questionDraft: { content, bloom, rubricId } }}>Tạo Rubric mới</Link>} feedback={<>{save.isError && <Alert tone="danger">Không thể lưu câu hỏi. Vui lòng thử lại.</Alert>}</>} actions={null} /><Dialog open={cancelOpen} title="Rời trang soạn câu hỏi?" onClose={() => setCancelOpen(false)}><p>Các thay đổi chưa lưu sẽ bị mất.</p><div className="dialog-actions"><Button variant="outline" onClick={() => setCancelOpen(false)}>Ở lại</Button><Button onClick={() => navigate(listPath(subjectId))}>Rời trang</Button></div></Dialog></>
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
  rubrics: Rubric[];
  rubricLoading: boolean;
  rubricError: boolean;
  onRetryRubrics: () => void;
}) {
  const navigate = useNavigate();
  const { session } = useSession();
  const subject = useLecturerSubject(subjectId);
  const location = useLocation();
  const create = useCreateApiQuestion();
  const update = useUpdateApiQuestion();
  const approve = useApproveApiQuestion();
  const remove = useDeleteApiQuestion();
  const edit = Boolean(initial);
  const resume = readQuestionEditorDraft(location.state);
  const [content, setContent] = useState(resume?.content ?? initial?.content ?? "");
  const [bloom, setBloom] = useState<BloomLevel | "">(resume?.bloom ?? initial?.bloom ?? "");
  const [rubricId, setRubricId] = useState(resume?.rubricId ?? initial?.rubricId ?? "");
  const [dirty, setDirty] = useState(Boolean(resume));
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
    <>
      <QuestionEditorView title={edit ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi vấn đáp"} backTo={location.pathname} rubricReturnState={{ returnTo: location.pathname, questionDraft: { content, bloom, rubricId } }} courseLabel={subject.data ? subject.data.code + " · " + subject.data.name : "Học phần đang chọn"} content={content} bloom={bloom} rubricId={rubricId} rubrics={rubrics} rubricLoading={rubricLoading} rubricError={rubricError} pending={pending} errors={errors} onContent={value => updateField(setContent, value)} onBloom={value => updateField(next => setBloom(next as BloomLevel), value)} onRubric={value => updateField(setRubricId, value)} onSubmit={submit} onCancel={exit} onRetryRubrics={onRetryRubrics} createRubric={<Link className="button outline" to="/lecturer/rubrics/new" state={{ returnTo: location.pathname, questionDraft: { content, bloom, rubricId } }}>Tạo Rubric mới</Link>} feedback={<>{errors.auth && <Alert tone="danger">{errors.auth}</Alert>}{mutationError && <Alert tone="danger">{mutationError instanceof ApiError ? mutationError.message : "Không thể lưu câu hỏi. Vui lòng thử lại."}</Alert>}{approve.isError && <Alert tone="danger">Không thể duyệt câu hỏi. Vui lòng thử lại.</Alert>}{remove.isError && <Alert tone="danger">Không thể xoá câu hỏi. Vui lòng thử lại.</Alert>}</>} actions={edit ? <div className="dialog-actions"><Button type="button" pending={approve.isPending} disabled={dirty || pending || initial?.status !== "BẢN NHÁP"} onClick={() => approve.mutate({ subjectId, questionId: initial!.id })}>Duyệt câu hỏi</Button><Button type="button" variant="danger" disabled={pending} pending={remove.isPending} onClick={() => setConfirmDelete(true)}>Xoá câu hỏi</Button></div> : null} />
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
    </>
  );
}
