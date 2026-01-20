import type { CalendarEvent, EventFormData } from '../types/event';

/**
 * Generates a unique series ID using crypto.randomUUID()
 */
export function generateSeriesId(): string {
  return crypto.randomUUID();
}

/**
 * Calculates default end date (3 months from start date)
 */
export function getDefaultEndDate(startDate: string): string {
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + 3);
  return date.toISOString().split('T')[0];
}

/**
 * Generates recurring events based on form data
 * Maximum 365 events per series
 */
export function generateRecurringEvents(
  formData: EventFormData,
  seriesId: string
): CalendarEvent[] {
  if (!formData.isRecurring || !formData.recurrenceType || !formData.recurrenceEndDate) {
    return [];
  }

  const events: CalendarEvent[] = [];
  const startDate = new Date(formData.date);
  const endDate = new Date(formData.recurrenceEndDate);
  const maxEvents = 365;

  let currentDate = new Date(startDate);
  let eventIndex = 0;

  while (currentDate <= endDate && eventIndex < maxEvents) {
    const event: CalendarEvent = {
      id: `${seriesId}-${eventIndex}`,
      title: formData.title,
      type: formData.type,
      date: currentDate.toISOString().split('T')[0],
      startTime: formData.startTime,
      duration: formData.type === 'meeting' ? formData.duration : 60,
      description: formData.description,
      isRecurring: true,
      seriesId: seriesId,
      recurrenceType: formData.recurrenceType,
      recurrenceEndDate: formData.recurrenceEndDate,
      reminder: formData.reminder,
      crmType: formData.crmType,
      crmEntityId: formData.crmEntityId,
      crmEntityName: formData.crmEntityName,
      assigneeId: formData.assigneeId,
      assigneeName: formData.assigneeName,
      isCompleted: formData.isCompleted,
      userId: 1, // Автоматически присваиваем "Мой календарь"
    };

    events.push(event);
    eventIndex++;

    // Move to next date based on recurrence type
    if (formData.recurrenceType === 'daily') {
      currentDate.setDate(currentDate.getDate() + 1);
    } else if (formData.recurrenceType === 'weekly') {
      currentDate.setDate(currentDate.getDate() + 7);
    }
  }

  return events;
}

/**
 * Checks if an event is part of a recurring series
 */
export function isPartOfSeries(event: CalendarEvent): boolean {
  return event.isRecurring === true && !!event.seriesId;
}
