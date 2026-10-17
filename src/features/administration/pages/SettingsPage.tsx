import { Settings, ShieldCheck, Database, Sparkles } from 'lucide-react'

export function SettingsPage() {
  const settingSections = [
    {
      icon: Sparkles,
      title: 'Tham số AI khảo thí',
      description: 'Mô hình, ngôn ngữ và các tham số xử lý AI.',
      tone: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      icon: ShieldCheck,
      title: 'Quy chế & An toàn học thuật',
      description: 'Quy tắc bảo vệ dữ liệu và chính sách tham gia kỳ thi.',
      tone: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      icon: Database,
      title: 'Tích hợp dữ liệu',
      description: 'Kết nối học vụ và quản lý dữ liệu hệ thống.',
      tone: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      icon: Settings,
      title: 'Vận hành phòng thi',
      description: 'Quản lý cấu hình phòng thi và giới hạn phiên thi.',
      tone: 'bg-violet-50 text-violet-600 border-violet-100',
    },
  ]

  return (
    <section className="source-screen max-w-7xl mx-auto space-y-6 pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-sm border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-blue-200">
            <Sparkles size={13} className="text-amber-400" />
            <span>Quản trị hệ thống</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Cấu Hình Hệ Thống
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Các cấu hình vận hành được quản lý theo chính sách của hệ thống khảo thí.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingSections.map(({ icon: Icon, title, description, tone }) => (
          <article
            key={title}
            className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xs transition-all hover:shadow-md flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${tone}`}>
                <Icon size={22} />
              </div>
              <h2 className="text-base font-bold text-slate-900">{title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
            </div>
            <div className="pt-2">
              <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-500">
                Chưa khả dụng
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

