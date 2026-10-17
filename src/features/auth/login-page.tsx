import { useEffect, useId, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Shield,
  ShieldCheck,
  Volume2,
  Bot,
  FileCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Mic,
  ExternalLink,
  Building2,
  Sparkles,
  Info,
} from "lucide-react";
import { Dialog } from "../../components/ui/primitives";
import { LoadingPage } from "../../components/common/states";
import { useSession } from "../../app/providers/use-session";
import { runtimeConfig } from "../../services/api/runtime-config";
import { authorizedReturnPath, roleHome } from "./auth-navigation";

type FormErrors = { email?: string; password?: string };
type LoginRoleTab = "student" | "lecturer" | "admin";

const DEMO_CREDENTIALS: Record<LoginRoleTab, { email: string; pass: string }> = {
  student: { email: "student@academia.edu.vn", pass: "AivesDemo!2026" },
  lecturer: { email: "lecturer@academia.edu.vn", pass: "AivesDemo!2026" },
  admin: { email: "admin@academia.edu.vn", pass: "AivesDemo!2026" },
};

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

  const [activeRole, setActiveRole] = useState<LoginRoleTab>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Dialog states
  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [showRegulationsDialog, setShowRegulationsDialog] = useState(false);
  const [ssoMessage, setSsoMessage] = useState<string | null>(null);

  const emailErrorId = useId();
  const passwordErrorId = useId();

  useEffect(() => {
    if (session.status === "authenticated" && session.user) {
      navigate(authorizedReturnPath(location.state?.from, session.user), {
        replace: true,
      });
    }
  }, [location.state, navigate, session]);

  if (session.status === "loading") {
    return <LoadingPage label="Đang kiểm tra phiên đăng nhập" />;
  }
  if (session.user) return <Navigate replace to={roleHome(session.user)} />;

  function handleRoleTabChange(role: LoginRoleTab) {
    setActiveRole(role);
    setSubmitError(null);
    setErrors({});
    if (runtimeConfig.dataSource === "mock") {
      const demo = DEMO_CREDENTIALS[role];
      setEmail(demo.email);
      setPassword(demo.pass);
    }
  }

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
      {/* Top Header Navigation */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">AIVES</span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/70">
                Hệ thống Khảo thí Trực tuyến
              </span>
            </div>
          </div>

          {/* System Status */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Cổng đăng nhập AIVES</span>
              <span className="sm:hidden">Sẵn sàng</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Academic & AI Showcase */}
          <div className="lg:col-span-7 space-y-6 lg:pr-2">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold tracking-wide uppercase shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>AIVES VIVAAI 4.0</span>
            </div>

            {/* Main Headline & Subtitle */}
            <div className="space-y-3">
              <h1 id="login-title" className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-slate-900 tracking-tight leading-[1.16]">
                Khảo Thí Vấn Đáp <span className="text-blue-600">AI</span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
                Nền tảng thi vấn đáp thông minh thế hệ mới với Giám khảo AI tương tác thời gian thực, đánh giá năng lực minh bạch và chuẩn mực học thuật.
              </p>
            </div>

            {/* Interactive Showcase Card */}
            <div className="rounded-2xl border border-blue-100/90 bg-gradient-to-br from-white via-blue-50/30 to-blue-50/70 p-6 sm:p-7 shadow-xl shadow-blue-500/5 space-y-6 relative overflow-hidden backdrop-blur-xs">
              {/* Card Header with waveform */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/25">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Giám Khảo AI Tương Tác</h3>
                    <p className="text-xs font-medium text-blue-600">Âm học chuẩn hóa • Theo dõi phiên vấn đáp</p>
                  </div>
                </div>
                {/* Audio Waveform Animation */}
                <div className="flex items-center gap-1 h-7 px-3 bg-blue-50/90 border border-blue-200/70 rounded-full" aria-hidden="true">
                  <span className="w-1 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="w-1 h-4.5 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                  <span className="w-1 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                  <span className="w-1 h-5 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: "200ms" }} />
                  <span className="w-1 h-3.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: "400ms" }} />
                  <span className="w-1 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "100ms" }} />
                </div>
              </div>

              {/* 3 Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-xl border border-slate-200/80 bg-white/95 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Voice AI</h4>
                  <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Phỏng vấn thông minh</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200/80 bg-white/95 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Thiết bị</h4>
                  <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Kiểm tra micro & loa</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200/80 bg-white/95 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <FileCheck className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Rubric AI</h4>
                  <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Chấm điểm minh bạch</p>
                </div>
              </div>

              {/* 3 Metrics Row */}
              <div className="pt-4 border-t border-blue-100/90 grid grid-cols-3 gap-3">
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-blue-600 tracking-tight">Câu hỏi</div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Theo học phần</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-blue-600 tracking-tight">Rubric</div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Tiêu chí minh bạch</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-blue-600 tracking-tight">Giảng viên</div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Xác nhận kết quả</div>
                </div>
              </div>
            </div>

            {/* Bottom Compliance Banner */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                <Shield className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                <span>Quản lý khảo thí theo vai trò</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  AIVES
                </span>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  Vấn đáp
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Modern Login Card */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8 space-y-5">
              
              {/* Role Selection Tabs */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-2">
                  VAI TRÒ DỰ THI
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeRole === "student"}
                    onClick={() => handleRoleTabChange("student")}
                    className={`login-tab ${activeRole === "student" ? "active" : ""}`}
                  >
                    Thí sinh
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeRole === "lecturer"}
                    onClick={() => handleRoleTabChange("lecturer")}
                    className={`login-tab ${activeRole === "lecturer" ? "active" : ""}`}
                  >
                    Giám khảo
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeRole === "admin"}
                    onClick={() => handleRoleTabChange("admin")}
                    className={`login-tab ${activeRole === "admin" ? "active" : ""}`}
                  >
                    Quản trị viên
                  </button>
                </div>
              </div>

              {/* Login Title */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Đăng nhập</h2>
              </div>

              {/* SSO Options */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setSsoMessage("Cổng VNU SSO hiện đang được tích hợp cùng phòng khảo thí. Trong môi trường thử nghiệm, bạn có thể chọn các vai trò phía trên để đăng nhập trực tiếp.")}
                  className="login-sso-vnu"
                >
                  <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Đăng nhập VNU SSO</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSsoMessage("Đăng nhập bằng Google Workspace (.edu.vn) đang sẵn sàng. Trong môi trường thử nghiệm, bạn có thể chọn các vai trò phía trên để đăng nhập trực tiếp.")}
                  className="login-sso-google"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Google Workspace (.edu.vn)</span>
                </button>
              </div>

              {/* SSO Message Notice */}
              {ssoMessage && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-start justify-between gap-2">
                  <div className="flex items-start gap-1.5">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{ssoMessage}</span>
                  </div>
                  <button type="button" onClick={() => setSsoMessage(null)} className="text-blue-600 hover:text-blue-900 font-bold p-0">×</button>
                </div>
              )}

              {/* Divider */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200 w-full" />
                <span className="absolute bg-white px-3 text-[11px] font-bold text-slate-400 tracking-wider">HOẶC</span>
              </div>

              {/* Login Form */}
              <form className="space-y-4" noValidate onSubmit={handleSubmit}>
                {submitError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start justify-between gap-2.5">
                    <div>
                      <strong className="block font-bold mb-0.5">Thông báo xác thực</strong>
                      <span>{submitError}</span>
                    </div>
                    <button
                      type="button"
                      aria-label="Đóng thông báo"
                      onClick={clearFeedback}
                      className="text-red-600 hover:text-red-900 font-bold text-base leading-none p-1"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Email / Student Code Field */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="academic-email" className="text-xs font-semibold text-slate-700">
                      {activeRole === "student" ? "Email học thuật" : activeRole === "admin" ? "Tài khoản Quản trị viên" : "Email học thuật / Giám khảo"}
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">@academia.edu.vn</span>
                  </div>
                  <div className="login-input-wrap">
                    <Mail className="input-lead-icon" />
                    <input
                      id="academic-email"
                      aria-label="Tài khoản Email học thuật"
                      aria-describedby={errors.email ? emailErrorId : undefined}
                      aria-invalid={Boolean(errors.email)}
                      autoComplete="username"
                      inputMode="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((curr) => ({ ...curr, email: undefined }));
                        clearFeedback();
                      }}
                      placeholder={
                        activeRole === "student"
                          ? "student@academia.edu.vn"
                          : activeRole === "admin"
                          ? "admin@academia.edu.vn"
                          : "lecturer@academia.edu.vn"
                      }
                      className={`login-field-input ${errors.email ? "has-error" : ""}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600 font-medium" id={emailErrorId} role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="password" className="text-xs font-semibold text-slate-700">
                      Mật khẩu
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotDialog(true)}
                      className="login-forgot-btn"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="login-input-wrap">
                    <Lock className="input-lead-icon" />
                    <input
                      id="password"
                      aria-label="Mật khẩu bảo mật"
                      aria-describedby={errors.password ? passwordErrorId : undefined}
                      aria-invalid={Boolean(errors.password)}
                      autoComplete="current-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors((curr) => ({ ...curr, password: undefined }));
                        clearFeedback();
                      }}
                      placeholder="Nhập mật khẩu..."
                      className={`login-field-input ${errors.password ? "has-error" : ""}`}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      onClick={() => setShowPassword((v) => !v)}
                      className="login-eye-btn"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600 font-medium" id={passwordErrorId} role="alert">
                      {errors.password}
                    </p>
                  )}
                </div>

                <p className="text-xs text-slate-500">{runtimeConfig.dataSource === 'mock' ? 'Phiên demo được giữ trong tab này; đăng xuất để kết thúc.' : 'Thời hạn phiên đăng nhập do hệ thống quản lý.'}</p>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={pending}
                  aria-label={pending ? "Đang xử lý…" : "Đăng nhập vào hệ thống"}
                  className="login-submit-button"
                >
                  {pending ? (
                    <span>Đang xử lý…</span>
                  ) : (
                    <>
                      <span>Vào Hệ Thống</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Utilities Inside Card */}
              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link
                  to="/device-check"
                  className="login-bottom-link"
                >
                  <Mic className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Kiểm tra Micro &amp; Loa</span>
                </Link>
                <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span>Cổng hỗ trợ AIVES</span>
                </span>
              </div>
            </div>

            {/* Helpdesk & Regulation links */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-2 pt-1">
              <div>
                Hỗ trợ kỹ thuật: <strong className="text-slate-800 font-bold ml-1">Liên hệ phòng khảo thí</strong>
              </div>
              <button
                type="button"
                onClick={() => setShowRegulationsDialog(true)}
                className="login-regulations-btn"
              >
                <span>Quy chế ca thi</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Dialog: Forgot Password */}
      <Dialog
        open={showForgotDialog}
        onClose={() => setShowForgotDialog(false)}
        title="Quên mật khẩu tài khoản học thuật"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 py-2">
          <p>
            Đối với tài khoản học thuật được cấp trên hệ thống Khảo thí Vấn đáp AIVES:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>
              <strong>Sinh viên:</strong> Vui lòng liên hệ Văn phòng Đào tạo &amp; Quản lý Sinh viên hoặc Giảng viên phụ trách môn thi để được cấp lại mật khẩu.
            </li>
            <li>
              <strong>Giảng viên:</strong> Vui lòng liên hệ Quản trị viên hệ thống Khảo thí hoặc Phòng Đảm bảo Chất lượng qua email hỗ trợ bên dưới.
            </li>
          </ul>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs">
            <div>Hotline hỗ trợ: <strong className="text-slate-900 font-bold">Liên hệ phòng khảo thí</strong> (8:00 - 17:30)</div>
            <div>Email tiếp nhận: <a href="mailto:support@academia.edu.vn" className="text-blue-600 font-semibold">support@academia.edu.vn</a></div>
          </div>
        </div>
      </Dialog>

      {/* Dialog: Regulations */}
      <Dialog
        open={showRegulationsDialog}
        onClose={() => setShowRegulationsDialog(false)}
        title="Quy chế & Hướng dẫn thi vấn đáp trực tuyến AI"
      >
        <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 py-2 max-h-[60vh] overflow-y-auto">
          <p className="font-semibold text-slate-800">
            Thí sinh và Giám khảo tham gia ca thi vấn đáp AIVES cần tuân thủ các quy tắc sau:
          </p>
          <div className="space-y-2.5">
            <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-lg">
              <strong className="block text-blue-900 font-bold mb-1">1. Thiết bị &amp; Môi trường phòng thi</strong>
              <p className="text-xs text-blue-800">
                Thí sinh kiểm tra micro, loa và các thiết bị được yêu cầu trong hướng dẫn của từng kỳ thi. Chọn nơi yên tĩnh và thực hiện theo quy chế được giảng viên công bố.
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <strong className="block text-slate-900 font-bold mb-1">2. Cơ chế Giám khảo AI</strong>
              <p className="text-xs text-slate-700">
                AI sẽ phỏng vấn tuần tự theo các tiêu chí Rubric của môn học, tự động lắng nghe và đưa ra câu hỏi mở rộng dựa trên câu trả lời của thí sinh.
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <strong className="block text-slate-900 font-bold mb-1">3. Tính liêm chính &amp; Chấm điểm</strong>
              <p className="text-xs text-slate-700">
                Mọi phát biểu được lưu trữ âm thanh và chuyển hóa transcript đầy đủ. Điểm số từ AI là gợi ý tham khảo; Giảng viên hội đồng là người quyết định và xác nhận điểm số cuối cùng.
              </p>
            </div>
          </div>
        </div>
      </Dialog>
    </section>
  );
}
