import React from 'react';
import { CheckCircle2, Package, Truck, ArrowRight, Home, Mail } from 'lucide-react';

interface OrderSuccessProps {
  orderNumber: string;
  onContinueShopping: () => void;
  onViewOrderDetails: () => void;
}

export function OrderSuccess({ orderNumber, onContinueShopping, onViewOrderDetails }: OrderSuccessProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm p-8 md:p-12 relative overflow-hidden">
        {/* Top Right Decoration Blob */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="flex flex-col items-center text-center z-10 relative">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-200">
            <CheckCircle2 size={48} className="text-white" strokeWidth={2.5} />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
          <p className="text-gray-500 text-lg mb-8">Cảm ơn bạn đã mua sắm tại Fahasa</p>

          {/* Order Info Card */}
          <div className="w-full bg-[#FFF5F3] border border-red-50 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Package className="text-[#CA2128]" size={20} />
              <span className="text-gray-700 font-medium">Mã đơn hàng:</span>
              <span className="text-[#CA2128] font-bold text-xl">#{orderNumber}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <Mail size={16} />
              <span>Thông tin đơn hàng đã được gửi về email của bạn</span>
            </div>
          </div>

          {/* Steps */}
          <div className="w-full bg-gray-50 rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-800 text-center mb-6">Các bước tiếp theo:</h3>
            
            <div className="relative border-l-2 border-gray-200 ml-4 space-y-8">
              {/* Step 1 */}
              <div className="relative pl-8">
                <div className="absolute -left-[11px] bg-green-500 rounded-full w-5 h-5 flex items-center justify-center top-0.5">
                  <CheckCircle2 size={12} className="text-white" strokeWidth={3} />
                </div>
                <h4 className="text-gray-800 font-medium text-sm">Đơn hàng đã được xác nhận</h4>
                <p className="text-gray-500 text-xs mt-1">Hôm nay</p>
              </div>

              {/* Step 2 */}
              <div className="relative pl-8">
                <div className="absolute -left-[11px] bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center top-0.5 ring-4 ring-gray-50">
                  <span className="text-white text-[10px] font-bold">2</span>
                </div>
                <h4 className="text-gray-800 font-medium text-sm">Đang chuẩn bị hàng</h4>
                <p className="text-gray-500 text-xs mt-1">Dự kiến 1-2 ngày</p>
              </div>

              {/* Step 3 */}
              <div className="relative pl-8">
                <div className="absolute -left-[11px] bg-gray-300 rounded-full w-5 h-5 flex items-center justify-center top-0.5 ring-4 ring-gray-50">
                  <span className="text-white text-[10px] font-bold">3</span>
                </div>
                <h4 className="text-gray-400 font-medium text-sm">Giao hàng</h4>
                <p className="text-gray-400 text-xs mt-1">Dự kiến 2-3 ngày</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button
              onClick={onContinueShopping}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-[#CA2128] text-[#CA2128] rounded-xl font-medium hover:bg-red-50 transition-colors"
            >
              <Home size={18} />
              Tiếp tục mua sắm
            </button>
            <button
              onClick={onViewOrderDetails}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#CA2128] text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
            >
              Xem chi tiết đơn hàng
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <p className="mt-8 text-gray-500 text-sm">
        Bạn có thể theo dõi đơn hàng tại trang <button onClick={onViewOrderDetails} className="text-[#CA2128] font-medium hover:underline">Lịch sử đơn hàng</button>
      </p>
    </div>
  );
}
