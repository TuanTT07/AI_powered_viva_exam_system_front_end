# Lịch thi sinh viên theo JWT

## 1. Goal
Sinh viên đăng nhập tự thấy ca thi và mở đúng attempt, không nhập UUID.

## 2. Context
Người dùng dừng seed và yêu cầu tích hợp API BE đã triển khai. Đã xóa hai file seed local; không ghi seed lên Supabase. OpenAPI Render ngày 03/11/2026 xác nhận endpoint danh sách và my-slot theo JWT.

## 3. Scope
Repository/hook lịch thi, dashboard và danh sách cá nhân, trạng thái/phân trang, my-slot không studentId, giữ attemptId qua chi tiết/kiểm tra thiết bị/phòng thi.

## 4. Non-goals
Không seed DB, đổi BE, mở khóa speech, tạo lượt hỏi, làm orchestration mới, sửa grading, commit/push/deploy.

## 5. Relevant Sources
AGENTS.md, docs/api/API_CONTRACT.md, docs/api/ERROR_HANDLING.md, docs/design/STATES.md và UI_RULES.md, docs/architecture/STATE_MANAGEMENT.md, docs/product/USER_FLOWS.md, OpenAPI Render /v3/api-docs; features/exams, features/dashboard, viva-session/pages.

## 6. Current Behavior
API mode hiển thị form UUID. my-slot gửi studentId query. Speech đã có thay đổi chưa commit từ công việc trước; giữ nguyên chức năng và diff đó.

## 7. Target Behavior
GET /api/v1/student/exams qua apiClient JWT. Page bắt đầu 0, size mặc định 20 tối đa 100, lọc status, giữ thứ tự BE. Empty là trạng thái thành công. GET my-slot chỉ cần examId. attemptId trên navigation là metadata và phải khớp my-slot của JWT trước speech; không dùng để tự cấp quyền.

## 8. Architecture Constraints
Page compose feature, repository giữ HTTP, TanStack Query giữ server state và cache theo tài khoản. Mock tách riêng. Giữ layout hiện tại, chỉ hiển thị metadata, không bịa lượt hỏi hoặc tổng ngoài trang.

## 9. Milestones
1. Repository/types/hook; 2. list/dashboard UI; 3. navigation/my-slot; 4. docs và kiểm chứng.

## 10. Risks
Response dùng page thay vì number. Giờ/số ca có thể chưa được phân. Không giữ cache giữa các tài khoản. Không coi READY/attemptId là quyền speech hoặc tạo questionTurnId. Không ghi đè .env hoặc các sửa đổi speech có sẵn.

## 11. Validation
Kiểm tra repository query/UUID/pagination/error; UI loading/empty/403/retry/filter/page/navigation và không render mock trong API mode. Typecheck, lint, tests liên quan và build. Thử browser nếu công cụ cho phép; ghi rõ khi chưa kiểm chứng với JWT thật.

## 12. Definition of Done
Hai trang tự tải danh sách, không form UUID; metadata và trạng thái đúng, request theo JWT, attemptId được giữ và kiểm tra, kiểm chứng đã chạy không lỗi do thay đổi.

## 13. Progress Log
03/11/2026: kiểm tra contract Render, caller và working tree; bắt đầu triển khai. Không có seed cloud để xóa.

03/11/2026: hoàn tất repository/hook theo JWT, hai trang lịch thi tự tải, filter/phân trang bằng URL, trạng thái loading/empty/error/403/retry và cache theo tài khoản. Xóa form nhập UUID; my-slot không gửi studentId. attemptId được giữ qua chi tiết/thiết bị/phòng thi và đối chiếu với my-slot; phòng thi chặn attempt không khớp hoặc trạng thái không cho phép vào. Giữ riêng mock mode và các thay đổi speech có sẵn.

Kiểm chứng: `npm run typecheck`, `npm run lint`, `npm test -- src/features/exams/api-student-exam-repository.test.ts src/features/exams/student-personal-schedule.test.tsx` (21/21), `npm run build`, `git diff --check` đạt. Build còn cảnh báo bundle >500 kB; không thêm dependency. Các test dùng transport/session giả lập, không tiêu credit provider. Không chạy toàn bộ suite speech, không kiểm thử microphone/voice/reconnect hay browser responsive/keyboard bằng tài khoản thật. Công cụ điều khiển Brave trước đó lỗi/timeout nên chưa kiểm chứng JWT sinh viên thật trên Render. Không commit, push hoặc deploy. API danh sách chưa cấp lượt hỏi đang hoạt động, phòng thi giữ trạng thái chờ khi chưa có questionTurnId.
