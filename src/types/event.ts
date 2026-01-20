export type EventType = 'meeting' | 'task';

export type RecurrenceType = 'daily' | 'weekly';

export type ReminderType = 'none' | '10min' | '1hour' | '1day';

export type CrmType = 'deal' | 'contact';

export type CalendarEvent = {
  id: string;
  title: string;
  type: EventType;
  date: string;
  startTime: string;
  duration: number;
  description?: string;
  isRecurring?: boolean;
  seriesId?: string;
  recurrenceType?: RecurrenceType;
  recurrenceEndDate?: string;
  reminder?: ReminderType;
  crmType?: CrmType | null;
  crmEntityId?: number | null;
  crmEntityName?: string | null;
  assigneeId?: number;
  assigneeName?: string;
  isCompleted?: boolean;
  userId: number; // ID календаря пользователя
};

export type EventFormData = {
  title: string;
  type: EventType;
  date: string;
  startTime: string;
  duration: number;
  description: string;
  isRecurring?: boolean;
  recurrenceType?: RecurrenceType;
  recurrenceEndDate?: string;
  reminder?: ReminderType;
  crmType?: CrmType | null;
  crmEntityId?: number | null;
  crmEntityName?: string | null;
  assigneeId?: number;
  assigneeName?: string;
  isCompleted?: boolean;
};
