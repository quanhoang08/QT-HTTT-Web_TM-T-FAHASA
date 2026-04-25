import { useState } from 'react';
import { ShoppingCart, Star, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../utils/api';

interface ProductCardProps {
  id?: string;
  image: string;
  title: string;
  author?: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  discount?: number;
  isLoggedIn?: boolean;
  onCartUpdate?: (count: number) => void;
  onClick?: () => void;
}

export function ProductCard({
  id,
  image,
  title,
  author,
  price,
  originalPrice,
  rating = 5,
  discount,
  isLoggedIn,
  onCartUpdate,
  onClick,
}: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      showToast('error', 'Vui lòng đăng nhập để thêm vào giỏ!');
      return;
    }
    if (!id) return;
    setAdding(true);
    try {
      await api.post('/cart/add', { productId: id, quantity: 1 });
      const cartRes = await api.get('/cart');
      const items = cartRes.data?.items || [];
      const count = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
      onCartUpdate?.(count);
      showToast('success', 'Đã thêm vào giỏ hàng!');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể thêm vào giỏ hàng!';
      showToast('error', msg);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer relative" onClick={onClick}>
      {/* Toast inline nhỏ */}
      {toast && (
        <div className={`absolute top-2 left-2 right-2 z-20 flex items-center gap-2 px-3 py-2 rounded-lg text-white text-xs font-medium shadow-lg ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          <span className="truncate">{toast.message}</span>
        </div>
      )}

      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        {discount && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm">
            -{discount}%
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 mb-2 min-h-[3rem]">
          {title}
        </h3>
        {author && (
          <p className="text-sm text-gray-600 mb-2">{author}</p>
        )}

        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
          ))}
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-red-600 text-xl">
            {price.toLocaleString('vi-VN')}₫
          </span>
          {originalPrice && (
            <span className="text-gray-400 line-through text-sm">
              {originalPrice.toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={adding}
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <ShoppingCart size={18} />
          <span>{adding ? 'Đang thêm...' : 'Thêm vào giỏ'}</span>
        </button>
      </div>
    </div>
  );
}
