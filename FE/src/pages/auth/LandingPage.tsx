import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '@/api/publicApi';
import type { PublicStats } from '@/api/publicApi';

const LandingIcon = ({ name, className = 'w-6 h-6' }: { name: string; className?: string }) => {
  const paths: Record<string, React.ReactNode> = {
    parking: (
      <>
        <path d="M9 18V6h4.5a3.5 3.5 0 0 1 0 7H9" />
        <path d="M9 13h4.5" />
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
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
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
    creditCard: (
      <>
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <path d="M2 10h20" />
      </>
    ),
    camera: (
      <>
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
        <circle cx="12" cy="13" r="3" />
      </>
    ),
    zap: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
    mapPin: (
      <>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    star: (
      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
    ),
    arrowRight: <path d="M5 12h14m-7-7 7 7-7 7" />,
    login: (
      <>
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <path d="m10 17 5-5-5-5" />
        <path d="M15 12H3" />
      </>
    ),
    userPlus: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M19 8v6" />
        <path d="M22 11h-6" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    bike: (
      <>
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="18.5" cy="17.5" r="3.5" />
        <path d="m8 17.5 4-8 3 8M9.5 12h6M12 9.5l-2-2" />
      </>
    ),
  };

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
};

const features = [
  {
    icon: 'camera',
    title: 'Nhận diện biển số',
    desc: 'AI tự động nhận dạng biển số xe khi vào/ra bãi đỗ.',
  },
  {
    icon: 'creditCard',
    title: 'Thanh toán nhanh',
    desc: 'Tích hợp nhiều phương thức thanh toán, tính phí tức thời.',
  },
  {
    icon: 'chart',
    title: 'Báo cáo realtime',
    desc: 'Dashboard trực quan, thống kê doanh thu và lưu lượng xe.',
  },
  {
    icon: 'mapPin',
    title: 'Quản lý đa tòa nhà',
    desc: 'Giám sát nhiều bãi xe, tầng và slot trong cùng hệ thống.',
  },
  {
    icon: 'shield',
    title: 'Phân quyền vai trò',
    desc: 'Kiểm soát truy cập chặt chẽ theo Driver, Staff, Manager, Admin.',
  },
  {
    icon: 'zap',
    title: 'Đặt chỗ trước',
    desc: 'Cho phép tài xế đặt slot trước để tối ưu trải nghiệm.',
  },
];

const defaultStats: PublicStats = {
  totalBuildings: 1,
  totalSlots: 80,
  availableSlots: 40,
  totalVehicleTypes: 5,
};

const parkingInformation = [
  { icon: 'clock', title: 'Giờ hoạt động', value: '24/7', detail: 'Mở cửa tất cả các ngày trong tuần' },
  { icon: 'bike', title: 'Loại xe hỗ trợ', value: 'Ô tô & xe máy', detail: 'Có khu vực đỗ riêng cho từng loại xe' },
  { icon: 'parking', title: 'Slot còn trống', value: '', detail: 'Số liệu thực tế từ hệ thống' },
  { icon: 'creditCard', title: 'Bảng giá', value: 'Từ 5.000đ/giờ', detail: 'Mức phí phụ thuộc loại xe và thời gian gửi' },
];

const LandingPage = () => {
  const [stats, setStats] = useState<PublicStats>(defaultStats);
  useEffect(() => { publicApi.getStats().then(s => { setStats(s); }).catch(() => {}); }, []);

  const formatNumber = (n: number) => n.toLocaleString("vi-VN");

  const statItems = [
    { value: formatNumber(stats.totalBuildings), label: 'Tòa nhà' },
    { value: formatNumber(stats.totalSlots), label: 'Slot đỗ xe' },
    { value: formatNumber(stats.availableSlots), label: 'Slot trống' },
    { value: formatNumber(stats.totalVehicleTypes), label: 'Loại xe' },
  ];

  return (
    <main
      className="min-h-screen w-full overflow-y-auto"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      }}
    >
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-md bg-slate-900/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <LandingIcon name="parking" className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Parking BMS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              id="nav-login-btn"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 transition"
            >
              <LandingIcon name="login" className="w-4 h-4" />
              Đăng nhập
            </Link>
            <Link
              to="/register"
              id="nav-register-btn"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition"
            >
              <LandingIcon name="userPlus" className="w-4 h-4" />
              Đăng ký
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center overflow-hidden sm:mt-6 sm:rounded-3xl bg-cover bg-center"
        style={{
          backgroundImage: "linear-gradient(90deg, rgba(15,23,42,.94), rgba(15,23,42,.72)), url('https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1920&auto=format&fit=crop&q=80')",
        }}
      >
        {/* Glow blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20"
            style={{
              background:
                'radial-gradient(circle, rgba(59,130,246,0.6) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute top-40 right-0 w-72 h-72 rounded-full opacity-10"
            style={{
              background:
                'radial-gradient(circle, rgba(139,92,246,0.7) 0%, transparent 70%)',
            }}
          />
        </div>

        <span className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 text-blue-300 text-xs font-semibold tracking-wide mb-6">
          <LandingIcon name="star" className="w-3.5 h-3.5" />
          Hệ thống quản lý bãi xe thông minh
        </span>

        <h1 className="relative text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
          Quản lý toàn bộ bãi đỗ xe
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(90deg, #60a5fa, #818cf8)',
            }}
          >
            từ một nền tảng duy nhất
          </span>
        </h1>

        <p className="relative max-w-2xl mx-auto mt-6 text-slate-300 text-lg leading-relaxed">
          Tự động hóa check-in/out, nhận diện biển số, đặt chỗ, thanh toán và báo cáo — tất cả được phân quyền chặt chẽ cho từng vai trò.
        </p>

        <div className="relative mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            id="hero-register-btn"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-0.5"
          >
            <LandingIcon name="userPlus" className="w-5 h-5" />
            Bắt đầu miễn phí
            <LandingIcon name="arrowRight" className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            id="hero-login-btn"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-base backdrop-blur transition-all hover:-translate-y-0.5"
          >
            <LandingIcon name="login" className="w-5 h-5" />
            Đăng nhập ngay
          </Link>
        </div>
      </section>

      {/* Public parking information - UC01 */}
      <section id="parking-information" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">Thông tin dành cho tài xế</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Thông tin bãi xe</h2>
          <p className="mt-3 text-slate-400">Không cần đăng nhập để xem giờ hoạt động, loại xe, chỗ trống và mức phí.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {parkingInformation.map((item) => (
            <article key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-blue-400/40 hover:bg-white/10">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/15">
                <LandingIcon name={item.icon} className="h-5 w-5 text-blue-400" />
              </div>
              <p className="text-sm text-slate-400">{item.title}</p>
              <h3 className="mt-1 text-xl font-bold text-white">
                {item.icon === 'parking' ? `${formatNumber(stats.availableSlots)} vị trí` : item.value}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statItems.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 text-center"
            >
              <p className="text-3xl font-extrabold text-white">{s.value}</p>
              <p className="text-sm text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">Tính năng nổi bật</h2>
          <p className="text-slate-400 mt-3">Mọi công cụ bạn cần để vận hành bãi xe hiệu quả</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 hover:border-blue-500/40 hover:bg-white/8 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-400/20 flex items-center justify-center mb-4 group-hover:bg-blue-500/25 transition">
                <LandingIcon name={f.icon} className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA & Location ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div
          className="rounded-3xl border border-white/10 p-8 sm:p-12 lg:p-16 relative overflow-hidden flex flex-col lg:flex-row items-center gap-10 lg:gap-16"
          style={{
            background:
              'linear-gradient(135deg, rgba(37,99,235,0.25) 0%, rgba(109,40,217,0.15) 100%)',
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(59,130,246,0.15) 0%, transparent 70%)',
            }}
          />

          <div className="relative text-center lg:text-left flex-1 w-full">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Sẵn sàng tối ưu vận hành bãi xe?
            </h2>
            <p className="text-slate-300 mt-4 max-w-xl mx-auto lg:mx-0">
              Tạo tài khoản miễn phí ngay hôm nay và trải nghiệm hệ thống quản lý toàn diện trực tiếp hoặc qua nền tảng.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4">
              <Link
                to="/register"
                id="cta-register-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-0.5"
              >
                <LandingIcon name="userPlus" className="w-5 h-5" />
                Đăng ký ngay
              </Link>
              <Link
                to="/login"
                id="cta-login-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold backdrop-blur transition-all hover:-translate-y-0.5"
              >
                <LandingIcon name="login" className="w-5 h-5" />
                Đã có tài khoản
              </Link>
            </div>
          </div>

          <div className="relative w-full lg:w-[450px] xl:w-[500px] h-64 sm:h-80 rounded-2xl overflow-hidden border border-white/20 shadow-2xl flex-shrink-0">
            <iframe
              title="Location Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://maps.google.com/maps?q=70%20Tô%20Ký,%20phường%20Tân%20Chánh%20Hiệp,%20Quận%2012&t=&z=15&ie=UTF8&iwloc=&output=embed"
            />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 py-8 text-center text-slate-400 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
            <LandingIcon name="parking" className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white">Parking BMS</span>
        </div>
        <p>© 2026 Parking BMS - Hệ thống quản lý tòa nhà gửi xe</p>
      </footer>
    </main>
  );
};

export default LandingPage;
