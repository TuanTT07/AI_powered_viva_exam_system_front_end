import { DemoLabel } from '../../components/common/inline-notice'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  FileText,
  Calendar,
  Award,
  Sparkles,
  ShieldCheck,
  Clock,
  Headphones,
  GraduationCap,
} from 'lucide-react'
import { runtimeConfig } from '../../services/api/runtime-config'
import { studentResultsDemo } from './mocks/student-results-demo'
import '../students/student.css'

export function StudentResultListPage() {
  const demo = runtimeConfig.dataSource === 'mock'
  const results = demo ? studentResultsDemo : []
  const average = results.length
    ? (results.reduce((sum, result) => sum + result.score, 0) / results.length).toFixed(1)
    : '—'
  const maxScore = results.length
    ? Math.max(...results.map((r) => r.score)).toFixed(1)
    : '—'

  return (
    <section className="student-page">
      {/* Modern Hero Greeting / Header Banner matching Lecturer style */}
      <header className="student-hero">
        <div className="student-hero-content">
          <div className="student-hero-badge">
            <GraduationCap size={14} />
            <span>AIVES · KHẢO THÍ SINH VIÊN · KẾT QUẢ &amp; BIÊN BẢN</span>
          </div>
          <h1 className="student-hero-title">Kết quả &amp; biên bản</h1>
          <p className="student-hero-desc">
            Tra cứu điểm số chính thức, nhận xét chi tiết của giảng viên và lịch sử các đợt thi vấn đáp.
          </p>
        </div>

        <div className="student-actions">
          <Link className="button outline" to="/student/exams">
            <Calendar size={16} />
            <span>Kỳ thi của tôi</span>
          </Link>
          <Link className="button outline" to="/device-check">
            <Headphones size={16} />
            <span>Kiểm tra thiết bị</span>
          </Link>
        </div>
      </header>

      {demo && <DemoLabel detail="Điểm và nhận xét minh họa, không phải kết quả thi thực." />}

      {/* 4 Modern KPI Metric Cards */}
      <section className="student-metric-grid" aria-label="Tổng quan kết quả thi">
        {demo ? (
          <>
            <div className="metric-card metric-card--blue">
              <div className="metric-header">
                <span className="metric-label">Kết quả mẫu</span>
                <div className="metric-icon-wrap metric-icon-wrap--blue">
                  <FileText size={20} />
                </div>
              </div>
              <strong className="metric-value">{results.length}</strong>
              <span className="metric-hint">Bài thi đã hoàn tất</span>
            </div>

            <div className="metric-card metric-card--emerald">
              <div className="metric-header">
                <span className="metric-label">Điểm trung bình mẫu</span>
                <div className="metric-icon-wrap metric-icon-wrap--emerald">
                  <Award size={20} />
                </div>
              </div>
              <strong className="metric-value">
                {average}
                <span className="text-base font-normal text-slate-400"> / 10</span>
              </strong>
              <span className="metric-hint">Thang điểm 10</span>
            </div>

            <div className="metric-card metric-card--indigo">
              <div className="metric-header">
                <span className="metric-label">Điểm cao nhất</span>
                <div className="metric-icon-wrap metric-icon-wrap--indigo">
                  <Sparkles size={20} />
                </div>
              </div>
              <strong className="metric-value">{maxScore}</strong>
              <span className="metric-hint">Thành tích tốt nhất</span>
            </div>

            <div className="metric-card metric-card--amber">
              <div className="metric-header">
                <span className="metric-label">Phúc khảo điểm</span>
                <div className="metric-icon-wrap metric-icon-wrap--amber">
                  <ShieldCheck size={20} />
                </div>
              </div>
              <strong className="metric-value" style={{ fontSize: '1.4rem' }}>
                Hỗ trợ
              </strong>
              <span className="metric-hint">Theo quy chế khảo thí</span>
            </div>
          </>
        ) : (
          <>
            <div className="metric-card metric-card--blue">
              <div className="metric-header">
                <span className="metric-label">Trạng thái công bố</span>
                <div className="metric-icon-wrap metric-icon-wrap--blue">
                  <Clock size={20} />
                </div>
              </div>
              <strong className="metric-value" style={{ fontSize: '1.4rem' }}>
                Chờ duyệt
              </strong>
              <span className="metric-hint">Chính sách nhà trường</span>
            </div>

            <div className="metric-card metric-card--indigo">
              <div className="metric-header">
                <span className="metric-label">Biên bản hội thoại</span>
                <div className="metric-icon-wrap metric-icon-wrap--indigo">
                  <FileText size={20} />
                </div>
              </div>
              <strong className="metric-value" style={{ fontSize: '1.4rem' }}>
                Bảo mật
              </strong>
              <span className="metric-hint">Theo quyền tài khoản</span>
            </div>

            <div className="metric-card metric-card--emerald">
              <div className="metric-header">
                <span className="metric-label">Điểm chính thức</span>
                <div className="metric-icon-wrap metric-icon-wrap--emerald">
                  <Award size={20} />
                </div>
              </div>
              <strong className="metric-value">—</strong>
              <span className="metric-hint">Giảng viên xác nhận</span>
            </div>

            <div className="metric-card metric-card--amber">
              <div className="metric-header">
                <span className="metric-label">Quy chế phúc khảo</span>
                <div className="metric-icon-wrap metric-icon-wrap--amber">
                  <ShieldCheck size={20} />
                </div>
              </div>
              <strong className="metric-value" style={{ fontSize: '1.4rem' }}>
                Áp dụng
              </strong>
              <span className="metric-hint">Hạn xử lý theo thông báo</span>
            </div>
          </>
        )}
      </section>

      {/* Unified Results Surface */}
      <section className="student-results-surface" aria-labelledby="student-results-heading">
        <header className="student-results-surface-header">
          <div className="flex items-center gap-2.5 text-blue-900">
            <FileText size={18} aria-hidden="true" className="text-blue-600" />
            <h2 id="student-results-heading" className="text-base font-bold text-slate-900">
              Bảng điểm{demo ? ' mẫu' : ''}
            </h2>
          </div>
          {demo && (
            <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
              {results.length} bài thi
            </span>
          )}
        </header>

        {results.length ? (
          <div
            className="relative overflow-x-auto focus-visible:outline-2 focus-visible:outline-blue-600"
            role="region"
            aria-label="Bảng điểm có thể cuộn ngang"
            tabIndex={0}
          >
            <table className="student-table">
              <caption className="sr-only">Kết quả minh họa theo kỳ thi, thang điểm 10</caption>
              <thead>
                <tr>
                  <th scope="col">Kỳ thi / học phần</th>
                  <th scope="col">Ngày thi</th>
                  <th scope="col" style={{ textAlign: 'right' }}>
                    Điểm mẫu
                  </th>
                  <th scope="col">
                    <span className="sr-only">Xem biên bản</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id}>
                    <th scope="row" style={{ fontWeight: 'normal' }}>
                      <span className="block font-bold text-slate-900 text-sm">{result.title}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{result.subject}</span>
                    </th>
                    <td className="whitespace-nowrap text-xs tabular-nums text-slate-600">
                      {new Date(result.date).toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="student-score-pill">{result.score.toFixed(1)}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        aria-label={`Xem biên bản ${result.title}`}
                        className="button outline button--sm"
                        to={`/student/exams/${result.id}/result`}
                      >
                        <span>Biên bản</span>
                        <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FileText size={26} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {demo ? 'Chưa có kết quả để hiển thị' : 'Chưa thể tra cứu kết quả'}
            </h3>
            <p className="max-w-md text-sm text-slate-500">
              {demo
                ? 'Chưa có kết quả mẫu.'
                : 'Chức năng tra cứu điểm chưa được kết nối với backend.'}
            </p>
          </div>
        )}
      </section>
    </section>
  )
}
