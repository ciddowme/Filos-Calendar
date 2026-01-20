import React, { useState } from 'react';
import type { Calendar } from '../types/calendar';

interface CalendarListProps {
  calendars: Calendar[];
  onToggleVisibility: (calendarId: number) => void;
}

const CalendarList: React.FC<CalendarListProps> = ({ calendars, onToggleVisibility }) => {
  const [myCalendarsExpanded, setMyCalendarsExpanded] = useState(true);
  const [otherCalendarsExpanded, setOtherCalendarsExpanded] = useState(true);

  const myCalendars = calendars.filter(cal => cal.isOwn);
  const otherCalendars = calendars.filter(cal => !cal.isOwn);

  const CalendarItem: React.FC<{ calendar: Calendar }> = ({ calendar }) => (
    <div className="flex items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer group">
      <input
        type="checkbox"
        checked={calendar.visible}
        onChange={() => onToggleVisibility(calendar.id)}
        className="mr-2 cursor-pointer"
      />
      <div
        className="w-2.5 h-2.5 rounded-full mr-2 flex-shrink-0"
        style={{ backgroundColor: calendar.color }}
      />
      <span className="text-sm text-gray-700 truncate">{calendar.name}</span>
    </div>
  );

  return (
    <div className="border-t border-gray-200 pt-4">
      {/* Мои календари */}
      <div className="mb-3">
        <button
          onClick={() => setMyCalendarsExpanded(!myCalendarsExpanded)}
          className="flex items-center w-full px-2 py-1 hover:bg-gray-100 rounded text-sm font-medium text-gray-700"
        >
          <svg
            className={`w-4 h-4 mr-1 transition-transform ${myCalendarsExpanded ? 'rotate-90' : ''}`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
          <span>Мои календари</span>
        </button>
        {myCalendarsExpanded && (
          <div className="mt-1">
            {myCalendars.map(calendar => (
              <CalendarItem key={calendar.id} calendar={calendar} />
            ))}
          </div>
        )}
      </div>

      {/* Другие календари */}
      <div>
        <button
          onClick={() => setOtherCalendarsExpanded(!otherCalendarsExpanded)}
          className="flex items-center w-full px-2 py-1 hover:bg-gray-100 rounded text-sm font-medium text-gray-700"
        >
          <svg
            className={`w-4 h-4 mr-1 transition-transform ${otherCalendarsExpanded ? 'rotate-90' : ''}`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
          <span>Другие календари</span>
        </button>
        {otherCalendarsExpanded && (
          <div className="mt-1">
            {otherCalendars.map(calendar => (
              <CalendarItem key={calendar.id} calendar={calendar} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarList;
