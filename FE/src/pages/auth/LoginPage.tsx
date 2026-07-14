import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import type { Role } from '@/types/rbac';
import LandingPage from '@/pages/auth/LandingPage';

export type IconName = 'user' | 'lock' | 'eye' | 'eyeOff' | 'login' | 'check' | 'x';

interface IconProps {
  name: IconName;
  className?: string;
}

const Icon = ({ name, className = 'w-5 h-5' }: IconProps) => {
  const paths = {
    user: (
      <>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    lock: (
      <>
        <rect width="18" height="11" x="3" y="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    eyeOff: (
      <>
        <path d="m2 2 20 20" />
        <path d="M6.7 6.7C3.7 8.7 2 12 2 12s3.5 7 10 7c1.9 0 3.5-.6 4.9-1.4" />
        <path d="M9.9 4.4C10.6 4.1 11.3 4 12 4c6.5 0 10 8 10 8s-.7 1.6-2.2 3.2" />
        <path d="M14.1 14.1A3 3 0 0 1 9.9 9.9" />
      </>
    ),
    login: (
      <>
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <path d="m10 17 5-5-5-5" />
        <path d="M15 12H3" />
      </>
    ),
    check: <path d="m20 6-11 11-5-5" />,
    x: (
      <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </>
    ),
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const registrationSuccess = Boolean((location.state as { registrationSuccess?: boolean } | null)?.registrationSuccess);
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleHome: Record<Role, string> = {
    SYSTEM_ADMIN: '/app/users',
    PARKING_MANAGER: '/app/dashboard',
    PARKING_STAFF: '/app/dashboard',
    PARKING_USER: '/app/parking-info',
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await loginUser(identifier, password);
      login(result.user, result.token, remember);
      navigate(roleHome[result.user.role], { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div aria-hidden="true" className="max-h-screen overflow-hidden"><LandingPage /></div>
      <main className="fixed inset-0 z-[100] w-full overflow-y-auto bg-slate-950/70 backdrop-blur-sm">
        <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
          <div className="w-full max-w-xl">
            <div role="dialog" aria-modal="true" aria-labelledby="login-dialog-title" className={`relative rounded-3xl border border-white/60 bg-white/95 p-6 shadow-2xl backdrop-blur sm:p-8 ${registrationSuccess ? 'auth-modal-slide-in-right' : ''}`}>
              <Link
                to="/"
                aria-label="Đóng cửa sổ đăng nhập"
                title="Đóng"
                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
              >
                <Icon name="x" className="w-5 h-5" />
              </Link>

              <div className="mb-6 mt-2">
                <h2 id="login-dialog-title" className="text-2xl font-bold text-slate-800 mt-1">Đăng nhập</h2>
              </div>

              {registrationSuccess && (
                <div role="status" className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Icon name="check" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Đăng ký thành công!</p>
                    <p className="mt-0.5 text-sm text-emerald-700">Vui lòng đăng nhập để tiếp tục.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="username">Tên đăng nhập / Email</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Icon name="user" className="w-[18px] h-[18px]" />
                    </div>
                    <input id="username" name="username" type="text" value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoComplete="username" className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg py-3 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition" placeholder="Nhập tên đăng nhập hoặc email" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="password">Mật khẩu</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Icon name="lock" className="w-[18px] h-[18px]" />
                    </div>
                    <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg py-3 pl-10 pr-11 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition" placeholder="Nhập mật khẩu" required />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" aria-label="Hiện hoặc ẩn mật khẩu">
                      <Icon name={showPassword ? 'eyeOff' : 'eye'} className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="w-4 h-4 accent-blue-600 mr-2" />
                    Ghi nhớ đăng nhập
                  </label>
                  {/* <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Quên mật khẩu?</a> */}
                </div>

                {error && (
                  <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                  <Icon name="login" className="w-[18px] h-[18px]" />
                  {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
              </form>
              <p className="text-center text-sm text-slate-500 mt-6">
                Chưa có tài khoản? <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">Đăng ký ngay</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
