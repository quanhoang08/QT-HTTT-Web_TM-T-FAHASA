import { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, LogIn, Shield, X } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  author?: string;
  image?: string;
  price: number;
  category?: string;
}

interface HeaderProps {
  onLoginClick?: () => void;
  onCartClick?: () => void;
  onAdminClick?: () => void;
  onCategoryClick?: (categoryName: string) => void;
  onProductClick?: (product: Product) => void;
  isLoggedIn?: boolean;
  /** `true` khi user đã đăng nhập với role admin (đồng bộ từ /auth/me) */
  isAdmin?: boolean;
  userName?: string;
  cartCount?: number;
  allProducts?: Product[];
}

export function Header({ onLoginClick, onCartClick, onAdminClick, onCategoryClick, onProductClick, isLoggedIn, isAdmin, userName, cartCount = 0, allProducts = [] }: HeaderProps) {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Lọc gợi ý tìm kiếm từ danh sách sản phẩm
  const suggestions = searchQuery.trim().length >= 2
    ? allProducts
        .filter((p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.author && p.author.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 8)
    : [];

  // Đóng gợi ý khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <header className="bg-white border-b sticky top-0 z-50">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer">
            <img 
              src="/images/LogoFahasaCOM.png" 
              alt="Fahasa.com" 
              className="h-10 object-contain" 
            />
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Tìm kiếm sách, văn phòng phẩm, quà lưu niệm..."
                className="w-full border-2 border-red-600 rounded-lg px-4 py-3 pr-24 focus:outline-none focus:border-red-700"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}
                  className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 text-white p-2 rounded">
                <Search size={20} />
              </button>

              {/* Gợi ý tìm kiếm */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        setSearchQuery('');
                        setShowSuggestions(false);
                        onProductClick?.(product);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left border-b last:border-b-0"
                    >
                      {product.image && (
                        <img src={product.image} alt={product.title} className="w-10 h-14 object-cover rounded border flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-2">{product.title}</p>
                        {product.author && <p className="text-xs text-gray-500 mt-0.5">{product.author}</p>}
                        <p className="text-xs text-red-600 font-semibold mt-1">{product.price.toLocaleString('vi-VN')}₫</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-6">
            {/* Account dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowAccountMenu(true)}
              onMouseLeave={() => setShowAccountMenu(false)}
            >
              <button className="flex flex-col items-center gap-1 hover:text-red-600">
                <User size={24} />
                <span className="text-xs">{isLoggedIn ? (userName || 'Người dùng') : 'Đăng nhập'}</span>
              </button>

              {/* Dropdown Menu */}
              {showAccountMenu && (
                <div className="absolute top-full right-0 pt-2 w-48 z-50">
                  <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => {
                        setShowAccountMenu(false);
                        onLoginClick?.();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <LogIn size={20} className="text-gray-600" />
                      <div>
                        <div className="text-sm text-gray-800">Đăng nhập</div>
                        <div className="text-xs text-gray-500">Khách hàng</div>
                      </div>
                    </button>
                    <div className="border-t border-gray-200"></div>
                    <button
                      onClick={() => {
                        setShowAccountMenu(false);
                        onAdminClick?.();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                    >
                      <Shield size={20} className="text-[#CA2128]" />
                      <div>
                        <div className="text-sm text-gray-800">Admin</div>
                        <div className="text-xs text-gray-500">
                          {isAdmin ? "Quản trị viên" : isLoggedIn ? "Cần tài khoản admin" : "Đăng nhập admin để quản lý"}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onCartClick}
              className="flex flex-col items-center gap-1 hover:text-red-600 relative"
            >
              <ShoppingCart size={24} />
              <span className="text-xs">Giỏ hàng</span>
              {isLoggedIn && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-8 py-3 relative">
            <div
              className="relative"
              onMouseEnter={() => setShowCategoryMenu(true)}
              onMouseLeave={() => setShowCategoryMenu(false)}
            >
              <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                <Menu size={20} />
                <span>Danh mục sản phẩm</span>
              </button>

              {showCategoryMenu && (
                <div className="absolute top-full left-0 pt-2 w-64 z-50">
                  <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden py-2">
                    {['Sách Tiếng Việt', 'Sách Ngoại Văn', 'Sách Kỹ Năng', 'Sách Tâm Lý', 'Văn Học', 'Sách Tâm Linh', 'Văn Phòng Phẩm', 'Quà Lưu Niệm', 'Đồ Chơi'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setShowCategoryMenu(false);
                          onCategoryClick?.(cat);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-[#CA2128] transition-colors text-sm"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => onCategoryClick?.('Sách Tiếng Việt')} className="hover:text-red-600 text-sm md:text-base">Sách Tiếng Việt</button>
            <button onClick={() => onCategoryClick?.('Sách Ngoại Văn')} className="hover:text-red-600 text-sm md:text-base">Sách Ngoại Văn</button>
            <button onClick={() => onCategoryClick?.('Văn Phòng Phẩm')} className="hover:text-red-600 text-sm md:text-base">Văn Phòng Phẩm</button>
            <button onClick={() => onCategoryClick?.('Quà Lưu Niệm')} className="hover:text-red-600 text-sm md:text-base">Quà Lưu Niệm</button>
            <button onClick={() => onCategoryClick?.('Đồ Chơi')} className="hover:text-red-600 text-sm md:text-base">Đồ Chơi</button>
            <button className="text-red-600 text-sm md:text-base font-medium">🔥 Flash Sale</button>
          </div>
        </div>
      </nav>
    </header>
  );
}
