import { DemoLabel } from '../../../components/common/inline-notice'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Headphones, Mic, Volume2, Wifi } from 'lucide-react'
import { Alert, Button } from '../../../components/ui/primitives'
import { useOnline } from '../../../hooks/use-online'
import { useDeviceCheck } from '../use-device-check'
import { studentRoomSearch } from '../../exams/student-exam-navigation'
import { runtimeConfig } from '../../../services/api/runtime-config'

export function EquipmentCheckPage({ standalone = false }: { standalone?: boolean }) {
  const { examId = '' } = useParams()
  const navigate = useNavigate()
  const [search] = useSearchParams()
  const speechSearch = studentRoomSearch(search)
  const device = useDeviceCheck()
  const online = useOnline()
  const ready = device.mic === 'passed' && device.speaker === 'passed' && online
  const completed = Number(device.mic === 'passed') + Number(device.speaker === 'passed')
  const micLabel = { untested: 'Chưa kiểm tra', testing: 'Đang kiểm tra', passed: 'Đạt', error: 'Cần thử lại' }[device.mic]
  const speakerLabel = { untested: 'Chưa kiểm tra', playing: 'Đang phát', confirm: 'Chờ xác nhận', passed: 'Đạt', error: 'Cần thử lại' }[device.speaker]
  const statusClass = (passed: boolean) => `inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${passed ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`

  return (
    <section className="source-screen mx-auto max-w-5xl space-y-5 py-4 sm:py-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Kiểm tra thiết bị</h1>
        <p className="text-sm text-slate-500" role="status"><span className="font-semibold tabular-nums text-slate-900">{completed}/2</span> hoàn tất</p>
      </header>

      {runtimeConfig.dataSource === 'mock' && <DemoLabel detail="Chế độ mô phỏng" />}

      <div className="grid items-stretch gap-4 md:grid-cols-2">
        <section aria-labelledby="microphone-title" className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <h2 id="microphone-title" className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Mic size={18} className="text-blue-600" aria-hidden="true" />Micro</h2>
            <span className={statusClass(device.mic === 'passed')} role="status">{device.mic === 'passed' && <CheckCircle2 size={13} aria-hidden="true" />}{micLabel}</span>
          </header>
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-8">
            <div className={`flex h-14 w-14 items-center justify-center rounded-full ${device.mic === 'passed' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-600'}`}><Mic size={26} aria-hidden="true" /></div>
            <p className="text-sm text-slate-600">{device.mic === 'passed' ? 'Đã nhận giọng nói' : 'Nói thử một câu'}</p>
            <div className="w-full max-w-xs">
              <meter className="block h-3 w-full [&::-webkit-meter-bar]:rounded-full [&::-webkit-meter-bar]:border-0 [&::-webkit-meter-bar]:bg-slate-200 [&::-webkit-meter-optimum-value]:bg-blue-600 [&::-moz-meter-bar]:bg-blue-600" min={0} max={100} value={device.volume} aria-label="Mức âm thanh micro" />
              <p className="mt-1 text-right text-xs tabular-nums text-slate-500" aria-hidden="true">{Math.round(device.volume)}%</p>
            </div>
          </div>
          <div className="space-y-3 border-t border-slate-100 px-5 py-4">
            {device.error && <Alert tone="danger">{device.error}</Alert>}
            {device.mic === 'testing' && <p role="status" className="text-xs text-slate-500">Cho phép micro trong trình duyệt, rồi nói thử.</p>}
            <div className="flex flex-wrap gap-2">
              <Button variant={device.mic === 'passed' ? 'outline' : 'primary'} onClick={() => void device.startMic()} disabled={device.mic === 'testing'} className="min-h-11">
                {device.mic === 'untested' ? 'Bật micro' : device.mic === 'testing' ? 'Đang nghe…' : 'Kiểm tra lại micro'}
              </Button>
              {device.mic === 'testing' && <Button variant="outline" onClick={() => void device.startMic()} className="min-h-11">Thử lại</Button>}
            </div>
          </div>
        </section>

        <section aria-labelledby="speaker-title" className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <h2 id="speaker-title" className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Volume2 size={18} className="text-blue-600" aria-hidden="true" />Loa / tai nghe</h2>
            <span className={statusClass(device.speaker === 'passed')} role="status">{device.speaker === 'passed' && <CheckCircle2 size={13} aria-hidden="true" />}{speakerLabel}</span>
          </header>
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-8 text-center">
            <div className={`flex h-14 w-14 items-center justify-center rounded-full ${device.speaker === 'passed' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500'}`}><Headphones size={26} aria-hidden="true" /></div>
            {device.speaker === 'confirm' ? (
              <>
                <p className="text-sm text-slate-600">Bạn có nghe tiếng bíp?</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button onClick={device.confirmSpeaker} className="min-h-11">Nghe rõ</Button>
                  <Button variant="outline" onClick={device.rejectSpeaker} className="min-h-11">Không nghe</Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-600">{device.speaker === 'passed' ? 'Đã xác nhận nghe rõ' : 'Phát thử để kiểm tra loa'}</p>
            )}
          </div>
          <div className="space-y-3 border-t border-slate-100 px-5 py-4">
            {device.speaker === 'error' && <Alert tone="danger">Kiểm tra âm lượng và kết nối loa, rồi phát lại.</Alert>}
            <Button variant="outline" disabled={device.speaker === 'playing'} onClick={() => void device.testSpeaker()} className="min-h-11"><Volume2 size={15} aria-hidden="true" />{device.speaker === 'playing' ? 'Đang phát…' : 'Phát âm thử'}</Button>
          </div>
        </section>
      </div>

      <div className={`flex items-center gap-2 text-xs ${online ? 'text-slate-500' : 'text-rose-700'}`} role="status">
        <Wifi size={15} aria-hidden="true" />
        <span>{online ? 'Có mạng · Chưa xác minh máy chủ' : 'Mất mạng · Kết nối lại để tiếp tục'}</span>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-2 text-sm font-medium text-slate-600 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600" to={standalone ? '/login' : `/student/exams/${examId}${speechSearch}`}><ArrowLeft size={15} aria-hidden="true" />{standalone ? 'Về đăng nhập' : 'Quay lại'}</Link>
        {standalone ? (
          <p className="text-xs text-slate-500">Kiểm tra thiết bị không cấp quyền vào thi.</p>
        ) : (
          <>
            <p id="device-check-requirements" className="sr-only">Cần xác nhận micro, loa và có kết nối mạng trước khi vào phòng thi.</p>
            <Button disabled={!ready} aria-describedby={!ready ? 'device-check-requirements' : undefined} className="min-h-11" onClick={() => { device.stop(); navigate(`/student/exams/${examId}/session${speechSearch}`) }}>Vào phòng thi<ArrowRight size={15} aria-hidden="true" /></Button>
          </>
        )}
      </footer>
      {!standalone && runtimeConfig.dataSource === 'mock' && <Link className="button outline" to={`/student/exams/${examId}/session`}>Xem mô phỏng không dùng micro</Link>}
    </section>
  )
}
