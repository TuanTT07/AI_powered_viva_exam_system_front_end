import { useEffect, useId, useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button, Input } from '../../components/ui/primitives'
import { LoadingPage } from '../../components/common/states'
import { useSession } from '../../app/providers/use-session'
import { authorizedReturnPath, roleHome } from './auth-navigation'

type FormErrors = { email?: string; password?: string }

function validate(email: string, password: string): FormErrors {
  const errors: FormErrors = {}
  if (!email) errors.email = 'Nhập email học thuật của bạn.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Nhập địa chỉ email học thuật hợp lệ.'
  if (!password) errors.password = 'Nhập mật khẩu để tiếp tục.'
  return errors
}

export function LoginPage() {
  const { session, signIn } = useSession()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const emailErrorId = useId()
  const passwordErrorId = useId()

  useEffect(() => {
    if (session.status === 'authenticated' && session.user) navigate(authorizedReturnPath(location.state?.from, session.user), { replace: true })
  }, [location.state, navigate, session])

  if (session.status === 'loading') return <LoadingPage label="Đang kiểm tra phiên đăng nhập" />
  if (session.user) return <Navigate replace to={roleHome(session.user)} />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const nextErrors = validate(email, password)
    setErrors(nextErrors)
    setSubmitError(null)
    if (Object.keys(nextErrors).length) return
    setPending(true)
    try {
      const user = await signIn({ email, password })
      navigate(authorizedReturnPath(location.state?.from, user), { replace: true })
    } catch {
      setSubmitError('Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin tài khoản được cấp.')
    } finally {
      setPending(false)
    }
  }

  const clearFeedback = () => { setSubmitError(null) }
  return <section className="login-page" aria-labelledby="login-title">
    <div className="login-brand"><p className="login-kicker">AIVES · HỆ THỐNG VẤN ĐÁP</p><h1 id="login-title">Cổng Khảo Thí Học Thuật</h1><p>Đăng nhập bằng tài khoản học thuật được cấp để truy cập không gian khảo thí phù hợp với phân quyền của bạn.</p><p className="login-note">Hệ thống tự động điều hướng theo vai trò được cấp quyền: giảng viên, thí sinh hoặc quản trị hệ thống.</p></div>
    <form className="login-form" noValidate onSubmit={handleSubmit}>
      <div className="login-form-heading"><p className="eyebrow">XÁC THỰC DANH TÍNH</p><h2>Đăng nhập hệ thống</h2></div>
      {submitError && <Alert tone="danger"><strong>Thông báo xác thực</strong><span>{submitError}</span></Alert>}
      <div className="field-group"><label htmlFor="academic-email">Tài khoản Email học thuật</label><span className="field-hint">@academia.edu.vn</span><Input aria-describedby={errors.email ? emailErrorId : undefined} aria-invalid={Boolean(errors.email)} autoComplete="username" id="academic-email" inputMode="email" onChange={(event) => { setEmail(event.target.value); setErrors((current) => ({ ...current, email: undefined })); clearFeedback() }} placeholder="hoten@academia.edu.vn" type="email" value={email} />{errors.email && <p className="field-error" id={emailErrorId} role="alert">{errors.email}</p>}</div>
      <div className="field-group"><label htmlFor="password">Mật khẩu bảo mật</label><span className="field-hint">Chuẩn SSO/LDAP</span><div className="password-field"><Input aria-describedby={errors.password ? passwordErrorId : undefined} aria-invalid={Boolean(errors.password)} autoComplete="current-password" id="password" onChange={(event) => { setPassword(event.target.value); setErrors((current) => ({ ...current, password: undefined })); clearFeedback() }} type={showPassword ? 'text' : 'password'} value={password} /><button aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} className="password-toggle" onClick={() => setShowPassword((value) => !value)} type="button">{showPassword ? 'Ẩn' : 'Hiện'}</button></div>{errors.password && <p className="field-error" id={passwordErrorId} role="alert">{errors.password}</p>}</div>
      <Button className="login-submit" pending={pending} type="submit">Đăng nhập vào hệ thống</Button>
      <p className="login-support">Cần hỗ trợ truy cập? Liên hệ <a href="mailto:support@academia.edu.vn">support@academia.edu.vn</a>.</p>
    </form>
  </section>
}
