import React, { useState, useEffect } from 'react';

export function FlashSaleBanner() {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 35, seconds: 42 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (hours === 0 && minutes === 0 && seconds === 0) return prev;
        
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-lg p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold mb-2">
          ⚡ FLASH SALE MỖI NGÀY
        </h2>
        <p className="text-xl">
          Giảm giá đến 50% - Số lượng có hạn
        </p>
      </div>
      <div className="flex gap-4">
        <div className="bg-white text-red-600 rounded-lg p-4 text-center min-w-[80px] shadow-lg">
          <div className="text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
          <div className="text-sm font-medium">Giờ</div>
        </div>
        <div className="bg-white text-red-600 rounded-lg p-4 text-center min-w-[80px] shadow-lg">
          <div className="text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
          <div className="text-sm font-medium">Phút</div>
        </div>
        <div className="bg-white text-red-600 rounded-lg p-4 text-center min-w-[80px] shadow-lg">
          <div className="text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
          <div className="text-sm font-medium">Giây</div>
        </div>
      </div>
    </div>
  );
}
