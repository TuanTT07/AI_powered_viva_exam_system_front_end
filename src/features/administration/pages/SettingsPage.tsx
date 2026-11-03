import { Settings, ShieldCheck, Database, Sparkles } from 'lucide-react'
import '../admin.css'

export function SettingsPage() {
  const settingSections = [
    {
      icon: Sparkles,
      title: 'Tham số AI khảo thí',
      description: 'Mô hình, ngôn ngữ và các tham số xử lý AI.',
      tone: 'metric-icon-wrap--blue',
    },
    {
      icon: ShieldCheck,
      title: 'Quy chế & An toàn học thuật',
      description: 'Quy tắc bảo vệ dữ liệu và chính sách tham gia kỳ thi.',
      tone: 'metric-icon-wrap--emerald',
    },
    {
      icon: Database,
      title: 'Tích hợp dữ liệu',
      description: 'Kết nối học vụ và quản lý dữ liệu hệ thống.',
      tone: 'metric-icon-wrap--indigo',
    },
    {
      icon: Settings,
      title: 'Vận hành phòng thi',
      description: 'Quản lý cấu hình phòng thi và giới hạn phiên thi.',
      tone: 'metric-icon-wrap--amber',
    },
  ]

  return (
    <section className="admin-page">
      {/* Modern Hero Header Banner matching Lecturer style */}
      <header className="admin-hero">
        <div className="admin-hero-content">
          <div className="admin-hero-badge">
            <Sparkles size={14} />
            <span>AIVES · CẤU HÌNH HỆ THỐNG</span>
          </div>
          <h1 className="admin-hero-title">Cấu Hình Hệ Thống</h1>
          <p className="admin-hero-desc">
            Các cấu hình vận hành và tham số khảo thí được quản lý theo chính sách của hệ thống.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingSections.map(({ icon: Icon, title, description, tone }) => (
          <article
            key={title}
            className="dashboard-section justify-between hover:border-blue-300 transition-colors"
          >
            <div className="space-y-3">
              <div className={`metric-icon-wrap ${tone}`}>
                <Icon size={22} />
              </div>
              <h2 className="text-base font-bold text-slate-900">{title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex justify-between items-center">
              <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                Chưa khả dụng
              </span>
              <span className="text-xs text-slate-400">Thiết lập theo quyền SuperAdmin</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
