import { BookOpen, Calendar, FileEdit, LayoutDashboard, Users, Settings, GraduationCap, Award, type LucideIcon } from 'lucide-react'
import type { AppRole } from '../../types/auth'

export type WorkspaceNavItem = { label: string; to: string; icon: LucideIcon; end?: boolean }
export type WorkspaceNavGroup = { label: string; items: WorkspaceNavItem[] }

export function workspaceNavigation(role: AppRole): WorkspaceNavGroup[] {
  if (role === 'admin') return [{ label: 'Quản trị hệ thống', items: [
    { label: 'Tổng quan', to: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Người dùng', to: '/admin/users', icon: Users },
    { label: 'Môn học & phân công', to: '/admin/courses', icon: BookOpen },
    { label: 'Cấu hình', to: '/admin/settings', icon: Settings },
  ] }]
  if (role === 'student') return [{ label: 'Cổng thí sinh', items: [
    { label: 'Tổng quan', to: '/student', icon: GraduationCap, end: true },
    { label: 'Kỳ thi của tôi', to: '/student/exams', icon: Calendar },
    { label: 'Kết quả & biên bản', to: '/student/results', icon: Award },
  ] }]
  return [{ label: 'Quản trị khảo thí', items: [
    { label: 'Tổng quan', to: '/lecturer', icon: LayoutDashboard, end: true },
    { label: 'Môn học & Học liệu', to: '/lecturer/subjects', icon: BookOpen },
    { label: 'Rubric chấm điểm', to: '/lecturer/rubrics', icon: FileEdit },
    { label: 'Kỳ thi vấn đáp', to: '/lecturer/exams', icon: Calendar },
  ] }]
}
export function workspaceNavActive(item: WorkspaceNavItem, pathname: string) {
  return item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`)
}
export function workspaceTitle(pathname: string, fallback: string) {
  if (/\/profile$/.test(pathname)) return 'Hồ sơ cá nhân'
  if (/\/questions\/generate/.test(pathname)) return 'AI Sinh Đề RAG'
  if (/\/questions\/(new|[^/]+\/edit)$/.test(pathname)) return 'Soạn thảo câu hỏi & Rubric'
  if (/\/questions$/.test(pathname)) return 'Ngân hàng câu hỏi'
  if (/\/rubrics\//.test(pathname)) return 'Soạn thảo & Thiết lập Rubric'
  if (/\/rubrics$/.test(pathname)) return 'Quản lý Rubric'
  if (/\/materials/.test(pathname)) return 'Kho tri thức RAG & Giáo trình'
  if (/\/attempts\/[^/]+/.test(pathname)) return 'Chấm điểm & Tổng kết hồ sơ'
  if (/\/attempts$/.test(pathname)) return 'Hồ sơ lượt thi'
  if (/\/report$/.test(pathname)) return 'Báo cáo kỳ thi'
  if (/\/monitor/.test(pathname)) return 'Giám sát kỳ thi'
  if (/\/students/.test(pathname)) return 'Danh sách thí sinh & Tiến độ'
  if (/\/schedule/.test(pathname)) return 'Lịch trình & Ca thi viva'
  if (/\/exams\/(new|[^/]+\/edit)$/.test(pathname)) return 'Thiết lập kỳ thi'
  if (/\/exams\/[^/]+$/.test(pathname)) return 'Chi tiết kỳ thi'
  if (/\/exams$/.test(pathname)) return 'Kỳ thi vấn đáp'
  if (/\/subjects\/[^/]+$/.test(pathname)) return 'Tổng quan học phần'
  if (/\/subjects$/.test(pathname)) return 'Môn học phụ trách'
  if (/\/users/.test(pathname)) return 'Quản lý tài khoản'
  if (/\/courses/.test(pathname)) return 'Môn học & Phân công'
  if (/\/settings/.test(pathname)) return 'Cấu hình hệ thống'
  return fallback
}
