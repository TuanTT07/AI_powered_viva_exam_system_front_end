import { useEffect, useId, useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button, Input } from "../../components/ui/primitives";
import { LoadingPage } from "../../components/common/states";
import { useSession } from "../../app/providers/use-session";
import { authorizedReturnPath, roleHome } from "./auth-navigation";

type FormErrors = { email?: string; password?: string };

function validate(email: string, password: string): FormErrors {
  const errors: FormErrors = {};
  if (!email) errors.email = "Nhập email học thuật của bạn.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Nhập địa chỉ email học thuật hợp lệ.";
  if (!password) errors.password = "Nhập mật khẩu để tiếp tục.";
  return errors;
}

export function LoginPage() {
  const { session, signIn } = useSession();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const emailErrorId = useId();
  const passwordErrorId = useId();

  useEffect(() => {
    if (session.status === "authenticated" && session.user)
      navigate(authorizedReturnPath(location.state?.from, session.user), {
        replace: true,
      });
  }, [location.state, navigate, session]);

  if (session.status === "loading")
    return <LoadingPage label="Đang kiểm tra phiên đăng nhập" />;
  if (session.user) return <Navigate replace to={roleHome(session.user)} />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    setSubmitError(null);
    if (Object.keys(nextErrors).length) return;
    setPending(true);
    try {
      const user = await signIn({ email, password });
      navigate(authorizedReturnPath(location.state?.from, user), {
        replace: true,
      });
    } catch {
      setSubmitError(
        "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin tài khoản được cấp.",
      );
    } finally {
      setPending(false);
    }
  }

  const clearFeedback = () => {
    setSubmitError(null);
  };
  return (
    <section className="login-page" aria-labelledby="login-title">
      <div className="login-shell">
        <div className="login-brand">
          <div className="login-logo" aria-hidden="true">
            AIVES
          </div>
          <p className="login-kicker">
            <span>KHẢO THÍ ĐIỆN TỬ</span>
            <i>•</i> AIVES
          </p>
          <h1 id="login-title">Cổng Khảo Thí Học Thuật</h1>
          <p className="login-subtitle">
            Hệ thống thi vấn đáp có AI hỗ trợ dành cho Đại học &amp; Viện nghiên
            cứu
          </p>
        </div>
        <form className="login-form" noValidate onSubmit={handleSubmit}>
          {submitError && (
            <div className="login-alert">
              <span className="login-alert-icon" aria-hidden="true">
                !
              </span>
              <div>
                <strong>Thông báo xác thực</strong>
                <span>{submitError}</span>
              </div>
              <button
                type="button"
                aria-label="Đóng thông báo"
                onClick={clearFeedback}
              >
                ×
              </button>
            </div>
          )}
          <div className="field-group">
            <div className="field-label-row">
              <label htmlFor="academic-email">TÀI KHOẢN EMAIL HỌC THUẬT</label>
              <span className="field-hint">@academia.edu.vn</span>
            </div>
            <div className="input-with-icon">
              <span aria-hidden="true">✧</span>
                <Input aria-label="Tài khoản Email học thuật"
                aria-describedby={errors.email ? emailErrorId : undefined}
                aria-invalid={Boolean(errors.email)}
                autoComplete="username"
                id="academic-email"
                inputMode="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrors((current) => ({ ...current, email: undefined }));
                  clearFeedback();
                }}
                placeholder="nguyenvanan@academia.edu.vn"
                type="email"
                value={email}
              />
            </div>
            {errors.email && (
              <p className="field-error" id={emailErrorId} role="alert">
                {errors.email}
              </p>
            )}
          </div>
          <div className="field-group">
            <div className="field-label-row">
              <label htmlFor="password">MẬT KHẨU BẢO MẬT</label>
              <span className="field-hint">Chuẩn SSO/LDAP</span>
            </div>
            <div className="password-field">
              <span className="input-icon" aria-hidden="true">
                ⌘
              </span>
                <Input aria-label="Mật khẩu bảo mật"
                aria-describedby={errors.password ? passwordErrorId : undefined}
                aria-invalid={Boolean(errors.password)}
                autoComplete="current-password"
                id="password"
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrors((current) => ({ ...current, password: undefined }));
                  clearFeedback();
                }}
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                type="button"
              >
                {showPassword ? "Ẩn" : "◉"}
              </button>
            </div>
            {errors.password && (
              <p className="field-error" id={passwordErrorId} role="alert">
                {errors.password}
              </p>
            )}
          </div>
          <label className="remember-login">
            <input type="checkbox" defaultChecked />{" "}
            <span>Ghi nhớ phiên đăng nhập trên thiết bị học vụ</span>
          </label>
          <Button className="login-submit" pending={pending} type="submit">
            ĐĂNG NHẬP VÀO HỆ THỐNG <span aria-hidden="true">→</span>
          </Button>
        </form>
        <div className="login-footer">
          <p>
            <strong>Định tuyến tự động:</strong> Hệ thống tự động chuyển hướng
            giao diện làm việc theo vai trò học thuật được phân quyền:{" "}
            <em>Hội đồng Khảo thí</em>, <em>Thí sinh vấn đáp</em> hoặc{" "}
            <em>Quản trị Hệ thống</em>.
          </p>
          <p>
            ⓘ &nbsp; Quên mật khẩu hoặc gặp sự cố tài khoản? Vui lòng liên hệ{" "}
            <a href="mailto:support@academia.edu.vn">
              Phòng Khảo thí &amp; ĐBCL (support@academia.edu.vn)
            </a>
            .
          </p>
        </div>
      </div>
      <p className="login-version">
        MÃ HỆ THỐNG: VIVA-SEC-2025.A&nbsp; • &nbsp;PHIÊN BẢN 2.4.0
      </p>
    </section>
  );
}
