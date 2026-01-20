import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonStyle?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  confirmButtonStyle = 'primary',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const confirmButtonClasses = confirmButtonStyle === 'danger'
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-filos-blue hover:bg-filos-hover';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        onClick={onCancel}
      ></div>

      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-slideUp">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-normal text-gray-900">
              {title}
            </h2>
            <button
              type="button"
              onClick={onCancel}
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
          <p className="text-gray-700">{message}</p>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-6 py-2 text-sm font-medium text-white rounded transition-colors ${confirmButtonClasses}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
