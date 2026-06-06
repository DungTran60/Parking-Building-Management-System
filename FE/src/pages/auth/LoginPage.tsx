import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export type IconName = 'parking' | 'shield' | 'user' | 'lock' | 'eye' | 'eyeOff' | 'login' | 'car' | 'building' | 'creditCard' | 'chart' | 'camera';

interface IconProps {
  name: IconName;
  className?: string;
}

const Icon = ({ name, className = 'w-5 h-5' }: IconProps) => {
  const paths = {
    parking: (
      <>
        <path d="M9 18V6h4.5a3.5 3.5 0 0 1 0 7H9" />
        <path d="M9 13h4.5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
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
    car: (
      <>
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.4 6c-.3-.6-.9-1-1.6-1H7.2c-.7 0-1.3.4-1.6 1l-2.1 5.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
        <path d="M5 11h14" />
      </>
    ),
    building: (
      <>
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
        <path d="M10 6h4" />
        <path d="M10 10h4" />
        <path d="M10 14h4" />
        <path d="M10 18h4" />
      </>
    ),
    creditCard: (
      <>
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <path d="M2 10h20" />
      </>
    ),
    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
      </>
    ),
    camera: (
      <>
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
        <circle cx="12" cy="13" r="3" />
      </>
    ),
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

interface RoleCardProps {
  role: string;
  description: string;
  icon: IconName;
  active: boolean;
  onClick: () => void;
}

const RoleCard = ({ role, description, icon, active, onClick }: RoleCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-lg border p-3 text-left transition hover:border-blue-300 ${active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700'
      }`}
  >
    <Icon name={icon} className="w-[18px] h-[18px]" />
    <span className="block text-sm font-semibold mt-2">{role}</span>
    <span className="text-xs text-slate-500">{description}</span>
  </button>
);

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Driver');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert('Đăng nhập thành công! (Demo)');
  };

  return (
    <main
      className="min-h-screen w-full overflow-y-auto bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.78) 44%, rgba(15, 23, 42, 0.45) 100%), url('https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1920&auto=format&fit=crop&q=80')",
      }}
    >
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        <section className="hidden lg:flex flex-col justify-between px-12 py-10 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
              <Icon name="parking" className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Parking BMS</h1>
              <p className="text-xs text-blue-100">Smart Parking Building Management</p>
            </div>
          </div>

          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-blue-100 mb-5">
              <Icon name="shield" className="w-3.5 h-3.5" />
              Truy cập an toàn theo vai trò
            </span>
            <h2 className="text-4xl font-bold leading-tight">Quản lý vận hành bãi xe từ một màn hình đăng nhập.</h2>
            <p className="text-slate-200 mt-4 leading-7">
              Theo dõi slot trống, xử lý xe vào/ra, đặt chỗ, thanh toán và phân quyền cho từng nhóm người dùng trong cùng một hệ thống.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-8">
              <div className="rounded-xl bg-white/10 border border-white/15 p-4">
                <p className="text-2xl font-bold">24</p>
                <p className="text-xs text-slate-300 mt-1">bãi xe</p>
              </div>
              <div className="rounded-xl bg-white/10 border border-white/15 p-4">
                <p className="text-2xl font-bold">8,459</p>
                <p className="text-xs text-slate-300 mt-1">slot hoạt động</p>
              </div>
              <div className="rounded-xl bg-white/10 border border-white/15 p-4">
                <p className="text-2xl font-bold">99.8%</p>
                <p className="text-xs text-slate-300 mt-1">uptime</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-xl">
            <div className="flex items-center gap-3 rounded-xl bg-white/10 border border-white/15 p-3">
              <Icon name="camera" className="w-[18px] h-[18px]" />
              <span className="text-xs">Nhận diện biển số</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/10 border border-white/15 p-3">
              <Icon name="creditCard" className="w-[18px] h-[18px]" />
              <span className="text-xs">Thanh toán nhanh</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/10 border border-white/15 p-3">
              <Icon name="chart" className="w-[18px] h-[18px]" />
              <span className="text-xs">Báo cáo realtime</span>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden text-center mb-6 text-white">
              <div className="inline-flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
                  <Icon name="parking" className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <h1 className="text-xl font-bold">Parking BMS</h1>
                  <p className="text-xs text-blue-100">Quản lý bãi xe thông minh</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl shadow-2xl border border-white/60 bg-white/90 backdrop-blur p-6 sm:p-8">
              <div className="mb-6">
                <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Welcome back</p>
                <h2 className="text-2xl font-bold text-slate-800 mt-1">Đăng nhập hệ thống</h2>
                <p className="text-sm text-slate-500 mt-2">Sử dụng tài khoản được cấp để truy cập đúng vai trò.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="username">Tên đăng nhập / Email</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Icon name="user" className="w-[18px] h-[18px]" />
                    </div>
                    <input id="username" type="text" className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg py-3 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition" placeholder="Nhập tên đăng nhập hoặc email" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="password">Mật khẩu</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Icon name="lock" className="w-[18px] h-[18px]" />
                    </div>
                    <input id="password" type={showPassword ? 'text' : 'password'} className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg py-3 pl-10 pr-11 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition" placeholder="Nhập mật khẩu" required />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" aria-label="Hiện hoặc ẩn mật khẩu">
                      <Icon name={showPassword ? 'eyeOff' : 'eye'} className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center text-slate-600 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-blue-600 mr-2" />
                    Ghi nhớ đăng nhập
                  </label>
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Quên mật khẩu?</a>
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                  <Icon name="login" className="w-[18px] h-[18px]" />
                  Đăng nhập
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-xs text-slate-400">Chọn nhanh vai trò</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <RoleCard role="Driver" description="Gửi xe, đặt chỗ" icon="car" active={selectedRole === 'Driver'} onClick={() => setSelectedRole('Driver')} />
                <RoleCard role="Staff" description="Xe vào / ra" icon="login" active={selectedRole === 'Staff'} onClick={() => setSelectedRole('Staff')} />
                <RoleCard role="Manager" description="Bãi xe, báo cáo" icon="building" active={selectedRole === 'Manager'} onClick={() => setSelectedRole('Manager')} />
                <RoleCard role="Admin" description="Hệ thống" icon="shield" active={selectedRole === 'Admin'} onClick={() => setSelectedRole('Admin')} />
              </div>

              <p className="text-center text-sm text-slate-500 mt-6">
                Chưa có tài khoản? <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">Đăng ký ngay</Link>
              </p>
            </div>

            <p className="text-center text-slate-200 text-xs mt-6">© 2026 Parking BMS - Hệ thống quản lý tòa nhà gửi xe</p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
