import { useState } from 'react';
import { Button, Input, Badge, Dialog } from '../../../components/ui/primitives';

type UserRole = 'admin' | 'lecturer' | 'student';
type UserStatus = 'active' | 'inactive';

interface User {
  id: string;
  name: string;
  identifier: string; // e.g. CB-201402
  email: string;
  role: UserRole;
  status: UserStatus;
  subjects?: string[];
  initials: string;
}

const MOCK_USERS: User[] = [
  { id: '1', name: 'TS. Nguyễn Văn An', identifier: 'CB-201402', email: 'nguyenvanan@academia.edu.vn', role: 'lecturer', status: 'active', subjects: ['Lập trình Java Core', 'OOP'], initials: 'NA' },
  { id: '2', name: 'TS. Lê Quang Dũng', identifier: 'CB-201618', email: 'dung.lq@academia.edu.vn', role: 'lecturer', status: 'active', subjects: ['Cấu trúc dữ liệu & Giải thuật'], initials: 'LD' },
  { id: '3', name: 'Ban Quản trị Hệ thống', identifier: 'SYS-ROOT-01', email: 'admin.viva@academia.edu.vn', role: 'admin', status: 'active', initials: 'QT' },
  { id: '4', name: 'Trần Mai Linh', identifier: 'SV-21020485', email: 'linh.tm21020485@sv.academia.edu.vn', role: 'student', status: 'active', subjects: ['K66-CAC'], initials: 'TL' },
  { id: '5', name: 'Cán bộ Hoàng Văn Tuấn', identifier: 'CB-201209', email: 'tuan.hv@academia.edu.vn', role: 'lecturer', status: 'inactive', subjects: ['Kiến trúc máy tính'], initials: 'HT' },
];

function AccountEditorDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (user: any) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('lecturer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: Math.random().toString(),
      name,
      identifier: 'NEW-USER',
      email,
      role,
      status: 'active',
      initials: name.substring(0, 2).toUpperCase()
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title="Hồ sơ Cấp phát Tài khoản Khảo thí">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
        <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginTop: '-12px', marginBottom: '16px' }}>Cấp quyền truy cập hệ thống chấm thi vấn đáp AI cho cán bộ, hội đồng hoặc thí sinh.</p>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--navy)' }}>HỌ VÀ TÊN NGƯỜI DÙNG *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: TS. Phan Bá Hưng" required />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--navy)' }}>THƯ ĐIỆN TỬ (EMAIL) *</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hung.pb@academia.edu.vn" required />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--navy)' }}>MẬT KHẨU KHỞI TẠO BAN ĐẦU *</label>
            <span style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Bắt buộc đổi khi đăng nhập lần đầu</span>
          </div>
          <Input value="AkademiaViva@2025!" readOnly />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--navy)' }}>CHỌN VAI TRÒ HỆ THỐNG *</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {(['admin', 'lecturer', 'student'] as UserRole[]).map((r) => (
              <label key={r} style={{ flex: 1, padding: '12px', border: `1px solid ${role === r ? 'var(--navy)' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: role === r ? 'var(--soft)' : 'var(--surface)', textAlign: 'center' }}>
                <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} style={{ display: 'none' }} />
                <span style={{ display: 'block', fontWeight: 'bold', color: 'var(--navy-dark)' }}>
                  {r === 'admin' ? 'Admin' : r === 'lecturer' ? 'Giảng viên' : 'Sinh viên'}
                </span>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '4px' }}>
                  {r === 'admin' ? 'Quản trị toàn quyền' : r === 'lecturer' ? 'Khảo thí & chấm điểm' : 'Thí sinh vấn đáp'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
          <Button type="button" variant="outline" onClick={onClose}>Hủy bỏ</Button>
          <Button type="submit" variant="primary">Lưu & Kích hoạt</Button>
        </div>
      </form>
    </Dialog>
  );
}

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRoleFilter, setActiveRoleFilter] = useState<'all' | UserRole>('all');
  const [isAddingUser, setIsAddingUser] = useState(false);

  const filteredUsers = users.filter((u) => {
    const lowerSearch = searchTerm.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(lowerSearch) || u.email.toLowerCase().includes(lowerSearch) || u.identifier.toLowerCase().includes(lowerSearch);
    const matchRole = activeRoleFilter === 'all' || u.role === activeRoleFilter;
    return matchSearch && matchRole;
  });

  const handleSaveUser = (newUser: User) => {
    setUsers([newUser, ...users]);
    setIsAddingUser(false);
  };

  const toggleStatus = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header & Quick Stats */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Badge tone="neutral">Lưu trữ Quyền Hạn v4.8</Badge>
            <span style={{ color: 'var(--border)' }}>•</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Niên khoá 2024–2025</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--navy-dark)' }}>Sổ cái Quản trị Người dùng & Phân quyền</h1>
          <p style={{ margin: '8px 0 0 0', color: 'var(--secondary)', maxWidth: '600px' }}>Danh mục tài khoản học thuật, vai trò phân quyền và trạng thái cấp phép trong hệ thống thi vấn đáp VivaAI.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 20px', gap: '24px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 'bold' }}>TỔNG TÀI KHOẢN</span>
              <span style={{ fontSize: '1.25rem', color: 'var(--navy)', fontWeight: 'bold' }}>{users.length}</span>
            </div>
            <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border)' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 'bold' }}>HOẠT ĐỘNG</span>
              <span style={{ fontSize: '1.25rem', color: 'var(--navy)', fontWeight: 'bold' }}>{users.filter(u => u.status === 'active').length}</span>
            </div>
            <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border)' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 'bold' }}>ĐÃ KHÓA</span>
              <span style={{ fontSize: '1.25rem', color: 'var(--secondary)', fontWeight: 'bold' }}>{users.filter(u => u.status === 'inactive').length}</span>
            </div>
          </div>
          <Button variant="primary" onClick={() => setIsAddingUser(true)} style={{ height: '100%', padding: '0 24px' }}>
            + Cấp tài khoản mới
          </Button>
        </div>
      </section>

      {/* Filters */}
      <section style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Input 
          placeholder="Tìm theo họ tên, mã cán bộ/SV, hòm thư..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: '300px' }}
        />
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 'bold', marginRight: '8px' }}>LỌC VAI TRÒ:</span>
          {(['all', 'admin', 'lecturer', 'student'] as const).map(role => (
            <button 
              key={role}
              onClick={() => setActiveRoleFilter(role)}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                cursor: 'pointer',
                backgroundColor: activeRoleFilter === role ? 'var(--navy)' : 'var(--muted)',
                color: activeRoleFilter === role ? '#fff' : 'var(--secondary)',
                transition: 'all 0.2s'
              }}
            >
              {role === 'all' ? `Tất cả (${users.length})` : role === 'admin' ? `Admin (${users.filter(u => u.role === 'admin').length})` : role === 'lecturer' ? `Giảng viên (${users.filter(u => u.role === 'lecturer').length})` : `Sinh viên (${users.filter(u => u.role === 'student').length})`}
            </button>
          ))}
        </div>
      </section>

      {/* Table */}
      <section style={{ backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--secondary)' }}>Họ và tên & Mã định danh</th>
              <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--secondary)' }}>Email học viện</th>
              <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--secondary)' }}>Vai trò</th>
              <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--secondary)' }}>Phạm vi phụ trách</th>
              <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--secondary)' }}>Trạng thái</th>
              <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--secondary)', textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border)', opacity: user.status === 'inactive' ? 0.7 : 1 }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: user.role === 'admin' ? 'var(--navy)' : 'var(--muted)', color: user.role === 'admin' ? '#fff' : 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {user.initials}
                    </div>
                    <div>
                      <span style={{ display: 'block', fontWeight: 'bold', color: 'var(--navy-dark)' }}>{user.name}</span>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--secondary)', marginTop: '2px' }}>{user.identifier}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px', color: 'var(--secondary)', fontSize: '0.9rem' }}>{user.email}</td>
                <td style={{ padding: '16px' }}>
                  <Badge tone={user.role === 'admin' ? 'ai' : 'neutral'}>
                    {user.role === 'admin' ? 'Admin' : user.role === 'lecturer' ? 'Giảng viên' : 'Sinh viên'}
                  </Badge>
                </td>
                <td style={{ padding: '16px' }}>
                  {user.subjects && user.subjects.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {user.subjects.map(s => (
                        <span key={s} style={{ padding: '4px 8px', backgroundColor: 'var(--muted)', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text)' }}>{s}</span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Toàn hệ thống</span>
                  )}
                </td>
                <td style={{ padding: '16px' }}>
                  <Badge tone={user.status === 'active' ? 'info' : 'danger'}>
                    {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                  </Badge>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '8px' }}>
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--navy)', cursor: 'pointer', fontWeight: 'bold', padding: '4px 8px' }}>Sửa</button>
                    <button onClick={() => toggleStatus(user.id)} style={{ background: 'transparent', border: 'none', color: 'var(--secondary)', cursor: 'pointer', fontWeight: 'bold', padding: '4px 8px' }}>
                      {user.status === 'active' ? 'Khóa' : 'Mở khóa'}
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--secondary)' }}>Không tìm thấy người dùng phù hợp.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {isAddingUser && (
        <AccountEditorDialog open={isAddingUser} onClose={() => setIsAddingUser(false)} onSave={handleSaveUser} />
      )}
    </div>
  );
}
