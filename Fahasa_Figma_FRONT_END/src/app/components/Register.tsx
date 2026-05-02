import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User, Loader2 } from 'lucide-react';
import api from '../utils/api';

interface RegisterProps {
  onBackToHome?: () => void;
  onNavigateToLogin?: () => void;
  onRegisterSuccess?: () => void;
}

export function Register({ onBackToHome, onNavigateToLogin, onRegisterSuccess }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputs = Array.from(e.currentTarget.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]'));
    const name = (inputs[0] as HTMLInputElement).value;
    const email = (inputs[1] as HTMLInputElement).value;
    const password = (inputs[2] as HTMLInputElement).value;
    const confirmPassword = (inputs[3] as HTMLInputElement).value;

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

  return (
    <div className="min-h-screen flex flex-row-reverse">
      {/* Right Side - Background Image */}
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
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl px-12 py-8 flex flex-col items-center">
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

      {/* Left Side - Register Form */}
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

          {/* Register Container */}
          <div className="bg-white rounded-[20px] shadow-lg p-8">
            <h1 className="text-3xl mb-2 text-gray-800 text-center font-semibold">
              Đăng ký tài khoản
            </h1>
            <p className="text-gray-500 mb-8 text-center text-sm">
              Vui lòng điền thông tin để tạo tài khoản mới
            </p>

            <form className="space-y-4" onSubmit={handleRegister}>

              {/* Name Input */}
              <div>
                <label className="block text-sm mb-1 text-gray-700">
                  Họ và tên
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    placeholder="Vui lòng nhập họ tên của bạn"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-[10px] focus:outline-none focus:border-[#d946ef] transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm mb-1 text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-[10px] focus:outline-none focus:border-[#d946ef] transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm mb-1 text-gray-700">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-[10px] focus:outline-none focus:border-[#d946ef] transition-colors"
                    required
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

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm mb-1 text-gray-700">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-[10px] focus:outline-none focus:border-[#d946ef] transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2 pt-2">
                <label className="flex items-start gap-2 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 accent-[#d946ef] cursor-pointer mt-[2px]"
                    required
                  />
                  <span className="text-[12px] text-gray-600 leading-tight">
                    Tôi đồng ý với điều khoản dịch vụ và chính sách bảo mật
                  </span>
                </label>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#d946ef] to-[#a855f7] text-white py-3 rounded-[10px] hover:shadow-lg transition-shadow text-lg font-medium mt-2 disabled:opacity-70"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : null}
                Đăng Ký
              </button>
            </form>

            {/* Login Link */}
            <p className="text-center mt-6 text-gray-600 text-sm">
              Đã có tài khoản?{' '}
              <button type="button" onClick={onNavigateToLogin} className="text-[#CA2128] hover:underline font-medium">
                Đăng nhập
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
