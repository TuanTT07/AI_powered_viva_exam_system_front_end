# FE1 — Phòng thi sinh viên: đánh giá API và hướng tích hợp

Trạng thái: **đề xuất triển khai, chưa sửa code runtime**. Kiểm tra ngày03/11/2026.

## 1. Goal
Nối FE web phòng thi sinh viên với BE: đọc câu hỏi, thu microphone, gửi PCM, transcript, deadline câu trả lời và phục hồi khi mất kết nối. Phân biệt phần có thể làm ngay với phần còn chờ API điều phối BE1.

## 2. Context
Đối chiếu backend main tại commit `aef1275328acd6f97c67c27e780cd442fb6d263a` (02/11/2026,22:53+07). Speech đã có implementation; interview orchestration chưa đầy đủ. Swagger Render không phản hồi trong30giây khi kiểm tra; chỉ xác nhận source, không coi đây là bằng chứng API đã deploy/cấu hình/hoạt động với Deepgram thật.

## 3. Scope
- FE1: `/student/exams/:examId/check` và `/student/exams/:examId/session`.
- REST speech, WebSocket ticket, Browser TTS, AudioWorklet/PCM, transcript reducer, trạng thái lỗi và cleanup.
- Tái sử dụng API client, query boundary, device check và VivaSessionView hiện có.
- Chốt phần thiếu với BE1/BE2 trước khi nối nguyên buổi thi.

## 4. Non-goals
Không thực hiện FE2/chấm điểm, tự chọn câu hỏi, tự sinh follow-up, tự xác nhận nộp bài, upload camera, AI SDK/provider keys ở FE hoặc audio replay khi reconnect. Không có dữ liệu/phản hồi giả trong API mode. Không chạy ui-test/unit tests theo yêu cầu người dùng.

## 5. Relevant sources
### Backend, snapshot đã kiểm tra
- https://github.com/TuanTT07/AI_powered_viva_exam_system_backend/tree/aef1275328acd6f97c67c27e780cd442fb6d263a
- `doc/MODULE3_SPEECH.md`, `doc/TEAM_HANDOFF.md`, `doc/MODULE3_ARCHITECTURE.md`.
- `speech/controller/SpeechController.java`, `speech/dto/SpeechProtocol.java`, `speech/service/SpeechSessionService.java`, `speech/service/SpeechTicketService.java`.
- `speech/config/SpeechWebSocketConfig.java`, `speech/websocket/SpeechHandshakeInterceptor.java`.
- `interview/service/InterviewAccessService.java`, `interview/service/TranscriptService.java`.
- `exammgt/controller/StudentExamController.java`, `exammgt/service/impl/ExamScheduleServiceImpl.java`.
- `grading/controller/EvaluationController.java`, `grading/service/EvaluationService.java`.
### Frontend
- `src/features/viva-session/`, `src/features/exams/api-student-exam-repository.ts`.
- `src/services/api/client.ts`, `src/services/api/token-manager.ts`, `vite.config.ts`.
- `docs/architecture/{VIVA_STATE_MACHINE,REALTIME,STATE_MANAGEMENT,DATA_FLOW}.md`.
- `docs/api/{API_CONTRACT,WEBSOCKET_EVENTS,AI_CONTRACT,ERROR_HANDLING}.md`.

## 6. Current behavior / API thực tế
### API dùng cho FE1 đã có trong source
Tiền tố REST: `/api/interview`.

| Method/path | Dữ liệu và giới hạn |
|---|---|
| POST `/attempts/{attemptId}/speech-ticket` | JWT STUDENT; trả `{ticket, expiresAt, websocketPath}`. Attempt phải IN_PROGRESS, chủ sở hữu đúng, đã đổi mật khẩu. Ticket mặc định30s, dùng một lần, không quá hạn JWT. |
| GET `/attempts/{attemptId}/speech/questions/{questionTurnId}/playback` | Trả `{questionTurnId,text,ttsProvider:'browser',language:'vi-VN'}` cho lượt AI hiện hành. FE dùng speechSynthesis; không phải audio MP3. |
| GET `/attempts/{attemptId}/speech/answers/{answerId}` | Trả `{transcriptTurnId,text}` khi đã commit;404 có thể là chưa commit, không kết luận ngay rằng đã mất vĩnh viễn. |
| WS `/ws/interview/speech?ticket=...` | Origin phải thuộc BE CORS_ALLOWED_ORIGINS; không đưa JWT dài hạn vào query. Một kết nối/attempt/process. |

Envelope REST là `{success,status,message,data}`. Không dùng endpoint POST `.../questions/{questionTurnId}/audio` cũ trong luồng Browser TTS: đường server-TTS hiện không triển khai tương đương, trả501 khi cấu hình speech hợp lệ. Browser TTS không sinh audioId/MP3.

### Protocol WebSocket đã xác nhận
- Client: `answer.start`, `answer.end`, `ping`. Mỗi command cần requestId UUID.
- Server: `session.ready`, `answer.started`, `transcript.partial`, `transcript.final`, `answer.finalizing`, `answer.finalized`, `speech.error`, `pong`.
- Envelope server: `{type,requestId,answerId,data}`; requestId/answerId có thể null.
- `answer.start`: `{type:'answer.start',requestId,questionTurnId,audio:{encoding:'PCM_S16LE',sampleRate:16000,channels:1}}`.
- Đợi `answer.started` mới gửi binary audio. Event này trả answerId, questionTurnId và deadline ISO.
- Audio: raw signed16 little-endian, mono16kHz;20–100ms/frame =640–3200bytes, số byte chẵn, không quá32768bytes. Không dùng MediaRecorder WebM/Opus/base64 hoặc WAV header. Phải resample/downmix thật; chỉ đặt getUserMedia sampleRate không đủ bảo đảm.
- Stop capture/flush PCM rồi `answer.end` với requestId riêng và answerId. `answer.finalizing` khóa gửi; `answer.finalized` mới là xác nhận toàn bộ câu trả lời đã lưu.
- Transcript events chứa segmentId/revision/text. Thay partial theo segment, bỏ revision cũ, chốt final từng đoạn, sắp segment theo số; bỏ event khác answerId. `transcript.final` chưa đồng nghĩa câu trả lời đã commit.
- Theo dõi bufferedAmount; không xếp hàng vô hạn hoặc làm rơi audio rồi vẫn báo đã lưu. Backend giới hạn gửi nhanh hơn realtime2s.
- Ping giữa câu khoảng10s; cleanup capture/TTS/socket/timers khi rời phòng.

### Phân biệt ID
`examId` ≠ `attemptId` ≠ `questionAttemptId` ≠ `questionTurnId` ≠ `answerId`.
`questionTurnId` là TranscriptTurn.id của AI, không phải Question.id hoặc QuestionAttempt.id. My-slot trả attemptId và questions nhưng không cung cấp lượt AI đang hoạt động thay cho API start/current.

### Blocker BE1
Chưa thấy controller/API trong interview cho start/resume/current/full transcript/finish; chưa có service hoàn chỉnh chọn câu/hỏi phụ/chuyển câu. Speech yêu cầu attempt và question-attempt đã IN_PROGRESS cùng lượt AI đã ghi nên FE không thể tự khởi tạo bằng cách gọi speech-ticket.
`answer.finalized` không có câu tiếp hoặc điểm; WS speech chưa có `question.next`, `question.ready`, `interview.completed` cho vòng điều phối. AnswerFinalizedEvent Java là event nội bộ, không phải event gửi tới trình duyệt.

### Grading mới, thuộc FE2
Source main hiện có:
- POST `/api/question-attempts/{questionAttemptId}/evaluation/ai-grade`.
- GET `/api/question-attempts/{questionAttemptId}/evaluation`.
- PUT `/api/question-attempts/{questionAttemptId}/evaluation/final`.
- GET `/api/courses/{courseId}/evaluations`.
Service dùng quyền manager môn học. Không dùng các API này để cấp rubric/điểm AI riêng tư cho phòng thi sinh viên.

### FE hiện tại
- ApiRoom chỉ kiểm tra my-slot rồi hiển thị trạng thái chưa hỗ trợ và nút disabled.
- api-viva-session-repository vẫn ném VIVA_NOT_SUPPORTED.
- useVivaSession tồn tại nhưng chưa được route ApiRoom gọi; speech mặc định là mock.
- Repository cũ nhận start(examId), submitAnswer(sessionId,text), complete(sessionId); không khớp đường PCM+ticket mới.
- VivaSessionView còn phụ thuộc type DemoLine từ mocks; cần chuyển về transcript domain trung lập khi nối API.
- useDeviceCheck đã có getUserMedia/analyser và test loa440Hz; chưa kiểm tra voice tiếng Việt/STT/WebSocket thực tế.
- Vite chỉ proxy /api; chưa proxy /ws với ws:true. Cần cấu hình same-origin WS proxy hoặc WSS trực tiếp tới đúng BE, Origin vẫn phải được BE cho phép.

## 7. Target behavior
1. Check microphone/loa/voice vi/network và xác minh điều kiện vào thi.
2. Gọi API BE1 start/current đã chốt contract để nhận trạng thái/IDs/lượt hỏi.
3. Kết nối speech-ticket → session.ready; lấy playback và TTS (không capture khi AI đọc).
4. answer.start → answer.started → thu/gửi PCM → partial/final transcript.
5. answer.end → finalizing → finalized → chờ kết quả điều phối BE1.
6. Theo snapshot/event BE1 để hỏi phụ/chuyển câu hoặc xác nhận hoàn tất.
7. Mất mạng: dừng capture; ticket mới; tra answerId nếu mất ACK; đồng bộ state BE1. Không resume/replay audio giữa câu.

## 8. Architecture constraints
- Browser native WebSocket + Web Audio/AudioWorklet; chưa cần Socket.IO, STOMP, WebRTC hoặc speech SDK của provider.
- `services/realtime/`: ticket/socket/envelope/connection lifecycle.
- `services/media/`: microphone, PCM/resampler/AudioWorklet và Browser TTS, giải phóng thiết bị.
- `features/viva-session/`: DTO mapping, reducer transcript/session, error recovery và orchestration hook; pages chỉ compose.
- REST qua apiClient hiện có; dùng Query cho snapshot/current nếu contract dùng HTTP. PCM/binary frames/partial transcript không đi qua Query cache.
- Tách phase speech từ phase interview: session.ready chỉ là socket sẵn sàng, không phải xác nhận toàn bài thi bắt đầu/kết thúc.
- Deadline câu trả lời lấy từ answer.started.deadline; không dùng vòng TICK cũ tự trừ như đồng hồ chính thức. Deadline toàn bài/serverNow còn cần BE1/BE2 chốt; không bịa trường response. Không tự đánh dấu completed khi FE đếm về0.
- Gửi lại answer.start do STT_BUSY giữ requestId theo protocol. Sau socket mất không giả định command cache cũ còn tồn tại; tra receipt/snapshot trước khi cho thu lại.

## 9. Milestones
### A — FE1 làm ngay, chưa cần đủ BE1
Tách DTO/protocol speech, adapter socket, capture/resample PCM và Browser TTS. Nối vào UI phòng thi sau khi có attempt/lượt AI hợp lệ do BE chuẩn bị. Không tự seed/đổi trạng thái DB để giả lập start.

### B — Chốt contract với BE1/BE2
**Đề xuất, không phải API đã có:** start attempt, current/resume snapshot, trạng thái sinh câu phụ/câu tiếp, kết thúc bài. Snapshot cần attemptId, questionAttemptId, questionTurnId, nội dung được phép, phase, deadline/serverTime, progress/follow-up nếu BE hỗ trợ. Chọn một cơ chế lấy trạng thái tiếp theo; ưu tiên HTTP current + polling có giới hạn nếu chưa có WS interview, chỉ sau khi endpoint tồn tại. Làm rõ lost-ACK, idempotency, NO_SPEECH/hết giờ chưa thu âm và replay/resume.

### C — Nối toàn luồng
Thay ApiRoom placeholder, nối hook/reducer hiện có với adapter API thực; bỏ mock speech mặc định trong API mode. Chỉ sang completed sau xác nhận BE1, không dùng finalize-answer thay cho nộp toàn bài.

## 10. Risks / điểm cần BE xác nhận
- Source có speech không chứng minh deployment đã bật SPEECH_ENABLED, Deepgram key/quota và migrationV7. Default speech.enabled=false; thiếu key/service disabled trả503 khi xin ticket.
- Voice Việt phụ thuộc máy; loa beep thành công không chứng minh có voice vi. Chờ voiceschanged, không tự đổi sang voice Anh. Chốt chính sách đọc lỗi/fallback với nhóm.
- Ticket/connection cache là một-instance; không hứa resume audio hoặc chạy nhiều replica không affinity/shared state.
- Clock lệch: đã có answer deadline nhưng chưa có serverNow trong speech event; cần thống nhất đồng bộ clock và deadline toàn bài.
- My-slot hiện nhận studentId qua query; controller/service đã xem chưa ràng buộc JWT subject và mapper trả nội dung toàn bộ questions được gán. Cần BE kiểm tra ownership và chính sách tiết lộ câu hỏi trước thi. FE truyền user.id không thay thế authorization ở BE. Đây là nhận xét từ source, chưa thử khai thác trên deployment.
- Full transcript resume/API đọc câu đang chờ chưa có; FE không thể bảo đảm reload khôi phục đúng chỉ nhờ GET answer receipt.
- API_CONTRACT/WEBSOCKET_EVENTS của FE còn ghi không có speech/placeholder. TEAM_HANDOFF của BE còn ghi grading chưa có controller, nhưng source hiện có EvaluationController/Service. Lấy source thực tế làm chuẩn, cần cập nhật docs trước/sát lúc tích hợp; không tự coi mọi placeholder là event thật.

## 11. Validation
Trong lượt đánh giá này chỉ đọc code/docs và GET Swagger công khai (timeout); không chạy unit tests/ui-test, không gửi audio/provider, không dùng account/JWT/ticket hoặc sửa môi trường BE. Khi triển khai được yêu cầu, gom typecheck/lint/build ở cuối; các bước thử thật cần tài khoản sinh viên, attempt/lượt AI hợp lệ, BE speech đã cấu hình và origin hợp lệ.
Cần kiểm tra thủ công cuối giai đoạn: quyền micro, voice vi/autoplay, PCM đúng định dạng, start/stop/deadline, partial-vs-committed, mất ACK/lookup, disconnect/JWT expiry và xác nhận nộp bài.

## 12. Definition of done
FE1 đi hết một lượt thi thật, backend kiểm soát thứ tự câu/thời gian/trạng thái, transcript chỉ được gắn đã lưu sau ACK/receipt, reconnect không bịa kết quả/lặp câu trả lời, hoàn tất bài có xác nhận BE1. Không gọi provider trực tiếp, lộ rubric/đáp án hoặc mặc định mock trong API mode.

## 13. Progress log
03/11/2026: đánh giá source BE main và FE working tree hoàn tất; tạo đề xuất này. Chưa code/runtime integration. Giữ nguyên .env thay đổi sẵn và các file .context của người dùng; không pull/reset/checkout working tree. Hướng ưu tiên: làm speech adapter FE1 ngay, chờ contract BE1 để nối toàn buổi thi.

### Triển khai theo phạm vi người dùng chốt
Người dùng yêu cầu có API nào nối API đó, không chờ BE bổ sung. Đã triển khai playback/ticket/receipt + speech WS, Browser TTS, PCM AudioWorklet, reducer/transcript/deadline và recovery giới hạn. ApiRoom dùng adapter thật; mock mode cũ không trở thành fallback. Link từ BE cần questionTurnId thật (`/check?questionTurnId=...`, được chuyển tiếp sang session); không suy ra từ danh sách câu hỏi và không tạo ID/mã mẫu. Không có API start/next/finish nên UI chờ hoặc dừng đúng phạm vi, không giả nộp bài. Đồng hồ FE không tự kết thúc vì chưa có serverTime, BE kiểm soát deadline.

Tài liệu bàn giao: docs/features/fe1-speech-integration.md. Không sửa .env thay đổi sẵn. Không chạy unit/ui-test theo người dùng; chỉ kiểm tra cuối typecheck/lint/build. Chưa thử account/audio/provider thật.

### Kết quả phạm vi hiện tại
Typecheck, lint (không warning) và production build đã đạt. AudioWorklet được xuất thành asset JS riêng (no-inline), không bị nhúng data URL. Build còn cảnh báo chunk JS >500KB, không thay đổi cấu trúc bundle ngoài phạm vi này. Không chạy unit/ui-test hoặc gọi speech bằng account/audio thật; chưa xác nhận STT/voice/micro/DB trên deployment.

Người dùng đã thu hẹp nghiệm thu ở phần API đang có: ba REST speech và WS, không gồm Definition of Done toàn buổi thi ở mục12 ban đầu. Phạm vi hẹp đã code xong và kiểm tra biên dịch; end-to-end thật cần BE có attempt/prompt hợp lệ và tài khoản sinh viên. Các milestoneB/C là backlog, không phải phần đang triển khai. Giữ kế hoạch active để theo dõi xác minh thực tế chưa có bằng chứng, không đánh dấu toàn bộ luồng thi đã hoàn tất.
