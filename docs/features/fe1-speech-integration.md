# FE1 — API speech hiện có

Ngày03/11/2026. Đã nối playback, speech-ticket, receipt, WebSocket speech và hai API điều phối start/current được xác minh trên Render ngày 03/11/2026. Không tự seed, chọn câu, chấm điểm hoặc nộp bài giả. Không tích hợp grading giảng viên vào phòng thi sinh viên.

## Cấu hình và đường vào
- `VITE_DATA_SOURCE=api`; `VITE_API_BASE_URL` là origin BE hoặc để trống nếu dùng Vite proxy.
- Khi để trống, đặt `AIVES_API_PROXY_TARGET` tới BE; Vite proxy `/api` và `/ws` (`ws:true`). Khi gọi WSS trực tiếp hoặc qua proxy, Origin thực của FE phải nằm trong CORS_ALLOWED_ORIGINS của BE. Không tắt kiểm tra Origin.
- BE cần speech enabled, Deepgram key/quota, migrationV7 và account STUDENT đã đổi mật khẩu. Không đưa key vào FE.
- FE lấy GET `/api/interviews/{attemptId}/current` theo JWT. READY hiển thị nút bắt đầu để POST `/start`; reload chỉ GET và không tự tạo phiên mới. AWAITING_ANSWER nhận questionTurnId/text/deadlineAt từ prompt. PROCESSING chờ BE; COMPLETED chỉ hiển thị khi BE xác nhận.
- Không cần truyền questionTurnId trên URL; giá trị cũ trên URL không được dùng để chọn câu. BE chịu trách nhiệm khởi tạo, chuyển câu/hỏi phụ và kết thúc bằng InterviewWorker.
- questionTurnId lấy từ current của JWT, không nhầm với Question.id/QuestionAttempt.id. BE playback/ticket/answer.start tiếp tục kiểm tra quyền/current prompt. Không mặc định mã mẫu.
- Thiếu metadata lượt hỏi → UI chờ cấp lượt hỏi, không gọi speech với ID đoán. Ca chưa mở → báo lỗi, không tự đổi trạng thái.

## Luồng
1. Kết nối: GET playback, POST ticket có JWT → WS ticket dùng một lần → session.ready.
2. Có thể đọc bằng giọng vi của browser. Nếu máy không hỗ trợ, hiển thị lỗi và giữ nội dung câu hỏi cho người dùng đọc; không tự đọc giọng Anh.
3. Bắt đầu trả lời: xin micro/chuẩn bị AudioContext+AudioWorklet → answer.start → đợi answer.started mới nối capture/gửi audio.
4. PCM_S16LE mono16kHz: UA AudioContext thực hiện đổi sample rate khi hỗ trợ; fallback worklet resample windowed-sinc có carry giữa block. Frame50ms/1600bytes, frame cuối flush; không WebM/WAV/base64. Backpressure vượt64KB dừng và báo lỗi, không bỏ audio âm thầm.
5. Transcript partial/final: keyed answerId/segmentId/revision, sort segment numeric, không nối lặp partial. Mọi nội dung trước receipt nằm trong vùng chưa xác nhận lưu, kể cả transcript.final.
6. Kết thúc trả lời: flush audio → answer.end → answer.finalizing → answer.finalized. Receipt là xác nhận lưu của một câu trả lời, không phải nộp bài.
7. Deadline hiển thị theo answer.started.deadline; không tự đóng bài/tiến câu theo clock FE. BE tự chốt khi hết giờ; FE dừng capture khi nhận finalizing. Chưa có serverNow nên đồng hồ là tham khảo khi clock máy lệch. Xử lý race late audio/INVALID_STATE sau finalizing mà không ngắt transaction đang chốt.
8. Giữ duy nhất answerId trong sessionStorage, key gắn user/attempt/turn, không ghi audio/transcript/ticket. Reload hoặc mất ACK: GET answer receipt. Metadata được giữ cả sau ACK để reload vẫn tra kết quả từ BE, không dùng dữ liệu local làm bằng chứng đã lưu.
9.404 receipt không chứng minh câu trả lời chắc chắn chưa lưu. Giữ trạng thái chưa xác nhận, cho kiểm tra lại, không thu đè/phát lại audio. NO_SPEECH là lỗi BE xác nhận chưa lưu, cho kết nối/thu lại nếu prompt vẫn hợp lệ.
10. Mất mạng/đóng socket/micro lỗi: dừng thiết bị, không replay giữa câu; kết nối lại xin ticket mới hoặc tra receipt trước. Một attempt/connection; không có next-question/complete API được bịa ra.

## Code
- `speech-api.ts`: REST envelope/UUID/DTO validation qua apiClient và token boundary hiện có.
- `services/realtime/speech-socket.ts`: ticketed browser WebSocket, format validation, heartbeat/timeout/backpressure, không JWT trong query.
- `services/media/pcm-capture*`, `browser-tts.ts`: PCM/worklet và TTS native browser; cleanup khi thoát.
- `speech-session-model.ts`, `use-speech-answer.ts`: reducer pha speech và lifecycle tài nguyên. Không dùng mock speech/full-interview reducer cho ApiRoom.
- `ApiSpeechRoom`: tái sử dụng VivaSessionView; transcript type độc lập với mocks. Mock mode cũ vẫn tách rõ và không phải fallback khi API lỗi.

## Giới hạn và xác minh
Đã có start/current và worker BE tự tiến câu/hỏi phụ/hoàn tất. FE poll current mỗi 2 giây khi online và an toàn; tạm dừng khi kết nối/đọc/thu âm/chờ receipt, giữ snapshot nếu request cũ trả về giữa lúc thu. Sau receipt, FE đồng bộ lại; receipt của một câu không tự kết luận hoàn tất bài. Start hủy GET đang chạy và không tự retry POST. Slot READY có thể còn cache sau start; current là nguồn trạng thái speech. Câu hỏi/deadline hiển thị từ prompt; answer.started.deadline được ưu tiên khi thu. Không phân loại chính/hỏi phụ hoặc bịa lịch sử/điểm nếu DTO không cấp.

Kiểm chứng tự động có giả lập transport/WS/PCM/TTS cho start → current → question → answer.started → audio → finalized → processing → lượt tiếp theo → completed; reload không gọi start; không dùng ID trên URL; lỗi quyền/mạng và tra receipt sau disconnect. Đây không phải bằng chứng Deepgram/micro/DB đã chạy thật. Browser kiểm thử hiện chưa đăng nhập sinh viên; điều khiển Brave bị timeout khi chọn tab. Cần đăng nhập tài khoản sinh viên có attempt READY và câu hỏi đã phân để kiểm thử live. Không ghi token, transcript hoặc audio test thật vào repo.


## Question audio update — 2026-11-07
TTS provider metadata is now `deepgram`. The student listen button calls
POST `/api/interview/attempts/{attemptId}/speech/questions/{questionTurnId}/audio`,
then downloads `audioPath` through the authenticated API client as an MP3 Blob.
Playback uses HTML audio, cancels when leaving/changing questions and releases its Blob URL.
Backend defaults to female `flux-hoa-vi` (Early Access). No provider key or browser voice installation is needed in FE.
Existing browser-TTS documentation above is superseded by this flow.


## Minh voice and latency update — 2026-11-07
The current backend default is male `flux-minh-vi`. The room prepares the current
question MP3 as soon as the active question arrives, before speech connection or listen.
Listen shares the pending request; replay reuses its Blob within the current question.
Preparation is aborted/discarded on question, user or active-state change and unmount.
Speculative errors are silent and retried on explicit listen. No recording starts during playback.
First playback may still wait for the provider if preparation has not finished.
