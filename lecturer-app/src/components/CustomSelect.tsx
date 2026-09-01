import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
  badge?: string;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (SelectOption | string)[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  icon,
  size = 'md',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');
  const [maxMenuHeight, setMaxMenuHeight] = useState<number>(240);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  // Normalize options to SelectOption[]
  const normalizedOptions: SelectOption[] = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Calculate smart collision / auto-flip position
  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom - 12; // 12px margin from bottom edge/taskbar
    const spaceAbove = rect.top - 12; // 12px margin from top edge

    const desiredMenuHeight = 240;

    // If space below is not enough (< 220px) and there's more room above, flip upward!
    if (spaceBelow < 220 && spaceAbove > spaceBelow) {
      setPlacement('top');
      setMaxMenuHeight(Math.max(120, Math.min(desiredMenuHeight, spaceAbove)));
    } else {
      setPlacement('bottom');
      setMaxMenuHeight(Math.max(120, Math.min(desiredMenuHeight, spaceBelow)));
    }
  }, []);

  // Update position on open and when window scrolls/resizes
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  // Auto-scroll to selected option when opened
  useEffect(() => {
    if (isOpen && selectedItemRef.current && listRef.current) {
      selectedItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          const currentIndex = normalizedOptions.findIndex((opt) => opt.value === value);
          const nextIndex = currentIndex < normalizedOptions.length - 1 ? currentIndex + 1 : 0;
          onChange(normalizedOptions[nextIndex].value);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          const currentIndex = normalizedOptions.findIndex((opt) => opt.value === value);
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : normalizedOptions.length - 1;
          onChange(normalizedOptions[prevIndex].value);
        }
      }
    },
    [disabled, isOpen, normalizedOptions, value, onChange],
  );

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs rounded-md',
    md: 'px-3.5 py-2.5 text-sm rounded-lg',
    lg: 'px-4 py-3 text-base rounded-xl',
  };

  return (
    <div className={`relative w-full ${isOpen ? 'z-50' : 'z-10'} ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2"
        >
          {label}
        </label>
      )}

      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => {
          updatePosition();
          setIsOpen((prev) => !prev);
        }}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 text-slate-900 font-medium transition-all duration-200 text-left outline-none cursor-pointer hover:border-slate-300 focus:border-[#F5B41C] focus:ring-2 focus:ring-[#F5B41C]/25 ${
          isOpen ? 'border-[#F5B41C] ring-2 ring-[#F5B41C]/20 bg-white shadow-sm' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''} ${
          error ? 'border-red-400 focus:ring-red-400/20' : ''
        } ${sizeClasses[size]} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
          {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
          {selectedOption ? (
            <div className="flex items-center gap-2 truncate">
              {selectedOption.icon && <span className="shrink-0">{selectedOption.icon}</span>}
              <span className="truncate text-slate-800 font-medium">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-100 text-[#CAA10B] rounded-full shrink-0">
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 font-normal truncate">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#F5B41C]' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu with Smart Collision Flip */}
      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          className={`absolute left-0 right-0 z-[100] bg-white border border-slate-200 rounded-xl shadow-2xl shadow-slate-900/20 overflow-hidden overflow-y-auto py-1 animate-in fade-in-0 duration-150 ${
            placement === 'top'
              ? 'bottom-full mb-2 origin-bottom zoom-in-95'
              : 'top-full mt-2 origin-top zoom-in-95'
          } ${dropdownClassName}`}
          style={{ maxHeight: `${maxMenuHeight}px` }}
        >
          {normalizedOptions.length === 0 ? (
            <div className="px-3 py-3 text-xs text-slate-400 text-center">No options available</div>
          ) : (
            normalizedOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  ref={isSelected ? selectedItemRef : undefined}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-medium cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? 'bg-amber-50/80 text-[#081637] font-semibold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate min-w-0">
                    {option.icon && (
                      <span className={`shrink-0 ${isSelected ? 'text-[#F5B41C]' : 'text-slate-400'}`}>
                        {option.icon}
                      </span>
                    )}
                    <div className="truncate">
                      <div className="truncate">{option.label}</div>
                      {option.subLabel && (
                        <div className="text-[10px] text-slate-400 font-normal truncate">
                          {option.subLabel}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {option.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-slate-100 text-slate-600 rounded">
                        {option.badge}
                      </span>
                    )}
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#F5B41C]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {error && <p className="mt-1 text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  );
};
