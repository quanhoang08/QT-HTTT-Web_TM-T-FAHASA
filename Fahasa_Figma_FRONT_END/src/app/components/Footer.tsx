import { Facebook, Youtube, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="bg-red-600 text-white px-4 py-2 rounded font-bold text-xl inline-block mb-4">
              FAHASA
            </div>
            <p className="mb-4">
              Hệ thống nhà sách hàng đầu Việt Nam với hơn 50 chi nhánh trên toàn quốc.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">
                <Facebook size={24} />
              </a>
              <a href="#" className="hover:text-white">
                <Youtube size={24} />
              </a>
              <a href="#" className="hover:text-white">
                <Instagram size={24} />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white mb-4">Dịch vụ</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Điều khoản sử dụng</a></li>
              <li><a href="#" className="hover:text-white">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-white">Giới thiệu Fahasa</a></li>
              <li><a href="#" className="hover:text-white">Hệ thống trung tâm</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Chính sách đổi trả</a></li>
              <li><a href="#" className="hover:text-white">Chính sách bảo hành</a></li>
              <li><a href="#" className="hover:text-white">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="hover:text-white">Phương thức thanh toán</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin size={20} className="mt-1 flex-shrink-0" />
                <span>TDTU - HTTT647</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={20} />
                <span>1900 3667</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={20} />
                <span>cskh@fahasa.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>© 2026 Công ty Cổ Phần Văn Hóa Fahasa.</p>
        </div>
      </div>
    </footer>
  );
}
