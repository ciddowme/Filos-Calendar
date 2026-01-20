import React from 'react';

export type RecurrenceAction = 'single' | 'series';

interface RecurrenceActionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (action: RecurrenceAction) => void;
  actionType: 'edit' | 'delete';
}

const RecurrenceActionPopup: React.FC<RecurrenceActionPopupProps> = ({
  isOpen,
  onClose,
  onSelect,
  actionType,
}) => {
  if (!isOpen) return null;

  const title = actionType === 'edit' ? 'Редактировать событие' : 'Удалить событие';
  const message = actionType === 'edit'
    ? 'Это повторяющееся событие. Что вы хотите изменить?'
    : 'Это повторяющееся событие. Что вы хотите удалить?';

  const handleSelect = (action: RecurrenceAction) => {
    onSelect(action);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-slideUp">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-normal text-gray-900">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
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

        <div className="px-6 py-6">
          <p className="text-gray-700 mb-6">{message}</p>

          <div className="space-y-3">
            <button
              onClick={() => handleSelect('single')}
              className="w-full px-4 py-3 text-left text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              <div className="font-medium">Только это событие</div>
              <div className="text-sm text-gray-600 mt-1">
                {actionType === 'edit'
                  ? 'Изменения применятся только к этому событию'
                  : 'Будет удалено только это событие'}
              </div>
            </button>

            <button
              onClick={() => handleSelect('series')}
              className="w-full px-4 py-3 text-left text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              <div className="font-medium">Всю серию событий</div>
              <div className="text-sm text-gray-600 mt-1">
                {actionType === 'edit'
                  ? 'Изменения применятся ко всем событиям серии'
                  : 'Будут удалены все события серии'}
              </div>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecurrenceActionPopup;
