# Nghiệm thu sửa tổng hợp điểm — 11/11/2026

## Phạm vi và kết luận
Đã sửa FE để không lấy điểm một câu làm điểm toàn bài. Chưa nghiệm thu trọn luồng chấm đủ mọi câu bằng tài khoản thật. Chưa deploy.

## Nguyên nhân xác nhận từ mã nguồn
- AttemptTable dùng `.find()` lấy một Evaluation rồi hiển thị finalScore như điểm cả lượt thi.
- localStorage.confirmed được dùng như bằng chứng chốt điểm trong API mode.
- Hàng đợi chỉ xét những Evaluation đã tồn tại, không xét thiếu câu so với cấu hình.
- Trang tổng hợp chỉ tải trang đầu của API evaluations.
- BE main (EvaluationController, EvaluationService, EvaluationRepository) chỉ liệt kê các Evaluation đã tồn tại. Không có API giảng viên liệt kê đầy đủ QuestionAttempt chưa có Evaluation. Nhận examAttemptId ở API một câu có thể resolve về câu đầu.

## Hành vi sau sửa
- Điểm từng câu và tổng hợp phân biệt rõ. Đủ số câu chính, đúng examAttemptId, tất cả GRADED, điểm/rubric hợp lệ mới có điểm tổng hợp.
- Mới chốt 1/2: hiển thị tiến độ 1/2 và chưa đủ dữ liệu; không hiện 9.5 là điểm cả bài.
- Dùng chính sách trung bình đều hiện có, quy đổi từng rubric về /10 trước khi tính trung bình. Không thêm trọng số tùy chỉnh.
- Số câu dự kiến lấy từ maxMainQuestions backend, không dùng giá trị mặc định 1 của mapper để chứng minh hoàn tất. Thiếu cấu hình thì chưa kết luận điểm.
- Bảng summary mở bằng examAttemptId, không bằng ID câu đầu. Danh sách và workspace dùng chung hàm tải đủ các trang.
- Lượt thi thiếu câu tiếp tục nằm trong hàng đợi.
- API mode không lấy điểm hoặc xác nhận chính thức từ localStorage.
- Sinh viên chỉ có điểm tổng hợp khi đủ các câu chính được công bố và có maxScore hợp lệ; vẫn xem được từng câu đã công bố.

## Kịch bản kiểm thử tự động
- 1 câu 9.5/10 trên bài 2 câu: tổng null, tiến độ 1/2.
- Hai câu 9.5 và 6.5: tổng 8.0/10.
- Rubric 8/10 và 12/20: tổng 7.0/10.
- Điểm 0 hợp lệ; điểm NaN, vượt trần, mẫu số 0, bản ghi trùng, số câu thiếu/thừa: không báo hoàn tất.
- Cùng sinh viên nhưng khác examAttemptId: không gộp.
- Local confirmation không biến bài thiếu câu thành đủ điểm.
- Tải đủ trang 2, 3; lỗi trang sau không trả danh sách một phần như thành công.
- Kết quả sinh viên 1/2: chưa có điểm toàn bài hoặc trạng thái đạt/trượt.

## Giới hạn chưa nghiệm thu
- Chưa đăng nhập tài khoản giảng viên/sinh viên và chưa đọc dữ liệu thật của lượt thi trong ảnh.
- Nếu BE chỉ có Evaluation câu 1 thì FE không thể suy ra UUID câu 2. Cần BE trả đầy đủ danh sách QuestionAttempt (id, questionOrder, trạng thái và rubric/evaluation nếu có), hoặc bảo đảm tạo bản nháp Evaluation cho mọi câu đã thi. Không gọi AI hoặc tạo câu giả để lấp chỗ trống.
- maxMainQuestions là cấu hình tối đa, chưa phải số câu thực tế được gán trong mọi tình huống. FE cố ý không báo hoàn tất khi số bản ghi khác cấu hình; BE cần trả số lượng/IDs thực tế để xử lý dứt điểm trường hợp này.
- Chưa có bản tổng điểm backend riêng hay contract trọng số. UI gọi kết quả là điểm tổng hợp, không giả nhận đó là bản chốt toàn bài từ BE.

## Kết quả chạy kiểm tra
- Typecheck: PASS.
- Lint: không lỗi; 3 cảnh báo có sẵn tại ApiInterviewRoom.tsx.
- Test: 75 files, 312 tests PASS.
- Build: PASS; còn cảnh báo bundle >500 kB.
- git diff --check: PASS.
- Browser end-to-end với backend thật: CHƯA KIỂM CHỨNG.

Kết luận: đạt kiểm thử tự động phần FE tổng hợp/completeness; chưa đạt nghiệm thu toàn luồng mở/chấm câu chưa có Evaluation ở BE.
