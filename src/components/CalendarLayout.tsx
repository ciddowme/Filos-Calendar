import React, { useState } from 'react';
import Header from './Header';
import RightSidebar from './RightSidebar';
import DayView from './DayView';
import WeekView from './WeekView';
import EventModal from './EventModal';
import ConfirmationModal from './ConfirmationModal';
import type { CalendarEvent, EventFormData } from '../types/event';
import type { ViewMode } from '../types/viewMode';
import type { Calendar } from '../types/calendar';
import type { RecurrenceAction } from './RecurrenceActionPopup';
import { generateSeriesId, generateRecurringEvents } from '../utils/recurrence';
import { mockCalendars, mockEvents } from '../data/mockData';
import { formatDateToString } from '../utils/dateUtils';

const CalendarLayout: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialDate, setModalInitialDate] = useState<string | undefined>();
  const [modalInitialTime, setModalInitialTime] = useState<string | undefined>();
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [calendars, setCalendars] = useState<Calendar[]>(mockCalendars);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    const daysToSubtract = viewMode === 'week' ? 7 : 1;
    newDate.setDate(newDate.getDate() - daysToSubtract);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    const daysToAdd = viewMode === 'week' ? 7 : 1;
    newDate.setDate(newDate.getDate() + daysToAdd);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setViewMode('day'); // Switch to day view when selecting from mini calendar
  };

  const handleToggleCalendarVisibility = (calendarId: number) => {
    setCalendars(calendars.map(cal =>
      cal.id === calendarId ? { ...cal, visible: !cal.visible } : cal
    ));
  };

  // Filter events by visible calendars
  const visibleEvents = events.filter(event => {
    const calendar = calendars.find(cal => cal.userId === event.userId);
    return calendar?.visible ?? true;
  });

  const handleOpenModal = (date?: string, time?: string, event?: CalendarEvent) => {
    if (event) {
      setEditingEvent(event);
    } else {
      setModalInitialDate(date);
      setModalInitialTime(time);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalInitialDate(undefined);
    setModalInitialTime(undefined);
    setEditingEvent(undefined);
  };

  const checkTimeConflict = (date: string, time: string, duration: number = 60, excludeEventId?: string): boolean => {
    const [hours, minutes] = time.split(':').map(Number);
    const newEventStartMinutes = hours * 60 + minutes;
    const newEventEndMinutes = newEventStartMinutes + duration;

    return visibleEvents.some(event => {
      if (event.id === excludeEventId) return false;
      if (event.date !== date) return false;

      const [eventHours, eventMinutes] = event.startTime.split(':').map(Number);
      const eventStartMinutes = eventHours * 60 + eventMinutes;
      const eventEndMinutes = eventStartMinutes + event.duration;

      // Two intervals overlap if: start1 < end2 AND end1 > start2
      return newEventStartMinutes < eventEndMinutes && newEventEndMinutes > eventStartMinutes;
    });
  };

  const executeEventCreation = (formData: EventFormData) => {
    // Create new event
    if (formData.isRecurring && formData.recurrenceType && formData.recurrenceEndDate) {
      // Create recurring events series
      const newSeriesId = generateSeriesId();
      const recurringEvents = generateRecurringEvents(formData, newSeriesId);
      setEvents([...events, ...recurringEvents]);
    } else {
      // Create single event
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: formData.title,
        type: formData.type,
        date: formData.date,
        startTime: formData.startTime,
        duration: formData.type === 'meeting' ? formData.duration : 60,
        description: formData.description,
        reminder: formData.reminder,
        crmType: formData.crmType,
        crmEntityId: formData.crmEntityId,
        crmEntityName: formData.crmEntityName,
        assigneeId: formData.assigneeId,
        assigneeName: formData.assigneeName,
        isCompleted: formData.isCompleted,
        userId: 1, // Автоматически присваиваем "Мой календарь"
      };
      setEvents([...events, newEvent]);
    }
  };

  const handleSaveEvent = (formData: EventFormData, action?: RecurrenceAction, seriesId?: string) => {
    // Check for time conflict when creating new event
    if (!editingEvent) {
      const duration = formData.type === 'meeting' ? formData.duration : 60;
      const hasConflict = checkTimeConflict(formData.date, formData.startTime, duration);
      if (hasConflict) {
        setConfirmationModal({
          isOpen: true,
          title: 'Конфликт времени',
          message: 'На это время уже есть событие. Создать?',
          onConfirm: () => {
            executeEventCreation(formData);
            setConfirmationModal(null);
          }
        });
        return;
      }
      executeEventCreation(formData);
      return;
    }

    // Update existing event
    if (action === 'series' && seriesId) {
      // Update all events in the series
      const updatedEvents = events.map(event => {
        if (event.seriesId === seriesId) {
          return {
            ...event,
            title: formData.title,
            type: formData.type,
            startTime: formData.startTime,
            duration: formData.type === 'meeting' ? formData.duration : 60,
            description: formData.description,
            reminder: formData.reminder,
            crmType: formData.crmType,
            crmEntityId: formData.crmEntityId,
            crmEntityName: formData.crmEntityName,
            assigneeId: formData.assigneeId,
            assigneeName: formData.assigneeName,
            isCompleted: formData.isCompleted,
          };
        }
        return event;
      });
      setEvents(updatedEvents);
    } else {
      // Update single event - detach from series if it was recurring
      const updatedEvent: CalendarEvent = {
        ...editingEvent,
        title: formData.title,
        type: formData.type,
        date: formData.date,
        startTime: formData.startTime,
        duration: formData.type === 'meeting' ? formData.duration : 60,
        description: formData.description,
        reminder: formData.reminder,
        isRecurring: false,
        seriesId: undefined,
        recurrenceType: undefined,
        recurrenceEndDate: undefined,
        crmType: formData.crmType,
        crmEntityId: formData.crmEntityId,
        crmEntityName: formData.crmEntityName,
        assigneeId: formData.assigneeId,
        assigneeName: formData.assigneeName,
        isCompleted: formData.isCompleted,
      };
      setEvents(events.map(event => event.id === editingEvent.id ? updatedEvent : event));
    }
  };

  const handleDeleteEvent = (id: string, action?: RecurrenceAction, seriesId?: string) => {
    if (action === 'series' && seriesId) {
      // Delete all events in the series
      setEvents(events.filter(event => event.seriesId !== seriesId));
    } else {
      // Delete single event
      setEvents(events.filter(event => event.id !== id));
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    handleOpenModal(undefined, undefined, event);
  };

  const handleToggleComplete = (eventId: string) => {
    setEvents(events.map(event =>
      event.id === eventId
        ? { ...event, isCompleted: !event.isCompleted }
        : event
    ));
  };

  const handleCrmEntityClick = (event: CalendarEvent) => {
    if (event.crmEntityName) {
      alert(`Переход в карточку: ${event.crmEntityName}`);
    }
  };

  const executeEventDrop = (eventId: string, newDate: string, newTime: string) => {
    setEvents(events.map(event =>
      event.id === eventId
        ? { ...event, date: newDate, startTime: newTime }
        : event
    ));
  };

  const handleEventDrop = (eventId: string, newDate: string, newTime: string) => {
    const draggedEvent = events.find(event => event.id === eventId);
    const duration = draggedEvent?.duration || 60;
    const hasConflict = checkTimeConflict(newDate, newTime, duration, eventId);

    if (hasConflict) {
      setConfirmationModal({
        isOpen: true,
        title: 'Конфликт времени',
        message: 'На это время уже есть событие. Переместить?',
        onConfirm: () => {
          executeEventDrop(eventId, newDate, newTime);
          setConfirmationModal(null);
        }
      });
      return;
    }

    executeEventDrop(eventId, newDate, newTime);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <Header
        selectedDate={selectedDate}
        onPreviousDay={handlePreviousDay}
        onNextDay={handleNextDay}
        onToday={handleToday}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <div className="flex flex-1 overflow-hidden">
        {viewMode === 'day' ? (
          <DayView
            selectedDate={selectedDate}
            events={visibleEvents}
            calendars={calendars}
            onTimeSlotClick={(time) => handleOpenModal(formatDateToString(selectedDate), time)}
            onEventClick={handleEventClick}
            onToggleComplete={handleToggleComplete}
            onCrmEntityClick={handleCrmEntityClick}
            onEventDrop={handleEventDrop}
          />
        ) : (
          <WeekView
            selectedDate={selectedDate}
            events={visibleEvents}
            calendars={calendars}
            onTimeSlotClick={(date, time) => handleOpenModal(date, time)}
            onEventClick={handleEventClick}
            onToggleComplete={handleToggleComplete}
            onCrmEntityClick={handleCrmEntityClick}
            onEventDrop={handleEventDrop}
          />
        )}
        <RightSidebar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onCreateClick={() => handleOpenModal(formatDateToString(selectedDate))}
          calendars={calendars}
          onToggleCalendarVisibility={handleToggleCalendarVisibility}
        />
      </div>
      <EventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        initialDate={modalInitialDate}
        initialTime={modalInitialTime}
        editingEvent={editingEvent}
        onDelete={handleDeleteEvent}
      />
      {confirmationModal && (
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          title={confirmationModal.title}
          message={confirmationModal.message}
          onConfirm={confirmationModal.onConfirm}
          onCancel={() => setConfirmationModal(null)}
        />
      )}
    </div>
  );
};

export default CalendarLayout;
