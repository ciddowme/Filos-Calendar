import React from 'react';
import type { CalendarEvent } from '../types/event';

interface EventCardProps {
  event: CalendarEvent;
  top: number;
  height: number;
  color?: string;
  left?: number; // percentage (0-100)
  width?: number; // percentage (0-100)
  zIndex?: number;
  onClick?: (event: CalendarEvent) => void;
  onToggleComplete?: (eventId: string) => void;
  onCrmEntityClick?: (event: CalendarEvent) => void;
  onDragStart?: (event: CalendarEvent, mouseEvent?: React.MouseEvent) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, top, height, color, left = 0, width = 100, zIndex = 0, onClick, onToggleComplete, onCrmEntityClick, onDragStart }) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const mouseDownPos = React.useRef<{ x: number; y: number; time: number } | null>(null);

  // Use custom color or fallback to type-based colors
  const getBgColor = () => {
    if (color) return '';
    return event.type === 'meeting' ? 'bg-filos-blue' : 'bg-orange-400';
  };

  const getBorderColor = () => {
    if (color) return '';
    return event.type === 'meeting' ? 'border-filos-dark' : 'border-orange-500';
  };

  const bgColor = getBgColor();
  const borderColor = getBorderColor();

  // Check if event is short (less than 60 minutes)
  // Short events use single-line compact view to prevent text clipping
  const isShortEvent = event.duration < 60;

  // Check if event is overdue (past date/time and not completed)
  const isOverdue = () => {
    if (event.type !== 'task' || event.isCompleted) return false;
    const eventDateTime = new Date(`${event.date}T${event.startTime}`);
    return eventDateTime < new Date();
  };

  const formatTime = (time: string): string => {
    return time;
  };

  const formatDuration = (duration: number): string => {
    if (duration < 60) {
      return `${duration} мин`;
    }
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (minutes === 0) {
      return `${hours} ч`;
    }
    return `${hours} ч ${minutes} мин`;
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete?.(event.id);
  };

  const handleCrmClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCrmEntityClick?.(event);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Check if this was a quick click without much movement
    if (mouseDownPos.current) {
      const timeDiff = Date.now() - mouseDownPos.current.time;
      const deltaX = Math.abs(e.clientX - mouseDownPos.current.x);
      const deltaY = Math.abs(e.clientY - mouseDownPos.current.y);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // If clicked quickly (< 200ms) and didn't move much (< 5px), treat as click to open
      if (timeDiff < 200 && distance < 5) {
        onClick?.(event);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Ignore right click and clicks on interactive elements
    if (e.button !== 0) return;

    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.closest('input')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    // Record mouse position and time for click detection
    mouseDownPos.current = { x: e.clientX, y: e.clientY, time: Date.now() };

    // Start drag immediately (as it was before)
    onDragStart?.(event, e);
  };

  return (
    <div
      ref={cardRef}
      onMouseDown={handleMouseDown}
      className={`absolute ${bgColor} ${borderColor} ${
        isOverdue() ? 'border-l-8 border-l-red-600' : 'border-l-4'
      } rounded-md shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left: `${left}%`,
        width: `${width}%`,
        zIndex,
        backgroundColor: color || undefined,
        borderLeftColor: (color && !isOverdue()) ? color : undefined,
      }}
      onClick={handleCardClick}
    >
      {isShortEvent ? (
        // Компактный вид для коротких событий (30 минут и меньше)
        <div className="px-2 py-0.5 text-white h-full flex items-center">
          <div className={`flex items-center gap-1 text-xs truncate w-full ${
            event.isCompleted ? 'line-through opacity-70' : ''
          }`}>
            {event.type === 'task' && (
              <input
                type="checkbox"
                checked={event.isCompleted || false}
                onChange={() => {}}
                onClick={handleCheckboxClick}
                className="w-3 h-3 cursor-pointer flex-shrink-0"
              />
            )}
            {event.isRecurring && <span className="text-xs">🔄</span>}
            {event.isCompleted && <span className="text-xs">✓</span>}
            <span className="font-medium truncate">{event.title}</span>
            <span className="opacity-90 flex-shrink-0">• {formatTime(event.startTime)}</span>
            {event.crmEntityName && (
              <>
                <span className="opacity-90 flex-shrink-0">•</span>
                <span
                  className="opacity-90 truncate cursor-pointer hover:underline flex items-center gap-0.5"
                  onClick={handleCrmClick}
                >
                  <span>🔗</span>
                  <span>{event.crmEntityName}</span>
                </span>
              </>
            )}
          </div>
        </div>
      ) : (
        // Стандартный вид для событий длительностью больше 30 минут
        <div className="px-2 py-1 text-white h-full flex flex-col">
          <div className={`font-medium text-sm truncate flex items-center gap-1 ${
            event.isCompleted ? 'line-through opacity-70' : ''
          }`}>
            {event.type === 'task' && (
              <input
                type="checkbox"
                checked={event.isCompleted || false}
                onChange={() => {}}
                onClick={handleCheckboxClick}
                className="w-3.5 h-3.5 cursor-pointer flex-shrink-0"
              />
            )}
            {event.isRecurring && <span>🔄</span>}
            {event.isCompleted && <span>✓</span>}
            <span>{event.title}</span>
          </div>
          <div className={`text-xs opacity-90 ${event.isCompleted ? 'line-through' : ''}`}>
            {formatTime(event.startTime)}
            {event.type === 'meeting' && ` • ${formatDuration(event.duration)}`}
          </div>
          {event.crmEntityName && (
            <div
              className="text-xs opacity-90 truncate mt-1 flex items-center gap-1 cursor-pointer hover:underline"
              onClick={handleCrmClick}
            >
              <span>🔗</span>
              <span>{event.crmEntityName}</span>
            </div>
          )}
          {event.description && !event.crmEntityName && (
            <div className={`text-xs opacity-80 truncate mt-1 ${event.isCompleted ? 'line-through' : ''}`}>
              {event.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventCard;
