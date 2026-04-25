import { useEffect, useState } from 'react';
import { ArrowLeft, Trash2, Minus, Plus, ShoppingBag, Loader2 } from 'lucide-react';
import api from '../utils/api';

interface CartItem {
  id: string;
  title: string;
  author: string;
  image: string;
  price: number;
  quantity: number;
}

interface CartProps {
  onBackToHome?: () => void;
  onCheckout?: () => void;
  onCartUpdate?: (count: number) => void;
}

export function Cart({ onBackToHome, onCheckout, onCartUpdate }: CartProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('fahasa_token')));

  const mapCartItems = (cart: any): CartItem[] =>
    (cart?.items || []).map((item: any) => ({
      id: item.product?._id,
      title: item.product?.title || '',
      author: item.product?.author || '',
      image: item.product?.image || '',
      price: item.priceAtAdd || item.product?.price || 0,
      quantity: item.quantity || 1,
    }));

  useEffect(() => {
    const fetchCart = async () => {
      if (!localStorage.getItem('fahasa_token')) {
        setLoading(false);
        setIsLoggedIn(false);
        return;
      }
      try {
        setLoading(true);
        const res = await api.get('/cart');
        const mapped = mapCartItems(res.data);
        setCartItems(mapped);
        const count = mapped.reduce((sum, item) => sum + item.quantity, 0);
        onCartUpdate?.(count);
      } catch (error) {
        console.error('Failed to fetch cart', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const updateQuantity = async (id: string, delta: number) => {
    const current = cartItems.find((item) => item.id === id);
    if (!current) return;
    const nextQuantity = Math.max(1, Math.min(99, current.quantity + delta));
    try {
      const res = await api.put('/cart/update', { productId: id, quantity: nextQuantity });
      const mapped = mapCartItems(res.data);
      setCartItems(mapped);
      const count = mapped.reduce((sum, item) => sum + item.quantity, 0);
      onCartUpdate?.(count);
    } catch (error) {
      console.error('Failed to update cart item quantity', error);
    }
  };

  const removeItem = async (id: string) => {
    try {
      const res = await api.delete(`/cart/remove/${id}`);
      const mapped = mapCartItems(res.data);
      setCartItems(mapped);
      const count = mapped.reduce((sum, item) => sum + item.quantity, 0);
      onCartUpdate?.(count);
    } catch (error) {
      console.error('Failed to remove cart item', error);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = subtotal >= 300000 || subtotal === 0 ? 0 : 30000;
  const total = subtotal + shippingFee;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#CA2128] to-[#FF9E86] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-white hover:text-orange-100 transition-colors"
          >
            <ArrowLeft size={24} />
            <span className="text-lg font-medium">Tiếp tục mua sắm</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl mb-8 text-gray-800">Giỏ hàng của bạn ({totalItems} sản phẩm)</h1>

        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Loader2 size={36} className="animate-spin mx-auto text-[#CA2128] mb-3" />
            <p className="text-gray-600">Đang tải giỏ hàng...</p>
          </div>
        )}

        {loading ? null : !isLoggedIn ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBag size={80} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl mb-4 text-gray-600">Bạn chưa đăng nhập</h2>
            <p className="text-gray-500 mb-6">Vui lòng đăng nhập để xem giỏ hàng của riêng bạn</p>
            <button
              onClick={onBackToHome}
              className="bg-gradient-to-r from-[#CA2128] to-[#E63946] text-white px-8 py-3 rounded-lg hover:shadow-lg transition-shadow"
            >
              Quay về trang chủ
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          // Giỏ hàng trống
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBag size={80} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl mb-4 text-gray-600">Giỏ hàng trống</h2>
            <p className="text-gray-500 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <button
              onClick={onBackToHome}
              className="bg-gradient-to-r from-[#CA2128] to-[#E63946] text-white px-8 py-3 rounded-lg hover:shadow-lg transition-shadow"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          // Giỏ hàng có sản phẩm
          <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6">
            {/* Cột trái - Danh sách sản phẩm */}
            <div className="bg-white rounded-lg shadow-sm">
              {/* Header của bảng */}
              <div className="hidden md:grid grid-cols-[100px_1fr_120px_150px_50px] gap-4 p-6 border-b font-semibold text-gray-700">
                <div>Hình ảnh</div>
                <div>Sản phẩm</div>
                <div className="text-right">Đơn giá</div>
                <div className="text-center">Số lượng</div>
                <div></div>
              </div>

              {/* Danh sách sản phẩm */}
              <div className="divide-y">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 md:grid-cols-[100px_1fr_120px_150px_50px] gap-4 p-6 items-center"
                  >
                    {/* Hình thu nhỏ */}
                    <div className="flex justify-center md:justify-start">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-28 object-cover rounded border"
                      />
                    </div>

                    {/* Thông tin sản phẩm */}
                    <div>
                      <h3 className="mb-1 text-gray-800">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500">{item.author}</p>
                    </div>

                    {/* Đơn giá */}
                    <div className="text-right">
                      <span className="text-[#CA2128] text-lg">
                        {item.price.toLocaleString('vi-VN')}₫
                      </span>
                    </div>

                    {/* Bộ điều chỉnh số lượng */}
                    <div className="flex justify-center">
                      <div className="flex items-center border-2 border-gray-300 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-3 py-2 hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-4 py-2 border-x-2 border-gray-300 min-w-[60px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-3 py-2 hover:bg-gray-100 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Nút xóa */}
                    <div className="flex justify-center">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-2"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cột phải - Tóm tắt đơn hàng */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl mb-6 text-gray-800">
                  Tóm tắt đơn hàng
                </h2>

                <div className="space-y-4 mb-6">
                  {/* Tạm tính */}
                  <div className="flex justify-between text-gray-700">
                    <span>Tạm tính:</span>
                    <span>{subtotal.toLocaleString('vi-VN')}₫</span>
                  </div>

                  {/* Phí giao hàng */}
                  <div className="flex justify-between text-gray-700">
                    <span>Phí giao hàng:</span>
                    <span>{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}₫`}</span>
                  </div>

                  <div className="border-t pt-4">
                    {/* Tổng tiền */}
                    <div className="flex justify-between items-center text-xl">
                      <span className="font-semibold text-gray-800">Tổng tiền:</span>
                      <span className="text-[#CA2128] text-2xl">
                        {total.toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nút Tiến hành thanh toán */}
                <button
                  onClick={onCheckout}
                  className="w-full bg-gradient-to-r from-[#CA2128] to-[#FF9E86] text-white py-4 rounded-lg hover:shadow-lg transition-shadow text-lg font-medium"
                >
                  Tiến hành Thanh toán
                </button>

                {/* Thông tin bổ sung */}
                <div className="mt-6 pt-6 border-t text-sm text-gray-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>Miễn phí giao hàng cho đơn từ 300.000₫</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>Đổi trả trong vòng 7 ngày</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>Thanh toán an toàn & bảo mật</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
