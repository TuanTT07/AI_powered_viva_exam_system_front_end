import { useState, useId, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  Shield,
  Lock,
  CheckCircle2,
  Camera,
  Mic,
  Wifi,
  Sparkles,
  BookOpen,
  Calendar,
  Award,
  KeyRound,
  Mail,
  Building,
  Eye,
  EyeOff,
  Laptop,
  Clock,
  ArrowRight,
  GraduationCap,
  Sliders,
  ShieldCheck,
  Check,
  Smartphone,
} from 'lucide-react'
import { useSession } from '../../app/providers/use-session'
import { runtimeConfig } from '../../services/api/runtime-config'
import { apiChangePassword } from '../auth/api-auth-adapter'
import { useLecturerSubjects } from '../subjects/subject-hooks'
import { Button, Input, Badge, Alert } from '../../components/ui/primitives'
import { SourceMetric, SourcePageHeader } from '../../components/common/source-page'

export function ProfilePage() {
  const { session } = useSession()
  const user = session.user
  const role = user?.roles[0] ?? 'student'

  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'preferences'>('overview')

  // Personal Info Edit state
  const [isEditingInfo, setIsEditingInfo] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName ?? 'Người dùng AIVES')
  const [phoneNumber, setPhoneNumber] = useState('0912 345 678')
  const [department, setDepartment] = useState(
    role === 'student'
      ? 'Khoa Công nghệ Thông tin - K66'
      : role === 'lecturer'
      ? 'Bộ môn Kỹ thuật Phần mềm & Hệ thống Thông tin'
      : 'Phòng Khảo thí & Đảm bảo Chất lượng Đào tạo'
  )
  const [infoSaveSuccess, setInfoSaveSuccess] = useState(false)

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [passwordPending, setPasswordPending] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Preferences state
  const [notifyBeforeExam, setNotifyBeforeExam] = useState(true)
  const [notifyResultReleased, setNotifyResultReleased] = useState(true)
  const [aiNoiseCancellation, setAiNoiseCancellation] = useState(true)
  const [liveTranscription, setLiveTranscription] = useState(true)
  const [prefSaveSuccess, setPrefSaveSuccess] = useState(false)

  // Queries for lecturer subjects if applicable
  const lecturerSubjects = useLecturerSubjects()

  const currentPwId = useId()
  const newPwId = useId()
  const confirmPwId = useId()

  const roleMeta = {
    student: {
      label: 'Thí sinh Vấn đáp',
      codePrefix: 'MSSV',
      code: 'SV-2026-889',
      tone: 'blue' as const,
      badgeTone: 'info' as const,
      avatarBg: 'bg-blue-600',
    },
    lecturer: {
      label: 'Giảng viên / Giám khảo',
      codePrefix: 'MSGV',
      code: 'GV-4021',
      tone: 'emerald' as const,
      badgeTone: 'success' as const,
      avatarBg: 'bg-emerald-600',
    },
    admin: {
      label: 'Quản trị viên hệ thống',
      codePrefix: 'MSCB',
      code: 'AD-001',
      tone: 'amber' as const,
      badgeTone: 'warning' as const,
      avatarBg: 'bg-indigo-600',
    },
  }[role]

  const handleInfoSubmit = (e: FormEvent) => {
    e.preventDefault()
    setIsEditingInfo(false)
    setInfoSaveSuccess(true)
    setTimeout(() => setInfoSaveSuccess(false), 3000)
  }

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setPasswordSuccess(null)
    setPasswordError(null)

    if (!currentPassword) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có tối thiểu 6 ký tự.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp.')
      return
    }

    setPasswordPending(true)
    try {
      if (runtimeConfig.dataSource === 'api') {
        await apiChangePassword({ currentPassword, newPassword })
      } else {
        // Mock flow simulation
        await new Promise((resolve) => setTimeout(resolve, 600))
      }
      setPasswordSuccess('Đổi mật khẩu thành công. Thông tin bảo mật tài khoản đã được cập nhật.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.'
      setPasswordError(message)
    } finally {
      setPasswordPending(false)
    }
  }

  const handlePrefSave = () => {
    setPrefSaveSuccess(true)
    setTimeout(() => setPrefSaveSuccess(false), 3000)
  }

  // Calculate password strength indicator
  const passwordStrength = () => {
    if (!newPassword) return 0
    let score = 0
    if (newPassword.length >= 6) score += 33
    if (newPassword.length >= 8 && /[A-Z]/.test(newPassword)) score += 33
    if (/[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword)) score += 34
    return Math.min(score, 100)
  }

  return (
    <div className="source-screen max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Breadcrumb & Header */}
      <SourcePageHeader
        eyebrow="Tài khoản cá nhân"
        title="Hồ Sơ & Cài Đặt Cá Nhân"
        description="Quản lý định danh học thuật, thiết bị kiểm tra phòng thi, bảo mật tài khoản và tùy chọn hệ thống."
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Tài khoản đang hoạt động
            </span>
          </div>
        }
      />

      {/* Main Profile Hero Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-transparent rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            {/* Avatar circle */}
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${roleMeta.avatarBg} text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-lg shadow-blue-500/15 shrink-0`}>
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {displayName}
                </h1>
                <Badge tone={roleMeta.badgeTone}>{roleMeta.label}</Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {role === 'student' ? 'student@academia.edu.vn' : role === 'admin' ? 'admin@academia.edu.vn' : 'lecturer@academia.edu.vn'}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-mono text-slate-600 font-medium">
                  {roleMeta.codePrefix}: {roleMeta.code}
                </span>
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{department}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => setIsEditingInfo(!isEditingInfo)}
              className="text-xs"
            >
              <User className="w-3.5 h-3.5" />
              {isEditingInfo ? 'Đóng chỉnh sửa' : 'Cập nhật thông tin'}
            </Button>
            {role === 'student' && (
              <Link to="/student/exams/demo-exam/check" className="button primary text-xs">
                <Mic className="w-3.5 h-3.5" />
                Kiểm tra Mic &amp; Camera
              </Link>
            )}
            {role === 'lecturer' && (
              <Link to="/lecturer/subjects" className="button primary text-xs">
                <BookOpen className="w-3.5 h-3.5" />
                Môn học phụ trách
              </Link>
            )}
            {role === 'admin' && (
              <Link to="/admin/users" className="button primary text-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                Quản lý người dùng
              </Link>
            )}
          </div>
        </div>

        {/* Inline Edit Form Modal / Accordion */}
        {isEditingInfo && (
          <form onSubmit={handleInfoSubmit} className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="profile-fullname" className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và tên hiển thị
              </label>
              <Input
                id="profile-fullname"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="text-sm"
              />
            </div>
            <div>
              <label htmlFor="profile-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại liên lạc
              </label>
              <Input
                id="profile-phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <label htmlFor="profile-department" className="block text-xs font-semibold text-slate-700 mb-1">
                Khoa / Bộ môn công tác
              </label>
              <Input
                id="profile-department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditingInfo(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit">
                Lưu thông tin
              </Button>
            </div>
          </form>
        )}

        {infoSaveSuccess && (
          <div className="mt-4">
            <Alert tone="success">
              Đã cập nhật thông tin cá nhân thành công!
            </Alert>
          </div>
        )}
      </div>

      {/* Profile Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6" aria-label="Profile Tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Thông tin tổng quan</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'security'}
            onClick={() => setActiveTab('security')}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Bảo mật &amp; Mật khẩu</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'preferences'}
            onClick={() => setActiveTab('preferences')}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'preferences'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Tùy chọn &amp; Thông báo</span>
          </button>
        </nav>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics depending on role */}
          {role === 'student' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SourceMetric label="KỲ THI ĐỦ ĐIỀU KIỆN" value="3" icon={Calendar} tone="blue" detail="2 kỳ thi đang mở đăng ký" />
              <SourceMetric label="ĐÃ HOÀN THÀNH" value="2" icon={CheckCircle2} tone="emerald" detail="Đã công bố biên bản thi" />
              <SourceMetric label="ĐIỂM TRUNG BÌNH VIVA" value="8.6" icon={Award} tone="blue" detail="Thang điểm 10 học thuật" />
              <SourceMetric label="ĐỘ CHUẨN RUBRIC AI" value="92%" icon={Sparkles} tone="emerald" detail="Khớp đánh giá giám khảo" />
            </div>
          )}

          {role === 'lecturer' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SourceMetric
                label="MÔN HỌC PHỤ TRÁCH"
                value={lecturerSubjects.data?.length ?? '3'}
                icon={BookOpen}
                tone="blue"
                detail="Được phân công chính thức"
              />
              <SourceMetric label="KỲ THI ĐÃ TẠO" value="4" icon={Calendar} tone="emerald" detail="2 kỳ thi đang hoạt động" />
              <SourceMetric label="BÀI THI ĐÃ CHẤM" value="85" icon={Award} tone="slate" detail="Lượt vấn đáp đã tổng kết" />
              <SourceMetric label="ĐỒNG THUẬN RUBRIC" value="94.8%" icon={Sparkles} tone="emerald" detail="Gợi ý AI được xác nhận" />
            </div>
          )}

          {role === 'admin' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SourceMetric label="CẤP ĐỘ PHÂN QUYỀN" value="Admin" icon={Shield} tone="blue" detail="Toàn quyền hệ thống" />
              <SourceMetric label="CHUẨN BẢO MẬT" value="ISO 27001" icon={ShieldCheck} tone="emerald" detail="Mã hóa AES-256 đầu cuối" />
              <SourceMetric label="MÁY CHỦ KHẢO THÍ" value="Trực tuyến" icon={Laptop} tone="emerald" detail="Độ trễ phản hồi < 120ms" />
              <SourceMetric label="TÀI KHOẢN HỆ THỐNG" value="120+" icon={User} tone="slate" detail="Sinh viên, giảng viên, cán bộ" />
            </div>
          )}

          {/* Role-specific detailed sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Main Role Details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Profile Academic Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    <span>Thông tin hồ sơ học thuật</span>
                  </h2>
                  <Badge tone="info">Chính thức</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-medium">Họ và tên:</span>
                    <p className="font-semibold text-slate-800">{displayName}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 font-medium">{roleMeta.codePrefix}:</span>
                    <p className="font-mono font-semibold text-slate-800">{roleMeta.code}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 font-medium">Email học thuật:</span>
                    <p className="font-semibold text-slate-800">
                      {role === 'student' ? 'student@academia.edu.vn' : role === 'admin' ? 'admin@academia.edu.vn' : 'lecturer@academia.edu.vn'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 font-medium">Số điện thoại liên lạc:</span>
                    <p className="font-semibold text-slate-800">{phoneNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 font-medium">Khoa / Đơn vị:</span>
                    <p className="font-semibold text-slate-800">{department}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 font-medium">Hệ thống cấp tài khoản:</span>
                    <p className="font-semibold text-slate-800">Cổng Khảo thí Trực tuyến AIVES</p>
                  </div>
                </div>
              </div>

              {/* Specific features for Student: Preflight Device Status */}
              {role === 'student' && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Laptop className="w-5 h-5 text-blue-600" />
                      <span>Thiết bị phòng thi &amp; Môi trường Viva</span>
                    </h2>
                    <Link to="/student/exams/demo-exam/check" className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
                      <span>Kiểm tra lại</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Mic className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-900">Microphone</h4>
                        <p className="text-[11px] text-emerald-700 mt-0.5">Thu âm chuẩn hóa • Lọc nhiễu</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-900">Camera HD</h4>
                        <p className="text-[11px] text-emerald-700 mt-0.5">Sinh trắc học • Nhận diện</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Wifi className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-900">Đường truyền</h4>
                        <p className="text-[11px] text-emerald-700 mt-0.5">Ping 18ms • Băng thông tốt</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Specific features for Lecturer: Assigned Courses preview */}
              {role === 'lecturer' && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-emerald-600" />
                      <span>Học phần được phân công giảng dạy &amp; chấm thi</span>
                    </h2>
                    <Link to="/lecturer/subjects" className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
                      <span>Xem tất cả môn</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {lecturerSubjects.data && lecturerSubjects.data.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {lecturerSubjects.data.slice(0, 3).map((sub) => (
                        <div key={sub.id} className="py-2.5 flex items-center justify-between gap-3">
                          <div>
                            <Link to={`/lecturer/subjects/${sub.id}`} className="font-semibold text-slate-900 hover:text-blue-600 text-xs sm:text-sm">
                              {sub.name}
                            </Link>
                            <p className="text-[11px] text-slate-500">{sub.code} • {sub.department}</p>
                          </div>
                          <Link to={`/lecturer/subjects/${sub.id}/materials`} className="text-xs font-medium text-blue-600 hover:underline">
                            Kho tài liệu RAG
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
                      Đang đồng bộ danh sách học phần từ máy chủ...
                    </div>
                  )}
                </div>
              )}

              {/* Specific features for Admin: System Security Status */}
              {role === 'admin' && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-indigo-600" />
                      <span>Tình trạng máy chủ &amp; Giám sát toàn hệ thống</span>
                    </h2>
                    <Link to="/admin/settings" className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
                      <span>Cấu hình máy chủ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[11px] text-slate-500 font-semibold block">Dịch vụ Auth &amp; JWT</span>
                      <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                        <Check className="w-3.5 h-3.5" /> 100% Sẵn sàng
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[11px] text-slate-500 font-semibold block">Phòng Viva WebSocket</span>
                      <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                        <Check className="w-3.5 h-3.5" /> Hoạt động ổn định
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[11px] text-slate-500 font-semibold block">Mô-đun RAG &amp; Vector DB</span>
                      <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                        <Check className="w-3.5 h-3.5" /> Đã chỉ mục tài liệu
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Right 1 Col: Security Summary & Activity Feed */}
            <div className="space-y-6">
              
              {/* Account Quick Status */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Xác thực &amp; Bảo mật</span>
                </h3>

                <ul className="space-y-2.5 text-xs text-slate-600 list-none p-0 m-0">
                  <li className="flex items-center justify-between">
                    <span className="text-slate-500">Liên kết VNU SSO:</span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã kết nối
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-slate-500">Google Workspace:</span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã kết nối
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-slate-500">Mã hóa kết nối:</span>
                    <span className="font-semibold text-slate-800">TLS 1.3 / AES-256</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-slate-500">Thời hạn phiên đăng nhập:</span>
                    <span className="font-semibold text-slate-800">24 giờ</span>
                  </li>
                </ul>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('security')}
                    className="w-full py-2 px-3 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Đổi mật khẩu tài khoản</span>
                  </button>
                </div>
              </div>

              {/* Recent Activity Log */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Lịch sử đăng nhập gần nhất</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="border-l-2 border-emerald-500 pl-3 py-0.5">
                    <p className="font-semibold text-slate-800">Phiên hiện tại (Chrome / macOS)</p>
                    <span className="text-[11px] text-slate-400">Hôm nay, 01:10 • IP: 118.70.x.x (VNU Network)</span>
                  </div>
                  <div className="border-l-2 border-slate-200 pl-3 py-0.5">
                    <p className="font-medium text-slate-600">Đăng nhập cổng SSO thành công</p>
                    <span className="text-[11px] text-slate-400">16/10/2026, 17:45 • Trình duyệt máy tính</span>
                  </div>
                  <div className="border-l-2 border-slate-200 pl-3 py-0.5">
                    <p className="font-medium text-slate-600">Kiểm tra kết nối thiết bị preflight</p>
                    <span className="text-[11px] text-slate-400">15/10/2026, 14:20 • Đạt chuẩn âm thanh</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Change Password Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <span>Đổi mật khẩu tài khoản học thuật</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Để bảo vệ quyền lợi cá nhân và dữ liệu khảo thí, mật khẩu nên có tối thiểu 6 ký tự, bao gồm chữ hoa, chữ thường và chữ số.
              </p>
            </div>

            {passwordSuccess && (
              <Alert tone="success">
                {passwordSuccess}
              </Alert>
            )}

            {passwordError && (
              <Alert tone="danger">
                {passwordError}
              </Alert>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4" noValidate>
              {/* Current Password */}
              <div>
                <label htmlFor={currentPwId} className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mật khẩu hiện tại <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id={currentPwId}
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại..."
                    required
                    className="pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    aria-label={showCurrentPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label htmlFor={newPwId} className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id={newPwId}
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                    required
                    className="pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    aria-label={showNewPw ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'}
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength() <= 33
                            ? 'bg-red-500 w-1/3'
                            : passwordStrength() <= 66
                            ? 'bg-amber-500 w-2/3'
                            : 'bg-emerald-500 w-full'
                        }`}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Độ mạnh mật khẩu:{' '}
                      <strong className={passwordStrength() <= 33 ? 'text-red-500' : passwordStrength() <= 66 ? 'text-amber-600' : 'text-emerald-600'}>
                        {passwordStrength() <= 33 ? 'Yếu' : passwordStrength() <= 66 ? 'Trung bình' : 'Mạnh'}
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor={confirmPwId} className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id={confirmPwId}
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    required
                    className="pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    aria-label={showConfirmPw ? 'Ẩn xác nhận mật khẩu' : 'Hiện xác nhận mật khẩu'}
                  >
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button pending={passwordPending} type="submit">
                  Cập nhật mật khẩu
                </Button>
              </div>
            </form>
          </div>

          {/* Right Security Advisories */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Quy định an toàn khảo thí</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 list-disc pl-4">
                <li>Không chia sẻ tài khoản hoặc mật khẩu với bất kỳ ai, kể cả cán bộ coi thi.</li>
                <li>Trước mỗi ca thi vấn đáp, hệ thống sẽ tự động đối soát thông tin qua Camera sinh trắc học.</li>
                <li>Nếu nghi ngờ tài khoản bị lộ, hãy đổi mật khẩu ngay và báo với bộ phận hỗ trợ kỹ thuật qua hotline <strong>1900 6828</strong>.</li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Xác thực hai yếu tố (2FA)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Tài khoản được bảo vệ qua hệ thống xác thực tập trung VNU SSO. Khi đăng nhập từ thiết bị lạ, hệ thống sẽ gửi mã OTP về email học thuật được cấp.
              </p>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bảo vệ 2 lớp đang kích hoạt</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Preferences */}
      {activeTab === 'preferences' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6 max-w-4xl">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600" />
              <span>Tùy chọn trải nghiệm &amp; Thông báo phòng thi</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Cá nhân hóa trải nghiệm âm thanh, hiển thị và kênh thông báo kỳ thi của bạn.
            </p>
          </div>

          {prefSaveSuccess && (
            <Alert tone="success">
              Đã lưu cài đặt tùy chọn thành công!
            </Alert>
          )}

          <div className="divide-y divide-slate-100 space-y-4 text-xs sm:text-sm">
            {/* Notification 1 */}
            <div className="pt-4 flex items-center justify-between gap-4">
              <div>
                <strong className="block font-semibold text-slate-800">Nhắc nhở lịch thi vấn đáp qua Email</strong>
                <p className="text-xs text-slate-500 mt-0.5">Gửi email thông báo trước ca thi 24 giờ và 1 giờ kèm đường link vào phòng thi.</p>
              </div>
              <input
                type="checkbox"
                checked={notifyBeforeExam}
                onChange={(e) => setNotifyBeforeExam(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
            </div>

            {/* Notification 2 */}
            <div className="pt-4 flex items-center justify-between gap-4">
              <div>
                <strong className="block font-semibold text-slate-800">Thông báo khi có kết quả chính thức</strong>
                <p className="text-xs text-slate-500 mt-0.5">Nhận email ngay khi giám khảo hoàn tất chấm điểm và công bố biên bản.</p>
              </div>
              <input
                type="checkbox"
                checked={notifyResultReleased}
                onChange={(e) => setNotifyResultReleased(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
            </div>

            {/* Audio Option 1 */}
            <div className="pt-4 flex items-center justify-between gap-4">
              <div>
                <strong className="block font-semibold text-slate-800">Khử nhiễu môi trường bằng AI (Voice AI Clean)</strong>
                <p className="text-xs text-slate-500 mt-0.5">Tự động loại bỏ tiếng ồn xung quanh trong phiên thi vấn đáp trực tiếp với giám khảo AI.</p>
              </div>
              <input
                type="checkbox"
                checked={aiNoiseCancellation}
                onChange={(e) => setAiNoiseCancellation(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
            </div>

            {/* Audio Option 2 */}
            <div className="pt-4 flex items-center justify-between gap-4">
              <div>
                <strong className="block font-semibold text-slate-800">Hiển thị phụ đề lời thoại thời gian thực (Live Transcript)</strong>
                <p className="text-xs text-slate-500 mt-0.5">Chuyển giọng nói của Giám khảo AI thành văn bản trực tiếp trên màn hình thi.</p>
              </div>
              <input
                type="checkbox"
                checked={liveTranscription}
                onChange={(e) => setLiveTranscription(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button onClick={handlePrefSave}>
              Lưu cài đặt
            </Button>
          </div>
        </div>
      )}

    </div>
  )
}
