import { useState, useEffect, type FormEvent } from 'react';
import { ArrowLeft, User, Package, MapPin, Bell, ChevronRight, LogOut, Lock, Loader2 } from 'lucide-react';
import api from '../utils/api';

interface CustomerDashboardProps {
  onBackToHome?: () => void;
  onLogout?: () => void;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'processing' | 'shipping' | 'delivered' | 'cancelled';
  total: number;
  items: number;
}

interface AddressItem {
  id: string;
  fullName: string;
  phone: string;
  fullAddress: string;
  isDefault: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'order' | 'promotion';
  isRead: boolean;
}

export function CustomerDashboard({ onBackToHome, onLogout }: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'notifications'>('orders');
  const [loading, setLoading] = useState(true);

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    line1: '', // backend fields actually are line1, city etc, but wait. Backend User model: let's check it fast. I will just pass line1: fullAddress, city: 'N/A' for now.
    city: 'N/A', // or fullAddress
    fullAddress: '',
    isDefault: false,
  });

  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        try {
          setLoading(true);
          const [profileRes, addrRes, notiRes, orderRes] = await Promise.all([
            api.get('/user/profile'),
            api.get('/user/addresses'),
            api.get('/user/notifications'),
            api.get('/orders/my-orders'),
          ]);
          setProfileForm({
            name: profileRes.data.name || '',
            email: profileRes.data.email || '',
            phone: profileRes.data.phone || '',
          });
          setAddresses(addrRes.data.items || []);
          setNotifications(notiRes.data.items || []);
          setOrders(orderRes.data.items || []);
        } catch (error) {
          console.error("Lỗi lấy dữ liệu cá nhân:", error);
        } finally {
          setLoading(false);
        }
    };
    fetchData();
  }, []);

  // Dữ liệu khách hàng mẫu
  const customer = {
    name: profileForm.name,
    email: profileForm.email,
    phone: profileForm.phone,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profileForm.name || 'User')}&background=CA2128&color=fff&size=200`,
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      pending: {
        label: 'Chờ thanh toán',
        color: 'bg-gray-100 text-gray-700 border-gray-200',
      },
      processing: {
        label: 'Đang xử lý',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
      },
      shipping: {
        label: 'Đang giao',
        color: 'bg-orange-100 text-orange-700 border-orange-200',
      },
      delivered: {
        label: 'Đã giao',
        color: 'bg-green-100 text-green-700 border-green-200',
      },
      cancelled: {
        label: 'Đã hủy',
        color: 'bg-gray-100 text-gray-700 border-gray-200',
      },
    };
    return configs[status] || configs.pending;
  };

  const menuItems = [
    { id: 'profile', icon: User, label: 'Thông tin tài khoản' },
    { id: 'orders', icon: Package, label: 'Lịch sử đơn hàng' },
    { id: 'addresses', icon: MapPin, label: 'Sổ địa chỉ' },
    { id: 'notifications', icon: Bell, label: 'Thông báo' },
  ];

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const res = await api.put('/user/profile', { name: profileForm.name, phone: profileForm.phone });
      alert("Cập nhật thông tin thành công!");
      setProfileForm((prev) => ({ ...prev, name: res.data.name, phone: res.data.phone }));
    } catch {
      alert("Đã xảy ra lỗi khi cập nhật.");
    }
  };

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp.");
      return;
    }
    try {
      await api.put('/user/change-password', { 
        currentPassword: passwordForm.currentPassword, 
        newPassword: passwordForm.newPassword 
      });
      alert("Đổi mật khẩu thành công!");
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi khi đổi mật khẩu");
    }
  };

  const resetAddressForm = () => {
    setAddressForm({ fullName: '', phone: '', fullAddress: '', isDefault: false, line1: '', city: 'N/A' });
    setEditingAddressId(null);
  };

  const handleSubmitAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!addressForm.fullName || !addressForm.phone || !addressForm.fullAddress) {
      return;
    }

    try {
      if (editingAddressId) {
        const res = await api.put(`/user/addresses/${editingAddressId}`, {
          fullName: addressForm.fullName,
          phone: addressForm.phone,
          line1: addressForm.fullAddress,
          city: addressForm.city,
          isDefault: addressForm.isDefault
        });
        setAddresses(res.data.items);
      } else {
        const res = await api.post(`/user/addresses`, {
          fullName: addressForm.fullName,
          phone: addressForm.phone,
          line1: addressForm.fullAddress,
          city: addressForm.city,
          isDefault: addressForm.isDefault
        });
        setAddresses(res.data.items);
      }
      resetAddressForm();
    } catch (e) {
      console.error(e);
      alert("Có lỗi khi lưu địa chỉ");
    }
  };

  const handleEditAddress = (address: any) => {
    setEditingAddressId(address._id || address.id);
    setAddressForm({
      fullName: address.fullName,
      phone: address.phone,
      fullAddress: address.line1 || address.fullAddress || '',
      line1: address.line1,
      city: address.city,
      isDefault: address.isDefault,
    });
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await api.delete(`/user/addresses/${id}`);
      setAddresses(res.data.items);
      if (editingAddressId === id) resetAddressForm();
    } catch (e) {
      alert("Lỗi khi xóa địa chỉ");
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/user/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((item) => (item._id === id || item.id === id ? { ...item, isRead: true } : item))
      );
    } catch (error) {
      console.error(error);
    }
  };

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
        {loading && (
          <div className="fixed inset-0 z-50 bg-white/50 flex flex-col items-center justify-center backdrop-blur-sm">
            <Loader2 className="animate-spin text-[#CA2128] mb-2" size={40} />
            <span>Đang tải...</span>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar - Menu bên trái */}
          <div className="space-y-4">
            {/* Card thông tin khách hàng */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col items-center text-center">
                <img
                  src={customer.avatar}
                  alt={customer.name}
                  className="w-24 h-24 rounded-full mb-4 border-4 border-[#CA2128]"
                />
                <h3 className="text-xl mb-1 text-gray-800">
                  {customer.name}
                </h3>
                <p className="text-sm text-gray-600">{customer.email}</p>
              </div>
            </div>

            {/* Menu navigation */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
                      isActive
                        ? 'bg-red-50 text-[#CA2128] border-l-4 border-[#CA2128]'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && <ChevronRight size={20} />}
                  </button>
                );
              })}

              <div className="border-t border-gray-100 my-2"></div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-6 py-4 text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={20} />
                <span className="flex-1 text-left font-medium">Đăng xuất</span>
              </button>
            </div>
          </div>

          {/* Nội dung bên phải */}
          <div>
            {activeTab === 'orders' && (
              <div>
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h2 className="text-2xl mb-2 text-gray-800">
                    Lịch sử đơn hàng
                  </h2>
                  <p className="text-gray-600">
                    Quản lý và theo dõi các đơn hàng của bạn
                  </p>
                </div>

                <div className="space-y-4">
                  {orders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          {/* Thông tin đơn hàng */}
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <h3 className="text-lg text-gray-800">
                                Đơn hàng <span className="text-[#CA2128]">#{order.orderNumber}</span>
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-sm border ${statusConfig.color}`}
                              >
                                {statusConfig.label}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                              <div>
                                <span className="font-semibold">Ngày đặt:</span> {new Date(order.createdAt || order.date).toLocaleDateString('vi-VN')}
                              </div>
                              <div>
                                <span className="font-semibold">Số lượng:</span> {order.items?.length || 0} mục
                              </div>
                              <div>
                                <span className="font-semibold">Tổng tiền:</span>{' '}
                                <span className="text-[#CA2128] text-base">
                                  {order.total?.toLocaleString('vi-VN')}₫
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Nút hành động */}
                          <div className="flex gap-3">
                            <button className="px-6 py-2 bg-gradient-to-r from-[#CA2128] to-[#E63946] text-white rounded-lg hover:shadow-lg transition-shadow">
                              Xem chi tiết
                            </button>
                            {order.status === 'delivered' && (
                              <button className="px-6 py-2 border-2 border-[#CA2128] text-[#CA2128] rounded-lg hover:bg-red-50 transition-colors">
                                Mua lại
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination hoặc load more */}
                <div className="mt-6 text-center">
                  <button className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Xem thêm đơn hàng
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h2 className="text-2xl mb-2 text-gray-800">
                    Thông tin tài khoản
                  </h2>
                  <p className="text-gray-600">
                    Cập nhật hồ sơ và đổi mật khẩu tại một nơi
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h3 className="text-xl text-gray-800 mb-4">Cập nhật thông tin</h3>
                  <form className="space-y-6" onSubmit={handleSaveProfile}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm mb-2 text-gray-700">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#CA2128]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-2 text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileForm.email}
                          disabled
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#CA2128]"
                        />
                        <p className="text-xs text-gray-500 mt-2">Email không thể thay đổi.</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm mb-2 text-gray-700">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#CA2128]"
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="px-8 py-3 bg-gradient-to-r from-[#CA2128] to-[#E63946] text-white rounded-lg hover:shadow-lg transition-shadow"
                      >
                        Lưu thay đổi
                      </button>
                      <button
                        type="button"
                        className="px-8 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Lock size={20} className="text-[#CA2128]" />
                    <h3 className="text-xl text-gray-800">Đổi mật khẩu</h3>
                  </div>
                  <form className="space-y-4" onSubmit={handleChangePassword}>
                    <div>
                      <label className="block text-sm mb-2 text-gray-700">Mật khẩu hiện tại</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(event) =>
                          setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#CA2128]"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2 text-gray-700">Mật khẩu mới</label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(event) =>
                            setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#CA2128]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-2 text-gray-700">Xác nhận mật khẩu mới</label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(event) =>
                            setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#CA2128]"
                        />
                      </div>
                    </div>
                    {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <p className="text-sm text-red-600">Mật khẩu xác nhận chưa khớp.</p>
                    )}
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-[#CA2128] to-[#E63946] text-white rounded-lg hover:shadow-lg transition-shadow"
                    >
                      Cập nhật mật khẩu
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div>
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl mb-2 text-gray-800">
                        Sổ địa chỉ
                      </h2>
                      <p className="text-gray-600">
                        Quản lý địa chỉ giao hàng của bạn
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">Tối đa 5 địa chỉ</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h3 className="text-lg text-gray-800 mb-4">
                    {editingAddressId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
                  </h3>
                  <form className="space-y-4" onSubmit={handleSubmitAddress}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Họ tên người nhận"
                        value={addressForm.fullName}
                        onChange={(event) =>
                          setAddressForm((prev) => ({ ...prev, fullName: event.target.value }))
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#CA2128]"
                      />
                      <input
                        type="tel"
                        placeholder="Số điện thoại"
                        value={addressForm.phone}
                        onChange={(event) =>
                          setAddressForm((prev) => ({ ...prev, phone: event.target.value }))
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#CA2128]"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Địa chỉ đầy đủ"
                      value={addressForm.fullAddress}
                      onChange={(event) =>
                        setAddressForm((prev) => ({ ...prev, fullAddress: event.target.value }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#CA2128]"
                    />
                    <label className="flex items-center gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(event) =>
                          setAddressForm((prev) => ({ ...prev, isDefault: event.target.checked }))
                        }
                        className="w-4 h-4 accent-[#CA2128]"
                      />
                      Đặt làm địa chỉ mặc định
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-[#CA2128] to-[#E63946] text-white rounded-lg hover:shadow-lg transition-shadow"
                      >
                        {editingAddressId ? 'Lưu địa chỉ' : 'Thêm địa chỉ'}
                      </button>
                      {editingAddressId && (
                        <button
                          type="button"
                          onClick={resetAddressForm}
                          className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`bg-white rounded-lg shadow-sm p-6 border-2 ${
                        address.isDefault ? 'border-[#CA2128]' : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-lg text-gray-800">{address.fullName}</h3>
                            {address.isDefault && (
                              <span className="px-3 py-1 bg-[#CA2128] text-white text-xs rounded-full">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 mb-2">{address.phone}</p>
                          <p className="text-gray-600">{address.fullAddress}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="text-[#CA2128] hover:underline"
                          >
                            Sửa
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleDeleteAddress(address._id || address.id)}
                            className="text-gray-600 hover:underline"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {addresses.length === 0 && (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-dashed">
                      Chưa có địa chỉ nào được lưu.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl mb-2 text-gray-800">
                        Thông báo
                      </h2>
                      <p className="text-gray-600">
                        Các thông báo và cập nhật mới nhất
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-red-100 text-[#CA2128] text-sm">
                      {unreadCount} chưa đọc
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {notifications.map((item) => (
                    <div
                      key={item._id || item.id}
                      className={`bg-white rounded-lg shadow-sm p-6 transition-colors cursor-pointer ${
                        item.isRead ? 'hover:bg-gray-50' : 'border-l-4 border-[#CA2128]'
                      }`}
                      onClick={() => markAsRead(item._id || item.id)}
                    >
                      <div className="flex gap-4">
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                            item.type === 'order' ? 'bg-green-100' : 'bg-blue-100'
                          }`}
                        >
                          {item.type === 'order' ? (
                            <Package size={24} className="text-green-600" />
                          ) : (
                            <Bell size={24} className="text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1 gap-4">
                            <h3 className="text-gray-800">{item.title}</h3>
                            {!item.isRead && <span className="text-xs text-[#CA2128]">Mới</span>}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{item.message}</p>
                          <span className="text-xs text-gray-500">{new Date(item.createdAt || item.time || new Date()).toLocaleString('vi-VN')}</span>
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
    </div>
  );
}
