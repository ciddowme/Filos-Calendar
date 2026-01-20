import React from 'react';
import ViewModeSwitcher from './ViewModeSwitcher';
import type { ViewMode } from '../types/viewMode';

interface HeaderProps {
  selectedDate: Date;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onPreviousDay,
  onNextDay,
  onToday,
  viewMode,
  onViewModeChange,
}) => {
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday as first day
    d.setDate(d.getDate() + diff);
    return d;
  };

  const getWeekEnd = (date: Date): Date => {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
  };

  const formatDate = (date: Date): string => {
    if (viewMode === 'week') {
      const weekStart = getWeekStart(date);
      const weekEnd = getWeekEnd(date);

      const startDay = weekStart.getDate();
      const endDay = weekEnd.getDate();
      const startMonth = weekStart.toLocaleDateString('ru-RU', { month: 'long' });
      const endMonth = weekEnd.toLocaleDateString('ru-RU', { month: 'long' });
      const year = weekStart.getFullYear();

      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${startDay} – ${endDay} ${startMonth} ${year}`;
      } else {
        return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${year}`;
      }
    } else {
      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      };
      return date.toLocaleDateString('ru-RU', options);
    }
  };

  return (
    <header className="flex items-center px-6 py-2 border-b border-filos-light/30 h-16 bg-gradient-to-r from-white to-filos-lighter/5">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Filos Logo"
              className="h-12 w-auto"
            />
          </div>
          <h1 className="text-xl text-black font-medium">Календарь</h1>
        </div>

        <button
          onClick={onToday}
          className="px-4 py-2 text-sm font-medium text-white bg-filos-blue border border-filos-blue rounded hover:bg-filos-hover transition-colors shadow-sm"
        >
          Сегодня
        </button>

        <ViewModeSwitcher currentMode={viewMode} onModeChange={onViewModeChange} />

        <div className="flex items-center space-x-2">
          <button
            onClick={onPreviousDay}
            className="p-2 text-black hover:bg-filos-lighter/20 rounded-full transition-colors"
            aria-label="Previous day"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <button
            onClick={onNextDay}
            className="p-2 text-black hover:bg-filos-lighter/20 rounded-full transition-colors"
            aria-label="Next day"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="ml-6 text-xl text-black font-medium">{formatDate(selectedDate)}</div>
    </header>
  );
};

export default Header;
