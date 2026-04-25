import { useState } from 'react';
import { ArrowLeft, Star, ShoppingCart, Minus, Plus, Heart, Share2, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../utils/api';

interface ProductDetailProps {
  onBackToHome?: () => void;
  onCartUpdate?: (count: number) => void;
  isLoggedIn?: boolean;
  product?: {
    id: number | string;
    title: string;
    author: string;
    image: string;
    price: number;
    originalPrice?: number;
    rating?: number;
  };
}

const reviews = [
  {
    id: 1,
    name: 'Nguyễn Minh Anh',
    avatar: 'https://ui-avatars.com/api/?name=Nguyen+Minh+Anh&background=CA2128&color=fff',
    rating: 5,
    date: '15/04/2026',
    comment: 'Cuốn sách rất hay! Nội dung sâu sắc, văn phong dễ hiểu. Giao hàng nhanh, đóng gói cẩn thận.',
  },
  {
    id: 2,
    name: 'Trần Hoàng Long',
    avatar: 'https://ui-avatars.com/api/?name=Tran+Hoang+Long&background=4A90E2&color=fff',
    rating: 4,
    date: '12/04/2026',
    comment: 'Sách chất lượng tốt, giá hợp lý. Nội dung rất bổ ích cho người mới bắt đầu.',
  },
  {
    id: 3,
    name: 'Lê Thị Mai',
    avatar: 'https://ui-avatars.com/api/?name=Le+Thi+Mai&background=E63946&color=fff',
    rating: 5,
    date: '10/04/2026',
    comment: 'Đã đọc xong và rất hài lòng. Recommend cho mọi người!',
  },
];

export function ProductDetail({ onBackToHome, product, isLoggedIn, onCartUpdate }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [addingToCart, setAddingToCart] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      showToast('error', 'Vui lòng đăng nhập để thêm vào giỏ hàng!');
      return;
    }
    setAddingToCart(true);
    try {
      await api.post('/cart/add', { productId: currentProduct.id, quantity });
      // Cập nhật số lượng giỏ hàng
      const cartRes = await api.get('/cart');
      const items = cartRes.data?.items || [];
      const count = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
      onCartUpdate?.(count);
      showToast('success', `Đã thêm "${currentProduct.title}" vào giỏ hàng!`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể thêm vào giỏ hàng, vui lòng thử lại!';
      showToast('error', msg);
    } finally {
      setAddingToCart(false);
    }
  };

  // Default product nếu không có product được truyền vào
  const defaultProduct = {
    id: 1,
    title: 'Nghệ Thuật Tư Duy Rành Mạch',
    author: 'Rolf Dobelli',
    image: '/images/NgheTHuatTUduy.webp',
    price: 135000,
    originalPrice: 180000,
    rating: 5,
  };

  const currentProduct = product || defaultProduct;
  const discount = currentProduct.originalPrice
    ? Math.round(((currentProduct.originalPrice - currentProduct.price) / currentProduct.originalPrice) * 100)
    : 0;

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, Math.min(99, quantity + delta)));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl text-white animate-fade-in ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
      {/* Header với nút quay lại */}
      <div className="bg-gradient-to-r from-[#CA2128] to-[#FF9E86] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-white hover:text-orange-100 transition-colors"
          >
            <ArrowLeft size={24} />
            <span className="text-lg font-medium">Quay lại trang chủ</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Khung thông tin chính */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Cột trái - Hình ảnh */}
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={currentProduct.image}
                  alt={currentProduct.title}
                  className="w-full max-w-md rounded-lg shadow-lg"
                />
                {discount > 0 && (
                  <div className="absolute top-4 right-4 bg-[#CA2128] text-white px-4 py-2 rounded-lg text-xl">
                    -{discount}%
                  </div>
                )}
              </div>
            </div>

            {/* Cột phải - Thông tin */}
            <div className="flex flex-col">
              <h1 className="text-4xl mb-4 text-gray-800">
                {currentProduct.title}
              </h1>

              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Tác giả:</span> {currentProduct.author}
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Nhà xuất bản:</span> NXB Trẻ
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Hình thức:</span> Bìa mềm
                </p>
              </div>

              {/* Đánh giá */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < (currentProduct.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-gray-600">(128 đánh giá)</span>
              </div>

              {/* Giá */}
              <div className="mb-8">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl text-[#CA2128]">
                    {currentProduct.price.toLocaleString('vi-VN')}₫
                  </span>
                  {currentProduct.originalPrice && (
                    <span className="text-2xl text-gray-400 line-through">
                      {currentProduct.originalPrice.toLocaleString('vi-VN')}₫
                    </span>
                  )}
                </div>
              </div>

              {/* Khu vực mua hàng */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-gray-700 font-semibold">Số lượng:</span>
                  <div className="flex items-center border-2 border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="px-6 py-2 border-x-2 border-gray-300 min-w-[80px] text-center text-lg">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full bg-gradient-to-r from-[#CA2128] to-[#E63946] text-white py-4 rounded-lg hover:shadow-lg transition-shadow flex items-center justify-center gap-3 text-xl mb-4 disabled:opacity-70"
                >
                  <ShoppingCart size={24} />
                  <span>{addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}</span>
                </button>

                <div className="flex gap-3">
                  <button className="flex-1 border-2 border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <Heart size={20} />
                    <span>Yêu thích</span>
                  </button>
                  <button className="flex-1 border-2 border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <Share2 size={20} />
                    <span>Chia sẻ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Mô tả và Đánh giá */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Tab Headers */}
          <div className="flex gap-8 border-b mb-6">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-4 px-2 transition-colors ${
                activeTab === 'description'
                  ? 'border-b-2 border-[#CA2128] text-[#CA2128] font-semibold'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Mô tả sản phẩm
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 px-2 transition-colors ${
                activeTab === 'reviews'
                  ? 'border-b-2 border-[#CA2128] text-[#CA2128] font-semibold'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Đánh giá ({reviews.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'description' ? (
            <div className="prose max-w-none text-gray-700">
              <p className="mb-4">
                <strong>{currentProduct.title}</strong> là một cuốn sách tuyệt vời giúp bạn hiểu rõ hơn về nghệ thuật tư duy logic và sáng tạo.
                Tác giả {currentProduct.author} đã khéo léo trình bày những kiến thức phức tạp một cách dễ hiểu và gần gũi.
              </p>
              <p className="mb-4">
                Cuốn sách cung cấp những phương pháp thực tiễn, giúp người đọc:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Phát triển tư duy logic và phản biện</li>
                <li>Tránh những sai lầm phổ biến trong suy nghĩ</li>
                <li>Ra quyết định đúng đắn và hiệu quả hơn</li>
                <li>Nâng cao khả năng giải quyết vấn đề</li>
              </ul>
              <p>
                Đây là cuốn sách phù hợp cho mọi lứa tuổi, đặc biệt là những ai muốn cải thiện khả năng tư duy và phán đoán của mình.
              </p>
            </div>
          ) : (
            <div>
              {/* Điểm đánh giá tổng quan */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-5xl text-[#CA2128] mb-2">
                      {currentProduct.rating || 4.5}
                    </div>
                    <div className="flex justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={24}
                          className={i < Math.floor(currentProduct.rating || 4.5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <div className="text-gray-600">128 đánh giá</div>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-3 mb-2">
                        <span className="w-12 text-sm text-gray-600">{star} sao</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${star === 5 ? 80 : star === 4 ? 15 : 5}%` }}
                          ></div>
                        </div>
                        <span className="w-12 text-sm text-gray-600 text-right">
                          {star === 5 ? 102 : star === 4 ? 19 : 7}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Danh sách bình luận */}
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-6 last:border-b-0">
                    <div className="flex gap-4">
                      <img
                        src={review.avatar}
                        alt={review.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">{review.name}</h4>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <div className="flex mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
