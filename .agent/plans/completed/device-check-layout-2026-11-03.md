# Nâng cấp bố cục kiểm tra thiết bị

## 1. Goal
Trang kiểm tra thiết bị gọn, dễ theo dõi và dùng được trên màn hình nhỏ.
## 2. Context
Người dùng yêu cầu cải thiện trang trong ảnh: banner lớn, micro và loa xếp dài, hướng dẫn chiếm cột riêng.
## 3. Scope
Chỉ bố cục EquipmentCheckPage và trạng thái hiển thị từ hook đang có.
## 4. Non-goals
Không đổi media hook, API, điều kiện vào thi, speech, commit/push/deploy.
## 5. Relevant Sources
AGENTS.md; docs/design/UI_RULES.md, STATES.md; use-device-check.ts; EquipmentCheckPage; ảnh người dùng; skill redesign-existing-projects.
## 6. Current Behavior
Banner lớn; micro/loa xếp dọc; hướng dẫn ở sidebar, thao tác tiếp tục tách khỏi kiểm tra.
## 7. Target Behavior
Tiêu đề gọn, tiến độ hai thiết bị, micro/loa cạnh nhau trên desktop, hướng dẫn bên dưới và thanh thao tác rõ ràng. Mobile xếp dọc.
## 8. Architecture Constraints
Tái sử dụng primitives và hook; không thêm dependency, không tự cấp quyền thiết bị hoặc tạo kết quả kiểm tra.
## 9. Milestones
Chỉnh bố cục; kiểm chứng type/lint/build và browser công khai /device-check.
## 10. Risks
Không làm mất retry/error, xác nhận nghe rõ, cleanup hoặc attemptId/questionTurnId qua navigation.
## 11. Validation
Typecheck, lint, build; kiểm tra browser trạng thái ban đầu và keyboard; không bật micro thực hoặc tiêu credit speech. Các trạng thái khác đọc đối chiếu code/hook hiện có.
## 12. Definition of Done
Bố cục mới hiển thị, đủ control/trạng thái và điều kiện tiếp tục không thay đổi; ghi rõ giới hạn kiểm thử.
## 13. Progress Log
03/11/2026: đọc component/hook, hướng dẫn UI và ảnh; bắt đầu bố cục gọn với hai thiết bị song song.

03/11/2026: hoàn tất tiêu đề gọn, tiến độ 0/2 từ kết quả thật, hai cột micro/loa desktop, trạng thái mạng riêng, hướng dẫn ngắn và thanh điều hướng cuối trang. Giữ retry/error, xác nhận nghe rõ, điều kiện ready và attemptId/questionTurnId.

Typecheck/lint/build đạt; build còn cảnh báo bundle >500 kB có sẵn. Kiểm tra browser /device-check ở 1280px và 390px: bố cục hai cột/xếp dọc, scrollWidth bằng clientWidth; phím Tab chuyển từ nút micro sang phát âm thanh. Đã reset viewport; ảnh desktop /tmp/aives-device-check-layout.png. Không bật micro, phát âm thanh thật hoặc kiểm tra phiên thi bằng JWT thật; không chạy toàn bộ speech suite. Không thêm test cho thay đổi bố cục thuần túy; chạy test hook thiết bị hiện có. Không commit/push.
