import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import type { BlogCategory } from '../../utils/types';

interface MultiSelectDropdownProps {
  categories: BlogCategory[];
  selectedCategories: BlogCategory[];
  onToggleCategory: (category: BlogCategory) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  categories,
  selectedCategories,
  onToggleCategory,
  disabled = false,
  placeholder = 'Wybierz kategorie...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleRemoveCategory = (e: React.MouseEvent, category: BlogCategory) => {
    e.stopPropagation();
    onToggleCategory(category);
  };

  const isSelected = (category: BlogCategory) => {
    return selectedCategories.some(c => c.id === category.id);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Wybierz kategorie"
        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between ${
          isOpen ? 'ring-2 ring-primary-500' : ''
        }`}
      >
        <div className="flex-1 flex flex-wrap gap-1 items-center min-h-[24px]">
          {selectedCategories.length === 0 ? (
            <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
          ) : (
            selectedCategories.map((category) => (
              <span
                key={category.id}
                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-200"
              >
                <span>{category.name}</span>
                <button
                  type="button"
                  onClick={(e) => handleRemoveCategory(e, category)}
                  className="hover:text-primary-900 dark:hover:text-primary-100"
                  disabled={disabled}
                  aria-label={`Usuń ${category.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          role="listbox"
          aria-label="Lista kategorii"
          className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {categories.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
              Brak dostępnych kategorii
            </div>
          ) : (
            <div className="py-1">
              {categories.map((category) => {
                const selected = isSelected(category);
                return (
                  <button
                    key={category.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    aria-label={`${category.name} (${category.slug})`}
                    onClick={() => {
                      onToggleCategory(category);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {category.slug}
                      </div>
                    </div>
                    {selected && (
                      <Check className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
