# Nối điều phối phiên thi FE1
## 1. Goal
Sinh viên mở phiên, nhận đúng lượt hỏi từ BE, trả lời speech và theo tiến trình BE.
## 2. Context
Swagger Render đã có POST /api/interviews/{attemptId}/start và GET /current. Kết luận thiếu API trước đây đã được sửa.
## 3. Scope
Adapter typed/validated; container trạng thái server; speech handoff, đồng bộ sau receipt và reload; tests/docs.
## 4. Non-goals
Không đổi BE, seed/credentials, grading, tự tạo question ID, commit/push/deploy.
## 5. Relevant Sources
AGENTS.md, API_CONTRACT, WEBSOCKET_EVENTS, VIVA_STATE_MACHINE, REALTIME, UI_RULES, speech adapters/hooks; OpenAPI Render; BE origin/main InterviewController, InterviewFlow, InterviewWorker, InterviewAccessService, InterviewTiming.
## 6. Current Behavior
Phòng thi đợi questionTurnId query; speech đã có adapter riêng nhưng chưa nối start/current.
## 7. Target Behavior
GET current theo JWT; READY cần nút bắt đầu POST rõ ràng; AWAITING_ANSWER dùng prompt.questionTurnId/text/deadlineAt; PROCESSING poll; COMPLETED hiển thị xác nhận BE. Reload chỉ GET, không tự POST. Không lấy lượt hỏi từ URL.
## 8. Architecture Constraints
TanStack Query cache theo tài khoản/attempt; không poll làm mất ACK/audio chưa xác nhận. Receipt không phải kết thúc bài thi. Server chọn câu/hỏi phụ/kết thúc.
## 9. Milestones
Xác minh BE; adapter/container; speech callback; kiểm thử state/transport/media mocks và kiểm tra live khả dụng; docs.
## 10. Risks
Slot READY bị cache sau start; dùng trạng thái current làm quyền speech UI. Đóng/mount lại speech khi đang thu có thể mất ACK; pause poll và giữ snapshot đến lúc an toàn. Không tự kết luận hoàn tất theo clock.
## 11. Validation
Typecheck/lint/build; test HTTP contract, READY/start, reload, prompt handoff, PROCESSING/COMPLETED, 403/error/retry, không đổi prompt khi đang chờ receipt. Speech WS/audio được giả lập khi chưa có tài khoản/cấp quyền micro thật.
## 12. Definition of Done
Không cần nhập questionTurnId; start/current nối đúng, các failure/race được kiểm chứng; ghi rõ giới hạn live.
## 13. Progress Log
03/11/2026: xác minh OpenAPI và source BE, có worker tự tiến câu/hỏi phụ/hoàn tất. Bắt đầu FE.

03/11/2026: đã nối interview-api, ApiInterviewRoom, prompt/deadline và callback receipt trong ApiSpeechRoom. Không đọc questionTurnId từ URL. GET current trên entry/reload, POST start qua nút rõ ràng; mutation hủy GET đang chạy, không tự retry POST. Kết nối/đọc/thu speech hủy read đang chạy và tạm dừng polling để giữ đúng prompt đến receipt; sau receipt đồng bộ lại và tiếp tục theo worker BE. Completion chỉ theo current COMPLETED, kể cả reload ca đã hoàn tất. Cập nhật docs và test generic adapter cũ để không còn khẳng định BE thiếu API.

Kiểm chứng đã chạy: `npm run typecheck`, `npm run lint` (không warning), `npm test` (60 file, 244/244 test đạt), `npm run build`, `git diff --check`. Build còn warning bundle >500 kB. Test tích hợp dùng HTTP/WS/PCM/TTS giả lập, có kiểm tra start chỉ khi bấm, bỏ qua prompt URL, ACK trước audio, không mất phòng khi chưa có receipt, chuyển câu/completion từ BE, reload không start, 403, retry mạng và tra receipt sau disconnect không thu lại. GET current thật trên Render không JWT trả 401 như mong đợi; đó không phải kiểm chứng thi thật.

Còn chờ live: tab IAB 3 đã mở localhost:5173/student/exams và được chuyển về /login; chưa có phiên sinh viên. Brave đọc được danh sách tab nhưng timeout khi chọn AIVES, chưa dùng được phiên đăng nhập cũ. Đã giữ tab đăng nhập làm handoff. Cần sinh viên đăng nhập với ca READY và bộ câu hỏi hợp lệ, rồi mới kiểm chứng Render/DB/micro/voice thực tế. Không tạo credential, seed, ghi token/log riêng tư, commit hay push. Giữ plan active cho bước live này.
