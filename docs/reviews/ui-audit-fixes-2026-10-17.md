# Kết quả xử lý UI — 17/10/2026

Nhánh sửa: `feature/role-profile-pages`, nền `ef99870`.

Đã xử lý UI-01 đến UI-20, đồng thời đổi danh sách môn học thành các hàng gọn trên desktop và thẻ xếp dọc trên mobile. Không thêm dependency hay API endpoint; .env local được giữ nguyên.

| Finding | Xử lý |
|---|---|
| UI-01 | Active tab nền xanh nhạt/chữ xanh đậm, không còn trùng màu. |
| UI-02 | Danh mục chủ đề demo lấy từ câu hỏi đúng học phần; chủ đề có thể để trống. |
| UI-03 | Button tổng hợp disabled sau spread, thêm aria-busy; kiểm tra pending=true/disabled=false. |
| UI-04 | Hồ sơ chỉ hiển thị định danh từ session; tùy chọn demo lưu localStorage theo user và báo đúng phạm vi. API chưa hỗ trợ thì không mở thao tác lưu giả. |
| UI-05 | Bỏ số liệu, lịch sử/IP, SSO/2FA và chứng nhận chưa có nguồn; mật khẩu demo chỉ kiểm tra form, không báo đổi thật. |
| UI-06 | Mock thống nhất 1–20 câu, 6 Bloom, topic tùy chọn, tự chọn tối đa 5 nguồn sẵn sàng; hướng dẫn API và demo riêng. |
| UI-07 | /device-check công khai kiểm tra micro/loa; không có nút mở phiên thi khi chưa có ngữ cảnh ca thi. |
| UI-08 | Người dùng/môn/phân công mock dùng cùng ID; link môn được gán có record thật. |
| UI-09 | Sidebar mobile đóng có inert; mở drawer giữ focus, background inert, đóng trả focus và resize desktop đóng drawer. |
| UI-10 | Nút đăng xuất có accessible name ở mobile, vùng bấm 44px. |
| UI-11 | Viva mobile đưa câu hỏi/trả lời lên trước camera; timer/phase/progress sticky. |
| UI-12 | Guard SPA cho câu hỏi, rubric và Viva demo; chỉ bỏ qua khi thành công hoặc chuyển có bảo toàn questionDraft. |
| UI-13 | Input gộp class mặc định/caller, giữ các thuộc tính input. |
| UI-14 | Nhãn Nhập CSV; ngân hàng dùng thuật ngữ câu hỏi. |
| UI-15 | Thống kê học phần derive từ repositories; mutation invalidate thống kê. Ngày kết quả dùng cùng exam seed. Hồ sơ demo chưa hoàn tất không mở chấm; bản xem thử chấm điểm có nhãn riêng. |
| UI-16 | Bỏ checkbox ghi nhớ không hoạt động; demo giữ identity trong sessionStorage của tab, xóa khi logout, không lưu password/token. Phiên API vẫn do backend quản lý. |
| UI-17 | Form đăng nhập ghi rõ chỉ nhận email; bỏ chỉ dẫn nhận MSSV không được hỗ trợ. |
| UI-18 | ScrollRestoration ở root, key theo pathname; focus nội dung chính khi chuyển route, search học phần giữ scroll. |
| UI-19 | Một main chính, bỏ h1 lặp/h1 thiếu; cập nhật breadcrumb student và editor, dịch các nhãn vận hành chính. |
| UI-20 | Xem kỳ thi truyền subject filter; tạo kỳ thi preselect học phần hợp lệ từ URL. |

## Bố cục học phần

- Header gọn và tổng số/đang phụ trách cùng dòng trên desktop.
- Từ khóa, trạng thái, đặt lại và số kết quả trên một thanh lọc.
- Mỗi học phần có mã/tên/khoa, trạng thái, ba thống kê và nút mở trên một hàng.
- Bốn hàng tại 1440 × 900 chiếm khoảng 350px; mobile 390 × 844 không tràn ngang, nhãn và nút vẫn rõ.
- Loading/error/retry, không có học phần và không có kết quả lọc được giữ lại.

## Xác minh

- Typecheck, lint, 190 test trong 53 file và production build pass. Sau tinh gọn listener, chạy lại 36 test liên quan và build đều pass.
- Test hồi quy: Button/Input props; guard điều hướng; profile authority/API failure/local demo persistence; demo auth reload/logout; 6 Bloom và biên count; mock topic/count/result date/course-link consistency.
- Browser: danh sách học phần desktop/mobile; active tab computed colors; Tab bỏ qua menu ẩn, drawer; default AI sinh 5 nháp; questionDraft quay lại từ Rubric nguyên vẹn; cảnh báo rời form; reload giữ demo session; kiểm tra thiết bị công khai không 404; Viva timer ở top=0 cùng input, draft vẫn còn sau khi hủy rời phiên.
- Không thực hiện ghi âm/cấp quyền micro-camera, đổi mật khẩu thật, lưu điểm, xóa hoặc publish dữ liệu backend. Build còn advisory bundle lớn, không phải lỗi build.
