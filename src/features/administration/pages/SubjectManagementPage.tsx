import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BookOpen, Plus, Search, Filter, ChevronRight } from 'lucide-react'
import { Alert, Button, Dialog, Input } from '../../../components/ui/primitives'
import { LoadingPage } from '../../../components/common/states'
import { useCourses, useSaveCourse, useCourse } from '../course-hooks'
import type { Subject } from '../api-course-repository'
import '../admin.css'

export function SubjectManagementPage() {
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [adding, setAdding] = useState(false)
  const [feedback, setFeedback] = useState('')
  const courses = useCourses({ keyword: search, page, size: 10 })
  const save = useSaveCourse()
  const editId = params.get('edit')
  const detail = useCourse(editId)

  const close = () => {
    setAdding(false)
    setParams((current) => {
      const next = new URLSearchParams(current)
      next.delete('edit')
      return next
    })
  }

  return (
    <section className="admin-page">
      {/* Modern Hero Header Banner matching Lecturer style */}
      <header className="admin-hero">
        <div className="admin-hero-content">
          <div className="admin-hero-badge">
            <BookOpen size={14} />
            <span>AIVES · QUẢN TRỊ ĐÀO TẠO · HỌC PHẦN</span>
          </div>
          <h1 className="admin-hero-title">Quản Lý Môn Học &amp; Phân Công</h1>
          <p className="admin-hero-desc">
            Tạo học phần, quản trị mã môn và phân công giảng viên phụ trách chuyên môn.
          </p>
        </div>

        <div className="admin-actions">
          <Button
            onClick={() => {
              save.reset()
              setAdding(true)
            }}
          >
            <Plus size={16} />
            <span>Thêm môn học</span>
          </Button>
        </div>
      </header>

      {/* 3 KPI Summary Cards */}
      <section className="admin-metric-grid" aria-label="Thống kê học phần">
        <div className="metric-card metric-card--blue">
          <div className="metric-header">
            <span className="metric-label">Tổng học phần</span>
            <div className="metric-icon-wrap metric-icon-wrap--blue">
              <BookOpen size={20} />
            </div>
          </div>
          <strong className="metric-value">{courses.data?.totalElements ?? '—'}</strong>
          <span className="metric-hint">Môn học đã thiết lập</span>
        </div>

        <div className="metric-card metric-card--indigo">
          <div className="metric-header">
            <span className="metric-label">Đang hiển thị</span>
            <div className="metric-icon-wrap metric-icon-wrap--indigo">
              <Filter size={20} />
            </div>
          </div>
          <strong className="metric-value">{courses.data?.content.length ?? '—'}</strong>
          <span className="metric-hint">Theo từ khóa tìm kiếm</span>
        </div>

        <div className="metric-card metric-card--amber">
          <div className="metric-header">
            <span className="metric-label">Trang hiện tại</span>
            <div className="metric-icon-wrap metric-icon-wrap--amber">
              <ChevronRight size={20} />
            </div>
          </div>
          <strong className="metric-value" style={{ fontSize: '1.4rem' }}>
            {page} / {Math.max(1, courses.data?.totalPages ?? 1)}
          </strong>
          <span className="metric-hint">Phân trang 10 môn/trang</span>
        </div>
      </section>

      {feedback && <Alert tone="success">{feedback}</Alert>}

      {/* Filter Toolbar Surface */}
      <div className="admin-toolbar">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
          <input
            aria-label="Tìm học phần"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Tìm mã môn hoặc tên học phần..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs transition-all outline-none"
          />
        </div>
        <span className="text-xs text-slate-500 shrink-0 font-medium px-2">
          {courses.data?.totalElements ?? '—'} môn học
        </span>
      </div>

      {courses.isLoading ? (
        <LoadingPage label="Đang tải học phần" />
      ) : courses.isError ? (
        <section className="state">
          <Alert tone="danger">Không thể tải danh sách học phần.</Alert>
          <div className="mt-2">
            <Button onClick={() => courses.refetch()}>Thử lại</Button>
          </div>
        </section>
      ) : (
        <div className="admin-table-surface">
          <div className="overflow-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã &amp; Tên Học Phần</th>
                  <th>Khoa / Viện</th>
                  <th style={{ textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {courses.data?.content.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center shrink-0">
                          <BookOpen size={18} />
                        </span>
                        <div>
                          <Link
                            className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                            to={`/admin/courses/${encodeURIComponent(course.id)}`}
                          >
                            {course.name}
                          </Link>
                          <small className="block font-mono text-slate-400 mt-0.5 text-[11px]">
                            {course.code}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-600 font-medium">{course.department}</td>
                    <td>
                      <div className="flex justify-end gap-2 items-center">
                        <Link
                          className="button outline button--sm"
                          to={`/admin/courses/${encodeURIComponent(course.id)}`}
                        >
                          Giảng viên &amp; Chi tiết
                        </Link>
                        <Button
                          variant="outline"
                          onClick={() => {
                            save.reset()
                            setParams({ edit: course.id })
                          }}
                        >
                          Chỉnh sửa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!courses.data?.content.length && (
                  <tr>
                    <td colSpan={3} className="p-12 text-center text-slate-500">
                      Không tìm thấy học phần.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex justify-between items-center gap-3 px-5 py-4 border-t border-slate-100 text-xs text-slate-500 bg-slate-50/50">
            <span>
              Trang {page} / {Math.max(1, courses.data?.totalPages ?? 1)}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
                Trước
              </Button>
              <Button
                variant="outline"
                disabled={page >= (courses.data?.totalPages ?? 1)}
                onClick={() => setPage((value) => value + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}

      {editId && detail.isLoading && <LoadingPage label="Đang tải thông tin học phần" />}
      {editId && detail.isError && (
        <Alert tone="danger">
          Không thể tải học phần. <Button onClick={() => detail.refetch()}>Thử lại</Button>
        </Alert>
      )}

      {(adding || (editId && detail.data)) && (
        <CourseEditor
          key={adding ? 'new' : editId}
          course={adding ? null : detail.data ?? null}
          pending={save.isPending}
          error={save.error}
          onClose={() => {
            if (!save.isPending) close()
          }}
          onSave={(draft) =>
            save.mutate(draft, {
              onSuccess: () => {
                close()
                setFeedback('Đã lưu học phần.')
              },
            })
          }
        />
      )}
    </section>
  )
}

function CourseEditor({
  course,
  pending,
  error,
  onClose,
  onSave,
}: {
  course: Subject | null
  pending: boolean
  error: Error | null
  onClose: () => void
  onSave: (draft: { id?: string; code: string; name: string; department: string }) => void
}) {
  const [code, setCode] = useState(course?.code ?? '')
  const [name, setName] = useState(course?.name ?? '')
  const [department, setDepartment] = useState(course?.department ?? '')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!pending) {
      onSave({ id: course?.id, code: code.trim(), name: name.trim(), department: department.trim() })
    }
  }

  return (
    <Dialog open title={course ? 'Chỉnh sửa môn học' : 'Tạo môn học'} onClose={onClose}>
      <form className="grid gap-4 mt-4" onSubmit={submit}>
        <label>
          Mã học phần
          <Input required value={code} onChange={(event) => setCode(event.target.value)} />
        </label>
        <label>
          Tên học phần
          <Input required value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Khoa / Viện
          <Input required value={department} onChange={(event) => setDepartment(event.target.value)} />
        </label>
        {error && <Alert tone="danger">{error.message}</Alert>}
        <div className="dialog-actions">
          <Button type="button" variant="outline" disabled={pending} onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" pending={pending}>
            Lưu học phần
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
