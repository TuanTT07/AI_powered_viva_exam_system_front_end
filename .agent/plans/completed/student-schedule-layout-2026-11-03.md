# Bố cục lịch thi sinh viên
## 1. Goal
Lịch thi rõ ràng, ít khoảng trống, thao tác vào thi nổi bật.
## 2. Context
Ảnh người dùng: danh sách chỉ chiếm 7/12 chiều ngang, sidebar hướng dẫn lớn, card/nút/phân trang dàn dài.
## 3. Scope
StudentSchedulePortal và vùng API của StudentPortalView.
## 4. Non-goals
Không đổi API/quyền/speech/seed/mock, không commit/push.
## 5. Relevant Sources
AGENTS.md; UI_RULES, STATES; hai component hiện tại; ảnh; skill redesign-existing-projects đã đọc.
## 6. Current Behavior
Danh sách và hướng dẫn hai cột, toolbar nhiều khoảng trống, phân trang luôn hiện dù có một trang.
## 7. Target Behavior
Danh sách toàn chiều ngang, toolbar gọn, card nhấn ngày/tiêu đề/thời gian/nút vào phòng; hướng dẫn thành thanh nhỏ bên dưới. Mobile xếp dọc.
## 8. Architecture Constraints
Giữ TanStack Query, URL filter/page, attempt handoff và trạng thái API/mock.
## 9. Milestones
Chỉnh bố cục; kiểm tra UI và các test lịch thi hiện có; type/lint/build.
## 10. Risks
Không đổi eligibility từ status BE, không mất nhãn keyboard/empty/error hoặc đường dẫn attemptId.
## 11. Validation
Test repository/lịch thi; typecheck/lint/build; browser nếu có phiên hoặc harness cô lập. Không nhập credential thật hoặc gọi speech trong tác vụ UI.
## 12. Definition of Done
Bố cục mới và các trạng thái cũ chạy được, ghi rõ giới hạn browser.
## 13. Progress Log
03/11/2026: đọc working tree/component và ảnh, bắt đầu chỉnh bố cục.

03/11/2026: hoàn tất danh sách toàn chiều ngang, toolbar gọn, ngày/thông tin ca phân cấp rõ, secondary action dạng link và primary action riêng. Hướng dẫn chuyển thành thanh nhỏ dưới danh sách; ẩn pager khi một trang. Mobile bộ lọc trạng thái chiếm cả hàng để không cắt chữ; thứ tự nút và focus cùng DOM. Giữ API, eligibility, query params và mock.

Kiểm chứng: typecheck/lint/build và 21 test lịch thi/repository đạt; git diff --check sạch. Build còn warning bundle >500 kB có sẵn. Đăng nhập thành công bằng tài khoản seed student.fe1@aives.test trên FE local kết nối BE Render, quan sát dữ liệu thật cả Tổng quan và Kỳ thi của tôi. Desktop 1440px và mobile 390px: không tràn ngang, Tab từ trạng thái sang số ca; đã reset viewport. Ca test ban đầu IN_PROGRESS và sau đó BE trả COMPLETED; không thay đổi/reset ca hoặc thử speech trong tác vụ bố cục. Ảnh /tmp/aives-student-schedule-layout.png; tab IAB 3 giữ để xem kết quả. Không commit/push.
