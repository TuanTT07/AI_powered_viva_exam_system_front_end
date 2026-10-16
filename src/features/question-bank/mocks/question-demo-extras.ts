import type { Question } from '../question-types'
// Synthetic question catalog for the explicit demonstration repositories.
const topics: Record<string, string[]> = {
  database: ['So sánh các mức cô lập giao dịch và hiện tượng phantom read.', 'Thiết kế chỉ mục cho truy vấn nhiều điều kiện và giải thích cách kiểm tra hiệu quả.', 'Phân tích lựa chọn khóa chính, khóa ngoại và ràng buộc toàn vẹn dữ liệu.', 'Thiết kế quy trình sao lưu và phục hồi dữ liệu sau sự cố.'],
  'java-core': ['Giải thích cơ chế quản lý bộ nhớ của JVM và vai trò của garbage collector.', 'So sánh String, StringBuilder và StringBuffer trong Java.', 'Phân biệt checked exception và unchecked exception bằng ví dụ.', 'Trình bày vòng đời của một thread và cách tránh race condition.', 'Phân tích hợp đồng equals và hashCode khi dùng HashMap.', 'Giải thích generic type và type erasure trong Java.'],
  'operating-systems': ['Phân biệt process và thread, phân tích chi phí chuyển ngữ cảnh.', 'So sánh các thuật toán lập lịch CPU và tiêu chí lựa chọn.', 'Giải thích deadlock và các điều kiện để deadlock xảy ra.', 'Trình bày cơ chế bộ nhớ ảo và xử lý page fault.', 'So sánh semaphore và mutex bằng một tình huống đồng bộ.', 'Mô tả cách hệ điều hành quản lý quyền truy cập tập tin.'],
  dsa: ['Phân tích độ phức tạp của tìm kiếm nhị phân.', 'So sánh quicksort và mergesort theo bộ nhớ và trường hợp xấu nhất.', 'Thiết kế cấu trúc dữ liệu cho bộ nhớ đệm LRU.', 'Giải thích sự khác biệt giữa BFS và DFS bằng ví dụ.', 'Trình bày thuật toán Dijkstra và giới hạn áp dụng.', 'Giải thích quy hoạch động qua bài toán cái túi.'],
  'intro-ai': ['Phân biệt học có giám sát và học không giám sát.', 'Giải thích overfitting và các biện pháp giảm thiểu.', 'So sánh precision, recall và F1 trong phân loại.', 'Trình bày quy trình chia tập huấn luyện, kiểm định và kiểm tra.', 'Giải thích gradient descent và ảnh hưởng của learning rate.', 'Đề xuất cách đánh giá độ tin cậy của mô hình AI.'],
  networks: ['So sánh mô hình TCP/IP và OSI.', 'Giải thích cơ chế bắt tay ba bước của TCP.', 'Mô tả cách DNS phân giải tên miền.', 'Phân tích sự khác biệt giữa TCP và UDP trong truyền dữ liệu.', 'Trình bày cách chia subnet và lựa chọn subnet mask.', 'Giải thích vai trò của TLS trong kết nối HTTPS.'],
  'software-engineering': ['Phân biệt yêu cầu chức năng và phi chức năng.', 'Trình bày cách phân rã một user story thành tiêu chí chấp nhận.', 'So sánh kiểm thử đơn vị, tích hợp và hệ thống.', 'Giải thích nguyên tắc SOLID bằng một ví dụ thiết kế.', 'Đề xuất quy trình review code và xử lý technical debt.', 'Phân tích trade-off giữa kiến trúc nguyên khối và microservices.'],
  security: ['Phân biệt xác thực và phân quyền trong ứng dụng web.', 'Giải thích SQL injection và cách phòng chống.', 'Phân tích rủi ro XSS và các biện pháp giảm thiểu.', 'Trình bày quy trình bảo vệ và luân chuyển khóa bí mật.', 'So sánh mã hóa đối xứng và bất đối xứng.', 'Thiết kế quy trình ghi log bảo mật mà không lộ dữ liệu nhạy cảm.'],
  ux: ['Giải thích quy trình nghiên cứu nhu cầu người dùng.', 'Đề xuất cách kiểm tra khả năng sử dụng của một biểu mẫu.', 'Phân tích sự khác biệt giữa navigation và information architecture.', 'Trình bày các nguyên tắc thiết kế hỗ trợ khả năng tiếp cận.', 'Thiết kế thử nghiệm A/B cho một luồng đăng ký.', 'Đề xuất cách đo hiệu quả cải tiến trải nghiệm người dùng.'],
}
export const questionDemoExtras: Question[] = Object.entries(topics).flatMap(([subjectId, rows]) => rows.map((content, index) => ({
  id: subjectId === 'database' ? `Q-DB-${String(index + 3).padStart(4, '0')}` : `Q-DEMO-${subjectId.toUpperCase()}-${String(index + 1).padStart(4, '0')}`,
  subjectId, content, topic: index < 3 ? 'Kiến thức nền tảng' : 'Ứng dụng & phân tích', bloom: index % 2 ? 'PHÂN TÍCH' : 'HIỂU', source: 'Thủ công', status: 'ĐÃ DUYỆT', rubric: '3 tiêu chí (10đ)',
})))
export function demoQuestionIds(subjectId: string) {
  if (subjectId === 'oop-java') return ['Q-OOP-0001', 'Q-OOP-0002', 'Q-OOP-0003', 'Q-OOP-0005', 'Q-OOP-0006']
  return [...(subjectId === 'database' ? ['Q-DB-0001', 'Q-DB-0002'] : []), ...questionDemoExtras.filter(q => q.subjectId === subjectId).map(q => q.id)]
}
