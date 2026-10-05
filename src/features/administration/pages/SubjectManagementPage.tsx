import { useState } from 'react';
import { PageHeader } from '../../../components/common/states';
import { Button, Input, Dialog } from '../../../components/ui/primitives';

interface Subject {
  id: string;
  code: string;
  name: string;
  lecturers: string[];
}

const MOCK_SUBJECTS: Subject[] = [
  { id: '1', code: 'SWD391', name: 'Software Architecture and Design', lecturers: ['Trần Thị B'] },
  { id: '2', code: 'PRJ301', name: 'Java Web Application Development', lecturers: ['Trần Thị B', 'Phạm Thị D'] },
  { id: '3', code: 'PRO192', name: 'Object-Oriented Programming', lecturers: [] },
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
  const [lecturers, setLecturers] = useState(subject?.lecturers.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject) {
      onSave({
        ...subject,
        code,
        name,
        lecturers: lecturers.split(',').map((l) => l.trim()).filter(Boolean),
      });
    } else {
      onSave({
        id: Math.random().toString(),
        code,
        name,
        lecturers: lecturers.split(',').map((l) => l.trim()).filter(Boolean),
      });
    }
  };

  if (subject && subject.id !== (open && subject ? subject.id : '')) {
    setCode(subject.code);
    setName(subject.name);
    setLecturers(subject.lecturers.join(', '));
  } else if (!subject && open && code === '' && name === '' && lecturers === '') {
    // Wait, let's reset form correctly on new subject
  }

  return (
    <Dialog open={open} onClose={onClose} title={subject ? "Chỉnh sửa môn học" : "Thêm môn học mới"}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
        <div>
          <label>Mã môn học</label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} required />
        </div>
        <div>
          <label>Tên môn học</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Giảng viên phụ trách (cách nhau bằng dấu phẩy)</label>
          <Input value={lecturers} onChange={(e) => setLecturers(e.target.value)} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
          <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="primary">Lưu thay đổi</Button>
        </div>
      </form>
    </Dialog>
  );
}

export function SubjectManagementPage() {
  const [subjects, setSubjects] = useState<Subject[]>(MOCK_SUBJECTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const filteredSubjects = subjects.filter(
    (s) =>
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveSubject = (savedSubject: Subject) => {
    if (isAdding) {
      setSubjects([...subjects, savedSubject]);
    } else {
      setSubjects(subjects.map((s) => (s.id === savedSubject.id ? savedSubject : s)));
    }
    setEditingSubject(null);
    setIsAdding(false);
  };

  const handleAddNew = () => {
    setEditingSubject(null);
    setIsAdding(true);
  };

  const closeDialog = () => {
    setEditingSubject(null);
    setIsAdding(false);
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <PageHeader
          title="Môn học và phân công"
          description="Quản lý danh sách môn học và phạm vi phụ trách của giảng viên."
          eyebrow="Administration"
        />
        <Button onClick={handleAddNew} variant="primary">Thêm môn học</Button>
      </div>
      
      <div className="search-filter-bar" style={{ marginBottom: '24px' }}>
        <Input
          placeholder="Tìm kiếm môn học..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', maxWidth: '400px' }}
        />
      </div>

      <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #C6C5CF' }}>
            <th style={{ padding: '12px 8px' }}>Mã môn</th>
            <th style={{ padding: '12px 8px' }}>Tên môn học</th>
            <th style={{ padding: '12px 8px' }}>Giảng viên phụ trách</th>
            <th style={{ padding: '12px 8px' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject) => (
              <tr key={subject.id} style={{ borderBottom: '1px solid #EBE8E2' }}>
                <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{subject.code}</td>
                <td style={{ padding: '12px 8px' }}>{subject.name}</td>
                <td style={{ padding: '12px 8px' }}>
                  {subject.lecturers.length > 0 ? subject.lecturers.join(', ') : <span style={{ color: '#76767F' }}>Chưa phân công</span>}
                </td>
                <td style={{ padding: '12px 8px' }}>
                  <Button variant="outline" onClick={() => setEditingSubject(subject)}>Phân công / Sửa</Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ padding: '24px', textAlign: 'center' }}>Không tìm thấy môn học.</td>
            </tr>
          )}
        </tbody>
      </table>

      {(editingSubject || isAdding) && (
        <SubjectEditorDialog
          subject={editingSubject}
          open={!!editingSubject || isAdding}
          onClose={closeDialog}
          onSave={handleSaveSubject}
        />
      )}
    </div>
  );
}
