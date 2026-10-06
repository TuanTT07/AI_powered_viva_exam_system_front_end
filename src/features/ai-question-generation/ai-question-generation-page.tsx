import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
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
import { useQuestionTopics } from "../question-bank/question-hooks";
import { useRubrics } from "../rubrics/rubric-hooks";
import type { BloomLevel } from "../question-bank/question-types";
import {
  type GeneratedQuestion,
  type GenerationLanguage,
  type GenerationRequest,
} from "./generation-types";
import {
  useGenerateQuestions,
  useSaveGeneratedQuestions,
} from "./generation-hooks";
import {
  validateGenerationRequest,
  validateGeneratedQuestions,
} from "./generation-validation";
import "./ai-question-generation.css";
import { runtimeConfig } from "../../services/api/runtime-config";

const blooms: BloomLevel[] = ["NHỚ", "HIỂU", "VẬN DỤNG", "PHÂN TÍCH"];

export function AIQuestionGenerationPage() {
  const { subjectId = "" } = useParams();
  if (runtimeConfig.dataSource === "api")
    return <ApiGenerationUnsupported subjectId={subjectId} />;
  return <MockAIQuestionGenerationPage />;
}

function ApiGenerationUnsupported({ subjectId }: { subjectId: string }) {
  return (
    <section className="state">
      <h2>Tính năng sắp có</h2>
      <p>
        Chức năng sinh câu hỏi đang được hoàn thiện. Bạn vẫn có thể tạo câu hỏi
        thủ công từ ngân hàng câu hỏi.
      </p>
      <Link
        className="button outline"
        to={`/lecturer/subjects/${subjectId}/questions`}
      >
        Về ngân hàng câu hỏi
      </Link>
    </section>
  );
}

function MockAIQuestionGenerationPage() {
  const { subjectId = "" } = useParams();
  const materials = useMaterials(subjectId);
  const topics = useQuestionTopics(subjectId);
  const rubrics = useRubrics(subjectId);
  const generate = useGenerateQuestions();
  const save = useSaveGeneratedQuestions();
  const [form, setForm] = useState({
    materialIds: [] as string[],
    topic: "",
    bloom: "" as BloomLevel | "",
    count: "5",
    language: "vi" as GenerationLanguage,
    rubricId: "",
  });
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<number | null>(null);
  const readyMaterials = (materials.data ?? []).filter(
    (material) =>
      material.status === "READY" && material.subjectId === subjectId,
  );
  const request: GenerationRequest = {
    subjectId,
    materialIds: form.materialIds,
    topic: form.topic,
    bloom: form.bloom as BloomLevel,
    count: Number(form.count),
    language: form.language,
    rubricId: form.rubricId || undefined,
  };
  const update = (key: keyof typeof form, value: string | string[]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next = validateGenerationRequest(
      request,
      materials.data ?? [],
      topics.data ?? [],
      rubrics.data ?? [],
    );
    setErrors(next);
    if (Object.keys(next).length || generate.isPending) return;
    generate.mutate(
      {
        request,
        materialNames: readyMaterials
          .filter((item) => form.materialIds.includes(item.id))
          .map((item) => item.filename),
      },
      {
        onSuccess: (result) => setQuestions(result),
        onError: () =>
          setErrors({
            generation:
              "Không thể tạo câu hỏi. Cấu hình vẫn được giữ để thử lại.",
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
          <p className="eyebrow">NGÂN HÀNG CÂU HỎI · AI DRAFT WORKSPACE</p>
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
              Chỉ học liệu đã ở trạng thái Sẵn sàng mới có thể làm nguồn.
            </p>
            <fieldset>
              <legend>
                Tài liệu nguồn <span>({form.materialIds.length}/5)</span>
              </legend>
              {!readyMaterials.length ? (
                <div className="no-ready-material">
                  <strong>Chưa có tài liệu sẵn sàng</strong>
                  <p>
                    Hãy tải lên và chờ học liệu xử lý xong trước khi sinh câu
                    hỏi.
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
              Chủ đề
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
              Số lượng câu hỏi
              <Input
                aria-invalid={Boolean(errors.count)}
                max="10"
                min="1"
                onChange={(event) => update("count", event.target.value)}
                type="number"
                value={form.count}
              />
            </label>
            {errors.count && <p className="field-error">{errors.count}</p>}
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
            <label>
              Rubric (tuỳ chọn)
              <select
                aria-invalid={Boolean(errors.rubric)}
                value={form.rubricId}
                onChange={(event) => update("rubricId", event.target.value)}
              >
                <option value="">Không gắn rubric</option>
                {(rubrics.data ?? [])
                  .filter((rubric) => rubric.subjectId === subjectId)
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
          {generate.isPending && (
            <div className="generation-pending" aria-live="polite">
              <Spinner label="Đang sinh câu hỏi" /> Đang tạo câu hỏi…
            </div>
          )}
          <Button
            disabled={generate.isPending || !readyMaterials.length}
            pending={generate.isPending}
            type="submit"
          >
            Sinh {form.count || 0} câu hỏi
          </Button>
        </form>
        <section className="generation-review" aria-labelledby="review-title">
          <div className="review-head">
            <div>
              <p className="eyebrow">REVIEW · DRAFT QUESTIONS</p>
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
              Đã lưu {saveSuccess} câu hỏi ở trạng thái BẢN NHÁP.
            </Alert>
          )}
          {!questions.length ? (
            <div className="review-empty">
              <h3>Chưa có batch câu hỏi</h3>
              <p>Cấu hình nguồn ở bên trái để bắt đầu tạo câu hỏi nháp.</p>
            </div>
          ) : (
            <>
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
                <Button
                  disabled={!saveable.length || save.isPending}
                  onClick={() => setConfirmSave(true)}
                  pending={save.isPending}
                >
                  Lưu {saveable.length} câu vào ngân hàng
                </Button>
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
        <p>Batch chưa lưu sẽ bị thay thế.</p>
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
        Kết quả sinh câu hỏi cần được giảng viên rà soát trước khi lưu.
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
        <small>Nguồn đã chọn: {question.sourceMaterialNames.join(", ")}</small>
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
