import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { useAssignLecturer, useCourse, useCourseLecturers, useDeleteCourse, useRemoveLecturer } from '../course-hooks'
import { useUsers } from '../user-hooks'
import { ArrowLeft, BookOpen, Trash2, UserPlus, UserMinus, Loader2, AlertCircle } from 'lucide-react'

export function AdminCourseDetailPage() {
  const { courseId = '' } = useParams(); 
  const navigate = useNavigate(); 
  
  const courseQuery = useCourse(courseId); 
  const lecturersQuery = useCourseLecturers(courseId); 
  const usersQuery = useUsers({ role: 'lecturer', size: 100 }); 
  
  const assign = useAssignLecturer(); 
  const remove = useRemoveLecturer(); 
  const del = useDeleteCourse(); 
  
  const [selected, setSelected] = useState('')

  if (courseQuery.isLoading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  const course = courseQuery.data; 
  if (courseQuery.isError || !course) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-red-500">
      <AlertCircle className="w-12 h-12 mb-4" />
      <h2 className="text-xl font-semibold">Không tìm thấy môn học hoặc bạn không có quyền.</h2>
      <Link to="/admin/courses" className="mt-4 text-blue-600 hover:underline">Quay lại danh sách</Link>
    </div>
  );

  const lecturers = lecturersQuery.data || course.lecturers || [];
  const available = (usersQuery.data?.content || []).filter(u => !lecturers.some(l => l.id === u.id))

  const handleRemoveLecturer = (lecturerId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn gỡ giảng viên này khỏi môn học?')) {
      remove.mutate({ courseId, lecturerId });
    }
  };

  const handleDeleteCourse = () => {
    if (window.confirm('CẢNH BÁO: Bạn có thực sự muốn xóa môn học này? Hành động này không thể hoàn tác.')) {
      del.mutate(courseId, { onSuccess: () => navigate('/admin/courses') })
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to="/admin/courses"
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Quay lại</span>
            </Link>
          </div>
          <button 
            onClick={handleDeleteCourse}
            disabled={del.isPending}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 transition-colors font-medium shadow-sm disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa môn học</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cột trái: Thông tin môn học */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6 overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{course.name}</h1>
                  <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
                    <span className="font-medium bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">Mã: {course.code}</span>
                    {course.department && <span>Phòng ban: {course.department}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Quản lý giảng viên */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6 overflow-hidden">
              <h3 className="text-lg font-semibold text-slate-700 border-b border-gray-100 pb-3 mb-4">
                Giảng viên phụ trách
              </h3>
              
              {/* Danh sách giảng viên hiện tại */}
              <div className="space-y-3 mb-6">
                {lecturers.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Chưa có giảng viên nào.</p>
                ) : (
                  lecturers.map(lecturer => (
                    <div key={lecturer.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg group">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{lecturer.name}</p>
                        <p className="text-xs text-slate-500">{lecturer.email}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveLecturer(lecturer.id)}
                        disabled={remove.isPending}
                        title="Gỡ giảng viên"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Form phân công thêm */}
              <div className="border-t border-gray-100 pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phân công giảng viên mới
                </label>
                <div className="flex flex-col gap-3">
                  <select
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition bg-white"
                  >
                    <option value="">-- Chọn giảng viên --</option>
                    {available.map(u => (
                      <option key={u.id} value={u.id}>{u.name} - {u.email}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => assign.mutate({ courseId, lecturerId: selected }, { onSuccess: () => setSelected('') })}
                    disabled={!selected || assign.isPending}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition-colors font-medium shadow-sm disabled:opacity-50 w-full"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Phân công</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
