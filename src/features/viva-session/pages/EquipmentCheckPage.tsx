import { DemoLabel } from '../../../components/common/inline-notice'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Headphones,
  Mic,
  Volume2,
  Wifi,
} from 'lucide-react'
import { Alert, Button } from '../../../components/ui/primitives'
import { useOnline } from '../../../hooks/use-online'
import { useDeviceCheck } from '../use-device-check'
import { studentRoomSearch } from '../../exams/student-exam-navigation'
import { runtimeConfig } from '../../../services/api/runtime-config'
import '../../students/student.css'

export function EquipmentCheckPage({ standalone = false }: { standalone?: boolean }) {
  const { examId = '' } = useParams()
  const navigate = useNavigate()
  const [search] = useSearchParams()
  const speechSearch = studentRoomSearch(search)
  const device = useDeviceCheck()
  const online = useOnline()
  const ready = device.mic === 'passed' && device.speaker === 'passed' && online
  const completed = Number(device.mic === 'passed') + Number(device.speaker === 'passed')
  const micLabel = {
    untested: 'Chưa kiểm tra',
    testing: 'Đang kiểm tra',
    passed: 'Đạt',
    error: 'Cần thử lại',
  }[device.mic]
  const speakerLabel = {
    untested: 'Chưa kiểm tra',
    playing: 'Đang phát',
    confirm: 'Chờ xác nhận',
    passed: 'Đạt',
    error: 'Cần thử lại',
  }[device.speaker]
  const statusClass = (passed: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
      passed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
    }`

  return (
    <section className="student-page">
      {/* Modern Hero Greeting / Header Banner matching Lecturer style */}
      <header className="student-hero">
        <div className="student-hero-content">
          <div className="student-hero-badge">
            <Headphones size={14} />
            <span>AIVES · TIỆN ÍCH KHẢO THÍ · KIỂM TRA THIẾT BỊ</span>
          </div>
          <h1 className="student-hero-title">Kiểm tra thiết bị</h1>
          <p className="student-hero-desc">
            Đảm bảo micro, loa và kết nối mạng hoạt động chuẩn xác trước khi bước vào phiên vấn đáp chính thức.
          </p>
        </div>

        <div className="student-actions">
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-1.5 text-xs font-bold text-blue-800"
            role="status"
          >
            <CheckCircle2 size={14} />
            <span>{completed}/2 hoàn tất</span>
          </span>
        </div>
      </header>

      {runtimeConfig.dataSource === 'mock' && <DemoLabel detail="Chế độ mô phỏng" />}

      {/* 2-column Grid for Micro & Speaker */}
      <div className="dashboard-grid">
        {/* Microphone Section */}
        <section aria-labelledby="microphone-title" className="dashboard-section justify-between">
          <div className="section-header-row">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Mic size={18} aria-hidden="true" />
              </div>
              <div>
                <h2 id="microphone-title" className="section-title">
                  Micro
                </h2>
                <p className="section-subtitle">Thu âm giọng nói của bạn.</p>
              </div>
            </div>
            <span className={statusClass(device.mic === 'passed')} role="status">
              {device.mic === 'passed' && <CheckCircle2 size={13} aria-hidden="true" />}
              {micLabel}
            </span>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all ${
                device.mic === 'passed'
                  ? 'bg-emerald-50 text-emerald-700 ring-4 ring-emerald-100'
                  : 'bg-blue-50 text-blue-600 ring-4 ring-blue-50'
              }`}
            >
              <Mic size={30} aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-slate-700">
              {device.mic === 'passed' ? 'Đã nhận tín hiệu giọng nói' : 'Nói thử một câu bất kỳ để thử mic'}
            </p>
            <div className="w-full max-w-xs">
              <meter
                className="block h-3 w-full [&::-webkit-meter-bar]:rounded-full [&::-webkit-meter-bar]:border-0 [&::-webkit-meter-bar]:bg-slate-200 [&::-webkit-meter-optimum-value]:bg-blue-600 [&::-moz-meter-bar]:bg-blue-600"
                min={0}
                max={100}
                value={device.volume}
                aria-label="Mức âm thanh micro"
              />
              <p className="mt-1 text-right text-xs font-mono font-medium text-slate-500" aria-hidden="true">
                {Math.round(device.volume)}%
              </p>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-4">
            {device.error && <Alert tone="danger">{device.error}</Alert>}
            {device.mic === 'testing' && (
              <p role="status" className="text-xs text-slate-500">
                Cho phép micro trong trình duyệt, rồi nói thử.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={device.mic === 'passed' ? 'outline' : 'primary'}
                onClick={() => void device.startMic()}
                disabled={device.mic === 'testing'}
                className="min-h-11"
              >
                {device.mic === 'untested'
                  ? 'Bật micro'
                  : device.mic === 'testing'
                    ? 'Đang nghe…'
                    : 'Kiểm tra lại micro'}
              </Button>
              {device.mic === 'testing' && (
                <Button variant="outline" onClick={() => void device.startMic()} className="min-h-11">
                  Thử lại
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Speaker Section */}
        <section aria-labelledby="speaker-title" className="dashboard-section justify-between">
          <div className="section-header-row">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Volume2 size={18} aria-hidden="true" />
              </div>
              <div>
                <h2 id="speaker-title" className="section-title">
                  Loa / tai nghe
                </h2>
                <p className="section-subtitle">Nghe câu hỏi từ giám thị AI.</p>
              </div>
            </div>
            <span className={statusClass(device.speaker === 'passed')} role="status">
              {device.speaker === 'passed' && <CheckCircle2 size={13} aria-hidden="true" />}
              {speakerLabel}
            </span>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all ${
                device.speaker === 'passed'
                  ? 'bg-emerald-50 text-emerald-700 ring-4 ring-emerald-100'
                  : 'bg-slate-100 text-slate-600 ring-4 ring-slate-50'
              }`}
            >
              <Headphones size={30} aria-hidden="true" />
            </div>
            {device.speaker === 'confirm' ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">Bạn có nghe thấy âm thanh thử nghiệm không?</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button onClick={device.confirmSpeaker} className="min-h-10">
                    Nghe rõ
                  </Button>
                  <Button variant="outline" onClick={device.rejectSpeaker} className="min-h-10">
                    Không nghe
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-700">
                {device.speaker === 'passed'
                  ? 'Đã xác nhận nghe rõ âm thanh'
                  : 'Phát âm thử để kiểm tra loa hoặc tai nghe'}
              </p>
            )}
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-4">
            {device.speaker === 'error' && (
              <Alert tone="danger">Kiểm tra âm lượng và kết nối loa, rồi phát lại.</Alert>
            )}
            <Button
              variant="outline"
              disabled={device.speaker === 'playing'}
              onClick={() => void device.testSpeaker()}
              className="min-h-11"
            >
              <Volume2 size={15} aria-hidden="true" />
              <span>{device.speaker === 'playing' ? 'Đang phát…' : 'Phát âm thử'}</span>
            </Button>
          </div>
        </section>
      </div>

      {/* Network Connectivity Status Bar */}
      <div
        className={`flex items-center gap-2.5 rounded-xl border p-4 text-xs font-medium ${
          online
            ? 'border-blue-100 bg-blue-50/50 text-blue-800'
            : 'border-rose-200 bg-rose-50 text-rose-700'
        }`}
        role="status"
      >
        <Wifi size={16} aria-hidden="true" />
        <span>
          {online
            ? 'Có mạng · Chưa xác minh máy chủ'
            : 'Mất mạng · Kết nối lại để tiếp tục'}
        </span>
      </div>

      {/* Footer Navigation matching Lecturer style */}
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4">
        <Link
          className="button outline min-h-11"
          to={standalone ? '/login' : `/student/exams/${examId}${speechSearch}`}
        >
          <ArrowLeft size={15} aria-hidden="true" />
          <span>{standalone ? 'Về đăng nhập' : 'Quay lại'}</span>
        </Link>

        {standalone ? (
          <p className="text-xs text-slate-500">Kiểm tra thiết bị không cấp quyền vào thi.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <p id="device-check-requirements" className="sr-only">
              Cần xác nhận micro, loa và có kết nối mạng trước khi vào phòng thi.
            </p>
            {!ready && (
              <span className="text-xs text-slate-500 hidden sm:inline">
                Cần hoàn tất cả 2 bước kiểm tra để vào thi
              </span>
            )}
            <Button
              disabled={!ready}
              aria-describedby={!ready ? 'device-check-requirements' : undefined}
              className="min-h-11 button primary"
              onClick={() => {
                device.stop()
                navigate(`/student/exams/${examId}/session${speechSearch}`)
              }}
            >
              <span>Vào phòng thi</span>
              <ArrowRight size={15} aria-hidden="true" />
            </Button>
          </div>
        )}
      </footer>

      {!standalone && runtimeConfig.dataSource === 'mock' && (
        <div className="pt-2 text-center">
          <Link className="text-xs text-blue-600 hover:underline" to={`/student/exams/${examId}/session`}>
            Xem mô phỏng không dùng micro →
          </Link>
        </div>
      )}
    </section>
  )
}
