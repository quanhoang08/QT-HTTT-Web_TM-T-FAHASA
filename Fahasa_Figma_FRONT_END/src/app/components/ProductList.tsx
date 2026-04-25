import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, Star, Grid3x3, Rows3, Loader2 } from 'lucide-react';
import { ProductCard } from './ProductCard';
import api from '../utils/api';

interface ProductListProps {
  onBackToHome?: () => void;
  onProductClick?: (product: any) => void;
  category?: string;
  isLoggedIn?: boolean;
  onCartUpdate?: (count: number) => void;
}

export function ProductList({
  onBackToHome,
  onProductClick,
  category = 'Tất cả sách',
  isLoggedIn,
  onCartUpdate
}: ProductListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('bestseller');

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedPublishers, setSelectedPublishers] = useState<string[]>([]);

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchProducts = async () => {
        try {
          // Fetch up to 1000 products to do client-side filtering for MVP
          const response = await api.get('/products?limit=1000');
          const items = response.data.items || [];
          const formatted = items.map((item: any) => ({
            id: item._id,
            title: item.title,
            author: item.author,
            image: item.image,
            price: item.price,
            originalPrice: item.originalPrice,
            rating: item.rating,
            discount: item.discount,
            category: item.category?.name || 'Sách Tiếng Việt',
            publisher: item.publisher,
          }));
          setAllProducts(formatted);
        } catch (error) {
          console.error("Failed to fetch products:", error);
        } finally {
          setLoading(false);
        }
      };
      
    fetchProducts();
  }, []);

  const authors = Array.from(new Set(allProducts.map((item) => item.author))).sort();
  const publishers = Array.from(new Set(allProducts.map((item) => item.publisher))).sort();
  const categories = Array.from(new Set(allProducts.map((item) => item.category))).sort();

  useEffect(() => {
    if (category && category !== 'Tất cả sách') {
      setSelectedCategories([category]);
    } else {
      setSelectedCategories([]);
    }
  }, [category]);

  const priceRanges = [
    { label: 'Dưới 100.000₫', min: 0, max: 100000 },
    { label: '100.000₫ - 200.000₫', min: 100000, max: 200000 },
    { label: '200.000₫ - 300.000₫', min: 200000, max: 300000 },
    { label: 'Trên 300.000₫', min: 300000, max: Infinity },
  ];

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const togglePriceRange = (range: string) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  const toggleRating = (rating: number) => {
    setSelectedRatings((prev) =>
      prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
    );
  };

  const toggleAuthor = (author: string) => {
    setSelectedAuthors((prev) =>
      prev.includes(author) ? prev.filter((a) => a !== author) : [...prev, author]
    );
  };

  const togglePublisher = (publisher: string) => {
    setSelectedPublishers((prev) =>
      prev.includes(publisher)
        ? prev.filter((p) => p !== publisher)
        : [...prev, publisher]
    );
  };

  // Lọc sản phẩm
  let filteredProducts = [...allProducts];

  if (selectedCategories.length > 0) {
    filteredProducts = filteredProducts.filter((p) => selectedCategories.includes(p.category));
  } else if (category && category !== 'Tất cả sách') {
    filteredProducts = filteredProducts.filter((p) => p.category === category);
  }

  if (selectedPriceRanges.length > 0) {
    filteredProducts = filteredProducts.filter((p) => {
      return selectedPriceRanges.some((range) => {
        const priceRange = priceRanges.find((pr) => pr.label === range);
        return priceRange && p.price >= priceRange.min && p.price < priceRange.max;
      });
    });
  }

  if (selectedRatings.length > 0) {
    filteredProducts = filteredProducts.filter((p) => selectedRatings.includes(p.rating || 5));
  }

  if (selectedAuthors.length > 0) {
    filteredProducts = filteredProducts.filter((p) => selectedAuthors.includes(p.author));
  }

  if (selectedPublishers.length > 0) {
    filteredProducts = filteredProducts.filter((p) => selectedPublishers.includes(p.publisher));
  }

  // Sắp xếp
  if (sortBy === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#CA2128]" size={48} />
      </div>
    );
  }

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
            <span className="text-lg font-medium">Trang chủ</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          Trang chủ / <span className="text-[#CA2128]">{category}</span>
        </div>

        <h1 className="text-3xl mb-8 text-gray-800">{category}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[25%_75%] gap-6">
          {/* Cột trái - Bộ lọc */}
          <div className="space-y-6">
            {/* Bộ lọc theo Danh mục */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg mb-4 text-gray-800">Danh mục</h3>
              <div className="space-y-3">
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="w-5 h-5 accent-[#CA2128] cursor-pointer"
                    />
                    <span className="text-gray-700">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bộ lọc theo Giá */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg mb-4 text-gray-800">Khoảng giá</h3>
              <div className="space-y-3">
                {priceRanges.map((range) => (
                  <label key={range.label} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedPriceRanges.includes(range.label)}
                      onChange={() => togglePriceRange(range.label)}
                      className="w-5 h-5 accent-[#CA2128] cursor-pointer"
                    />
                    <span className="text-gray-700">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bộ lọc theo Đánh giá */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg mb-4 text-gray-800">Đánh giá</h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <label key={rating} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedRatings.includes(rating)}
                      onChange={() => toggleRating(rating)}
                      className="w-5 h-5 accent-[#CA2128] cursor-pointer"
                    />
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                      <span className="text-gray-700">trở lên</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Bộ lọc theo Tác giả */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg mb-4 text-gray-800">Tác giả</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {authors.map((author) => (
                  <label key={author} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedAuthors.includes(author)}
                      onChange={() => toggleAuthor(author)}
                      className="w-5 h-5 accent-[#CA2128] cursor-pointer"
                    />
                    <span className="text-gray-700 text-sm">{author}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bộ lọc theo Nhà xuất bản */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg mb-4 text-gray-800">Nhà xuất bản</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {publishers.map((publisher) => (
                  <label key={publisher} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedPublishers.includes(publisher)}
                      onChange={() => togglePublisher(publisher)}
                      className="w-5 h-5 accent-[#CA2128] cursor-pointer"
                    />
                    <span className="text-gray-700 text-sm">{publisher}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Nút xóa bộ lọc */}
            {(selectedCategories.length > 0 ||
              selectedPriceRanges.length > 0 ||
              selectedRatings.length > 0 ||
              selectedAuthors.length > 0 ||
              selectedPublishers.length > 0) && (
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedPriceRanges([]);
                  setSelectedRatings([]);
                  setSelectedAuthors([]);
                  setSelectedPublishers([]);
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>

          {/* Cột phải - Danh sách sản phẩm */}
          <div>
            {/* Thanh sắp xếp */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-gray-700">
                  Hiển thị <strong>{filteredProducts.length}</strong> sản phẩm
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Chế độ xem */}
                <div className="flex gap-2 border rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#CA2128] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <Grid3x3 size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#CA2128] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <Rows3 size={20} />
                  </button>
                </div>

                {/* Sắp xếp */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none border-2 border-gray-200 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#CA2128] cursor-pointer"
                  >
                    <option value="bestseller">Bán chạy nhất</option>
                    <option value="price-asc">Giá: Thấp đến cao</option>
                    <option value="price-desc">Giá: Cao đến thấp</option>
                  </select>
                  <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Grid sản phẩm */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-600 text-lg">Không tìm thấy sản phẩm phù hợp</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    {...product}
                    isLoggedIn={isLoggedIn}
                    onCartUpdate={onCartUpdate}
                    onClick={() => onProductClick?.(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
