import React from 'react';
import CalendarList from './CalendarList';
import type { Calendar } from '../types/calendar';

interface RightSidebarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onCreateClick: () => void;
  calendars: Calendar[];
  onToggleCalendarVisibility: (calendarId: number) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  selectedDate,
  onDateSelect,
  onCreateClick,
  calendars,
  onToggleCalendarVisibility
}) => {
  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const days: Date[] = [];

    const firstDayOfWeek = firstDay.getDay();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1));

    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const days = getDaysInMonth(selectedDate);
  const monthYear = selectedDate.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  });

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return isSameDay(date, today);
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === selectedDate.getMonth();
  };

  return (
    <div className="w-64 border-l border-gray-200 bg-white flex flex-col">
      <div className="p-4">
        <button
          onClick={onCreateClick}
          className="w-full flex items-center space-x-3 px-4 py-3 bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow"
        >
          <svg className="w-6 h-6 text-filos-blue" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">Создать</span>
        </button>
      </div>

      <div className="px-4 pb-4">
        <div className="mb-3">
          <h2 className="text-sm font-medium text-gray-900 capitalize">{monthYear}</h2>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'].map((day) => (
            <div key={day} className="text-xs text-gray-500 text-center font-medium py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDay = isToday(day);
            const isCurrentMonthDay = isCurrentMonth(day);

            return (
              <button
                key={index}
                onClick={() => onDateSelect(day)}
                className={`
                  h-8 w-8 text-xs rounded-full flex items-center justify-center
                  transition-colors
                  ${isSelected ? 'bg-filos-blue text-white font-semibold' : ''}
                  ${!isSelected && isTodayDay ? 'bg-filos-lighter/30 text-filos-blue font-semibold' : ''}
                  ${
                    !isSelected && !isTodayDay && isCurrentMonthDay
                      ? 'text-gray-900 hover:bg-gray-100'
                      : ''
                  }
                  ${!isSelected && !isTodayDay && !isCurrentMonthDay ? 'text-gray-400' : ''}
                `}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 flex-1 overflow-y-auto">
        <CalendarList
          calendars={calendars}
          onToggleVisibility={onToggleCalendarVisibility}
        />
      </div>
    </div>
  );
};

export default RightSidebar;
