# Nghiệm thu sửa gốc chấm nhiều câu — 11/11/2026

## Thay đổi phối hợp
Cả BE và FE dùng nhánh `fix/complete-attempt-grading`. BE được sửa trước để trả tất cả QuestionAttempt thực tế, bao gồm các câu chưa có Evaluation. FE dùng danh sách này để chọn câu và tổng hợp, thay vì chỉ đọc những Evaluation đã tồn tại.

API giảng viên: `GET /api/exams/{examId}/attempts/{attemptId}/grading` trả thứ tự câu, trạng thái câu và evaluation có sẵn hoặc draft. GET không tạo đánh giá hoặc gọi AI. Các thao tác lưu/AI/công bố gửi đúng questionAttemptId đang chọn. Giữ phân quyền theo học phần và kiểm tra exam/attempt khớp.

API sinh viên: `GET /api/v1/student/exams/{attemptId}/result-summary` trả số câu thực tế và kết quả đã công bố, xác thực chủ sở hữu. Không lấy số câu tối đa từ cấu hình làm số câu đã thi. Không trả transcript chưa công bố.

UI: chọn Câu 1/2/3; trạng thái riêng; “Lưu điểm câu này”; dialog giải thích lưu chưa phải công bố; tổng kết xem điểm từng câu; không hiện 1/3 từ cấu hình. Sinh viên chờ kết quả đủ. Lỗi tải không dùng cache cũ để làm mất bài khỏi hàng đợi.

## Kết quả
- BE: 103 tests, 0 failures/errors/skips; chạy đầy đủ với PostgreSQL17 trong Docker dùng riêng cho test và `-Dinterview.pg.test=true`.
- Regression tích hợp controller/service qua MockMvc + PostgreSQL: tạo3 câu, chưa có Evaluation -> GET đủ3 và không phát sinh Evaluation -> lưu/công bố từng câu -> student summary đủ3. Tài khoản student không được đọc inventory giảng viên; student khác không được đọc summary.
- FE: 316 tests pass; typecheck và build pass. Lint chỉ còn3 cảnh báo có sẵn tại ApiInterviewRoom. Bổ sung test câu2/3 xuất hiện dù chỉ câu1 có Evaluation, lưu đúng ID câu2, API inventory khác attempt bị từ chối, không lẫn cache/điểm khi chuyển câu.
- Maven package thành công. Không thêm dependency/migration.

## Phạm vi chưa xác minh
Không kiểm chứng giọng nói/Deepgram hoặc dữ liệu thật của lượt thi trong ảnh. Không deploy. Cần BE mới trước FE mới; FE không fallback về endpoint tự chọn câu đầu khi inventory lỗi. Công bố vẫn theo từng câu, chưa có API công bố cả lượt thi nguyên tử.

Báo cáo này cập nhật giới hạn “chưa có API inventory” trong báo cáo grading-completeness-acceptance trước đó: API nay đã được triển khai trong nhánh BE mới, chưa phải bản BE deploy.
