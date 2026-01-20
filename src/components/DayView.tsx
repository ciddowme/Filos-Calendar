import React, { useState, useEffect, useRef } from 'react';
import type { CalendarEvent } from '../types/event';
import type { Calendar } from '../types/calendar';
import EventCard from './EventCard';
import { calculateEventPositions } from '../utils/eventLayout';
import { formatDateToString } from '../utils/dateUtils';

interface DayViewProps {
  selectedDate: Date;
  events: CalendarEvent[];
  calendars?: Calendar[];
  onTimeSlotClick: (time: string) => void;
  onEventClick: (event: CalendarEvent) => void;
  onToggleComplete?: (eventId: string) => void;
  onCrmEntityClick?: (event: CalendarEvent) => void;
  onEventDrop?: (eventId: string, newDate: string, newTime: string) => void;
}

const DayView: React.FC<DayViewProps> = ({
  selectedDate,
  events,
  calendars,
  onTimeSlotClick,
  onEventClick,
  onToggleComplete,
  onCrmEntityClick,
  onEventDrop
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const HOUR_HEIGHT = 60; // pixels

  // Get event color from calendar
  const getEventColor = (event: CalendarEvent): string | undefined => {
    if (!calendars) return undefined;
    const calendar = calendars.find(cal => cal.userId === event.userId);
    return calendar?.color;
  };
  const [currentTime, setCurrentTime] = useState(new Date());
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [ghostPosition, setGhostPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggedEventSize, setDraggedEventSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [dragStartPosition, setDragStartPosition] = useState<{ x: number; y: number } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to 8:00 AM on mount or when date changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollTo = 8 * HOUR_HEIGHT; // 8:00 AM
      scrollContainerRef.current.scrollTop = scrollTo;
    }
  }, [selectedDate]);

  const formatHour = (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const formatDayName = (date: Date): string => {
    return date.toLocaleDateString('ru-RU', { weekday: 'short' }).toUpperCase();
  };

  const getDayNumber = (date: Date): number => {
    return date.getDate();
  };

  const getCurrentTimePosition = (): number | null => {
    const now = currentTime;
    const hours = now.getHours();
    const minutes = now.getMinutes();

    return hours * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
  };

  const isToday = (date: Date): boolean => {
    const today = currentTime;
    return date.toDateString() === today.toDateString();
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

  const handleTimeSlotClick = (hour: number, minutes: number) => {
    const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    onTimeSlotClick(timeString);
  };

  const handleDragStart = (event: CalendarEvent, mouseEvent?: React.MouseEvent) => {
    setDraggedEvent(event);

    if (mouseEvent) {
      const target = mouseEvent.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();

      // Store the size of the event being dragged
      setDraggedEventSize({
        width: rect.width,
        height: rect.height,
      });

      // Calculate offset from top-left corner of element
      const offset = {
        x: mouseEvent.clientX - rect.left,
        y: mouseEvent.clientY - rect.top,
      };
      setDragOffset(offset);
      setGhostPosition({ x: mouseEvent.clientX, y: mouseEvent.clientY });
      setDragStartPosition({ x: mouseEvent.clientX, y: mouseEvent.clientY });
    }
  };

  // Handle mouse move for custom drag
  useEffect(() => {
    if (!draggedEvent) return;

    const handleMouseMove = (e: MouseEvent) => {
      setGhostPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (draggedEvent && scrollContainerRef.current && onEventDrop) {
        // Check if mouse actually moved significantly (more than 10 pixels)
        if (dragStartPosition) {
          const deltaX = Math.abs(e.clientX - dragStartPosition.x);
          const deltaY = Math.abs(e.clientY - dragStartPosition.y);
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          // If movement is less than 10px, treat as a click, not a drag
          if (distance < 10) {
            setDraggedEvent(null);
            setGhostPosition(null);
            setDragStartPosition(null);
            return;
          }
        }

        const scrollRect = scrollContainerRef.current.getBoundingClientRect();
        const scrollTop = scrollContainerRef.current.scrollTop;

        // Calculate Y position relative to the time grid (accounting for scroll)
        const relativeY = e.clientY - scrollRect.top + scrollTop;

        // Calculate hour and position within the hour
        const totalHours = relativeY / HOUR_HEIGHT;
        const hour = Math.floor(totalHours);
        const fractionOfHour = totalHours - hour;

        // Split hour into 2 parts: 0-30 min and 30-60 min
        const minutes = fractionOfHour < 0.5 ? 0 : 30;

        if (hour >= 0 && hour < 24) {
          const newDate = formatDateToString(selectedDate);
          const newTime = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          onEventDrop(draggedEvent.id, newDate, newTime);
        }
      }

      setDraggedEvent(null);
      setGhostPosition(null);
      setDragStartPosition(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedEvent, selectedDate, onEventDrop, HOUR_HEIGHT]);

  const getEventPosition = (event: CalendarEvent): { top: number; height: number } | null => {
    const selectedDateString = formatDateToString(selectedDate);
    if (event.date !== selectedDateString) {
      return null;
    }

    const [hours, minutes] = event.startTime.split(':').map(Number);
    const top = hours * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
    const height = (event.duration / 60) * HOUR_HEIGHT - 2; // Subtract 2px gap

    return { top, height };
  };

  const dayEvents = events.filter(
    (event) => event.date === formatDateToString(selectedDate)
  );

  // Calculate positions for overlapping events
  const eventPositions = calculateEventPositions(dayEvents);
  const getEventLayout = (eventId: string) => {
    return eventPositions.find(pos => pos.eventId === eventId);
  };

  const showCurrentTimeLine = isToday(selectedDate);
  const currentTimePosition = getCurrentTimePosition();

  const isNonWorkingHour = (hour: number): boolean => {
    return hour < 8 || hour >= 17;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
      {/* Vertical Lines Layer */}
      <div className="absolute top-16 left-0 right-0 bottom-0 pointer-events-none z-20">
        <div className="grid h-full" style={{ gridTemplateColumns: '64px 1fr' }}>
          <div className="border-r border-gray-200"></div>
          <div></div>
        </div>
      </div>

      <div className="grid border-b border-gray-200 relative z-10" style={{ gridTemplateColumns: '64px 1fr' }}>
        <div className="h-16"></div>
        <div className="relative h-16">
          <div className="absolute inset-0 flex items-center justify-center">
            {isToday(selectedDate) ? (
              <div className="flex flex-col items-center gap-1">
                <div className="text-xs uppercase tracking-wide text-filos-blue font-medium">
                  {formatDayName(selectedDate)}
                </div>
                <div className="w-10 h-10 rounded-full bg-filos-blue flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{getDayNumber(selectedDate)}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  {formatDayName(selectedDate)}
                </div>
                <div className="text-sm text-gray-700">
                  {getDayNumber(selectedDate)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative">
        <div ref={gridRef}>
          {hours.map((hour) => {
            const nonWorkingHour = isNonWorkingHour(hour);
            return (
              <div key={hour} className="grid" style={{ gridTemplateColumns: '64px 1fr' }}>
                <div className="relative" style={{ height: '60px' }}>
                  <div className="absolute top-1 right-2 text-xs text-gray-500">
                    {formatHour(hour)}
                  </div>
                </div>
                <div>
                  {/* First half: 00-30 minutes */}
                  <div
                    className={`relative hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 ${nonWorkingHour ? 'bg-gray-100' : ''}`}
                    style={{ height: '30px' }}
                    onClick={() => handleTimeSlotClick(hour, 0)}
                  >
                  </div>
                  {/* Second half: 30-60 minutes */}
                  <div
                    className={`relative hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-200 ${nonWorkingHour ? 'bg-gray-100' : ''}`}
                    style={{ height: '30px' }}
                    onClick={() => handleTimeSlotClick(hour, 30)}
                  >
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Events and Current Time Line */}
        <div className="absolute top-0 pointer-events-none z-30" style={{ left: '64px', right: 0 }}>
          <div className="relative h-full w-full">
            {dayEvents.map((event) => {
              const position = getEventPosition(event);
              if (!position) return null;
              const isDragging = draggedEvent?.id === event.id;
              const layout = getEventLayout(event.id);
              return (
                <div key={event.id} className="pointer-events-auto" style={{ opacity: isDragging ? 0.3 : 1 }}>
                  <EventCard
                    event={event}
                    top={position.top}
                    height={position.height}
                    left={layout?.left}
                    width={layout?.width}
                    zIndex={layout?.zIndex}
                    color={getEventColor(event)}
                    onClick={onEventClick}
                    onToggleComplete={onToggleComplete}
                    onCrmEntityClick={onCrmEntityClick}
                    onDragStart={handleDragStart}
                  />
                </div>
              );
            })}
            {showCurrentTimeLine && currentTimePosition !== null && (
              <div
                className="absolute left-0 right-0 z-40"
                style={{ top: `${currentTimePosition}px` }}
              >
                <div className="relative flex items-center">
                  <div className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white" style={{ left: '-8px' }}></div>
                  <div className="h-0.5 bg-red-500 w-full"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ghost element for custom drag */}
      {ghostPosition && draggedEvent && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: ghostPosition.x - dragOffset.x,
            top: ghostPosition.y - dragOffset.y,
            opacity: 1,
          }}
        >
          <div
            className={`${getEventColor(draggedEvent) ? '' : draggedEvent.type === 'meeting' ? 'bg-filos-blue border-filos-dark' : 'bg-orange-400 border-orange-500'} border-l-4 rounded-md shadow-lg overflow-hidden`}
            style={{
              width: `${draggedEventSize.width}px`,
              height: `${draggedEventSize.height}px`,
              backgroundColor: getEventColor(draggedEvent) || undefined,
              borderLeftColor: getEventColor(draggedEvent) || undefined,
            }}
          >
            {draggedEvent.duration < 60 ? (
              // Компактный вид для коротких событий (меньше часа)
              <div className="px-2 py-0.5 text-white h-full flex items-center">
                <div className={`flex items-center gap-1 text-xs truncate w-full ${
                  draggedEvent.isCompleted ? 'line-through opacity-70' : ''
                }`}>
                  {draggedEvent.type === 'task' && draggedEvent.isCompleted && (
                    <span className="text-xs">✓</span>
                  )}
                  {draggedEvent.isRecurring && <span className="text-xs">🔄</span>}
                  <span className="font-medium truncate">{draggedEvent.title}</span>
                  <span className="opacity-90 flex-shrink-0">• {draggedEvent.startTime}</span>
                  {draggedEvent.crmEntityName && (
                    <>
                      <span className="opacity-90 flex-shrink-0">•</span>
                      <span className="opacity-90 truncate flex items-center gap-0.5">
                        <span>🔗</span>
                        <span>{draggedEvent.crmEntityName}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              // Стандартный вид для длинных событий
              <div className="px-2 py-1 text-white h-full flex flex-col">
                <div className={`font-medium text-sm truncate flex items-center gap-1 ${
                  draggedEvent.isCompleted ? 'line-through opacity-70' : ''
                }`}>
                  {draggedEvent.type === 'task' && draggedEvent.isCompleted && (
                    <span>✓</span>
                  )}
                  {draggedEvent.isRecurring && <span>🔄</span>}
                  <span>{draggedEvent.title}</span>
                </div>
                <div className={`text-xs opacity-90 ${draggedEvent.isCompleted ? 'line-through' : ''}`}>
                  {draggedEvent.startTime}
                  {draggedEvent.type === 'meeting' && ` • ${formatDuration(draggedEvent.duration)}`}
                </div>
                {draggedEvent.crmEntityName && (
                  <div className="text-xs opacity-90 truncate mt-1 flex items-center gap-1">
                    <span>🔗</span>
                    <span>{draggedEvent.crmEntityName}</span>
                  </div>
                )}
                {draggedEvent.description && !draggedEvent.crmEntityName && (
                  <div className={`text-xs opacity-80 truncate mt-1 ${draggedEvent.isCompleted ? 'line-through' : ''}`}>
                    {draggedEvent.description}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DayView;
