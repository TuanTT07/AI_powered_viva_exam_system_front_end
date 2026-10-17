import { DemoLabel } from '../../../components/common/inline-notice'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, Mic, ShieldCheck, Volume2, Wifi, Sparkles, ArrowRight } from 'lucide-react'
import { Alert, Button } from '../../../components/ui/primitives'
import { useOnline } from '../../../hooks/use-online'
import { useDeviceCheck } from '../use-device-check'
import { runtimeConfig } from '../../../services/api/runtime-config'

export function EquipmentCheckPage({ standalone = false }: { standalone?: boolean }) {
  const { examId = '' } = useParams()
  const navigate = useNavigate()
  const device = useDeviceCheck()
  const online = useOnline()
  const ready = device.mic === 'passed' && device.speaker === 'passed' && online

  return (
    <section className="source-screen max-w-6xl mx-auto space-y-6 pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-sm border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-blue-200">
              <Sparkles size={13} className="text-amber-400" />
              <span>Cổng khảo thí thí sinh · Phòng chờ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Kiểm tra thiết bị trước khi thi
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Kiểm tra micro, loa và kết nối trước khi vào phòng vấn đáp để đảm bảo quá trình thi diễn ra thuận lợi.
            </p>
          </div>
        </div>
      </div>

      {runtimeConfig.dataSource === 'mock' && (
        <DemoLabel
          detail={
            standalone
              ? 'Kiểm tra thiết bị trên máy; không cấp quyền vào thi.'
              : 'Phiên demo · Kiểm tra thiết bị thật; phiên thi tiếp theo là mô phỏng.'
          }
        />
      )}

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-5">
          {/* Microphone Card */}
          <section className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center text-sm font-semibold">
              <span className="flex items-center gap-2.5 text-slate-900">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Mic size={18} />
                </div>
                <span>Microphone</span>
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  device.mic === 'passed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : device.mic === 'testing'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {device.mic === 'passed'
                  ? 'Đã nhận âm thanh'
                  : device.mic === 'testing'
                  ? 'Đang nghe thử'
                  : 'Chưa xác nhận'}
              </span>
            </div>

            <div className="bg-gradient-to-b from-slate-950 to-slate-900 p-8 sm:p-12 flex flex-col items-center gap-5 text-slate-300 relative overflow-hidden">
              <div
                className={`p-6 rounded-full transition-all duration-300 ${
                  device.mic === 'testing'
                    ? 'bg-blue-600/30 text-blue-400 ring-8 ring-blue-500/20 scale-110'
                    : device.mic === 'passed'
                    ? 'bg-emerald-600/20 text-emerald-400'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Mic size={36} />
              </div>
              <p className="text-sm text-center text-slate-200 font-medium">
                Hãy nói một câu ngắn để kiểm tra mức âm thanh.
              </p>
              <div className="w-full max-w-md space-y-1.5">
                <meter
                  className="w-full h-3 rounded-full overflow-hidden block"
                  min={0}
                  max={100}
                  value={device.volume}
                  aria-label="Mức âm thanh micro"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Yên lặng</span>
                  <span className="font-mono">{device.volume}%</span>
                  <span>Tối đa</span>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-3">
              {device.error && <Alert tone="danger">{device.error}</Alert>}
              <div className="flex flex-wrap gap-2.5">
                <Button
                  variant="outline"
                  onClick={() => void device.startMic()}
                  disabled={device.mic === 'testing'}
                >
                  {device.mic === 'untested'
                    ? 'Cho phép và kiểm tra micro'
                    : device.mic === 'testing'
                    ? 'Hãy nói để kiểm tra…'
                    : 'Kiểm tra lại micro'}
                </Button>
                {device.mic === 'testing' && (
                  <Button variant="outline" onClick={() => void device.startMic()}>
                    Khởi động lại kiểm tra
                  </Button>
                )}
              </div>
            </div>
          </section>

          {/* Speaker Card */}
          <section className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex gap-2.5 items-center">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Volume2 size={18} />
              </div>
              <span>Loa / tai nghe</span>
            </h2>
            <p className="text-sm text-slate-500">Phát tiếng bíp, sau đó xác nhận bạn nghe rõ âm thanh.</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                disabled={device.speaker === 'playing'}
                onClick={() => void device.testSpeaker()}
              >
                {device.speaker === 'playing' ? 'Đang phát…' : 'Phát âm thanh thử'}
              </Button>
              {device.speaker === 'confirm' && (
                <Button onClick={device.confirmSpeaker}>Tôi nghe rõ âm thanh</Button>
              )}
              {device.speaker === 'passed' && (
                <span className="text-sm text-emerald-700 flex items-center gap-2 font-semibold">
                  <CheckCircle2 size={16} /> Đã xác nhận nghe rõ
                </span>
              )}
            </div>
            {device.speaker === 'error' && (
              <Alert tone="danger">Không thể phát âm thanh. Kiểm tra loa hoặc tai nghe rồi thử lại.</Alert>
            )}
          </section>
        </div>

        {/* Right Sidebar */}
        <aside className="lg:col-span-5 space-y-4">
          <section className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex gap-2 items-center">
              <ShieldCheck size={18} className="text-blue-600" />
              <span>Hướng dẫn trước khi vào thi</span>
            </h2>
            <ol className="list-decimal pl-5 text-sm text-slate-600 space-y-2.5">
              <li>Chọn nơi yên tĩnh, sử dụng tai nghe nếu có.</li>
              <li>Cho phép micro và nói thử để kiểm tra tín hiệu.</li>
              <li>Nghe âm thanh thử và xác nhận loa hoạt động.</li>
              <li>Giữ kết nối mạng ổn định trong suốt phiên thi.</li>
            </ol>
            <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
              Kiểm tra thiết bị không xác nhận điều kiện vào thi. Quyền tham gia do hệ thống quyết định.
            </p>
          </section>

          <section className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 shadow-xs">
            <span className="flex gap-2.5 items-center text-sm font-semibold text-slate-900">
              <Wifi size={18} className="text-blue-600" />
              <span>Kết nối thiết bị</span>
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                online
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-rose-50 text-rose-700 border border-rose-200/60'
              }`}
            >
              {online ? 'Có mạng · chưa xác minh máy chủ' : 'Mất kết nối'}
            </span>
          </section>

          {!online && <Alert tone="danger">Kết nối lại mạng để tiếp tục.</Alert>}

          {!standalone && (
            <div className="border border-blue-200/80 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/50 p-5 sm:p-6 space-y-4 shadow-xs">
              <h2 className="text-base font-bold text-blue-900">Sẵn sàng vào phòng vấn đáp</h2>
              <p className="text-xs text-blue-800 leading-relaxed">
                {ready
                  ? 'Thiết bị đã được kiểm tra.'
                  : 'Hoàn tất micro, loa và kết nối mạng để tiếp tục.'}
              </p>
              <Button
                disabled={!ready}
                className="w-full flex items-center justify-center gap-2"
                onClick={() => {
                  device.stop()
                  navigate(`/student/exams/${examId}/session`)
                }}
              >
                Tiếp tục vào phòng thi
                <ArrowRight size={15} />
              </Button>
            </div>
          )}

          {!standalone && runtimeConfig.dataSource === 'mock' && (
            <Link className="button outline w-full text-center" to={`/student/exams/${examId}/session`}>
              Xem mô phỏng không dùng micro
            </Link>
          )}

          <Link
            className="button outline w-full text-center"
            to={standalone ? '/login' : `/student/exams/${examId}`}
          >
            {standalone ? 'Về đăng nhập' : 'Quay lại ca thi'}
          </Link>
        </aside>
      </div>
    </section>
  )
}

