import { DemoLabel } from '../../components/common/inline-notice'
import { Link } from 'react-router-dom'
import { ArrowRight, FileText } from 'lucide-react'
import { runtimeConfig } from '../../services/api/runtime-config'
import { studentResultsDemo } from './mocks/student-results-demo'

export function StudentResultListPage() {
  const demo = runtimeConfig.dataSource === 'mock'
  const results = demo ? studentResultsDemo : []
  const average = results.length
    ? (results.reduce((sum, result) => sum + result.score, 0) / results.length).toFixed(1)
    : '—'

  return (
    <section className="source-screen mx-auto max-w-5xl space-y-6 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="border-l-4 border-blue-600 pl-4">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Kết quả &amp; biên bản</h1>
        </div>
        <Link className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-medium text-blue-700 hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600" to="/student/exams">Kỳ thi của tôi<ArrowRight size={15} aria-hidden="true" /></Link>
      </header>

      {demo && <DemoLabel detail="Điểm và nhận xét minh họa, không phải kết quả thi thực." />}

      {demo && (
        <div><dl className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-5">
            <dt className="text-xs font-medium text-blue-800">Kết quả mẫu</dt>
            <dd className="mt-2 text-3xl font-semibold tabular-nums text-blue-900">{results.length}</dd>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <dt className="text-xs font-medium text-slate-500">Điểm trung bình mẫu</dt>
            <dd className="mt-2 text-3xl font-semibold tabular-nums text-blue-700">{average}<span className="text-sm font-normal text-slate-400"> / 10</span></dd>
          </div>
        </dl></div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white" aria-labelledby="student-results-heading">
        <header className="flex items-center gap-2 border-b border-blue-100 bg-blue-50/70 px-5 py-4 text-blue-800">
          <FileText size={18} aria-hidden="true" />
          <h2 id="student-results-heading" className="text-sm font-semibold">Bảng điểm{demo ? ' mẫu' : ''}</h2>
        </header>
        {results.length ? (
          <div className="relative overflow-x-auto focus-visible:outline-2 focus-visible:outline-blue-600" role="region" aria-label="Bảng điểm có thể cuộn ngang" tabIndex={0}>
            <table className="w-full min-w-[560px] text-left text-sm">
              <caption className="sr-only">Kết quả minh họa theo kỳ thi, thang điểm 10</caption>
              <thead className="border-b border-slate-100 text-xs text-slate-500"><tr>
                <th scope="col" className="px-5 py-3 font-medium">Kỳ thi / học phần</th>
                <th scope="col" className="px-5 py-3 font-medium">Ngày thi</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">Điểm mẫu</th>
                <th scope="col" className="px-5 py-3"><span className="sr-only">Xem biên bản</span></th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {results.map(result => (
                  <tr key={result.id} className="transition-colors hover:bg-blue-50/40">
                    <th scope="row" className="px-5 py-4 font-normal"><span className="block font-semibold text-slate-900">{result.title}</span><span className="mt-1 block text-xs text-slate-500">{result.subject}</span></th>
                    <td className="whitespace-nowrap px-5 py-4 text-xs tabular-nums text-slate-600">{new Date(result.date).toLocaleDateString('vi-VN')}</td>
                    <td className="px-5 py-4 text-right text-lg font-semibold tabular-nums text-blue-700">{result.score.toFixed(1)}</td>
                    <td className="px-5 py-4 text-right"><Link aria-label={`Xem biên bản ${result.title}`} className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" to={`/student/exams/${result.id}/result`}>Biên bản<ArrowRight size={14} aria-hidden="true" /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><FileText size={26} strokeWidth={1.5} aria-hidden="true" /></span>
            <h3 className="text-base font-semibold text-slate-900">{demo ? 'Chưa có kết quả để hiển thị' : 'Chưa thể tra cứu kết quả'}</h3>
            <p className="max-w-sm text-sm text-slate-500">{demo ? 'Chưa có kết quả mẫu.' : 'Chức năng tra cứu điểm chưa được kết nối với backend.'}</p>
          </div>
        )}
      </section>
    </section>
  )
}
