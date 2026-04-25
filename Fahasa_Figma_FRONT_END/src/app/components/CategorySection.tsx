import { BookOpen, Palette, Gift, Gamepad2, Briefcase, Sparkles } from 'lucide-react';

const defaultCategories = [
  { icon: BookOpen, name: 'Sách Tiếng Việt', color: 'bg-blue-100 text-blue-600' },
  { icon: BookOpen, name: 'Sách Ngoại Văn', color: 'bg-green-100 text-green-600' },
  { icon: Briefcase, name: 'Văn Phòng Phẩm', color: 'bg-purple-100 text-purple-600' },
  { icon: Gift, name: 'Quà Lưu Niệm', color: 'bg-pink-100 text-pink-600' },
  { icon: Gamepad2, name: 'Đồ Chơi', color: 'bg-orange-100 text-orange-600' },
  { icon: Palette, name: 'Nghệ Thuật', color: 'bg-red-100 text-red-600' },
  { icon: Sparkles, name: 'Thời Trang', color: 'bg-yellow-100 text-yellow-600' },
  { icon: BookOpen, name: 'Sách Giáo Khoa', color: 'bg-teal-100 text-teal-600' },
];

interface CategorySectionProps {
  onCategoryClick?: (categoryName: string) => void;
  categories?: string[];
}

export function CategorySection({ onCategoryClick, categories }: CategorySectionProps) {
  const items = categories && categories.length > 0
    ? categories.map((name) => ({ icon: BookOpen, name, color: 'bg-blue-100 text-blue-600' }))
    : defaultCategories;

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-2xl mb-6">Danh mục nổi bật</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {items.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.name}
              onClick={() => onCategoryClick?.(category.name)}
              className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`${category.color} p-4 rounded-full`}>
                <Icon size={32} />
              </div>
              <span className="text-sm text-center">{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
