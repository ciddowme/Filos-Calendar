import React from 'react';
import type { ViewMode } from '../types/viewMode';

interface ViewModeSwitcherProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="inline-flex rounded-md shadow-sm" role="group">
      <button
        type="button"
        onClick={() => onModeChange('day')}
        className={`px-4 py-2 text-sm font-medium border transition-colors ${
          currentMode === 'day'
            ? 'bg-filos-blue text-white border-filos-blue shadow-sm'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-filos-lighter/10'
        } rounded-l-md`}
      >
        День
      </button>
      <button
        type="button"
        onClick={() => onModeChange('week')}
        className={`px-4 py-2 text-sm font-medium border-t border-r border-b transition-colors ${
          currentMode === 'week'
            ? 'bg-filos-blue text-white border-filos-blue shadow-sm'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-filos-lighter/10'
        } rounded-r-md`}
      >
        Неделя
      </button>
    </div>
  );
};

export default ViewModeSwitcher;
