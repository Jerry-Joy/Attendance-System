import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Clock, ChevronDown, ChevronUp, X, Search, Check, AlertCircle } from 'lucide-react';

export interface TimeSelectProps {
  value: string; // 24h format e.g. "08:30" or "14:45"
  onChange: (value: string) => void;
  minTime?: string; // Optional minimum time in 24h "HH:mm"
  maxTime?: string; // Optional maximum time in 24h "HH:mm"
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
}

// Convert "HH:mm" to total minutes from midnight
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return 0;
  return h * 60 + m;
}

// Convert minutes to "HH:mm" 24h format
export function minutesToTimeStr(totalMinutes: number): string {
  const normalized = Math.max(0, Math.min(23 * 60 + 59, totalMinutes));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Pure parser: 24h "HH:mm" -> { hour: 1-12, minute: 0-59, period: 'AM' | 'PM' }
export function parse24hTo12h(timeStr: string): { hour: number; minute: number; period: 'AM' | 'PM' } {
  if (!timeStr || !timeStr.includes(':')) {
    return { hour: 12, minute: 0, period: 'PM' };
  }
  const [hStr, mStr] = timeStr.split(':');
  const h24 = parseInt(hStr, 10);
  const min = parseInt(mStr, 10);
  if (isNaN(h24) || isNaN(min)) {
    return { hour: 12, minute: 0, period: 'PM' };
  }
  const period: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
  const hour = h24 % 12 === 0 ? 12 : h24 % 12;
  return { hour, minute: min, period };
}

// Pure formatter: { hour: 1-12, minute: 0-59, period: 'AM' | 'PM' } -> 24h "HH:mm"
export function format12hTo24h(hour12: number, minute: number, period: 'AM' | 'PM'): string {
  let h24 = hour12 % 12;
  if (period === 'PM') h24 += 12;
  return `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

// Format 24h "HH:mm" to 12h display string e.g. "12:00 PM"
export function formatTo12Hour(timeStr: string): string {
  if (!timeStr || !timeStr.includes(':')) return '';
  const { hour, minute, period } = parse24hTo12h(timeStr);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
}

type ActiveColumn = 'hour' | 'minute' | 'period' | null;

export const TimeSelect: React.FC<TimeSelectProps> = ({
  value,
  onChange,
  minTime,
  maxTime,
  placeholder = 'Select Time',
  label,
  error,
  disabled = false,
  className = '',
  buttonClassName = '',
  size = 'md',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeColumn, setActiveColumn] = useState<ActiveColumn>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Derive current hour, minute, period directly from value
  const currentTimeObj = useMemo(() => {
    if (value) {
      return parse24hTo12h(value);
    }
    if (minTime) {
      const minMins = timeToMinutes(minTime) + 60;
      const clamped = Math.min(23 * 60 + 59, minMins);
      return parse24hTo12h(minutesToTimeStr(clamped));
    }
    return { hour: 12, minute: 0, period: 'PM' as const };
  }, [value, minTime]);

  const currentHour = currentTimeObj.hour;
  const currentMinute = currentTimeObj.minute;
  const currentPeriod = currentTimeObj.period;

  // Focus search input when a column opens
  useEffect(() => {
    if (activeColumn) {
      setSearchQuery('');
      const timer = setTimeout(() => searchInputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [activeColumn]);

  // Check if a time violates minTime
  const isTimeDisabled = useCallback(
    (time24: string): boolean => {
      const totalMins = timeToMinutes(time24);
      if (minTime && totalMins <= timeToMinutes(minTime)) {
        return true;
      }
      if (maxTime && totalMins > timeToMinutes(maxTime)) {
        return true;
      }
      return false;
    },
    [minTime, maxTime],
  );

  // Smart Collision Detection
  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;

    const popoverHeight = 320;
    if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
      setPlacement('top');
    } else {
      setPlacement('bottom');
    }
  }, []);

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

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveColumn(null);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Direct handlers for Hour, Minute, and Period selection
  const handleSelectHour = (newHour: number) => {
    const new24 = format12hTo24h(newHour, currentMinute, currentPeriod);
    onChange(new24);
    setActiveColumn('minute'); // Smoothly advance to minute selection
  };

  const handleSelectMinute = (newMin: number) => {
    const new24 = format12hTo24h(currentHour, newMin, currentPeriod);
    onChange(new24);
    setActiveColumn(null); // Close active sub-dropdown
  };

  const handleSelectPeriod = (newPeriod: 'AM' | 'PM') => {
    const new24 = format12hTo24h(currentHour, currentMinute, newPeriod);
    onChange(new24);
    setActiveColumn(null);
  };

  // Quick Action: Current Time
  const handleSetCurrentTime = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const now = new Date();
    const h24 = now.getHours();
    const m = now.getMinutes();
    const new24 = `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    onChange(new24);
    setIsOpen(false);
    setActiveColumn(null);
  };

  // Generate options based on active column
  const hourOptions = useMemo(() => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    return hours
      .map((h) => ({
        value: h,
        label: String(h).padStart(2, '0'),
      }))
      .filter((opt) => opt.label.includes(searchQuery.trim()));
  }, [searchQuery]);

  const minuteOptions = useMemo(() => {
    const minutes = Array.from({ length: 60 }, (_, i) => i);
    return minutes
      .map((m) => ({
        value: m,
        label: String(m).padStart(2, '0'),
      }))
      .filter((opt) => opt.label.includes(searchQuery.trim()));
  }, [searchQuery]);

  const periodOptions = useMemo(() => {
    return (['AM', 'PM'] as const).filter((p) =>
      p.toLowerCase().includes(searchQuery.trim().toLowerCase()),
    );
  }, [searchQuery]);

  const formattedDisplay = value ? formatTo12Hour(value) : '';
  const currentPreview24 = format12hTo24h(currentHour, currentMinute, currentPeriod);
  const isCurrentInvalid = isTimeDisabled(currentPreview24);

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

      {/* Main Trigger Box */}
      <div
        id={id}
        onClick={() => {
          if (disabled) return;
          updatePosition();
          setIsOpen((prev) => !prev);
          if (isOpen) setActiveColumn(null);
        }}
        className={`w-full flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 text-slate-900 font-medium transition-all duration-200 text-left outline-none cursor-pointer hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
          isOpen ? 'border-blue-500 ring-2 ring-blue-100 bg-white shadow-sm' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''} ${
          error ? 'border-red-400 focus:ring-red-400/20' : ''
        } ${sizeClasses[size]} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
          {formattedDisplay ? (
            <span className="truncate text-slate-800 font-semibold tracking-wide font-mono text-sm">
              {formattedDisplay}
            </span>
          ) : (
            <span className="text-slate-400 font-normal truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setIsOpen(false);
                setActiveColumn(null);
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <Clock className="w-4 h-4 text-blue-500" />
        </div>
      </div>

      {/* "Select Time" Primary Card */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 sm:w-[280px] z-[100] bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/20 p-4 animate-in fade-in-0 duration-150 ${
            placement === 'top'
              ? 'bottom-full mb-2 origin-bottom zoom-in-95'
              : 'top-full mt-2 origin-top zoom-in-95'
          }`}
        >
          {/* Header Title */}
          <div className="text-center font-bold text-slate-800 text-xs mb-3.5">
            Select Time
          </div>

          {/* Alert if earlier than minTime */}
          {isCurrentInvalid && minTime && (
            <div className="flex items-center gap-1.5 p-2 mb-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[10px] font-medium leading-tight">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Must be after {formatTo12Hour(minTime)}</span>
            </div>
          )}

          {/* Row of 3 Select Pills (Hour : Minute  PM) */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {/* Hour Pill */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveColumn((prev) => (prev === 'hour' ? null : 'hour'));
              }}
              className={`flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                activeColumn === 'hour'
                  ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/40 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
              }`}
            >
              <span>{String(currentHour).padStart(2, '0')}</span>
              {activeColumn === 'hour' ? (
                <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            <span className="font-bold text-slate-400 text-sm">:</span>

            {/* Minute Pill */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveColumn((prev) => (prev === 'minute' ? null : 'minute'));
              }}
              className={`flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                activeColumn === 'minute'
                  ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/40 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
              }`}
            >
              <span>{String(currentMinute).padStart(2, '0')}</span>
              {activeColumn === 'minute' ? (
                <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* Period Pill */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveColumn((prev) => (prev === 'period' ? null : 'period'));
              }}
              className={`flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                activeColumn === 'period'
                  ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/40 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
              }`}
            >
              <span>{currentPeriod}</span>
              {activeColumn === 'period' ? (
                <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>

          {/* Secondary Sub-Dropdown Popover (when a column is active) */}
          {activeColumn && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-2 mb-3 animate-in fade-in-0 zoom-in-95 duration-100">
              {/* Search Bar */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-lg pl-8 pr-2 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Scrollable Option List */}
              <div className="max-h-40 overflow-y-auto space-y-0.5 pr-0.5">
                {activeColumn === 'hour' &&
                  (hourOptions.length === 0 ? (
                    <div className="text-center py-2 text-[11px] text-slate-400">No hours found</div>
                  ) : (
                    hourOptions.map((opt) => {
                      const isSelected = currentHour === opt.value;
                      return (
                        <div
                          key={opt.value}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSelectHour(opt.value);
                          }}
                          className={`flex items-center justify-between px-3 py-1.5 text-xs font-mono rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-50 text-blue-700 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                      );
                    })
                  ))}

                {activeColumn === 'minute' &&
                  (minuteOptions.length === 0 ? (
                    <div className="text-center py-2 text-[11px] text-slate-400">No minutes found</div>
                  ) : (
                    minuteOptions.map((opt) => {
                      const isSelected = currentMinute === opt.value;
                      return (
                        <div
                          key={opt.value}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSelectMinute(opt.value);
                          }}
                          className={`flex items-center justify-between px-3 py-1.5 text-xs font-mono rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-50 text-blue-700 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                      );
                    })
                  ))}

                {activeColumn === 'period' &&
                  periodOptions.map((p) => {
                    const isSelected = currentPeriod === p;
                    return (
                      <div
                        key={p}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSelectPeriod(p);
                        }}
                        className={`flex items-center justify-between px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{p}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <button
              type="button"
              onClick={handleSetCurrentTime}
              className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer transition-colors"
            >
              Current Time
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!value) {
                  onChange(currentPreview24);
                }
                setIsOpen(false);
                setActiveColumn(null);
              }}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  );
};
