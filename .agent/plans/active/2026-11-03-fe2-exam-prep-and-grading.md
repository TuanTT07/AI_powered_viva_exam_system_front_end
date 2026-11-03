# ExecPlan: Frontend 2 (FE2) — Chuẩn bị lượt thi (CN3) & Chấm điểm Giảng viên (CN4)

## 1. Goal
Hoàn thiện toàn bộ luồng giao diện và tương tác cho vai trò **Frontend 2 (FE2)** trong hệ thống AIVES bao gồm:
1. **Chuẩn bị lượt thi (CN3)**: Cấu hình tham số kỳ thi nâng cao (`examConfig`: `maxMainQuestions`, `maxFollowUpQuestions`, `timeLimitPerTurnSeconds`, `bloomRatios`, `antiOverlapEnabled`) và giao diện chọn câu hỏi thi (thủ công / random pool) từ ngân hàng câu hỏi đã duyệt.
2. **Không gian chấm điểm giảng viên (CN4)**: Xem chi tiết lượt thi, hồ sơ thí sinh, luồng hội thoại transcript AI-sinh viên có mốc thời gian, rubric tiêu chí, điểm gợi ý AI, can thiệp điều chỉnh điểm, nhập nhận xét, cảnh báo dữ liệu chưa lưu, và chốt điểm chính thức theo chuẩn Human-in-the-loop.

## 2. Context
- Đề tài AIVES phân chia 2 vai trò frontend: FE1 phụ trách phòng thi sinh viên (CN3), FE2 phụ trách giao diện chuẩn bị lượt thi (CN3) và chấm điểm giảng viên (CN4).
- Cần chuẩn hóa tính năng, tuân thủ `AGENTS.md` (Human-in-the-loop: điểm AI chỉ là gợi ý, giảng viên là người quyết định cuối cùng; tương thích cả `mock` và `api`; không làm vỡ các test hiện có).

## 3. Scope
- `src/features/exams/exam-types.ts`: Mở rộng kiểu dữ liệu cấu hình `ExamConfig` (thời gian mỗi lượt, tỷ lệ Bloom, chống trùng lặp).
- `src/features/exams/exam-editor.tsx` & `exam-validation.ts`: Bổ sung cấu hình chi tiết `examConfig` trong form tạo/sửa kỳ thi.
- `src/features/exams/exam-question-config-page.tsx`: Nâng cấp giao diện chọn câu hỏi kỳ thi, hỗ trợ trực quan 2 chế độ chọn, lọc Bloom/chủ đề, và hiển thị rõ ràng thông số kỳ thi.
- `src/features/grading/grading-types.ts` & `grading-repository.ts`: Chuẩn hóa kiểu dữ liệu và repository chấm điểm (transcript, rubric, AI suggestion, lecturer scores, notes, status).
- `src/features/grading/views/GradingWorkspaceView.tsx` & `grading-workspace-page.tsx`: Hoàn thiện không gian chấm điểm 3 cột:
  - Cột 1: Giám sát thí sinh & câu hỏi & audio bằng chứng.
  - Cột 2: Biên bản hội thoại transcript AI-Sinh viên.
  - Cột 3: Rubric chấm điểm, AI gợi ý điểm + lý do, ô nhập điểm giảng viên, nhận xét.
  - Modal chốt điểm chính thức (`Confirm Final Grade`) với cảnh báo khóa điểm.
- `src/features/exams/views/AttemptTable.tsx` & `exam-attempt-list-page.tsx`: Cập nhật hiển thị trạng thái chấm điểm và điểm đã chốt.
- Unit tests: Bổ sung test kiểm thử cho luồng cấu hình kỳ thi và chấm điểm.

## 4. Non-goals
- Không can thiệp vào phòng thi của sinh viên (thuộc phạm vi Frontend 1 - CN3).
- Không gọi trực tiếp dịch vụ LLM/STT/TTS từ frontend (tuân thủ quy tắc kiến trúc `AGENTS.md`).

## 5. Relevant Sources
- `AGENTS.md`
- `docs/product/FEATURES.md` (CN3, CN4)
- `docs/api/API_CONTRACT.md`
- `docs/architecture/VIVA_STATE_MACHINE.md`
- `src/features/exams/`
- `src/features/grading/`

## 6. Current Behavior
- Cấu hình kỳ thi trong `exam-editor.tsx` chỉ có 3 trường cơ bản (`durationMinutes`, `mainQuestionCount`, `maxFollowUpCount`), chưa có cấu hình thời gian mỗi câu, tỷ lệ Bloom hay chống trùng lặp.
- Màn hình `exam-question-config-page.tsx` ở API mode đang hiển thị trạng thái chưa sẵn sàng thay vì cho phép cấu hình tham số.
- Màn hình chấm điểm `GradingWorkspacePage` có giao diện demo cơ bản, nhưng chưa có abstraction `grading-repository.ts`, chưa lưu vết điểm đã chốt vào danh sách lượt thi.

## 7. Target Behavior
- Giảng viên có thể thiết lập toàn diện các tham số phiên vấn đáp (`examConfig`) bao gồm: số câu hỏi chính, số câu hỏi đào sâu tối đa, thời gian mỗi câu hỏi (giây), tỷ lệ mức độ nhận thức Bloom, và bật/tắt cơ chế chống trùng lặp.
- Màn hình cấu hình câu hỏi cung cấp giao diện trực quan chọn câu hỏi đã duyệt, lọc theo chủ đề và Bloom, tự động điền hoặc chọn thủ công/pool.
- Không gian chấm điểm cung cấp trải nghiệm chuyên nghiệp: transcript từng lượt thoại, so sánh điểm AI gợi ý với điểm giảng viên chấm, modal xác nhận chốt điểm chính thức rõ ràng, bảo đảm nguyên tắc Human-in-the-loop.

## 8. Architecture Constraints
- Giữ 100% test hiện có vượt qua (`npm run test`).
- Giữ `tsc -b` và `npm run build` 100% xanh.
- Không thay đổi các contracts API đã thống nhất.

## 9. Milestones
- [x] Milestone 1: Phân tích codebase & lập kế hoạch thực hiện.
- [x] Milestone 2: Cập nhật kiểu dữ liệu & mở rộng form cấu hình kỳ thi (`examConfig`).
- [x] Milestone 3: Nâng cấp màn hình cấu hình câu hỏi kỳ thi (`exam-question-config-page.tsx`).
- [x] Milestone 4: Chuẩn hóa tầng repository và dữ liệu chấm điểm (`grading-types.ts`, `grading-repository.ts`).
- [x] Milestone 5: Nâng cấp không gian chấm điểm (`GradingWorkspaceView.tsx`, `GradingWorkspacePage.tsx`) với Human-in-the-loop modal.
- [x] Milestone 6: Đồng bộ điểm đã chốt với danh sách lượt thi (`AttemptTable.tsx`).
- [x] Milestone 7: Viết unit tests bổ sung và kiểm tra toàn diện (`typecheck`, `test`, `build`).

## 10. Risks & Mitigation
- **Risk:** Làm thay đổi giao diện hoặc text khiến các bài test cũ trong `grading-workspace-page.test.tsx` bị fail.  
  **Mitigation:** Giữ nguyên các text nhãn kiểm thử của demo workspace (`Xác nhận điểm demo`, `ĐIỂM CHỐT MẪU`, v.v.) và mở rộng thêm luồng chốt điểm chính thức song song hoặc tương thích.
- **Risk:** TypeScript strict mode lỗi khi thêm trường mới vào `ExamDraft` hoặc `ExamSession`.  
  **Mitigation:** Sử dụng optional properties với giá trị mặc định chuẩn (`60s`, tỷ lệ Bloom chuẩn).

## 11. Validation
- `npm run typecheck` (Passed - 0 errors)
- `npm run lint` (Passed - 0 warnings, 0 errors)
- `npm run test` (Passed - 59 test files, 216 tests passed)
- `npm run build` (Passed - 0 errors)
