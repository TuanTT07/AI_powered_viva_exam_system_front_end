import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BookOpen, Plus, Search, Sparkles, Filter, ChevronRight } from 'lucide-react'
import { Alert, Button, Dialog, Input } from '../../../components/ui/primitives'
import { LoadingPage } from '../../../components/common/states'
import { useCourses, useSaveCourse, useCourse } from '../course-hooks'
import type { Subject } from '../api-course-repository'

export function SubjectManagementPage() {
  const [params, setParams] = useSearchParams(), [search, setSearch] = useState(''), [page, setPage] = useState(1), [adding, setAdding] = useState(false), [feedback, setFeedback] = useState('')
  const courses = useCourses({ keyword: search, page, size: 10 }), save = useSaveCourse(), editId = params.get('edit'), detail = useCourse(editId)
  const close = () => { setAdding(false); setParams(current => { const next = new URLSearchParams(current); next.delete('edit'); return next }) }

  return (
    <section className="source-screen max-w-7xl mx-auto space-y-6 pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-sm border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-blue-200">
              <Sparkles size={13} className="text-amber-400" />
              <span>Danh mục học phần</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Quản Lý Môn Học &amp; Phân Công
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Tạo học phần và phân công giảng viên phụ trách.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => { save.reset(); setAdding(true) }}>
              <Plus size={15} />
              Thêm môn học
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">TỔNG HỌC PHẦN</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <BookOpen size={18} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {courses.data?.totalElements ?? '—'}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Môn học đã thiết lập</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">ĐANG HIỂN THỊ</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Filter size={18} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-indigo-600 font-mono">
              {courses.data?.content.length ?? '—'}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Theo từ khóa tìm kiếm</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">TRANG HIỆN TẠI</span>
            <span className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <ChevronRight size={18} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-violet-600 font-mono">
              {page} / {Math.max(1, courses.data?.totalPages ?? 1)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Phân trang 10 môn/trang</p>
          </div>
        </div>
      </div>

      {feedback && <Alert tone="success">{feedback}</Alert>}

      {/* Search Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
          <input
            aria-label="Tìm học phần"
            value={search}
            onChange={event => { setSearch(event.target.value); setPage(1) }}
            placeholder="Tìm mã môn hoặc tên học phần..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs transition-all"
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
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Mã &amp; Tên Học Phần</th>
                  <th className="px-5 py-3.5">Khoa / Viện</th>
                  <th className="px-5 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.data?.content.map(course => (
                  <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center shrink-0">
                          <BookOpen size={18} />
                        </span>
                        <div>
                          <Link className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors" to={`/admin/courses/${encodeURIComponent(course.id)}`}>
                            {course.name}
                          </Link>
                          <small className="block font-mono text-slate-400 mt-0.5 text-[11px]">
                            {course.code}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-medium">
                      {course.department}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2 items-center">
                        <Link className="button outline" to={`/admin/courses/${encodeURIComponent(course.id)}`}>
                          Giảng viên &amp; Chi tiết
                        </Link>
                        <Button variant="outline" onClick={() => { save.reset(); setParams({ edit: course.id }) }}>
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
            <span>Trang {page} / {Math.max(1, courses.data?.totalPages ?? 1)}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>
                Trước
              </Button>
              <Button variant="outline" disabled={page >= (courses.data?.totalPages ?? 1)} onClick={() => setPage(value => value + 1)}>
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}

      {editId && detail.isLoading && <LoadingPage label="Đang tải thông tin học phần" />}
      {editId && detail.isError && (
        <Alert tone="danger">
          Không thể tải học phần.{' '}
          <Button onClick={() => detail.refetch()}>Thử lại</Button>
        </Alert>
      )}

      {(adding || (editId && detail.data)) && (
        <CourseEditor
          key={adding ? 'new' : editId}
          course={adding ? null : detail.data ?? null}
          pending={save.isPending}
          error={save.error}
          onClose={() => { if (!save.isPending) close() }}
          onSave={draft => save.mutate(draft, { onSuccess: () => { close(); setFeedback('Đã lưu học phần.') } })}
        />
      )}
    </section>
  )
}

function CourseEditor({ course, pending, error, onClose, onSave }: { course: Subject | null; pending: boolean; error: Error | null; onClose: () => void; onSave: (draft: { id?: string; code: string; name: string; department: string }) => void }) {
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
          <Input required value={code} onChange={event => setCode(event.target.value)} />
        </label>
        <label>
          Tên học phần
          <Input required value={name} onChange={event => setName(event.target.value)} />
        </label>
        <label>
          Khoa / Viện
          <Input required value={department} onChange={event => setDepartment(event.target.value)} />
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

