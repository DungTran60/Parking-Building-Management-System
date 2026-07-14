import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LandingPage from '@/pages/auth/LandingPage';
import { registerUser } from '@/services/authService';

const Icon = ({ name, className = 'w-5 h-5' }: { name: string; className?: string }) => {
    const paths: Record<string, React.ReactNode> = {
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

const RegisterPage = () => {
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        setIsSubmitting(true);
        try {
            await registerUser({ username, password, email, phoneNumber });
            setIsTransitioning(true);
            await new Promise((resolve) => window.setTimeout(resolve, 280));
            navigate('/login', { replace: true, state: { registrationSuccess: true } });
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'Đăng ký thất bại. Vui lòng thử lại.');
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
                        <div role="dialog" aria-modal="true" aria-labelledby="register-dialog-title" className={`relative rounded-3xl border border-white/60 bg-white/95 p-6 shadow-2xl backdrop-blur sm:p-8 ${isTransitioning ? 'auth-modal-slide-out-left' : ''}`}>
                            <Link
                                to="/"
                                aria-label="Đóng cửa sổ đăng ký"
                                title="Đóng"
                                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                            >
                                <Icon name="x" className="w-5 h-5" />
                            </Link>

                            <div className="mb-6 mt-2">
                                <h2 id="register-dialog-title" className="text-2xl font-bold text-slate-800 mt-1">Đăng ký tài khoản</h2>
                                <p className="text-sm text-slate-500 mt-2">Nhập thông tin để tạo tài khoản sử dụng Parking BMS.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="username">Tên đăng nhập</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Icon name="user" className="w-[18px] h-[18px]" />
                                        </div>
                                        <input id="username" name="username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" minLength={3} maxLength={50} className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg py-3 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition" placeholder="newdriver" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="email">Email</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                <Icon name="mail" className="w-[18px] h-[18px]" />
                                            </div>
                                            <input id="email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg py-3 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition" placeholder="name@email.com" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="phone">Số điện thoại</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                <Icon name="phone" className="w-[18px] h-[18px]" />
                                            </div>
                                            <input id="phone" name="phoneNumber" type="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} autoComplete="tel" className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg py-3 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition" placeholder="09xx xxx xxx" required />
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
                                            <input id="password" name="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={8} className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg py-3 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition" placeholder="Tối thiểu 8 ký tự" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                <Icon name="lock" className="w-[18px] h-[18px]" />
                                            </div>
                                            <input id="confirmPassword" name="confirmPassword" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={8} className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg py-3 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition" placeholder="Nhập lại mật khẩu" required />
                                        </div>
                                    </div>
                                </div>

                                <label className="flex items-start gap-2 text-sm text-slate-600">
                                    <input type="checkbox" className="mt-1 w-4 h-4 accent-blue-600" required />
                                    <span>Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật của Parking BMS.</span>
                                </label>

                                {error && (
                                    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                                        {error}
                                    </div>
                                )}

                                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                                    <Icon name="userPlus" className="w-[18px] h-[18px]" />
                                    {isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                                </button>
                            </form>

                            <p className="text-center text-sm text-slate-500 mt-6">
                                Đã có tài khoản? <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">Đăng nhập</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RegisterPage;
