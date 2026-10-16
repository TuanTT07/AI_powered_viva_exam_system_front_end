// Presentation fixtures: imported only by the explicitly selected demo workspace.
export const gradingDemo = {
  question: 'Phân biệt ArrayList và LinkedList trong Java. Khi cần truy cập ngẫu nhiên theo chỉ số, bạn chọn cấu trúc nào và vì sao?',
  criteria: [
    { id: 'structure', name: 'Cấu trúc lưu trữ', max: 3, ai: 3, evidence: 'Phân biệt mảng động và danh sách liên kết đôi.' },
    { id: 'access', name: 'Truy cập ngẫu nhiên', max: 3, ai: 2.5, evidence: 'Chọn ArrayList, giải thích truy cập theo chỉ số O(1).' },
    { id: 'changes', name: 'Thêm và xóa phần tử', max: 4, ai: 3, evidence: 'Nêu chi phí dịch chuyển phần tử; cần làm rõ vị trí thêm/xóa.' },
  ],
  transcript: [
    { role: 'ai', text: 'Em hãy phân biệt ArrayList và LinkedList trong Java.', time: '00:00' },
    { role: 'student', text: 'ArrayList lưu trên mảng động, LinkedList gồm các node liên kết đôi. Thêm xóa ở đầu danh sách liên kết không cần dịch chuyển cả mảng.', time: '00:10' },
    { role: 'ai', text: 'Nếu thường xuyên truy cập phần tử theo chỉ số, em chọn cấu trúc nào?', time: '01:00' },
    { role: 'student', text: 'Em chọn ArrayList vì truy cập theo chỉ số có độ phức tạp O(1); LinkedList cần duyệt các node.', time: '01:12' },
  ],
}
