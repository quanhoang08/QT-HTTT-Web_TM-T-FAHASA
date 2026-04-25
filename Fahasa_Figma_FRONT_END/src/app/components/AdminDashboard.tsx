import { useState, useEffect, FormEvent } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  UserCheck,
  Menu,
  X,
  Loader2,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';
import api from '../utils/api';
import {
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

type RevenueRange = 'day' | 'week' | 'month' | 'year';

const Pagination = ({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4 pb-4">
      <button disabled={page === 1} onClick={() => onPageChange(page - 1)} className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"><ChevronLeft size={16} /></button>
      <span className="text-sm">Trang {page} / {totalPages}</span>
      <button disabled={page === totalPages} onClick={() => onPageChange(page + 1)} className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"><ChevronRight size={16} /></button>
    </div>
  );
};

type AccessState = 'checking' | 'allowed' | 'denied';

export function AdminDashboard({ onBackToHome }: { onBackToHome?: () => void }) {
  const [accessState, setAccessState] = useState<AccessState>('checking');
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'products' | 'orders' | 'customers'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [revenueRange, setRevenueRange] = useState<RevenueRange>('month');

  // Products State
  const [products, setProducts] = useState<any[]>([]);
  const [productsPage, setProductsPage] = useState(1);
  const [productsSearch, setProductsSearch] = useState('');
  const [productsTotalPages, setProductsTotalPages] = useState(1);
  const [searchValProduct, setSearchValProduct] = useState('');

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersSearch, setOrdersSearch] = useState('');
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [searchValOrder, setSearchValOrder] = useState('');

  // Customers State
  const [customers, setCustomers] = useState<any[]>([]);
  const [customersPage, setCustomersPage] = useState(1);
  const [customersSearch, setCustomersSearch] = useState('');
  const [customersTotalPages, setCustomersTotalPages] = useState(1);
  const [searchValCustomer, setSearchValCustomer] = useState('');

  // Modals & Metadata
  const [categories, setCategories] = useState<any[]>([]);
  const [productModal, setProductModal] = useState<{ isOpen: boolean; data: any; mode: 'add' | 'edit' }>({ isOpen: false, data: null, mode: 'add' });
  const [orderModal, setOrderModal] = useState<{ isOpen: boolean; data: any }>({ isOpen: false, data: null });

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/dashboard?period=${revenueRange}`);
      setDashboardData(res.data);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/products?page=${productsPage}&limit=10&search=${productsSearch}`);
      setProducts(res.data.items);
      setProductsTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu sản phẩm", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/orders?page=${ordersPage}&limit=10&search=${ordersSearch}`);
      setOrders(res.data.items);
      setOrdersTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu đơn hàng", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/customers?page=${customersPage}&limit=10&search=${customersSearch}`);
      setCustomers(res.data.items);
      setCustomersTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu khách hàng", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.items);
    } catch (error) {
      console.error("Lỗi lấy danh mục", error);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/auth/me');
        if (cancelled) return;
        if (res.data?.role === 'admin') {
          setAccessState('allowed');
        } else {
          setAccessState('denied');
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setAccessState('denied');
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (accessState !== 'allowed') return;
    fetchDashboard();
  }, [revenueRange, accessState]);

  useEffect(() => {
    if (accessState !== 'allowed') return;
    if (activeMenu === 'products') fetchProducts();
  }, [activeMenu, productsPage, productsSearch, accessState]);

  useEffect(() => {
    if (accessState !== 'allowed') return;
    if (activeMenu === 'orders') fetchOrders();
  }, [activeMenu, ordersPage, ordersSearch, accessState]);

  useEffect(() => {
    if (accessState !== 'allowed') return;
    if (activeMenu === 'customers') fetchCustomers();
  }, [activeMenu, customersPage, customersSearch, accessState]);

  useEffect(() => {
    if (accessState !== 'allowed') return;
    fetchCategories();
  }, [accessState]);

  const formatCurrency = (value: number) => `${value?.toLocaleString('vi-VN') || 0}₫`;
  const formatDate = (value: string) => value ? new Date(value).toLocaleDateString('vi-VN') : '-';

  const handleProductSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const payload = Object.fromEntries(formData.entries());
    try {
      if (productModal.mode === 'add') {
        await api.post('/admin/products', payload);
      } else {
        await api.put(`/admin/products/${productModal.data._id}`, payload);
      }
      setProductModal({ isOpen: false, data: null, mode: 'add' });
      fetchProducts();
    } catch (error) {
      console.error("Lỗi lưu sản phẩm", error);
      alert("Lỗi lưu sản phẩm");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Lỗi xóa sản phẩm", error);
    }
  };

  const handleViewOrder = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/orders/${id}`);
      setOrderModal({ isOpen: true, data: res.data });
    } catch (error) {
      console.error("Lỗi lấy chi tiết đơn hàng", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      if (activeMenu === 'orders') fetchOrders();
      if (activeMenu === 'dashboard') fetchDashboard();
      if (orderModal.isOpen && orderModal.data?._id === orderId) {
        handleViewOrder(orderId);
      }
    } catch (error) {
      console.error('Failed to update order status', error);
    }
  };

  const rangeLabelMap: Record<RevenueRange, string> = {
    day: 'ngày hiện tại',
    week: 'tuần hiện tại',
    month: 'tháng hiện tại',
    year: 'năm hiện tại',
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      shipping: { label: 'Đang giao', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700 border-green-200' },
      cancelled: { label: 'Đã hủy', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    };
    return configs[status] || configs.pending;
  };

  const revenueData = dashboardData?.series?.map((item: any) => ({
    name: item.label,
    revenue: item.revenue,
    orders: item.orders
  })) || [];

  const kpiData = dashboardData ? [
    {
      id: 1, title: `Doanh thu hôm nay`, value: formatCurrency(dashboardData.kpi.revenueToday),
      change: 'Hôm nay', trend: 'up', icon: DollarSign, color: 'bg-green-500', lightBg: 'bg-green-50',
    },
    {
      id: 2, title: `Tổng Đơn hàng`, value: dashboardData.kpi.totalOrders.toLocaleString('vi-VN'),
      change: 'Toàn thời gian', trend: 'up', icon: ShoppingCart, color: 'bg-blue-500', lightBg: 'bg-blue-50',
    },
    {
      id: 3, title: 'Tổng Sản phẩm', value: dashboardData.kpi.totalProducts.toLocaleString('vi-VN'),
      change: 'Có sẵn', trend: 'up', icon: Package, color: 'bg-orange-500', lightBg: 'bg-orange-50',
    },
    {
      id: 4, title: 'Khách hàng', value: dashboardData.kpi.totalCustomers.toLocaleString('vi-VN'),
      change: 'Hệ thống', trend: 'up', icon: UserCheck, color: 'bg-purple-500', lightBg: 'bg-purple-50',
    },
  ] : [];

  const recentOrders = dashboardData?.recentOrders || [];

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard Tổng quan' },
    { id: 'products', icon: Package, label: 'Quản lý Sản phẩm' },
    { id: 'orders', icon: ShoppingCart, label: 'Quản lý Đơn hàng' },
    { id: 'customers', icon: Users, label: 'Quản lý Khách hàng' },
  ];

  if (accessState === 'checking') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin text-[#CA2128] mb-4" size={48} />
        <p className="text-gray-600">Đang kiểm tra quyền truy cập…</p>
      </div>
    );
  }

  if (accessState === 'denied') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={32} />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Không có quyền quản trị</h1>
          <p className="text-gray-600 text-sm mb-4">
            Các API admin chỉ dành cho tài khoản có vai trò <strong>admin</strong> trên server. Tài khoản đăng ký thường là <strong>khách hàng</strong>, nên server trả lỗi 403 (Forbidden).
          </p>
          <p className="text-sm text-gray-700 mb-6 text-left bg-gray-50 rounded-lg p-3">
            Sau khi chạy seed backend, đăng xuất và đăng nhập bằng tài khoản mặc định:
            <br />
            <code className="text-[#CA2128]">admin@fahasa.com</code> / <code className="text-[#CA2128]">Admin@123</code>
          </p>
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="w-full py-3 rounded-lg bg-[#CA2128] text-white font-medium hover:opacity-95"
            >
              ← Quay về trang chủ
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-sm">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-900 text-white transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-[#CA2128] to-[#E63946] p-2 rounded-lg"><Package size={24} /></div>
            <div><h1 className="text-xl">Fahasa</h1><p className="text-xs text-gray-400">Admin Panel</p></div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button key={item.id} onClick={() => { setActiveMenu(item.id as any); setProductsPage(1); setOrdersPage(1); setCustomersPage(1); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-gradient-to-r from-[#CA2128] to-[#E63946] text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
                <Icon size={20} /><span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg"><Menu size={24} /></button>
            <h2 className="text-xl font-semibold text-gray-800">{menuItems.find(m => m.id === activeMenu)?.label}</h2>
          </div>
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg border transition-colors"
            >
              ← Quay về trang chủ
            </button>
          )}
        </header>

        <main className="flex-1 overflow-auto p-6 relative">
          {loading && (
            <div className="absolute inset-0 z-50 bg-white/50 flex flex-col items-center justify-center backdrop-blur-sm">
              <Loader2 className="animate-spin text-[#CA2128] mb-2" size={40} />
            </div>
          )}

          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiData.map((kpi) => {
                  const Icon = kpi.icon;
                  return (
                    <div key={kpi.id} className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`${kpi.lightBg} p-3 rounded-lg`}><Icon size={24} className={`${kpi.color.replace('bg-', 'text-')}`} /></div>
                        {kpi.trend === 'up' ? <span className="text-green-600 text-sm flex items-center gap-1"><TrendingUp size={16} />{kpi.change}</span> : <span className="text-orange-600 text-sm">{kpi.change}</span>}
                      </div>
                      <h3 className="text-gray-600 text-sm mb-2">{kpi.title}</h3>
                      <p className="text-2xl font-bold text-gray-800">{kpi.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Extra Revenue KPIs */}
              {dashboardData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-green-500">
                    <p className="text-xs text-gray-500 mb-1">Doanh thu tuần này</p>
                    <p className="text-xl font-bold text-gray-800">{formatCurrency(dashboardData.kpi.revenueWeek)}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-blue-500">
                    <p className="text-xs text-gray-500 mb-1">Doanh thu tháng này</p>
                    <p className="text-xl font-bold text-gray-800">{formatCurrency(dashboardData.kpi.revenueMonth)}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-purple-500">
                    <p className="text-xs text-gray-500 mb-1">Doanh thu năm {new Date().getFullYear()}</p>
                    <p className="text-xl font-bold text-gray-800">{formatCurrency(dashboardData.kpi.revenueYear)}</p>
                  </div>
                </div>
              )}

              {/* Revenue Chart */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Doanh thu theo thời gian</h3>
                    <p className="text-sm text-gray-600">Theo {rangeLabelMap[revenueRange]}</p>
                  </div>
                  <select value={revenueRange} onChange={(e) => setRevenueRange(e.target.value as RevenueRange)} className="border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-[#CA2128]">
                    <option value="day">Ngày hiện tại</option>
                    <option value="week">Tuần hiện tại</option>
                    <option value="month">Tháng hiện tại</option>
                    <option value="year">Năm hiện tại</option>
                  </select>
                </div>
                {revenueData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                    <ShoppingCart size={48} className="mb-3 opacity-30" />
                    <p className="text-sm">Chưa có dữ liệu doanh thu trong kỳ này</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis stroke="#666" tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                      <YAxis yAxisId="orders" orientation="right" stroke="#4B5563" />
                      <Tooltip formatter={(value: number, name: string) => [name === 'Doanh thu' ? formatCurrency(value) : value, name]} />
                      <Bar dataKey="revenue" name="Doanh thu" fill="#CA2128" radius={[8, 8, 0, 0]} />
                      <Line yAxisId="orders" type="monotone" dataKey="orders" name="Số đơn" stroke="#1D4ED8" strokeWidth={3} dot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-between p-5 border-b">
                  <h3 className="font-semibold text-gray-800">Đơn hàng gần đây</h3>
                  <button onClick={() => setActiveMenu('orders')} className="text-xs text-[#CA2128] hover:underline">Xem tất cả →</button>
                </div>
                {recentOrders.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Chưa có đơn hàng nào</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-5 py-3 font-semibold text-gray-600">Mã đơn</th>
                          <th className="px-5 py-3 font-semibold text-gray-600">Khách hàng</th>
                          <th className="px-5 py-3 font-semibold text-gray-600">Ngày đặt</th>
                          <th className="px-5 py-3 font-semibold text-gray-600 text-right">Tổng tiền</th>
                          <th className="px-5 py-3 font-semibold text-gray-600">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {recentOrders.map((order: any) => {
                          const cfg = getStatusConfig(order.status);
                          return (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-5 py-3 font-semibold text-[#CA2128]">#{order.orderNumber}</td>
                              <td className="px-5 py-3 text-gray-700">{order.customer}</td>
                              <td className="px-5 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                              <td className="px-5 py-3 text-right font-medium">{formatCurrency(order.total)}</td>
                              <td className="px-5 py-3">
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>{cfg.label}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === 'products' && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-4 border-b flex items-center justify-between gap-4 bg-gray-50">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Tìm tên sách, tác giả..." value={searchValProduct} onChange={(e) => setSearchValProduct(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setProductsSearch(searchValProduct)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-[#CA2128]" />
                </div>
                <button onClick={() => setProductModal({ isOpen: true, data: null, mode: 'add' })} className="flex items-center gap-2 px-4 py-2 bg-[#CA2128] text-white rounded-lg hover:bg-red-700">
                  <Plus size={18} /> Thêm Sản Phẩm
                </button>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Sản phẩm</th>
                      <th className="px-4 py-3 font-semibold">Danh mục</th>
                      <th className="px-4 py-3 font-semibold text-right">Giá</th>
                      <th className="px-4 py-3 font-semibold text-right">Tồn kho</th>
                      <th className="px-4 py-3 font-semibold text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400"><Package size={36} className="mx-auto mb-2 opacity-30" /><p>Chưa có sản phẩm nào</p></td></tr>
                    ) : products.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={item.image} alt={item.title} className="w-10 h-14 object-cover rounded border" />
                            <div><div className="font-medium text-gray-800 line-clamp-1">{item.title}</div><div className="text-xs text-gray-500">{item.author}</div></div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{item.category?.name || '-'}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.price)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-medium ${item.stock < 20 ? 'text-red-600' : 'text-gray-800'}`}>{item.stock}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => setProductModal({ isOpen: true, data: item, mode: 'edit' })} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded mr-2"><Edit size={16} /></button>
                          <button onClick={() => handleDeleteProduct(item._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={productsPage} totalPages={productsTotalPages} onPageChange={setProductsPage} />
            </div>
          )}

          {activeMenu === 'orders' && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-4 border-b flex items-center justify-between gap-4 bg-gray-50">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Tìm mã đơn hàng..." value={searchValOrder} onChange={(e) => setSearchValOrder(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setOrdersSearch(searchValOrder)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-[#CA2128]" />
                </div>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Mã đơn</th>
                      <th className="px-4 py-3 font-semibold">Khách hàng</th>
                      <th className="px-4 py-3 font-semibold">Ngày đặt</th>
                      <th className="px-4 py-3 font-semibold text-right">Tổng</th>
                      <th className="px-4 py-3 font-semibold">Trạng thái</th>
                      <th className="px-4 py-3 font-semibold text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400"><ShoppingCart size={36} className="mx-auto mb-2 opacity-30" /><p>Chưa có đơn hàng nào</p></td></tr>
                    ) : orders.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-[#CA2128]">#{item.orderNumber}</td>
                        <td className="px-4 py-3">{item.user?.name || '-'}</td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(item.createdAt)}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.total)}</td>
                        <td className="px-4 py-3">
                          <select value={item.status} onChange={(e) => updateOrderStatus(item._id, e.target.value)} className={`border rounded px-2 py-1 text-xs font-medium ${getStatusConfig(item.status).color}`}>
                            <option value="pending">Chờ xử lý</option>
                            <option value="shipping">Đang giao</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => handleViewOrder(item._id)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded border flex items-center gap-1 mx-auto text-xs">
                            <Eye size={14} /> Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={ordersPage} totalPages={ordersTotalPages} onPageChange={setOrdersPage} />
            </div>
          )}

          {activeMenu === 'customers' && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
               <div className="p-4 border-b flex items-center justify-between gap-4 bg-gray-50">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Tìm tên, email, SĐT..." value={searchValCustomer} onChange={(e) => setSearchValCustomer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setCustomersSearch(searchValCustomer)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-[#CA2128]" />
                </div>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Tên</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Số điện thoại</th>
                      <th className="px-4 py-3 font-semibold">Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {customers.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400"><Users size={36} className="mx-auto mb-2 opacity-30" /><p>Chưa có khách hàng nào</p></td></tr>
                    ) : customers.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{item.name}</td>
                        <td className="px-4 py-3 text-gray-600">{item.email}</td>
                        <td className="px-4 py-3 text-gray-600">{item.phone || '-'}</td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(item.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={customersPage} totalPages={customersTotalPages} onPageChange={setCustomersPage} />
            </div>
          )}
        </main>
      </div>

      {/* Product Modal */}
      {productModal.isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">{productModal.mode === 'add' ? 'Thêm Sản Phẩm Mới' : 'Sửa Sản Phẩm'}</h3>
              <button onClick={() => setProductModal({ isOpen: false, data: null, mode: 'add' })} className="p-1 hover:bg-gray-100 rounded"><X size={20}/></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <form id="productForm" onSubmit={handleProductSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
                  <input required name="title" defaultValue={productModal.data?.title} className="w-full border rounded-lg px-3 py-2 focus:border-[#CA2128] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tác giả *</label>
                  <input required name="author" defaultValue={productModal.data?.author} className="w-full border rounded-lg px-3 py-2 focus:border-[#CA2128] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nhà xuất bản *</label>
                  <input required name="publisher" defaultValue={productModal.data?.publisher} className="w-full border rounded-lg px-3 py-2 focus:border-[#CA2128] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Giá bán (₫) *</label>
                  <input required type="number" name="price" defaultValue={productModal.data?.price} className="w-full border rounded-lg px-3 py-2 focus:border-[#CA2128] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Giá gốc (₫)</label>
                  <input type="number" name="originalPrice" defaultValue={productModal.data?.originalPrice} className="w-full border rounded-lg px-3 py-2 focus:border-[#CA2128] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tồn kho *</label>
                  <input required type="number" name="stock" defaultValue={productModal.data?.stock} className="w-full border rounded-lg px-3 py-2 focus:border-[#CA2128] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Danh mục *</label>
                  <select required name="category" defaultValue={productModal.data?.category?._id} className="w-full border rounded-lg px-3 py-2 focus:border-[#CA2128] focus:outline-none bg-white">
                    <option value="">Chọn danh mục</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">URL Hình ảnh *</label>
                  <input required name="image" defaultValue={productModal.data?.image} className="w-full border rounded-lg px-3 py-2 focus:border-[#CA2128] focus:outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea name="description" rows={3} defaultValue={productModal.data?.description} className="w-full border rounded-lg px-3 py-2 focus:border-[#CA2128] focus:outline-none"></textarea>
                </div>
              </form>
            </div>
            <div className="p-4 border-t flex justify-end gap-2 bg-gray-50">
              <button onClick={() => setProductModal({ isOpen: false, data: null, mode: 'add' })} className="px-4 py-2 border rounded-lg hover:bg-gray-100 font-medium">Hủy</button>
              <button type="submit" form="productForm" className="px-4 py-2 bg-[#CA2128] text-white rounded-lg hover:bg-red-700 font-medium">Lưu Sản Phẩm</button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {orderModal.isOpen && orderModal.data && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  Chi tiết đơn hàng <span className="text-[#CA2128]">#{orderModal.data.orderNumber}</span>
                </h3>
                <p className="text-xs text-gray-500">Đặt ngày: {formatDate(orderModal.data.createdAt)}</p>
              </div>
              <button onClick={() => setOrderModal({ isOpen: false, data: null })} className="p-1 hover:bg-gray-100 rounded"><X size={20}/></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-semibold mb-3 border-b pb-2">Danh sách sản phẩm</h4>
                  <div className="space-y-3">
                    {orderModal.data.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-3">
                        <img src={item.product?.image || '/placeholder.png'} className="w-16 h-20 object-cover border rounded bg-white" alt="product"/>
                        <div className="flex-1">
                          <p className="font-medium line-clamp-2">{item.title}</p>
                          <p className="text-xs text-gray-500 mt-1">Đơn giá: {formatCurrency(item.price)}</p>
                          <p className="text-xs font-semibold mt-1">SL: {item.quantity}</p>
                        </div>
                        <div className="font-semibold text-right">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-semibold mb-3 border-b pb-2">Thông tin giao hàng</h4>
                  <p className="text-sm"><span className="text-gray-500">Người nhận:</span> <br/><b>{orderModal.data.shippingInfo.fullName}</b></p>
                  <p className="text-sm mt-2"><span className="text-gray-500">SĐT:</span> <br/><b>{orderModal.data.shippingInfo.phone}</b></p>
                  <p className="text-sm mt-2"><span className="text-gray-500">Địa chỉ:</span> <br/><b>{orderModal.data.shippingInfo.address}</b></p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-semibold mb-3 border-b pb-2">Tổng quan</h4>
                  <div className="flex justify-between text-sm mb-1"><span>Tạm tính:</span> <span>{formatCurrency(orderModal.data.total)}</span></div>
                  <div className="flex justify-between text-sm mb-1"><span>Phí giao hàng:</span> <span>Miễn phí</span></div>
                  <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t text-[#CA2128]"><span>Tổng cộng:</span> <span>{formatCurrency(orderModal.data.total)}</span></div>
                  <p className="text-xs text-gray-500 mt-3">Phương thức: <b>{orderModal.data.paymentMethod}</b></p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-semibold mb-3 border-b pb-2">Trạng thái đơn</h4>
                  <select 
                    value={orderModal.data.status} 
                    onChange={(e) => updateOrderStatus(orderModal.data._id, e.target.value)} 
                    className={`w-full border rounded-lg px-3 py-2 text-sm font-medium ${getStatusConfig(orderModal.data.status).color}`}
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="shipping">Đang giao</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
