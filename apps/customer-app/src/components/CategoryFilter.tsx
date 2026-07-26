'use client';

interface Category {
  name: string;
  count: number;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="space-y-2">
      <button
        onClick={() => onSelectCategory('')}
        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
          selectedCategory === ''
            ? 'bg-primary-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="font-medium">All Products</span>
          <span className="text-sm">
            {categories.reduce((sum, cat) => sum + cat.count, 0)}
          </span>
        </div>
      </button>

      {categories.map((category) => (
        <button
          key={category.name}
          onClick={() => onSelectCategory(category.name)}
          className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
            selectedCategory === category.name
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{category.name}</span>
            <span className="text-sm">{category.count}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
