import type { Calendar } from '../types/calendar';
import type { CalendarEvent } from '../types/event';

export interface CrmDeal {
  id: number;
  name: string;
}

export interface CrmContact {
  id: number;
  name: string;
}

export interface Assignee {
  id: number;
  name: string;
}

export const mockDeals: CrmDeal[] = [
  { id: 1, name: 'Сделка с ООО "Восток"' },
  { id: 2, name: 'Поставка химволокна' },
];

export const mockContacts: CrmContact[] = [
  { id: 1, name: 'Иванов Иван' },
  { id: 2, name: 'Петров Петр' },
];

export const mockAssignees: Assignee[] = [
  { id: 1, name: 'Я' },
  { id: 2, name: 'Анна Смирнова' },
  { id: 3, name: 'Олег Козлов' },
];

export const mockCalendars: Calendar[] = [
  { id: 1, name: 'Мой календарь', userId: 1, color: '#4285f4', isOwn: true, visible: true },
  { id: 2, name: 'Анна Смирнова', userId: 2, color: '#0b8043', isOwn: false, visible: true },
  { id: 3, name: 'Олег Козлов', userId: 3, color: '#e67c73', isOwn: false, visible: false },
  { id: 4, name: 'Мария Иванова', userId: 4, color: '#f4b400', isOwn: false, visible: true },
];

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const getYesterdayDate = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

export const mockEvents: CalendarEvent[] = [
  // События для "Мой календарь" (userId: 1)
  {
    id: 'event-1-1',
    title: 'Встреча с клиентом',
    type: 'meeting',
    date: getTodayDate(),
    startTime: '10:00',
    duration: 60,
    description: 'Обсуждение нового проекта',
    userId: 1,
    crmType: 'deal',
    crmEntityId: 1,
    crmEntityName: 'Сделка с ООО "Восток"',
  },
  {
    id: 'event-1-2',
    title: 'Подготовка отчета',
    type: 'task',
    date: getTodayDate(),
    startTime: '14:00',
    duration: 60,
    description: 'Квартальный отчет',
    userId: 1,
    isCompleted: false,
  },
  {
    id: 'event-1-3',
    title: 'Планерка',
    type: 'meeting',
    date: getTomorrowDate(),
    startTime: '09:00',
    duration: 30,
    userId: 1,
  },

  // События для Анны Смирновой (userId: 2)
  {
    id: 'event-2-1',
    title: 'Звонок с заказчиком',
    type: 'meeting',
    date: getTodayDate(),
    startTime: '11:00',
    duration: 45,
    description: 'Уточнение требований',
    userId: 2,
    crmType: 'contact',
    crmEntityId: 1,
    crmEntityName: 'Иванов Иван',
  },
  {
    id: 'event-2-2',
    title: 'Код-ревью',
    type: 'task',
    date: getTodayDate(),
    startTime: '15:00',
    duration: 60,
    userId: 2,
    isCompleted: true,
  },
  {
    id: 'event-2-3',
    title: 'Презентация проекта',
    type: 'meeting',
    date: getTomorrowDate(),
    startTime: '13:00',
    duration: 90,
    userId: 2,
  },

  // События для Олега Козлова (userId: 3)
  {
    id: 'event-3-1',
    title: 'Разработка фичи',
    type: 'task',
    date: getYesterdayDate(),
    startTime: '10:00',
    duration: 120,
    description: 'Новый модуль аналитики',
    userId: 3,
    isCompleted: true,
  },
  {
    id: 'event-3-2',
    title: 'Встреча с командой',
    type: 'meeting',
    date: getTodayDate(),
    startTime: '12:00',
    duration: 60,
    userId: 3,
  },
  {
    id: 'event-3-3',
    title: 'Тестирование',
    type: 'task',
    date: getTodayDate(),
    startTime: '16:00',
    duration: 90,
    userId: 3,
    isCompleted: false,
  },

  // События для Марии Ивановой (userId: 4)
  {
    id: 'event-4-1',
    title: 'Обучение новичков',
    type: 'meeting',
    date: getTodayDate(),
    startTime: '10:30',
    duration: 90,
    description: 'Вводный курс',
    userId: 4,
  },
  {
    id: 'event-4-2',
    title: 'Проверка документации',
    type: 'task',
    date: getTodayDate(),
    startTime: '14:30',
    duration: 60,
    userId: 4,
    isCompleted: false,
  },
  {
    id: 'event-4-3',
    title: 'Переговоры',
    type: 'meeting',
    date: getTomorrowDate(),
    startTime: '11:00',
    duration: 60,
    description: 'Обсуждение бюджета',
    userId: 4,
    crmType: 'deal',
    crmEntityId: 2,
    crmEntityName: 'Поставка химволокна',
  },
];
