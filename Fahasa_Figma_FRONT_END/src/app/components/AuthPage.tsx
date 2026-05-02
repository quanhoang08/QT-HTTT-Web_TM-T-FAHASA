import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User, LogIn, Loader2 } from 'lucide-react';
import api from '../utils/api';

// URL backend gốc (không có /api) để redirect OAuth
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://tmdt-fahasa-backend.onrender.com';

interface AuthPageProps {
  initialView?: 'login' | 'register';
  onBackToHome?: () => void;
  onLoginSuccess?: () => void;
  onRegisterSuccess?: () => void;
}

export function AuthPage({ initialView = 'login', onBackToHome, onLoginSuccess, onRegisterSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(initialView === 'login');

  // Login States
  const [loginShowPassword, setLoginShowPassword] = useState(false);

  // Register States
  const [registerShowPassword, setRegisterShowPassword] = useState(false);
  const [registerShowConfirmPassword, setRegisterShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loading, setLoading] = useState(false);

  // Common Transition Class (Mô phỏng đồ thị Cubic Bezier siêu mượt của Motion Graphics)
  const motionClass = "transition-all duration-[1100ms] ease-[cubic-bezier(0.85,0,0.15,1)]";

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputs = Array.from(e.currentTarget.querySelectorAll('input'));
    const email = inputs[0].value;
    const password = inputs[1].value;
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('fahasa_token', res.data.token);
      if (res.data.user) {
        localStorage.setItem('fahasa_user', JSON.stringify(res.data.user));
      }
      onLoginSuccess?.();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputs = Array.from(e.currentTarget.querySelectorAll('input'));
    const name = inputs[0].value;
    const email = inputs[1].value;
    const password = inputs[2].value;
    const confirmPassword = inputs[3].value;
    if (password !== confirmPassword) {
      alert('Mật khẩu không khớp!');
      return;
    }
    try {
      setLoading(true);
      const res = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('fahasa_token', res.data.token);
      if (res.data.user) {
        localStorage.setItem('fahasa_user', JSON.stringify(res.data.user));
      }
      onRegisterSuccess?.();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const startSocialLogin = (provider: 'google' | 'facebook') => {
    // Phải redirect thẳng đến backend Render (không qua /api prefix)
    window.location.href = `${BACKEND_URL}/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-0 lg:p-6 overflow-hidden">

      {/* Container Chính */}
      <div className="w-full h-screen lg:h-auto lg:min-h-[750px] lg:max-w-6xl bg-white lg:rounded-3xl lg:shadow-2xl relative overflow-hidden flex flex-col lg:flex-row">

        {/* ======================= */}
        {/*  MOBILE & TABLET VIEW   */}
        {/* ======================= */}
        <div className="lg:hidden flex-1 w-full h-full overflow-y-auto relative bg-white">
          {/* Ảnh nền mờ cho di động */}
          <div className="absolute top-0 left-0 w-full h-[300px] -z-10">
            <img src="/images/Couple-having-bookstore-date.png" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#CA2128]/20 to-[#FF9E86]/20 backdrop-blur-sm"></div>
          </div>

          <div className="p-6 pt-12">
            {onBackToHome && (
              <button onClick={onBackToHome} className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors mb-10 w-fit drop-shadow-md">
                <ArrowLeft size={20} />
                <span>Quay lại trang chủ</span>
              </button>
            )}

            <div className="bg-white rounded-3xl shadow-xl p-8 mt-12 border border-gray-100">
              {isLogin ? (
                <>
                  <h1 className="text-3xl mb-2 text-gray-800 text-center font-semibold">Đăng nhập</h1>
                  <p className="text-gray-500 mb-8 text-center text-sm">Chào mừng bạn quay trở lại!</p>
                  {/* Mobile Login Form ... extracted similarly below */}
                  <form className="space-y-5" onSubmit={handleLogin}>
                    <div>
                      <label className="block text-sm mb-2 text-gray-700">Email hoặc SĐT</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={20} /></div>
                        <input type="text" placeholder="example@email.com" className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-[10px] focus:outline-none focus:border-[#CA2128] transition-colors" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-2 text-gray-700">Mật khẩu</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={20} /></div>
                        <input type={loginShowPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-[10px] focus:outline-none focus:border-[#CA2128] transition-colors" required />
                        <button type="button" onClick={() => setLoginShowPassword(!loginShowPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {loginShowPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <a href="#" className="text-sm text-[#CA2128] hover:underline font-medium">Quên mật khẩu?</a>
                    </div>
                    <button type="submit" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#CA2128] to-[#FF9E86] text-white py-3 rounded-[10px] hover:shadow-lg transition-shadow text-lg font-medium">
                      <LogIn size={20} /> Đăng nhập
                    </button>
                  </form>
                  <p className="text-center mt-8 text-gray-600">Chưa có tài khoản?{' '}<button onClick={() => setIsLogin(false)} className="text-[#CA2128] hover:underline font-medium">Đăng ký ngay</button></p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl mb-2 text-gray-800 text-center font-semibold">Đăng ký</h1>
                  <p className="text-gray-500 mb-8 text-center text-sm">Điền thông tin để tạo tài khoản mới</p>
                  <form className="space-y-4" onSubmit={handleRegister}>
                    <div>
                      <label className="block text-sm mb-1 text-gray-700">Họ và tên</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><User size={20} /></div>
                        <input type="text" placeholder="Họ và tên" className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-[10px] focus:outline-none focus:border-[#d946ef] transition-colors" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-1 text-gray-700">Email</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={20} /></div>
                        <input type="email" placeholder="example@email.com" className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-[10px] focus:outline-none focus:border-[#d946ef] transition-colors" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-1 text-gray-700">Mật khẩu</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={20} /></div>
                        <input type={registerShowPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-[10px] focus:outline-none focus:border-[#d946ef] transition-colors" required />
                        <button type="button" onClick={() => setRegisterShowPassword(!registerShowPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {registerShowPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-1 text-gray-700">Xác nhận mật khẩu</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={20} /></div>
                        <input type={registerShowConfirmPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-[10px] focus:outline-none focus:border-[#d946ef] transition-colors" required />
                        <button type="button" onClick={() => setRegisterShowConfirmPassword(!registerShowConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {registerShowConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#d946ef] to-[#a855f7] text-white py-3 rounded-[10px] hover:shadow-lg transition-shadow text-lg font-medium mt-4 disabled:opacity-70">
                      {loading ? <Loader2 size={20} className="animate-spin" /> : null} Đăng Ký
                    </button>
                  </form>
                  <p className="text-center mt-6 text-gray-600 text-sm">Đã có tài khoản?{' '}<button onClick={() => setIsLogin(true)} className="text-[#CA2128] hover:underline font-medium">Đăng nhập</button></p>
                </>
              )}
            </div>
          </div>
        </div>


        {/* ======================= */}
        {/*      DESKTOP VIEW       */}
        {/* ======================= */}
        <div className="hidden lg:block flex-1 w-full h-full relative min-h-[750px]">

          {/* --------------- LEFT PANEL: REGISTER FORM --------------- */}
          <div className={`absolute top-0 left-0 w-[40%] h-full px-12 py-8 bg-gray-50 flex flex-col justify-center ${motionClass} ${!isLogin ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-[20%] pointer-events-none'}`}>
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-[#d946ef] transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Quay lại trang chủ</span>
              </button>
            )}
            <div className="w-full max-w-md mx-auto mt-12">
              <h1 className="text-3xl mb-2 text-gray-800 text-center font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#d946ef] to-[#a855f7]">Đăng ký tài khoản</h1>
              <p className="text-gray-500 mb-8 text-center text-sm">Vui lòng điền thông tin để tạo tài khoản mới</p>

              <form className="space-y-4" onSubmit={handleRegister}>
                <div>
                  <label className="block text-sm mb-1 text-gray-700">Họ và tên</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><User size={20} /></div>
                    <input type="text" placeholder="Họ và tên" className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-[10px] focus:outline-none focus:border-[#d946ef] transition-colors bg-white" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1 text-gray-700">Email</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={20} /></div>
                    <input type="email" placeholder="example@email.com" className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-[10px] focus:outline-none focus:border-[#d946ef] transition-colors bg-white" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1 text-gray-700">Mật khẩu</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={20} /></div>
                    <input type={registerShowPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-[10px] focus:outline-none focus:border-[#d946ef] transition-colors bg-white" required />
                    <button type="button" onClick={() => setRegisterShowPassword(!registerShowPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {registerShowPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1 text-gray-700">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={20} /></div>
                    <input type={registerShowConfirmPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-[10px] focus:outline-none focus:border-[#d946ef] transition-colors bg-white" required />
                    <button type="button" onClick={() => setRegisterShowConfirmPassword(!registerShowConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {registerShowConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <label className="flex items-start gap-2 cursor-pointer mt-1">
                    <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="w-4 h-4 accent-[#d946ef] cursor-pointer mt-[2px]" required />
                    <span className="text-[12px] text-gray-600 leading-tight">Tôi đồng ý với điều khoản dịch vụ và chính sách bảo mật</span>
                  </label>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-[#d946ef] to-[#a855f7] text-white py-3 rounded-[10px] hover:shadow-lg transition-shadow text-lg font-medium mt-2">
                  Đăng Ký Tài Khoản
                </button>
                <div className="mt-6 text-center text-gray-600 text-sm">
                  Đã có tài khoản?{' '}
                  <button type="button" onClick={() => setIsLogin(true)} className="text-[#d946ef] hover:underline font-medium">Đăng nhập</button>
                </div>
              </form>
            </div>
          </div>

          {/* --------------- RIGHT PANEL: LOGIN FORM --------------- */}
          <div className={`absolute top-0 right-0 w-[40%] h-full px-12 py-8 bg-gray-50 flex flex-col justify-center ${motionClass} ${isLogin ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[20%] pointer-events-none'}`}>
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-[#CA2128] transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Quay lại trang chủ</span>
              </button>
            )}
            <div className="w-full max-w-md mx-auto mt-12">
              {/* Back Button for Desktop (Placed dynamically based on which side is active) */}

              <h1 className="text-4xl mb-4 text-gray-800 text-center font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#CA2128] to-[#FF9E86]">Xin chào!</h1>
              <p className="text-gray-500 mb-10 text-center">Chào mừng bạn quay trở lại với Fahasa</p>

              <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                  <label className="block text-sm mb-2 text-gray-700 font-medium">Tên đăng nhập / Email</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={20} /></div>
                    <input type="text" placeholder="Nhập email của bạn" className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-[12px] focus:outline-none focus:border-[#CA2128] transition-colors bg-white shadow-sm" required />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-sm text-gray-700 font-medium">Mật khẩu</label>
                    <a href="#" className="text-sm text-[#CA2128] hover:underline font-medium">Quên mật khẩu?</a>
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={20} /></div>
                    <input type={loginShowPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-[12px] focus:outline-none focus:border-[#CA2128] transition-colors bg-white shadow-sm" required />
                    <button type="button" onClick={() => setLoginShowPassword(!loginShowPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {loginShowPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#CA2128] to-[#FF9E86] text-white py-4 rounded-[12px] hover:shadow-lg transition-transform hover:-translate-y-0.5 text-lg font-medium mt-8">
                  <LogIn size={20} /> Đăng nhập
                </button>
              </form>

              {/* Social Login Options */}
              <div className="mt-10">
                <div className="relative flex items-center justify-center mb-6">
                  <div className="border-t border-gray-300 w-full absolute"></div>
                  <span className="bg-gray-50 px-4 text-sm text-gray-500 relative z-10">hoặc đăng nhập bằng</span>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => startSocialLogin('google')}
                    className="flex-1 py-3 border-2 border-gray-200 rounded-[12px] flex flex-col sm:flex-row items-center justify-center gap-2 hover:bg-white hover:border-gray-300 transition-colors"
                  >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                    <span className="text-sm font-medium text-gray-700">Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => startSocialLogin('facebook')}
                    className="flex-1 py-3 border-2 border-gray-200 rounded-[12px] flex flex-col sm:flex-row items-center justify-center gap-2 hover:bg-white hover:border-gray-300 transition-colors"
                  >
                    <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5" alt="Facebook" />
                    <span className="text-sm font-medium text-gray-700">Facebook</span>
                  </button>
                </div>
              </div>

              <div className="mt-8 text-center text-gray-600 text-sm">
                Chưa có tài khoản?{' '}
                <button type="button" onClick={() => setIsLogin(false)} className="text-[#CA2128] hover:underline font-medium">Đăng ký ngay</button>
              </div>

            </div>
          </div>


          {/* --------------- SLIDING OVERLAY (CÁNH CỬA TRƯỢT) --------------- */}
          <div
            className={`absolute top-0 left-0 h-full w-[60%] overflow-hidden z-20 ${motionClass} shadow-[0_0_40px_rgba(0,0,0,0.2)]`}
            style={{ transform: `translateX(${isLogin ? '0%' : '66.666667%'})` }}
          >
            {/* Vỏ bọc chứa ảnh cần relative để img absolute ăn đúng */}
            <div
              className={`relative h-full ${motionClass}`}
              style={{ width: '166.6667%', transform: `translateX(${isLogin ? '0%' : '-40%'})` }}
            >
              <img
                src="/images/Couple-having-bookstore-date.png"
                alt="Bookstore"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className={`absolute inset-0 transition-colors duration-1000 ${isLogin ? 'bg-gradient-to-br from-[#CA2128]/40 to-[#FF9E86]/40' : 'bg-gradient-to-bl from-[#d946ef]/40 to-[#a855f7]/40'}`}></div>
            </div>

            {/* Dynamic Content Inside the Window (Must be outside the 166% div to center correctly) */}
            <div className="absolute inset-0 flex items-center justify-center text-white px-12">
              <div className={`absolute w-full max-w-sm flex flex-col items-center text-center transition-all duration-700 delay-300 ${isLogin ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
                <h2 className="text-4xl font-bold mb-6 drop-shadow-lg leading-tight">Bạn là người mới?</h2>
                <p className="text-base text-red-50 font-light mb-10 drop-shadow">Hàng ngàn cuốn sách hấp dẫn và các ưu đãi đặc quyền đang chờ đón bạn tham gia.</p>
                <button
                  onClick={() => setIsLogin(false)}
                  className="px-10 py-3 rounded-full border-2 border-white text-white font-semibold text-lg hover:bg-white hover:text-[#CA2128] transition-all transform hover:scale-105"
                >
                  Tạo tài khoản ngay
                </button>
              </div>

              <div className={`absolute w-full max-w-sm flex flex-col items-center text-center transition-all duration-700 delay-300 ${!isLogin ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 pointer-events-none'}`}>
                <h2 className="text-4xl font-bold mb-6 drop-shadow-lg leading-tight">Chào bạn trở lại!</h2>
                <p className="text-base text-purple-50 font-light mb-10 drop-shadow">Để tiếp tục hành trình mua sắm và chia sẻ tri thức, hãy đăng nhập bằng tài khoản của bạn.</p>
                <button
                  onClick={() => setIsLogin(true)}
                  className="px-10 py-3 rounded-full border-2 border-white text-white font-semibold text-lg hover:bg-white hover:text-[#d946ef] transition-all transform hover:scale-105"
                >
                  Đăng nhập ngay
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
