import React from "react";
import { Header } from "./components/Header";
import { BannerCarousel } from "./components/BannerCarousel";
import { CategorySection } from "./components/CategorySection";
import { ProductCard } from "./components/ProductCard";
import { Footer } from "./components/Footer";
import { ProductDetail } from "./components/ProductDetail";
import { Cart } from "./components/Cart";
import { Checkout } from "./components/Checkout";
import { ProductList } from "./components/ProductList";
import { CustomerDashboard } from "./components/CustomerDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { FlashSaleBanner } from "./components/FlashSaleBanner";
import { AuthPage } from "./components/AuthPage";
import api from "./utils/api";

export default function App() {
  const [showLogin, setShowLogin] = React.useState(false);
  const [showRegister, setShowRegister] = React.useState(false);
  const [showCart, setShowCart] = React.useState(false);
  const [showCheckout, setShowCheckout] = React.useState(false);
  const [showProductList, setShowProductList] =
    React.useState(false);
  const [showDashboard, setShowDashboard] =
    React.useState(false);
  const [showAdminDashboard, setShowAdminDashboard] =
    React.useState(false);
  const [selectedCategory, setSelectedCategory] =
    React.useState("Tất cả sách");
  const [selectedProduct, setSelectedProduct] =
    React.useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [cartCount, setCartCount] = React.useState(0);

  const [userName, setUserName] = React.useState('');
  const [featuredBooks, setFeaturedBooks] = React.useState<any[]>([]);
  const [bestsellers, setBestsellers] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [allProductsForSearch, setAllProductsForSearch] = React.useState<any[]>([]);

  const refreshCartCount = React.useCallback(async () => {
    const token = localStorage.getItem("fahasa_token");
    if (!token) {
      setCartCount(0);
      return;
    }
    try {
      const cartRes = await api.get("/cart");
      const items = cartRes.data?.items || [];
      setCartCount(items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0));
    } catch {
      setCartCount(0);
    }
  }, []);

  const mapProduct = (item: any) => ({
    id: item._id,
    image: item.image,
    title: item.title,
    author: item.author,
    price: item.price,
    originalPrice: item.originalPrice,
    rating: item.rating,
    discount: item.discount,
    category: item.category?.name || "Sách Tiếng Việt",
    publisher: item.publisher,
  });

  React.useEffect(() => {
    const bootstrap = async () => {
      const params = new URLSearchParams(window.location.search);
      const oauthToken = params.get("token");
      const oauthSuccess = params.get("oauth") === "success";
      if (oauthSuccess && oauthToken) {
        localStorage.setItem("fahasa_token", oauthToken);
        window.history.replaceState({}, "", window.location.pathname);
      }

      const token = localStorage.getItem("fahasa_token");
      if (token) {
        setIsLoggedIn(true);
        try {
          const meRes = await api.get("/auth/me");
          localStorage.setItem("fahasa_user", JSON.stringify(meRes.data));
          setUserName(meRes.data.name || "");
        } catch {
          const userStr = localStorage.getItem("fahasa_user");
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              setUserName(user.name || "");
            } catch {
              setUserName("");
            }
          }
        }
        await refreshCartCount();
      }

      try {
        const [featuredRes, bestsellersRes, categoriesRes, allProductsRes] = await Promise.all([
          api.get("/products?limit=8&sort=newest"),
          api.get("/products?limit=8&sort=bestseller"),
          api.get("/categories"),
          api.get("/products?limit=1000"),
        ]);
        setFeaturedBooks((featuredRes.data.items || []).map(mapProduct));
        setBestsellers((bestsellersRes.data.items || []).map(mapProduct));
        setCategories((categoriesRes.data.items || []).map((item: any) => item.name));
        setAllProductsForSearch((allProductsRes.data.items || []).map(mapProduct));
      } catch (error) {
        console.error("Failed to bootstrap homepage data", error);
      }
    };

    bootstrap();
  }, [refreshCartCount]);

  // Hiển thị trang Admin Dashboard
  if (showAdminDashboard) {
    return <AdminDashboard onBackToHome={() => setShowAdminDashboard(false)} />;
  }

  // Hiển thị trang Dashboard
  if (showDashboard) {
    return (
      <CustomerDashboard
        onBackToHome={() => setShowDashboard(false)}
        onLogout={() => {
          localStorage.removeItem('fahasa_token');
          localStorage.removeItem('fahasa_user');
          setShowDashboard(false);
          setIsLoggedIn(false);
          setUserName('');
          setCartCount(0);
        }}
      />
    );
  }

  // Hiển thị trang Danh sách sản phẩm
  if (showProductList) {
    return (
      <ProductList
        onBackToHome={() => setShowProductList(false)}
        onProductClick={(product) => {
          setShowProductList(false);
          setSelectedProduct(product);
        }}
        category={selectedCategory}
        isLoggedIn={isLoggedIn}
        onCartUpdate={(count) => setCartCount(count)}
      />
    );
  }

  // Hiển thị trang Thanh toán
  if (showCheckout) {
    return (
      <Checkout
        onBackToCart={() => {
          setShowCheckout(false);
          setShowCart(true);
        }}
      />
    );
  }

  // Hiển thị trang Giỏ hàng
  if (showCart) {
    return (
      <Cart
        onBackToHome={async () => {
          await refreshCartCount();
          setShowCart(false);
        }}
        onCartUpdate={(count) => setCartCount(count)}
        onCheckout={() => {
          setShowCart(false);
          setShowCheckout(true);
        }}
      />
    );
  }

  // Hiển thị trang Product Detail
  if (selectedProduct) {
    return (
      <ProductDetail
        onBackToHome={() => setSelectedProduct(null)}
        product={selectedProduct}
        isLoggedIn={isLoggedIn}
        onCartUpdate={(count) => setCartCount(count)}
      />
    );
  }

  // Hiển thị trang Xác thực (Đăng nhập/Đăng ký)
  if (showLogin || showRegister) {
    return (
      <AuthPage
        initialView={showLogin ? 'login' : 'register'}
        onBackToHome={() => {
          setShowLogin(false);
          setShowRegister(false);
        }}
        onLoginSuccess={async () => {
          setShowLogin(false);
          setShowRegister(false);
          setIsLoggedIn(true);
          const userStr = localStorage.getItem("fahasa_user");
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              setUserName(user.name || "");
            } catch {
              setUserName("");
            }
          }
          await refreshCartCount();
        }}
        onRegisterSuccess={async () => {
          setShowLogin(false);
          setShowRegister(false);
          setIsLoggedIn(true);
          const userStr = localStorage.getItem("fahasa_user");
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              setUserName(user.name || "");
            } catch {
              setUserName("");
            }
          }
          await refreshCartCount();
        }}
      />
    );
  }

  // Hiển thị trang chủ
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onLoginClick={() => {
          if (isLoggedIn) {
            setShowDashboard(true);
          } else {
            setShowLogin(true);
          }
        }}
        onAdminClick={() => setShowAdminDashboard(true)}
        onCartClick={() => setShowCart(true)}
        isLoggedIn={isLoggedIn}
        userName={userName}
        cartCount={cartCount}
        allProducts={allProductsForSearch}
        onProductClick={(product) => setSelectedProduct(product)}
        onCategoryClick={(categoryName) => {
          setSelectedCategory(categoryName);
          setShowProductList(true);
        }}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Banner */}
        <BannerCarousel />

        {/* Categories */}
        <CategorySection
          categories={categories}
          onCategoryClick={(categoryName) => {
            setSelectedCategory(categoryName);
            setShowProductList(true);
          }}
        />

        {/* Flash Sale Banner */}
        <FlashSaleBanner />

        {/* Featured Books */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl">📚 Sách Nổi Bật</h2>
            <a
              href="#"
              className="text-red-600 hover:underline"
            >
              Xem tất cả →
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredBooks.map((book) => (
              <ProductCard
                key={book.id}
                {...book}
                isLoggedIn={isLoggedIn}
                onCartUpdate={(count) => setCartCount(count)}
                onClick={() => setSelectedProduct(book)}
              />
            ))}
          </div>
        </section>

        {/* Promotional Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-8 text-white">
            <h3 className="text-2xl mb-2">Văn Phòng Phẩm</h3>
            <p className="mb-4">Giảm giá đến 30%</p>
            <button className="bg-white text-purple-600 px-6 py-2 rounded-lg hover:bg-gray-100">
              Mua ngay
            </button>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-8 text-white">
            <h3 className="text-2xl mb-2">Sách Thiếu Nhi</h3>
            <p className="mb-4">Combo ưu đãi hấp dẫn</p>
            <button className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-gray-100">
              Khám phá
            </button>
          </div>
        </div>

        {/* Bestsellers */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl">🏆 Sách Bán Chạy</h2>
            <a
              href="#"
              className="text-red-600 hover:underline"
            >
              Xem tất cả →
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bestsellers.map((book) => (
              <ProductCard
                key={book.id}
                {...book}
                isLoggedIn={isLoggedIn}
                onCartUpdate={(count) => setCartCount(count)}
                onClick={() => setSelectedProduct(book)}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}