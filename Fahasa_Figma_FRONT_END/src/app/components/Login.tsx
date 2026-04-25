import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onBackToHome?: () => void;
  onNavigateToRegister?: () => void;
}

export function Login({ onBackToHome, onNavigateToRegister }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Background Image */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden">
        <img
          src="/images/Couple-having-bookstore-date.png"
          alt="Bookstore"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#A22729]/20 to-[#F8874A]/20"></div>

        {/* Logo & Brand */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl px-12 py-8">
            <img
              src="/images/LogoFahasaCOM.png"
              alt="Fahasa.com"
              className="h-16 object-contain mb-6 drop-shadow-lg"
            />
            <p className="text-2xl text-center font-light">
              Hệ thống nhà sách hàng đầu Việt Nam
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-8 bg-gray-50 relative">
        {/* Back Button */}
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Quay lại trang chủ</span>
          </button>
        )}

        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img
              src="/images/LogoFahasaCOM.png"
              alt="Fahasa.com"
              className="h-12 object-contain"
            />
          </div>

          {/* Login Container */}
          <div className="bg-white rounded-[20px] shadow-lg p-8">
            <h1 className="text-3xl mb-2 text-gray-800">
              Đăng nhập tài khoản
            </h1>
            <p className="text-gray-500 mb-8">
              Chào mừng bạn quay trở lại!
            </p>

            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onLoginSuccess?.(); }}>
              {/* Email Input */}
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-[10px] focus:outline-none focus:border-[#CA2128] transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-[10px] focus:outline-none focus:border-[#CA2128] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-[#CA2128] cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">Ghi nhớ đăng nhập</span>
                </label>
                <a href="#" className="text-sm text-[#CA2128] hover:underline">
                  Quên mật khẩu?
                </a>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#CA2128] to-[#FF9E86] text-white py-3 rounded-[10px] hover:shadow-lg transition-shadow text-lg font-medium"
              >
                Đăng nhập
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-gray-500 text-sm">Hoặc</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Social Login */}
            <button className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 py-3 rounded-[10px] hover:bg-gray-50 transition-colors">
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-5 h-5"
              />
              <span className="text-gray-700">Đăng nhập bằng Google</span>
            </button>

            {/* Sign Up Link */}
            <p className="text-center mt-6 text-gray-600 text-sm">
              Chưa có tài khoản?{' '}
              <button type="button" onClick={onNavigateToRegister} className="text-[#CA2128] hover:underline font-medium">
                Đăng ký ngay
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
