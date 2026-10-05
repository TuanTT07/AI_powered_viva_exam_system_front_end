import { useState } from 'react';
import { Badge, Button, Input, Dialog } from '../../../components/ui/primitives';

interface Subject {
  id: string;
  code: string;
  name: string;
  department: string;
  lecturers: { name: string; initials: string }[];
  questionCount: number;
}

const MOCK_SUBJECTS: Subject[] = [
  { id: '1', code: 'INT2204', name: 'Lập trình OOP', department: 'Khoa CNTT', lecturers: [{ name: 'TS. Nguyễn Văn A', initials: 'VA' }, { name: 'ThS. Trần B', initials: 'TB' }], questionCount: 450 },
  { id: '2', code: 'INT2208', name: 'Kiến trúc máy tính', department: 'Khoa CNTT', lecturers: [{ name: 'PGS. Hoàng C', initials: 'HC' }], questionCount: 320 },
  { id: '3', code: 'MAT1092', name: 'Đại số tuyến tính', department: 'Khoa Toán Cơ', lecturers: [], questionCount: 0 },
  { id: '4', code: 'ECO101', name: 'Kinh tế vi mô', department: 'Khoa Kinh tế', lecturers: [{ name: 'TS. Lê D', initials: 'LD' }], questionCount: 120 },
];

function SubjectEditorDialog({
  subject,
  open,
  onClose,
  onSave,
}: {
  subject: Subject | null;
  open: boolean;
  onClose: () => void;
  onSave: (subject: Subject) => void;
}) {
  const [code, setCode] = useState(subject?.code || '');
  const [name, setName] = useState(subject?.name || '');
  const [department, setDepartment] = useState(subject?.department || 'Khoa CNTT');
  
  // Note: in a real app, assigning lecturers would use a multi-select component.
  // We mock the save process here.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: subject ? subject.id : Math.random().toString(),
      code,
      name,
      department,
      lecturers: subject ? subject.lecturers : [],
      questionCount: subject ? subject.questionCount : 0,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title={subject ? "Hồ sơ Môn học & Phân công" : "Khởi tạo Môn học mới"}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
        <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginTop: '-12px', marginBottom: '16px' }}>
          Quản lý mã định danh, đơn vị quản lý và danh sách giảng viên phụ trách hệ sinh thái câu hỏi.
        </p>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--navy)' }}>MÃ MÔN HỌC *</label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="VD: INT2204" required />
          </div>
          <div style={{ flex: 2 }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--navy)' }}>TÊN HỌC PHẦN *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên môn học tiếng Việt" required />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--navy)' }}>ĐƠN VỊ PHỤ TRÁCH (KHOA / VIỆN)</label>
          <select 
            value={department} 
            onChange={(e) => setDepartment(e.target.value)}
            style={{ width: '100%', minHeight: '42px', border: '1px solid var(--border)', borderRadius: '4px', padding: '0 12px', fontFamily: 'inherit', fontSize: '1rem' }}
          >
            <option value="Khoa CNTT">Khoa Công nghệ Thông tin</option>
            <option value="Khoa Toán Cơ">Khoa Toán Cơ Tin học</option>
            <option value="Khoa Kinh tế">Khoa Kinh tế</option>
            <option value="Viện ĐTQT">Viện Đào tạo Quốc tế</option>
          </select>
        </div>

        {subject && (
          <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'var(--muted)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 'bold', color: 'var(--navy-dark)', marginBottom: '12px', fontSize: '0.9rem' }}>GIẢNG VIÊN ĐƯỢC PHÂN CÔNG</div>
            {subject.lecturers.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {subject.lecturers.map((l, idx) => (
                  <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.85rem' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--soft)', color: 'var(--navy)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 'bold' }}>{l.initials}</div>
                    {l.name}
                  </span>
                ))}
                <button type="button" style={{ border: '1px dashed var(--border)', background: 'transparent', borderRadius: '4px', padding: '4px 12px', cursor: 'pointer', color: 'var(--secondary)', fontSize: '0.85rem' }}>+ Thêm</button>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Chưa có giảng viên nào phụ trách. Ngân hàng câu hỏi sẽ bị đóng băng.</div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
          <Button type="button" variant="outline" onClick={onClose}>Hủy bỏ</Button>
          <Button type="submit" variant="primary">Lưu hồ sơ môn học</Button>
        </div>
      </form>
    </Dialog>
  );
}

export function SubjectManagementPage() {
  const [subjects, setSubjects] = useState<Subject[]>(MOCK_SUBJECTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const filteredSubjects = subjects.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase()) || s.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = activeFilter === 'all' 
      ? true 
      : activeFilter === 'assigned' 
        ? s.lecturers.length > 0 
        : s.lecturers.length === 0;
    return matchSearch && matchFilter;
  });

  const handleSave = (savedSubject: Subject) => {
    if (isAdding) {
      setSubjects([savedSubject, ...subjects]);
    } else {
      setSubjects(subjects.map(s => s.id === savedSubject.id ? savedSubject : s));
    }
    setIsAdding(false);
    setEditingSubject(null);
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header & Quick Stats */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Hệ thống Quản trị &gt; Danh mục</span>
            <span style={{ color: 'var(--border)' }}>•</span>
            <Badge tone="success">Đồng bộ SIS: 06:00 Hôm nay</Badge>
          </div>
          <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--navy-dark)' }}>Quản lý Môn học & Phân công</h1>
          <p style={{ margin: '8px 0 0 0', color: 'var(--secondary)', maxWidth: '600px' }}>Kiểm soát hệ sinh thái học phần, theo dõi tiến độ xây dựng ngân hàng câu hỏi và ủy quyền giảng viên.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 20px', gap: '24px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 'bold' }}>TỔNG MÔN HỌC</span>
              <span style={{ fontSize: '1.25rem', color: 'var(--navy)', fontWeight: 'bold' }}>{subjects.length}</span>
            </div>
            <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border)' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 'bold' }}>ĐÃ PHÂN CÔNG</span>
              <span style={{ fontSize: '1.25rem', color: 'var(--navy)', fontWeight: 'bold' }}>{subjects.filter(s => s.lecturers.length > 0).length}</span>
            </div>
            <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border)' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 'bold' }}>CHƯA PHÂN CÔNG</span>
              <span style={{ fontSize: '1.25rem', color: 'var(--danger)', fontWeight: 'bold' }}>{subjects.filter(s => s.lecturers.length === 0).length}</span>
            </div>
          </div>
          <Button variant="primary" onClick={() => setIsAdding(true)} style={{ height: '100%', padding: '0 24px' }}>
            + Thêm môn học
          </Button>
        </div>
      </section>

      {/* Filters */}
      <section style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Input 
          placeholder="Tìm mã môn, tên môn, khoa viện..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: '300px' }}
        />
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 'bold', marginRight: '8px' }}>TRẠNG THÁI:</span>
          {(['all', 'assigned', 'unassigned'] as const).map(filter => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                cursor: 'pointer',
                backgroundColor: activeFilter === filter ? 'var(--navy)' : 'var(--muted)',
                color: activeFilter === filter ? '#fff' : 'var(--secondary)',
                transition: 'all 0.2s'
              }}
            >
              {filter === 'all' ? `Tất cả` : filter === 'assigned' ? `Đã phân công` : `Chưa phân công`}
            </button>
          ))}
        </div>
      </section>

      {/* Table */}
      <section style={{ backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--secondary)' }}>Mã & Tên Học Phần</th>
              <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--secondary)' }}>Khoa / Viện</th>
              <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--secondary)' }}>Giảng viên phụ trách</th>
              <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--secondary)' }}>Ngân hàng Câu hỏi</th>
              <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--secondary)', textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubjects.length > 0 ? filteredSubjects.map((subject) => (
              <tr key={subject.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                      {subject.code.substring(0, 3)}
                    </div>
                    <div>
                      <span style={{ display: 'block', fontWeight: 'bold', color: 'var(--navy-dark)' }}>{subject.name}</span>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--secondary)', marginTop: '2px' }}>{subject.code}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <Badge tone="neutral">{subject.department}</Badge>
                </td>
                <td style={{ padding: '16px' }}>
                  {subject.lecturers.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {subject.lecturers.map((l, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--muted)', padding: '2px 8px 2px 2px', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--navy-dark)', border: '1px solid var(--border)' }}>
                          <span style={{ backgroundColor: 'var(--soft)', width: '20px', height: '20px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.6rem' }}>{l.initials}</span>
                          {l.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 'bold', backgroundColor: 'var(--danger-soft)', padding: '4px 8px', borderRadius: '4px' }}>Chưa phân công</span>
                  )}
                </td>
                <td style={{ padding: '16px' }}>
                  {subject.questionCount > 0 ? (
                    <span style={{ fontWeight: 'bold', color: 'var(--navy-dark)' }}>{subject.questionCount} <span style={{ fontWeight: 'normal', color: 'var(--secondary)', fontSize: '0.85rem' }}>câu</span></span>
                  ) : (
                    <span style={{ color: 'var(--danger)' }}>Trống</span>
                  )}
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <Button variant="outline" onClick={() => setEditingSubject(subject)}>Thiết lập</Button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--secondary)' }}>Không tìm thấy học phần phù hợp.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {(editingSubject || isAdding) && (
        <SubjectEditorDialog
          subject={editingSubject}
          open={!!editingSubject || isAdding}
          onClose={() => { setEditingSubject(null); setIsAdding(false); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
