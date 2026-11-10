# Công bố kết quả một lần — 11/11/2026

BE/FE branch: fix/attempt-result-publication.

- Giảng viên lưu điểm từng câu, sau đó dùng “Công bố kết quả” và một dialog xác nhận cho toàn bộ lượt thi.
- Nút có ở cả màn chấm và xem điểm. Bị khóa nếu còn thiếu điểm, lượt thi chưa hoàn tất, đang tải/lưu/AI hoặc có chỉnh sửa chưa lưu. Trạng thái sau công bố: “Đã công bố kết quả bài thi”.
- Không loop gọi từng endpoint công bố cũ. Dùng một PUT endpoint mới, BE kiểm tra quyền/học phần, khóa lượt thi và các câu, kiểm tra đủ điểm rồi đặt publishedAt trong cùng transaction.
- Test PostgreSQL kiểm chứng: chưa đủ điểm ->409 và0 published; đủ3 -> một request publish đủ3 cùng timestamp; gọi lại không thay đổi timestamp; sinh viên không được công bố; student summary trả đủ3.
- FE test xác nhận một request đúng attemptId, dialog trước khi gửi, thiếu điểm thì disabled.
- BE cần được triển khai trước FE. Chưa thử công bố bằng tài khoản thật trên Render; không thay đổi điểm hoặc kết quả thật trong tác vụ này.

Kiểm tra cuối: BE103 tests pass (0 failures/errors/skips), package PASS. FE319 tests/77files pass, typecheck/build PASS; lint chỉ3 cảnh báo viva có sẵn. Database kiểm thử đã dọn. Commit/push trên nhánh fix/attempt-result-publication; chưa deploy.
