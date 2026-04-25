import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Wallet, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../utils/api';

interface CheckoutProps {
  onBackToCart?: () => void;
}

interface CartItem {
  id: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

export function Checkout({ onBackToCart }: CheckoutProps) {
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'momo' | 'vnpay'>('cod');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get('/cart');
        const items = (res.data.items || []).map((item: any) => ({
          id: item.product?._id,
          title: item.product?.title || '',
          image: item.product?.image || '',
          price: item.priceAtAdd || item.product?.price || 0,
          quantity: item.quantity || 1,
        }));
        setCartItems(items);
      } catch (error) {
        console.error('Failed to load cart for checkout', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handlePlaceOrder = async () => {
    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address) {
      alert('Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ');
      return;
    }
    try {
      setPlacingOrder(true);
      await api.post('/orders', {
        shippingInfo,
        paymentMethod: paymentMethod === 'vnpay' ? 'VNPAY_MOCK' : 'COD',
      });
      alert('Đặt hàng thành công');
      onBackToCart?.();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Không thể đặt hàng');
    } finally {
      setPlacingOrder(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = deliveryMethod === 'delivery' ? 30000 : 0;
  const discount = 0;
  const total = subtotal + shippingFee - discount;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#CA2128] to-[#FF9E86] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={onBackToCart}
            className="flex items-center gap-2 text-white hover:text-orange-100 transition-colors"
          >
            <ArrowLeft size={24} />
            <span className="text-lg font-medium">Quay lại giỏ hàng</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl mb-8 text-gray-800">
          Thanh toán
        </h1>
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-10 text-center mb-6">
            <Loader2 size={34} className="animate-spin mx-auto mb-2 text-[#CA2128]" />
            <p className="text-gray-600">Đang tải dữ liệu thanh toán...</p>
          </div>
        )}

        {!loading && <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6">
          {/* Cột trái - Thông tin giao hàng & Thanh toán */}
          <div className="space-y-6">
            {/* Phương thức nhận hàng */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl mb-4 text-gray-800 flex items-center gap-2">
                <MapPin size={24} className="text-[#CA2128]" />
                Phương thức nhận hàng
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Giao hàng tận nơi */}
                <label
                  className={`relative flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    deliveryMethod === 'delivery'
                      ? 'border-[#CA2128] bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="delivery"
                    checked={deliveryMethod === 'delivery'}
                    onChange={() => setDeliveryMethod('delivery')}
                    className="w-5 h-5 accent-[#CA2128]"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">Giao hàng tận nơi</div>
                    <div className="text-sm text-gray-600">Giao hàng trong 2-3 ngày</div>
                  </div>
                  {deliveryMethod === 'delivery' && (
                    <CheckCircle2 size={24} className="text-[#CA2128] absolute top-4 right-4" />
                  )}
                </label>

                {/* Nhận tại cửa hàng */}
                <label
                  className={`relative flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    deliveryMethod === 'pickup'
                      ? 'border-[#CA2128] bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="pickup"
                    checked={deliveryMethod === 'pickup'}
                    onChange={() => setDeliveryMethod('pickup')}
                    className="w-5 h-5 accent-[#CA2128]"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">Nhận tại cửa hàng</div>
                    <div className="text-sm text-gray-600">Miễn phí vận chuyển</div>
                  </div>
                  {deliveryMethod === 'pickup' && (
                    <CheckCircle2 size={24} className="text-[#CA2128] absolute top-4 right-4" />
                  )}
                </label>
              </div>
            </div>

            {/* Địa chỉ giao hàng */}
            {deliveryMethod === 'delivery' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl mb-4 text-gray-800">
                  Địa chỉ giao hàng
                </h2>

                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-2 text-gray-700">
                        Họ và tên <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={shippingInfo.fullName}
                        onChange={(e) => setShippingInfo((prev) => ({ ...prev, fullName: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#CA2128] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2 text-gray-700">
                        Số điện thoại <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="0901234567"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo((prev) => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#CA2128] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="example@email.com"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#CA2128] transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm mb-2 text-gray-700">
                        Tỉnh/Thành phố <span className="text-red-600">*</span>
                      </label>
                      <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#CA2128] transition-colors">
                        <option>Hồ Chí Minh</option>
                        <option>Hà Nội</option>
                        <option>Đà Nẵng</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-2 text-gray-700">
                        Quận/Huyện <span className="text-red-600">*</span>
                      </label>
                      <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#CA2128] transition-colors">
                        <option>Quận 1</option>
                        <option>Quận 2</option>
                        <option>Quận 3</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-2 text-gray-700">
                        Phường/Xã <span className="text-red-600">*</span>
                      </label>
                      <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#CA2128] transition-colors">
                        <option>Phường Bến Nghé</option>
                        <option>Phường Bến Thành</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      Địa chỉ chi tiết <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      placeholder="Số nhà, tên đường..."
                      rows={3}
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo((prev) => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#CA2128] transition-colors resize-none"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      Ghi chú đơn hàng (tùy chọn)
                    </label>
                    <textarea
                      placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn"
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#CA2128] transition-colors resize-none"
                    ></textarea>
                  </div>
                </form>
              </div>
            )}

            {/* Phương thức thanh toán */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl mb-4 text-gray-800 flex items-center gap-2">
                <Wallet size={24} className="text-[#CA2128]" />
                Phương thức thanh toán
              </h2>

              <div className="space-y-3">
                {/* COD */}
                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#CA2128] bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="w-5 h-5 accent-[#CA2128]"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                      💵
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">Thanh toán khi nhận hàng (COD)</div>
                      <div className="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận hàng</div>
                    </div>
                  </div>
                </label>

                {/* MoMo */}
                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'momo'
                      ? 'border-[#CA2128] bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="momo"
                    checked={paymentMethod === 'momo'}
                    onChange={() => setPaymentMethod('momo')}
                    className="w-5 h-5 accent-[#CA2128]"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-50 p-1 border">
                      <img src="/images/Momo.webp" alt="MoMo" className="w-full h-full object-contain rounded" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">Ví điện tử MoMo</div>
                      <div className="text-sm text-gray-600">Thanh toán qua ví MoMo</div>
                    </div>
                  </div>
                </label>

                {/* VNPAY */}
                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'vnpay'
                      ? 'border-[#CA2128] bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="vnpay"
                    checked={paymentMethod === 'vnpay'}
                    onChange={() => setPaymentMethod('vnpay')}
                    className="w-5 h-5 accent-[#CA2128]"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-50 p-1 border">
                      <img src="/images/VNPay.png" alt="VNPAY" className="w-full h-full object-contain rounded" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">Cổng thanh toán VNPAY</div>
                      <div className="text-sm text-gray-600">Thanh toán qua thẻ ATM, Visa, MasterCard</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Cột phải - Tóm tắt đơn hàng */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl mb-4 text-gray-800">
                Đơn hàng ({cartItems.length} sản phẩm)
              </h2>

              {/* Danh sách sản phẩm rút gọn */}
              <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pt-2 pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-20 object-cover rounded border"
                      />
                      <span className="absolute -top-2 -right-2 bg-[#CA2128] text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm text-gray-800 line-clamp-2 mb-1">
                        {item.title}
                      </h4>
                      <p className="text-[#CA2128]">
                        {item.price.toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                {/* Tạm tính */}
                <div className="flex justify-between text-gray-700">
                  <span>Tạm tính:</span>
                  <span>{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>

                {/* Phí vận chuyển */}
                <div className="flex justify-between text-gray-700">
                  <span>Phí vận chuyển:</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-green-600">Miễn phí</span>
                    ) : (
                      `${shippingFee.toLocaleString('vi-VN')}₫`
                    )}
                  </span>
                </div>

                {/* Giảm giá */}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{discount.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}

                <div className="border-t pt-3">
                  {/* Tổng cộng */}
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-semibold text-gray-800">Tổng cộng:</span>
                    <span className="text-[#CA2128] text-2xl">
                      {total.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
              </div>

              {/* Nút Xác nhận đặt hàng */}
              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder || cartItems.length === 0}
                className="w-full mt-6 bg-gradient-to-r from-[#CA2128] to-[#FF9E86] text-white py-4 rounded-lg hover:shadow-lg transition-shadow text-lg disabled:opacity-60"
              >
                {placingOrder ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
              </button>

              {/* Thông tin bảo mật */}
              <div className="mt-4 pt-4 border-t text-sm text-gray-600 space-y-2">
                <div className="flex items-center gap-2">
                  <span>🔒</span>
                  <span>Thanh toán an toàn & bảo mật</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Đổi trả miễn phí trong 7 ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
}
