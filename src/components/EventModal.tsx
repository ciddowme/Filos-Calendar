import React, { useState, useEffect } from 'react';
import type { EventFormData, EventType, CalendarEvent, RecurrenceType, ReminderType, CrmType } from '../types/event';
import RecurrenceActionPopup, { type RecurrenceAction } from './RecurrenceActionPopup';
import ConfirmationModal from './ConfirmationModal';
import { getDefaultEndDate } from '../utils/recurrence';
import { mockDeals, mockContacts, mockAssignees } from '../data/mockData';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: EventFormData, action?: RecurrenceAction, seriesId?: string) => void;
  initialDate?: string;
  initialTime?: string;
  editingEvent?: CalendarEvent;
  onDelete?: (id: string, action?: RecurrenceAction, seriesId?: string) => void;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDate,
  initialTime,
  editingEvent,
  onDelete,
}) => {
  const getInitialFormData = (): EventFormData => {
    if (editingEvent) {
      return {
        title: editingEvent.title,
        type: editingEvent.type,
        date: editingEvent.date,
        startTime: editingEvent.startTime,
        duration: editingEvent.duration,
        description: editingEvent.description || '',
        isRecurring: editingEvent.isRecurring || false,
        recurrenceType: editingEvent.recurrenceType,
        recurrenceEndDate: editingEvent.recurrenceEndDate,
        reminder: editingEvent.reminder || 'none',
        crmType: editingEvent.crmType || null,
        crmEntityId: editingEvent.crmEntityId || null,
        crmEntityName: editingEvent.crmEntityName || null,
        assigneeId: editingEvent.assigneeId || 1,
        assigneeName: editingEvent.assigneeName || 'Я',
        isCompleted: editingEvent.isCompleted || false,
      };
    }
    return {
      title: '',
      type: 'meeting' as EventType,
      date: initialDate || new Date().toISOString().split('T')[0],
      startTime: initialTime || '09:00',
      duration: 30,
      description: '',
      isRecurring: false,
      reminder: 'none',
      crmType: null,
      crmEntityId: null,
      crmEntityName: null,
      assigneeId: 1,
      assigneeName: 'Я',
      isCompleted: false,
    };
  };

  const [formData, setFormData] = useState<EventFormData>(getInitialFormData());
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(0);
  const [showRecurrencePopup, setShowRecurrencePopup] = useState(false);
  const [pendingAction, setPendingAction] = useState<'save' | 'delete' | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initialData = getInitialFormData();
      setFormData(initialData);

      // Проверяем, является ли длительность кастомной
      const predefinedDurations = [15, 30, 60, 120];
      const isCustom = !predefinedDurations.includes(initialData.duration);
      setIsCustomDuration(isCustom);

      if (isCustom) {
        setCustomHours(Math.floor(initialData.duration / 60));
        setCustomMinutes(initialData.duration % 60);
      } else {
        setCustomHours(0);
        setCustomMinutes(0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialDate, initialTime, editingEvent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      // Check if editing a recurring event
      if (editingEvent?.isRecurring && editingEvent.seriesId) {
        setPendingAction('save');
        setShowRecurrencePopup(true);
      } else {
        onSave(formData);
        handleClose();
      }
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      type: 'meeting',
      date: initialDate || new Date().toISOString().split('T')[0],
      startTime: initialTime || '09:00',
      duration: 30,
      description: '',
      isRecurring: false,
      reminder: 'none',
      crmType: null,
      crmEntityId: null,
      crmEntityName: null,
      assigneeId: 1,
      assigneeName: 'Я',
      isCompleted: false,
    });
    setIsCustomDuration(false);
    setCustomHours(0);
    setCustomMinutes(0);
    setShowRecurrencePopup(false);
    setPendingAction(null);
    setShowDeleteConfirmation(false);
    onClose();
  };

  const handleCrmTypeChange = (value: string) => {
    if (value === 'none') {
      setFormData({
        ...formData,
        crmType: null,
        crmEntityId: null,
        crmEntityName: null,
      });
    } else {
      setFormData({
        ...formData,
        crmType: value as CrmType,
        crmEntityId: null,
        crmEntityName: null,
      });
    }
  };

  const handleCrmEntityChange = (entityId: number) => {
    let entityName = '';
    if (formData.crmType === 'deal') {
      const deal = mockDeals.find(d => d.id === entityId);
      entityName = deal?.name || '';
    } else if (formData.crmType === 'contact') {
      const contact = mockContacts.find(c => c.id === entityId);
      entityName = contact?.name || '';
    }
    setFormData({
      ...formData,
      crmEntityId: entityId,
      crmEntityName: entityName,
    });
  };

  const handleAssigneeChange = (assigneeId: number) => {
    const assignee = mockAssignees.find(a => a.id === assigneeId);
    setFormData({
      ...formData,
      assigneeId,
      assigneeName: assignee?.name || '',
    });
  };

  const handleDurationChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomDuration(true);
      // Если пользователь выбрал "Свое время", устанавливаем значение по умолчанию
      const defaultHours = 1;
      const defaultMinutes = 0;
      setCustomHours(defaultHours);
      setCustomMinutes(defaultMinutes);
      setFormData({ ...formData, duration: defaultHours * 60 + defaultMinutes });
    } else {
      setIsCustomDuration(false);
      setFormData({ ...formData, duration: Number(value) });
    }
  };

  const handleCustomTimeChange = (hours: number, minutes: number) => {
    setCustomHours(hours);
    setCustomMinutes(minutes);
    const totalMinutes = hours * 60 + minutes;
    setFormData({ ...formData, duration: totalMinutes });
  };

  const handleConfirmDelete = () => {
    if (editingEvent && onDelete) {
      onDelete(editingEvent.id);
      setShowDeleteConfirmation(false);
      handleClose();
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const handleDelete = () => {
    if (editingEvent && onDelete) {
      // Check if it's a recurring event
      if (editingEvent.isRecurring && editingEvent.seriesId) {
        setPendingAction('delete');
        setShowRecurrencePopup(true);
      } else {
        setShowDeleteConfirmation(true);
      }
    }
  };

  const handleRecurrenceAction = (action: RecurrenceAction) => {
    if (pendingAction === 'save' && editingEvent) {
      onSave(formData, action, editingEvent.seriesId);
      handleClose();
    } else if (pendingAction === 'delete' && editingEvent) {
      onDelete?.(editingEvent.id, action, editingEvent.seriesId);
      handleClose();
    }
  };

  const handleRecurringToggle = (checked: boolean) => {
    if (checked) {
      const endDate = getDefaultEndDate(formData.date);
      setFormData({
        ...formData,
        isRecurring: true,
        recurrenceType: 'daily',
        recurrenceEndDate: endDate,
      });
    } else {
      setFormData({
        ...formData,
        isRecurring: false,
        recurrenceType: undefined,
        recurrenceEndDate: undefined,
      });
    }
  };

  if (!isOpen) return null;

  const isFormValid = formData.title.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 overflow-hidden animate-slideUp h-[600px] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex flex-col h-full">
            <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-normal text-gray-900">
                  {editingEvent ? 'Редактировать событие' : 'Новое событие'}
                </h2>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-6 py-6 space-y-6 flex-1 overflow-y-auto">
              <div>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Добавить название"
                  className="w-full text-2xl font-normal text-gray-900 border-0 border-b-2 border-transparent focus:border-filos-blue focus:outline-none placeholder-gray-400 pb-2"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Тип события
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="meeting"
                      checked={formData.type === 'meeting'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                      className="w-4 h-4 text-filos-blue focus:ring-filos-blue cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-700">Встреча</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="task"
                      checked={formData.type === 'task'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                      className="w-4 h-4 text-filos-blue focus:ring-filos-blue cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-700">Задача</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Дата
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-filos-blue focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Время начала
                  </label>
                  <input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-filos-blue focus:border-transparent"
                  />
                </div>
              </div>

              {formData.type === 'meeting' && (
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Длительность
                  </label>
                  <select
                    id="duration"
                    value={isCustomDuration ? 'custom' : formData.duration}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-filos-blue focus:border-transparent bg-white"
                  >
                    <option value={15}>15 минут</option>
                    <option value={30}>30 минут</option>
                    <option value={60}>1 час</option>
                    <option value={120}>2 часа</option>
                    <option value="custom">Свое время</option>
                  </select>

                  {isCustomDuration && (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="customHours" className="block text-xs font-medium text-gray-600 mb-1">
                          Часы
                        </label>
                        <input
                          id="customHours"
                          type="number"
                          min="0"
                          max="23"
                          value={customHours}
                          onChange={(e) => handleCustomTimeChange(Number(e.target.value), customMinutes)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-filos-blue focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="customMinutes" className="block text-xs font-medium text-gray-600 mb-1">
                          Минуты
                        </label>
                        <input
                          id="customMinutes"
                          type="number"
                          min="0"
                          max="59"
                          value={customMinutes}
                          onChange={(e) => handleCustomTimeChange(customHours, Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-filos-blue focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Описание
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Добавить описание"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-filos-blue focus:border-transparent placeholder-gray-400 resize-none"
                />
              </div>

              <div>
                <label htmlFor="crmType" className="block text-sm font-medium text-gray-700 mb-2">
                  Привязать к
                </label>
                <select
                  id="crmType"
                  value={formData.crmType || 'none'}
                  onChange={(e) => handleCrmTypeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-filos-blue focus:border-transparent bg-white"
                >
                  <option value="none">Не привязывать</option>
                  <option value="deal">Сделка</option>
                  <option value="contact">Контакт</option>
                </select>
              </div>

              {formData.crmType && (
                <div>
                  <label htmlFor="crmEntity" className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.crmType === 'deal' ? 'Выберите сделку' : 'Выберите контакт'}
                  </label>
                  <select
                    id="crmEntity"
                    value={formData.crmEntityId || ''}
                    onChange={(e) => handleCrmEntityChange(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-filos-blue focus:border-transparent bg-white"
                  >
                    <option value="">Выберите...</option>
                    {formData.crmType === 'deal'
                      ? mockDeals.map((deal) => (
                          <option key={deal.id} value={deal.id}>
                            {deal.name}
                          </option>
                        ))
                      : mockContacts.map((contact) => (
                          <option key={contact.id} value={contact.id}>
                            {contact.name}
                          </option>
                        ))}
                  </select>
                </div>
              )}

              {formData.type === 'task' && (
                <div>
                  <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-2">
                    Исполнитель
                  </label>
                  <select
                    id="assignee"
                    value={formData.assigneeId}
                    onChange={(e) => handleAssigneeChange(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-filos-blue focus:border-transparent bg-white"
                  >
                    {mockAssignees.map((assignee) => (
                      <option key={assignee.id} value={assignee.id}>
                        {assignee.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="reminder" className="block text-sm font-medium text-gray-700 mb-2">
                  Напоминание
                </label>
                <select
                  id="reminder"
                  value={formData.reminder || 'none'}
                  onChange={(e) => setFormData({ ...formData, reminder: e.target.value as ReminderType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-filos-blue focus:border-transparent bg-white"
                >
                  <option value="none">Без напоминания</option>
                  <option value="10min">За 10 минут</option>
                  <option value="1hour">За 1 час</option>
                  <option value="1day">За 1 день</option>
                </select>
              </div>

              <div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring || false}
                    onChange={(e) => handleRecurringToggle(e.target.checked)}
                    disabled={!!editingEvent}
                    className="w-4 h-4 text-filos-blue focus:ring-filos-blue cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Повторяющееся событие
                  </span>
                </label>
              </div>

              {formData.isRecurring && (
                <>
                  <div>
                    <label htmlFor="recurrenceType" className="block text-sm font-medium text-gray-700 mb-2">
                      Повторять
                    </label>
                    <select
                      id="recurrenceType"
                      value={formData.recurrenceType || 'daily'}
                      onChange={(e) => setFormData({ ...formData, recurrenceType: e.target.value as RecurrenceType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-filos-blue focus:border-transparent bg-white"
                    >
                      <option value="daily">Ежедневно</option>
                      <option value="weekly">Еженедельно</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="recurrenceEndDate" className="block text-sm font-medium text-gray-700 mb-2">
                      До какой даты
                    </label>
                    <input
                      id="recurrenceEndDate"
                      type="date"
                      value={formData.recurrenceEndDate || ''}
                      min={formData.date}
                      onChange={(e) => setFormData({ ...formData, recurrenceEndDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-filos-blue focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between flex-shrink-0">
              <div>
                {editingEvent && onDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                  >
                    Удалить
                  </button>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`px-6 py-2 text-sm font-medium text-white rounded transition-colors ${
                    isFormValid
                      ? 'bg-filos-blue hover:bg-filos-hover'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <RecurrenceActionPopup
        isOpen={showRecurrencePopup}
        onClose={() => setShowRecurrencePopup(false)}
        onSelect={handleRecurrenceAction}
        actionType={pendingAction === 'delete' ? 'delete' : 'edit'}
      />
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        title="Удалить событие"
        message="Вы уверены, что хотите удалить это событие?"
        confirmText="Удалить"
        cancelText="Отмена"
        confirmButtonStyle="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default EventModal;
