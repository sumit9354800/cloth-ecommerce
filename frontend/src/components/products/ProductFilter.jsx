'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const ProductFilter = ({ filters }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const categories = searchParams.get('category');
    return categories ? categories.split(',') : [];
  });
  
  const [priceRange, setPriceRange] = useState({
    min: '',
    max: '',
  });
  
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedRating, setSelectedRating] = useState('');
  const [inStock, setInStock] = useState(false);

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (selectedCategories.length > 0) {
      params.append('category', selectedCategories.join(','));
    }
    if (priceRange.min) {
      params.append('minPrice', priceRange.min);
    }
    if (priceRange.max) {
      params.append('maxPrice', priceRange.max);
    }
    if (selectedSizes.length > 0) {
      params.append('size', selectedSizes.join(','));
    }
    if (selectedColors.length > 0) {
      params.append('color', selectedColors.join(','));
    }
    if (selectedRating) {
      params.append('rating', selectedRating);
    }
    if (inStock) {
      params.append('inStock', 'true');
    }

    router.push(`/products?${params.toString()}`);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: '', max: '' });
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedRating('');
    setInStock(false);
    router.push('/products');
  };

  // Toggle array item
  const toggleItem = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Filters
      </h3>

      {/* Category Filter */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase">
          Category
        </h4>
        <div className="space-y-2">
          {filters?.categories?.map((category) => (
            <label key={category} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => toggleItem(category, selectedCategories, setSelectedCategories)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase">
          Price Range
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
          <span className="text-gray-500">to</span>
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
      </div>

      {/* Size Filter */}
      {filters?.sizes?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase">
            Size
          </h4>
          <div className="flex flex-wrap gap-2">
            {filters.sizes.map((size) => (
              <button
                key={size}
                onClick={() => toggleItem(size, selectedSizes, setSelectedSizes)}
                className={`px-3 py-1 text-sm rounded-full border transition-all ${
                  selectedSizes.includes(size)
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Filter */}
      {filters?.colors?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase">
            Color
          </h4>
          <div className="flex flex-wrap gap-2">
            {filters.colors.map((color) => (
              <button
                key={color}
                onClick={() => toggleItem(color, selectedColors, setSelectedColors)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  selectedColors.includes(color)
                    ? 'border-primary scale-110'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                style={{ backgroundColor: color.toLowerCase() }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rating Filter */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase">
          Minimum Rating
        </h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={rating}
                checked={selectedRating === rating.toString()}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="text-primary focus:ring-primary"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300 flex items-center">
                {rating}+ 
                <span className="text-yellow-400 ml-1">★</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Stock Filter */}
      <div>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="ml-2 text-gray-700 dark:text-gray-300">
            In Stock Only
          </span>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={applyFilters}
          className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Apply Filters
        </button>
        <button
          onClick={clearFilters}
          className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default ProductFilter;