import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Icon = ({ name, className = 'w-5 h-5' }: { name: string; className?: string }) => {
    const paths: Record<string, React.ReactNode> = {
        parking: (
            <>
                <path d="M9 18V6h4.5a3.5 3.5 0 0 1 0 7H9" />
                <path d="M9 13h4.5" />
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
        user: (
            <>
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </>
        ),
        mail: (
            <>
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-10 6L2 7" />
            </>
        ),
        phone: (
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6.4 6.4l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" />
        ),
        lock: (
            <>
                <rect width="18" height="11" x="3" y="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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
        calendar: (
            <>
                <path d="M8 2v4" />
                <path d="M16 2v4" />
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <path d="M3 10h18" />
            </>
        ),
        check: <path d="m20 6-11 11-5-5" />,
    };

    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {paths[name]}
        </svg>
    );
};

const accountTypes = [
    { id: 'driver', label: 'Driver', description: 'Gửi xe, đặt chỗ', icon: 'car' },
    { id: 'staff', label: 'Staff', description: 'Nhân viên vận hành', icon: 'userPlus' },
    { id: 'manager', label: 'Manager', description: 'Quản lý bãi xe', icon: 'shield' },
];

const RegisterPage = () => {
    const [accountType, setAccountType] = useState('driver');

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        alert('Đăng ký thành công! (Demo)');
    };

    return (
        <main
            className="min-h-screen w-full overflow-y-auto bg-cover bg-center"
            style={{
                backgroundImage:
                    "linear-gradient(90deg, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.78) 46%, rgba(15, 23, 42, 0.5) 100%), url('https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=1920&auto=format&fit=crop&q=80')",
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
                            <Icon name="userPlus" className="w-3.5 h-3.5" />
                            Tạo tài khoản truy cập hệ thống
                        </span>
                        <h2 className="text-4xl font-bold leading-tight">Bắt đầu sử dụng Parking BMS theo đúng vai trò của bạn.</h2>
                        <p className="text-slate-200 mt-4 leading-7">
                            Tài khoản Driver có thể gửi xe và đặt chỗ. Tài khoản Staff/Manager cần được quản trị viên xác minh trước khi kích hoạt đầy đủ quyền.
                        </p>
                        <div className="space-y-3 mt-8">
                            <div className="flex items-center gap-3 rounded-xl bg-white/10 border border-white/15 p-4">
                                <div className="w-9 h-9 rounded-lg bg-blue-500/80 flex items-center justify-center">
                                    <Icon name="check" className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold">Đăng ký nhanh</p>
                                    <p className="text-xs text-slate-300 mt-1">Tạo hồ sơ người dùng và phương tiện trong một luồng.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl bg-white/10 border border-white/15 p-4">
                                <div className="w-9 h-9 rounded-lg bg-green-500/80 flex items-center justify-center">
                                    <Icon name="calendar" className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold">Sẵn sàng đặt chỗ</p>
                                    <p className="text-xs text-slate-300 mt-1">Theo dõi slot trống và đặt chỗ trước nếu bãi hỗ trợ.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-slate-300">© 2026 Parking BMS - Hệ thống quản lý tòa nhà gửi xe</p>
                </section>

                <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-12">
                    <div className="w-full max-w-xl">
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
                                <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Create account</p>
                                <h2 className="text-2xl font-bold text-slate-800 mt-1">Đăng ký tài khoản</h2>
                                <p className="text-sm text-slate-500 mt-2">Nhập thông tin để tạo tài khoản sử dụng Parking BMS.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Loại tài khoản</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {accountTypes.map((type) => (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => setAccountType(type.id)}
                                                className={`rounded-lg border p-3 text-left transition hover:border-blue-300 ${accountType === type.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700'
                                                    }`}
                                            >
                                                <Icon name={type.icon} className="w-[18px] h-[18px]" />
                                                <span className="block text-sm font-semibold mt-2">{type.label}</span>
                                                <span className="text-xs text-slate-500">{type.description}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="fullName">Họ và tên</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                <Icon name="user" className="w-[18px] h-[18px]" />
                                            </div>
                                            <input id="fullName" className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg py-3 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition" placeholder="Nguyễn Văn A" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="phone">Số điện thoại</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                <Icon name="phone" className="w-[18px] h-[18px]" />
                                            </div>
                                            <input id="phone" className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg py-3 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition" placeholder="09xx xxx xxx" required />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="email">Email</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                <Icon name="mail" className="w-[18px] h-[18px]" />
                                            </div>
                                            <input id="email" type="email" className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg py-3 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition" placeholder="name@email.com" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="plate">Biển số xe</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                <Icon name="car" className="w-[18px] h-[18px]" />
                                            </div>
                                            <input id="plate" className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg py-3 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition uppercase" placeholder="29A-123.45" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="password">Mật khẩu</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                <Icon name="lock" className="w-[18px] h-[18px]" />
                                            </div>
                                            <input id="password" type="password" className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg py-3 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition" placeholder="Tối thiểu 8 ký tự" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                <Icon name="lock" className="w-[18px] h-[18px]" />
                                            </div>
                                            <input id="confirmPassword" type="password" className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg py-3 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition" placeholder="Nhập lại mật khẩu" required />
                                        </div>
                                    </div>
                                </div>

                                <label className="flex items-start gap-2 text-sm text-slate-600">
                                    <input type="checkbox" className="mt-1 w-4 h-4 accent-blue-600" required />
                                    <span>Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật của Parking BMS.</span>
                                </label>

                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                                    <Icon name="userPlus" className="w-[18px] h-[18px]" />
                                    Tạo tài khoản
                                </button>
                            </form>

                            <p className="text-center text-sm text-slate-500 mt-6">
                                Đã có tài khoản? <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">Đăng nhập</Link>
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default RegisterPage;
