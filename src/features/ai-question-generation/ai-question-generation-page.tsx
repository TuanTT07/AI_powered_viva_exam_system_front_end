import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Layers,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  EmptyState,
  LoadingPage,
  StatusBadge,
} from "../../components/common/states";
import {
  Alert,
  Badge,
  Button,
  Dialog,
  Input,
  Spinner,
} from "../../components/ui/primitives";
import { useMaterials } from "../learning-materials/material-hooks";
import { questionKeys, useQuestionTopics } from "../question-bank/question-hooks";
import { useRubrics } from "../rubrics/rubric-hooks";
import type { BloomLevel, Question } from "../question-bank/question-types";
import {
  type GeneratedQuestion,
  type GenerationLanguage,
  type GenerationRequest,
} from "./generation-types";
import {
  useApiGenerateQuestions,
  useGenerateQuestions,
  useSaveGeneratedQuestions,
} from "./generation-hooks";
import {
  validateGenerationRequest,
  validateGeneratedQuestions,
} from "./generation-validation";
import "./ai-question-generation.css";
import { runtimeConfig } from "../../services/api/runtime-config";
import type { QuestionApiBloomLevel } from "../question-bank/api-question-repository";
import { useExams, examKeys } from "../exams/exam-hooks";
import { examStatusMeta } from "../exams/exam-types";
import { examRepository } from "../exams/exam-repository";
import { questionRepository } from "../question-bank/question-repository";

const blooms: BloomLevel[] = [
  "NHỚ",
  "HIỂU",
  "VẬN DỤNG",
  "PHÂN TÍCH",
  "ĐÁNH GIÁ",
  "SÁNG TẠO",
];

const bloomToApiMap: Record<string, QuestionApiBloomLevel> = {
  NHỚ: "REMEMBER",
  HIỂU: "UNDERSTAND",
  "VẬN DỤNG": "APPLY",
  "PHÂN TÍCH": "ANALYZE",
  "ĐÁNH GIÁ": "EVALUATE",
  "SÁNG TẠO": "CREATE",
};

export function AIQuestionGenerationPage() {
  const isApi = runtimeConfig.dataSource === "api";
  const { subjectId = "" } = useParams();
  const navigate = useNavigate();
  const materials = useMaterials(subjectId);
  const topics = useQuestionTopics(subjectId);
  const rubrics = useRubrics(subjectId);
  const mockGenerate = useGenerateQuestions();
  const apiGenerate = useApiGenerateQuestions();
  const save = useSaveGeneratedQuestions();

  const isPending = mockGenerate.isPending || apiGenerate.isPending;

  const [form, setForm] = useState({
    materialIds: [] as string[],
    topic: "",
    bloom: "HIỂU" as BloomLevel | "",
    count: "5",
    language: "vi" as GenerationLanguage,
    rubricId: "",
  });
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const examsQuery = useExams({
    page: 1,
    pageSize: 100,
    q: "",
    subject: subjectId,
    status: "",
  });
  const allExamsQuery = useExams({
    page: 1,
    pageSize: 100,
    q: "",
    subject: "",
    status: "",
  });
  const rawExams = examsQuery.data?.items?.length
    ? examsQuery.data.items
    : (allExamsQuery.data?.items ?? []);
  const availableExams = rawExams.filter(
    (exam) => exam.subjectId === subjectId || !examsQuery.data?.items?.length,
  );

  const [selectedExamId, setSelectedExamId] = useState("");
  const [assigningPending, setAssigningPending] = useState(false);
  const [assignedSuccess, setAssignedSuccess] = useState<{
    examId: string;
    examTitle: string;
    count: number;
  } | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);

  const readyMaterials = (materials.data ?? []).filter(
    (material) =>
      material.status === "READY" && (!material.subjectId || material.subjectId === subjectId),
  );

  const request: GenerationRequest = {
    subjectId,
    materialIds: form.materialIds.length || isApi ? form.materialIds : readyMaterials.slice(0, 5).map(item => item.id),
    topic: form.topic,
    bloom: (form.bloom || "HIỂU") as BloomLevel,
    count: Number(form.count) || 1,
    language: form.language,
    rubricId: form.rubricId || undefined,
  };

  const update = (key: keyof typeof form, value: string | string[]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSaveSuccess(null);

    if (isApi) {
      const fieldErrors: Record<string, string> = {};
      const countNum = Number(form.count);
      if (!countNum || countNum < 1 || countNum > 20) {
        fieldErrors.count = "Số lượng câu hỏi phải từ 1 đến 20.";
      }
      if (!form.bloom) {
        fieldErrors.bloom = "Vui lòng chọn mức Bloom.";
      }
      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).length || isPending) return;

      apiGenerate.mutate(
        {
          courseId: subjectId,
          request: {
            count: countNum,
            topic: form.topic.trim() || undefined,
            bloomLevels: form.bloom ? [bloomToApiMap[form.bloom] || "UNDERSTAND"] : undefined,
            rubricId: form.rubricId || undefined,
            documentIds: form.materialIds.length > 0 ? form.materialIds : undefined,
          },
        },
        {
          onSuccess: (result) => {
            const mapped: GeneratedQuestion[] = result.map((q) => ({
              id: q.id,
              content: q.content,
              topic: q.topic || form.topic || "Chưa phân loại",
              bloom: q.bloom,
              suggestedAnswer: q.suggestedAnswer,
              rubricId: q.rubricId,
              sourceMaterialIds: form.materialIds,
              sourceMaterialNames: readyMaterials
                .filter((item) => request.materialIds.includes(item.id))
                .map((item) => item.filename),
              selected: true,
              issues: [],
            }));
            setQuestions(mapped);
            setSaveSuccess(result.length);
          },
          onError: (err: any) => {
            setErrors({
              generation:
                err?.message || "Không thể tạo câu hỏi từ máy chủ. Cấu hình vẫn được giữ để thử lại.",
            });
          },
        },
      );
      return;
    }

    const next = validateGenerationRequest(
      request,
      materials.data ?? [],
      topics.data ?? [],
      rubrics.data ?? [],
    );
    setErrors(next);
    if (Object.keys(next).length || isPending) return;

    mockGenerate.mutate(
      {
        request,
        materialNames: readyMaterials
          .filter((item) => request.materialIds.includes(item.id))
          .map((item) => item.filename),
      },
      {
        onSuccess: (result) => setQuestions(result),
        onError: () =>
          setErrors({
            generation: "Không thể tạo câu hỏi. Cấu hình vẫn được giữ để thử lại.",
          }),
      },
    );
  };

  const replace = () => {
    setConfirmReplace(false);
    setQuestions([]);
  };

  const changeQuestion = (
    id: string,
    key: "content" | "suggestedAnswer",
    value: string,
  ) =>
    setQuestions((current) =>
      validateGeneratedQuestions(
        current.map((question) =>
          question.id === id ? { ...question, [key]: value } : question,
        ),
      ),
    );

  const saveable = questions.filter(
    (question) => question.selected && !question.issues.length,
  );

  const targetExam = availableExams.find((e) => e.id === selectedExamId);

  const handleAssignToExam = async () => {
    if (!selectedExamId || !saveable.length || assigningPending) return;
    setAssigningPending(true);
    setAssignError(null);
    setAssignedSuccess(null);

    try {
      const examToUpdate = availableExams.find((e) => e.id === selectedExamId);
      if (!examToUpdate) throw new Error("Không tìm thấy kỳ thi đã chọn.");

      if (!isApi) {
        // 1. Lưu câu hỏi vào ngân hàng với trạng thái ĐÃ DUYỆT để hợp lệ gán vào kỳ thi
        const approvedQuestions: Question[] = saveable.map((q) => ({
          id: `Q-${subjectId.toUpperCase()}-${crypto.randomUUID().slice(0, 8)}`,
          subjectId,
          content: q.content,
          topic: q.topic || "AI Generated",
          bloom: q.bloom,
          suggestedAnswer: q.suggestedAnswer,
          rubric: q.rubricId ? "Theo rubric đã gắn" : undefined,
          source: "AI đề xuất" as const,
          status: "ĐÃ DUYỆT" as const,
        }));

        for (const q of approvedQuestions) {
          await questionRepository.save(q);
        }

        // 2. Lấy cấu hình câu hỏi hiện tại của kỳ thi và kết hợp
        const currentConfig = await examRepository.getQuestionConfig(selectedExamId);
        const existingIds = currentConfig?.questionIds ?? [];
        const newIds = approvedQuestions.map((q) => q.id);
        const mergedIds = Array.from(new Set([...existingIds, ...newIds]));

        // 3. Đảm bảo số lượng câu hỏi đạt chuẩn tối thiểu cho kỳ thi
        const requiredCount = examToUpdate.mainQuestionCount || 4;
        let finalQuestionIds = mergedIds;
        if (finalQuestionIds.length < requiredCount) {
          const existingApproved = (await questionRepository.list(examToUpdate.subjectId || subjectId))
            .filter((q) => q.status === "ĐÃ DUYỆT" && !finalQuestionIds.includes(q.id))
            .map((q) => q.id);
          finalQuestionIds = [...finalQuestionIds, ...existingApproved].slice(0, requiredCount);
        }

        const nextMode = finalQuestionIds.length > requiredCount ? "RANDOM_POOL" : (currentConfig?.mode ?? "MANUAL");
        await examRepository.saveQuestionConfig(selectedExamId, {
          mode: nextMode,
          questionIds: finalQuestionIds,
        });

        queryClient.invalidateQueries({ queryKey: examKeys.questionConfig(selectedExamId) });
        queryClient.invalidateQueries({ queryKey: examKeys.detail(selectedExamId) });
        queryClient.invalidateQueries({ queryKey: questionKeys.list(subjectId) });
        queryClient.invalidateQueries({ queryKey: ["lecturer-subjects"] });

        setAssignedSuccess({
          examId: selectedExamId,
          examTitle: examToUpdate.title,
          count: saveable.length,
        });

        // Bỏ chọn các câu hỏi đã gán thành công
        const savedContentSet = new Set(saveable.map((q) => q.content));
        setQuestions((current) =>
          current.map((q) =>
            savedContentSet.has(q.content) ? { ...q, selected: false } : q,
          ),
        );
      } else {
        save.mutateGenerated(subjectId, saveable, {
          onSuccess: () => {
            setAssignedSuccess({
              examId: selectedExamId,
              examTitle: examToUpdate.title,
              count: saveable.length,
            });
            setQuestions([]);
          },
          onError: (err) => {
            setAssignError(err.message || "Không thể gán câu hỏi vào kỳ thi.");
          },
        });
      }
    } catch (err: any) {
      setAssignError(err?.message || "Không thể gán câu hỏi vào kỳ thi đã chọn.");
    } finally {
      setAssigningPending(false);
    }
  };

  if (!subjectId)
    return (
      <EmptyState
        title="Thiếu học phần"
        description="Không thể xác định học phần để sinh câu hỏi."
      />
    );

  if (materials.isLoading || topics.isLoading || rubrics.isLoading)
    return <LoadingPage label="Đang tải dữ liệu học phần" />;

  if (materials.isError || topics.isError || rubrics.isError)
    return (
      <section className="state">
        <Alert tone="danger">
          Không thể tải đủ dữ liệu học phần để sinh câu hỏi.
        </Alert>
        <Button
          onClick={() => {
            void materials.refetch();
            void topics.refetch();
            void rubrics.refetch();
          }}
        >
          Thử lại
        </Button>
      </section>
    );

  return (
    <section className="ai-generation-page">
      <header className="ai-generation-head">
        <div>
          <p className="eyebrow">NGÂN HÀNG CÂU HỎI · SOẠN NHÁP AI</p>
          <h1>Sinh câu hỏi AI</h1>
          <p>
            Cấu hình nguồn học liệu và rà soát câu hỏi nháp trước khi đưa vào
            ngân hàng câu hỏi của học phần.
          </p>
        </div>
        <Link
          className="button outline"
          to={`/lecturer/subjects/${subjectId}/questions`}
        >
          Về ngân hàng câu hỏi
        </Link>
      </header>
      <div className="ai-generation-grid">
        <form className="generation-config" noValidate onSubmit={submit}>
          <section>
            <h2>1. Cấu hình nguồn</h2>
            <p className="form-help">
              Chỉ học liệu đã ở trạng thái Sẵn sàng (READY) mới có thể làm nguồn. {isApi ? 'Nếu không chọn tài liệu nào, hệ thống sẽ sử dụng học liệu sẵn sàng theo cấu hình máy chủ.' : 'Nếu không chọn tài liệu nào, demo sẽ sử dụng tối đa 5 học liệu sẵn sàng đầu tiên của môn.'}
            </p>
            <fieldset>
              <legend>
                Tài liệu nguồn <span>({form.materialIds.length}/5)</span>
              </legend>
              {!readyMaterials.length ? (
                <div className="no-ready-material">
                  <strong>Chưa có tài liệu sẵn sàng</strong>
                  <p>
                    Hãy tải lên và chờ học liệu xử lý xong (READY) trước khi sinh câu hỏi.
                  </p>
                  <Link
                    className="button outline"
                    to={`/lecturer/subjects/${subjectId}/materials`}
                  >
                    Mở Học liệu
                  </Link>
                </div>
              ) : (
                readyMaterials.map((material) => (
                  <label className="material-choice" key={material.id}>
                    <input
                      checked={form.materialIds.includes(material.id)}
                      disabled={
                        !form.materialIds.includes(material.id) &&
                        form.materialIds.length >= 5
                      }
                      onChange={(event) =>
                        update(
                          "materialIds",
                          event.target.checked
                            ? [...form.materialIds, material.id]
                            : form.materialIds.filter(
                                (id) => id !== material.id,
                              ),
                        )
                      }
                      type="checkbox"
                    />
                    <span>
                      <strong>{material.filename}</strong>
                      <small>
                        <Badge tone="success">Sẵn sàng</Badge>
                      </small>
                    </span>
                  </label>
                ))
              )}
            </fieldset>
            {errors.materials && (
              <p className="field-error">{errors.materials}</p>
            )}
          </section>
          <section>
            <h2>2. Tùy chọn câu hỏi</h2>
            <label>
              Chủ đề (tùy chọn)
              {isApi ? (
                <Input
                  placeholder="Ví dụ: Lập trình Java hướng đối tượng"
                  value={form.topic}
                  onChange={(event) => update("topic", event.target.value)}
                />
              ) : (
                <select
                  aria-invalid={Boolean(errors.topic)}
                  value={form.topic}
                  onChange={(event) => update("topic", event.target.value)}
                >
                  <option value="">Chọn chủ đề</option>
                  {(topics.data ?? []).map((topic) => (
                    <option key={topic}>{topic}</option>
                  ))}
                </select>
              )}
            </label>
            {errors.topic && <p className="field-error">{errors.topic}</p>}
            <fieldset>
              <legend>Mức Bloom</legend>
              <div className="bloom-options">
                {blooms.map((bloom) => (
                  <label key={bloom}>
                    <input
                      checked={form.bloom === bloom}
                      onChange={() => update("bloom", bloom)}
                      type="radio"
                    />
                    {bloom}
                  </label>
                ))}
              </div>
            </fieldset>
            {errors.bloom && <p className="field-error">{errors.bloom}</p>}
            <label>
              Số lượng câu hỏi (1 - 20)
              <Input
                aria-invalid={Boolean(errors.count)}
                max="20"
                min="1"
                onChange={(event) => update("count", event.target.value)}
                type="number"
                value={form.count}
              />
            </label>
            {errors.count && <p className="field-error">{errors.count}</p>}
            {!isApi && (
              <label>
                Ngôn ngữ
                <select
                  value={form.language}
                  onChange={(event) => update("language", event.target.value)}
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </label>
            )}
            <label>
              Rubric (tuỳ chọn)
              <select
                aria-invalid={Boolean(errors.rubric)}
                value={form.rubricId}
                onChange={(event) => update("rubricId", event.target.value)}
              >
                <option value="">Không gắn rubric</option>
                {(rubrics.data ?? [])
                  .filter((rubric) => !rubric.subjectId || rubric.subjectId === subjectId)
                  .map((rubric) => (
                    <option key={rubric.id} value={rubric.id}>
                      {rubric.name}
                    </option>
                  ))}
              </select>
            </label>
            {errors.rubric && <p className="field-error">{errors.rubric}</p>}
          </section>
          {errors.generation && (
            <Alert tone="danger">{errors.generation}</Alert>
          )}
          {isPending && (
            <div className="generation-pending" aria-live="polite">
              <Spinner label="Đang sinh câu hỏi với Gemini" /> Đang gửi yêu cầu sinh câu hỏi RAG tới AI (có thể mất 30–60 giây)…
            </div>
          )}
          <Button
            disabled={isPending || !readyMaterials.length}
            pending={isPending}
            type="submit"
          >
            Sinh {form.count || 0} câu hỏi bằng AI
          </Button>
        </form>
        <section className="generation-review" aria-labelledby="review-title">
          <div className="review-head">
            <div>
              <p className="eyebrow">RÀ SOÁT · CÂU HỎI NHÁP</p>
              <h2 id="review-title">Rà soát câu hỏi sinh bởi AI</h2>
            </div>
            {questions.length > 0 && (
              <span>
                {saveable.length}/{questions.length} được chọn
              </span>
            )}
          </div>
          {saveSuccess !== null && (
            <Alert tone="success">
              Đã sinh {saveSuccess} câu hỏi thành công ở trạng thái <strong>BẢN NHÁP (DRAFT)</strong> trên hệ thống. Giảng viên vui lòng rà soát và duyệt trước khi dùng cho kỳ thi.{" "}
              <Link to={`/lecturer/subjects/${subjectId}/questions`}>
                Xem trong Ngân hàng câu hỏi →
              </Link>
            </Alert>
          )}
          {!questions.length ? (
            <div className="review-empty">
              <h3>Chưa có batch câu hỏi</h3>
              <p>Cấu hình nguồn ở bên trái để bắt đầu tạo câu hỏi nháp bằng AI.</p>
            </div>
          ) : (
            <>
              {/* Quick Exam Assignment Card */}
              <div className="exam-quick-assign-card">
                <div className="exam-quick-assign-header">
                  <div className="exam-quick-assign-badge">
                    <Sparkles size={13} />
                    <span>CHỌN NHANH KỲ THI MONG MUỐN</span>
                  </div>
                  <h3 className="exam-quick-assign-title">
                    Gán câu hỏi trực tiếp vào kỳ thi
                  </h3>
                  <p className="exam-quick-assign-desc">
                    Tự động phê duyệt và đưa các câu hỏi AI đã chọn vào ngân hàng câu hỏi của ca thi.
                  </p>
                </div>

                <div className="exam-quick-assign-body">
                  <div className="exam-quick-assign-row">
                    <div className="exam-quick-select-wrap">
                      <label className="sr-only" htmlFor="quick-target-exam">
                        Chọn kỳ thi mong muốn
                      </label>
                      <select
                        id="quick-target-exam"
                        aria-label="Chọn kỳ thi mong muốn"
                        value={selectedExamId}
                        onChange={(e) => {
                          setSelectedExamId(e.target.value);
                          setAssignError(null);
                        }}
                        className="exam-quick-select"
                      >
                        <option value="">-- Chọn kỳ thi mong muốn gán câu hỏi --</option>
                        {availableExams.map((exam) => (
                          <option key={exam.id} value={exam.id}>
                            {exam.title} ({exam.id} · {examStatusMeta[exam.status]?.label ?? exam.status})
                          </option>
                        ))}
                      </select>
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      disabled={!selectedExamId || !saveable.length || assigningPending}
                      pending={assigningPending}
                      onClick={handleAssignToExam}
                      className="exam-assign-btn"
                    >
                      <Send size={14} />
                      <span>Gán {saveable.length} câu vào kỳ thi này</span>
                    </Button>
                  </div>

                  {targetExam && (
                    <div className="target-exam-quick-meta">
                      <span className="exam-meta-tag">
                        <Calendar size={12} />
                        <span>{targetExam.title}</span>
                      </span>
                      <span className="exam-meta-tag">
                        <Layers size={12} />
                        <span>Cần: {targetExam.mainQuestionCount} câu chính</span>
                      </span>
                      <StatusBadge
                        label={examStatusMeta[targetExam.status]?.label ?? targetExam.status}
                        tone={examStatusMeta[targetExam.status]?.tone ?? "neutral"}
                      />
                    </div>
                  )}

                  {assignError && <Alert tone="danger">{assignError}</Alert>}

                  {assignedSuccess && (
                    <div className="exam-assigned-success-banner">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-semibold text-emerald-950">
                            Đã gán thành công {assignedSuccess.count} câu hỏi vào kỳ thi “{assignedSuccess.examTitle}”!
                          </p>
                          <p className="text-xs text-emerald-800">
                            Các câu hỏi đã được phê duyệt và cập nhật ngay vào cấu hình đề thi của ca vấn đáp.
                          </p>
                          <div className="pt-1 flex items-center gap-3">
                            <Link
                              className="text-xs font-semibold text-emerald-700 underline hover:text-emerald-900 inline-flex items-center gap-1"
                              to={`/lecturer/exams/${assignedSuccess.examId}/questions`}
                            >
                              <span>Xem cấu hình câu hỏi kỳ thi</span>
                              <ChevronRight size={13} />
                            </Link>
                            <Link
                              className="text-xs font-medium text-slate-600 hover:text-slate-900"
                              to={`/lecturer/exams/${assignedSuccess.examId}`}
                            >
                              Chi tiết kỳ thi
                            </Link>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="text-emerald-700 hover:text-emerald-950 p-1"
                          onClick={() => setAssignedSuccess(null)}
                          aria-label="Đóng thông báo"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="review-actions">
                <Button
                  onClick={() =>
                    setQuestions((current) =>
                      current.map((question) => ({
                        ...question,
                        selected: true,
                      })),
                    )
                  }
                  variant="outline"
                >
                  Chọn tất cả
                </Button>
                <Button
                  onClick={() =>
                    setQuestions((current) =>
                      current.map((question) => ({
                        ...question,
                        selected: false,
                      })),
                    )
                  }
                  variant="outline"
                >
                  Bỏ chọn tất cả
                </Button>
                <Button
                  onClick={() => setConfirmReplace(true)}
                  variant="outline"
                >
                  Tạo batch mới
                </Button>
              </div>
              <div className="generated-list">
                {questions.map((question, index) => (
                  <GeneratedQuestionCard
                    key={question.id}
                    question={question}
                    index={index}
                    onChange={changeQuestion}
                    onToggle={() =>
                      setQuestions((current) =>
                        current.map((item) =>
                          item.id === question.id
                            ? { ...item, selected: !item.selected }
                            : item,
                        ),
                      )
                    }
                  />
                ))}
              </div>
              <footer className="save-review">
                <span>
                  {save.isError && (
                    <Alert tone="danger">
                      Lưu thất bại. Các chỉnh sửa và lựa chọn vẫn được giữ.
                    </Alert>
                  )}
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  {selectedExamId && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!saveable.length || assigningPending}
                      pending={assigningPending}
                      onClick={handleAssignToExam}
                    >
                      <Send size={14} />
                      <span>Gán {saveable.length} câu vào kỳ thi</span>
                    </Button>
                  )}
                  {isApi ? (
                    <Button
                      onClick={() => navigate(`/lecturer/subjects/${subjectId}/questions`)}
                    >
                      Mở Ngân hàng câu hỏi để duyệt
                    </Button>
                  ) : (
                    <Button
                      disabled={!saveable.length || save.isPending}
                      onClick={() => setConfirmSave(true)}
                      pending={save.isPending}
                    >
                      Lưu {saveable.length} câu vào ngân hàng
                    </Button>
                  )}
                </div>
              </footer>
            </>
          )}
        </section>
      </div>
      <Dialog
        open={confirmSave}
        onClose={() => setConfirmSave(false)}
        title="Lưu câu hỏi vào ngân hàng?"
      >
        <p>
          Sẽ lưu <strong>{saveable.length}</strong> câu hỏi vào học phần{" "}
          <strong>{subjectId}</strong> ở trạng thái BẢN NHÁP.
        </p>
        <div className="dialog-actions">
          <Button onClick={() => setConfirmSave(false)} variant="outline">
            Quay lại
          </Button>
          <Button
            onClick={() => {
              setConfirmSave(false);
              save.mutateGenerated(subjectId, saveable, {
                onSuccess: () => {
                  setSaveSuccess(saveable.length);
                  setQuestions([]);
                },
              });
            }}
          >
            Xác nhận lưu
          </Button>
        </div>
      </Dialog>
      <Dialog
        open={confirmReplace}
        onClose={() => setConfirmReplace(false)}
        title="Tạo batch mới?"
      >
        <p>Batch hiện tại sẽ bị thay thế.</p>
        <div className="dialog-actions">
          <Button onClick={() => setConfirmReplace(false)} variant="outline">
            Ở lại
          </Button>
          <Button variant="danger" onClick={replace}>
            Bỏ batch
          </Button>
        </div>
      </Dialog>
      <div className="ai-mock-note">
        Câu hỏi sinh bởi AI luôn bắt đầu ở trạng thái <strong>BẢN NHÁP (DRAFT)</strong> và chỉ được dùng cho thi sau khi giảng viên duyệt (APPROVE).
      </div>
    </section>
  );
}

function GeneratedQuestionCard({
  question,
  index,
  onToggle,
  onChange,
}: {
  question: GeneratedQuestion;
  index: number;
  onToggle: () => void;
  onChange: (
    id: string,
    key: "content" | "suggestedAnswer",
    value: string,
  ) => void;
}) {
  return (
    <article
      className={`generated-card ${question.selected ? "selected" : ""}`}
    >
      <header>
        <label>
          <input
            aria-label={`Chọn câu hỏi ${index + 1}`}
            checked={question.selected}
            onChange={onToggle}
            type="checkbox"
          />{" "}
          <strong>Câu hỏi {index + 1}</strong>
        </label>
        <StatusBadge
          label={question.issues.length ? "Cần chỉnh sửa" : "AI draft"}
          tone={question.issues.length ? "danger" : "ai"}
        />
      </header>
      <label>
        Nội dung câu hỏi
        <textarea
          aria-label={`Nội dung câu hỏi ${index + 1}`}
          onChange={(event) =>
            onChange(question.id, "content", event.target.value)
          }
          value={question.content}
        />
      </label>
      <label>
        Đáp án gợi ý
        <textarea
          aria-label={`Đáp án gợi ý ${index + 1}`}
          onChange={(event) =>
            onChange(question.id, "suggestedAnswer", event.target.value)
          }
          value={question.suggestedAnswer ?? ""}
        />
      </label>
      <footer>
        <span>
          <Badge tone="info">{question.topic}</Badge>{" "}
          <Badge tone="neutral">{question.bloom}</Badge>
        </span>
        <small>Nguồn đã chọn: {question.sourceMaterialNames.join(", ") || "Toàn bộ học phần"}</small>
      </footer>
      {question.issues.length > 0 && (
        <Alert tone="danger">
          <ul>
            {question.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </Alert>
      )}
    </article>
  );
}
