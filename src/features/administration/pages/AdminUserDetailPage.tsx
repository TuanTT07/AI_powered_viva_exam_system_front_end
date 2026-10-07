import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { useResetUserPassword, useUpdateUser, useUser, useUserCourses } from '../user-hooks'
import { useRoles } from '../role-hooks'
import { ArrowLeft, User, KeyRound, BookOpen, AlertCircle, Loader2, Save, X } from 'lucide-react'

export function AdminUserDetailPage() {
  const { userId = '' } = useParams();

  const userQuery = useUser(userId); 
  const coursesQuery = useUserCourses(userId); 
  const rolesQuery = useRoles();

  const update = useUpdateUser(); 
  const reset = useResetUserPassword();

  const [editing, setEditing] = useState(false); 
  const [name, setName] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [role, setRole] = useState('LECTURER'); 
  const [password, setPassword] = useState('');

  if (userQuery.isLoading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );
  
  const user = userQuery.data;
  if (userQuery.isError || !user) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-red-500">
      <AlertCircle className="w-12 h-12 mb-4" />
      <h2 className="text-xl font-semibold">Không tìm thấy tài khoản hoặc bạn không có quyền.</h2>
      <Link to="/admin/users" className="mt-4 text-blue-600 hover:underline">Quay lại danh sách</Link>
    </div>
  );

  const beginEdit = () => { 
    setName(user.name); 
    setEmail(user.email); 
    setRole(user.role.toUpperCase()); 
    setEditing(true);
  };

  const isLecturer = user.role.toLowerCase() === 'lecturer';

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/admin/users"
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cột trái: Thông tin tài khoản */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6 overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <User className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Thông tin tài khoản</h2>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                  user.role.toLowerCase() === 'admin' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {user.role}
                </span>
              </div>

              {editing ? (
                <form 
                  onSubmit={(e) => { 
                    e.preventDefault(); 
                    update.mutate({ id: user.id, fullName: name, email, roleName: role }, { onSuccess: () => setEditing(false) }) 
                  }} 
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Họ tên</label>
                    <input 
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                      value={name} onChange={e => setName(e.target.value)} required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input 
                      type="email"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                      value={email} onChange={e => setEmail(e.target.value)} required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Vai trò</label>
                    <select 
                      value={role} onChange={e => setRole(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition bg-white"
                    >
                      {(rolesQuery.data || []).map(r => <option key={r.id} value={r.roleName}>{r.roleName}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button type="submit" disabled={update.isPending} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition-colors font-medium shadow-sm disabled:opacity-50">
                      <Save className="w-4 h-4" /> Lưu
                    </button>
                    <button type="button" onClick={() => setEditing(false)} className="flex items-center gap-2 border border-gray-300 text-slate-600 hover:bg-slate-50 rounded-lg px-4 py-2 transition-colors font-medium">
                      <X className="w-4 h-4" /> Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Họ tên</p>
                    <p className="text-lg font-semibold text-slate-800">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Mã số / Định danh</p>
                    <p className="text-slate-700 font-medium bg-slate-50 inline-block px-2 py-1 rounded-md">{user.identifier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Email</p>
                    <p className="text-slate-700">{user.email}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <button onClick={beginEdit} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition-colors font-medium shadow-sm">
                      Chỉnh sửa thông tin
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Môn học phụ trách (Chỉ hiện nếu là giảng viên) */}
            {isLecturer && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6 overflow-hidden">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Môn học phụ trách</h3>
                </div>
                
                {coursesQuery.isLoading ? (
                  <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 text-blue-600 animate-spin" /></div>
                ) : coursesQuery.data?.length ? (
                  <ul className="space-y-3">
                    {coursesQuery.data.map(course => (
                      <li key={course.id} className="bg-slate-50 border border-slate-100 rounded-lg p-3 hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
                        <Link to={`/admin/courses/${course.id}`} className="flex items-center gap-2 group">
                          <span className="font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">{course.code}</span>
                          <span className="text-slate-500 group-hover:text-blue-600 transition-colors">— {course.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 italic">Chưa được phân công môn học nào.</p>
                )}
              </div>
            )}
          </div>

          {/* Cột phải: Actions / Đổi mật khẩu */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6 overflow-hidden">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-4">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700">Đặt lại mật khẩu</h3>
              </div>
              
              <form 
                onSubmit={(e) => { 
                  e.preventDefault(); 
                  reset.mutate({ id: user.id, newPassword: password }, { 
                    onSuccess: () => { 
                      setPassword(''); 
                      window.alert('Đặt lại mật khẩu thành công!');
                    } 
                  }) 
                }} 
                className="space-y-3"
              >
                <div>
                  <input 
                    type="password" 
                    minLength={6} 
                    placeholder="Mật khẩu mới (tối thiểu 6 ký tự)" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={reset.isPending || password.length < 6}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-4 py-2 transition-colors font-medium shadow-sm disabled:opacity-50"
                >
                  {reset.isPending ? 'Đang xử lý...' : 'Đặt lại'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
