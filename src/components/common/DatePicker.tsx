import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate, addDays, subtractDays } from '../../utils/dateUtils';

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onDateChange }) => {
  const handlePrevDay = () => {
    onDateChange(subtractDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2">
      <button
        onClick={handlePrevDay}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
      >
        <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      </button>
      
      <div className="flex items-center space-x-2 px-2">
        <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[100px] text-center">
          {formatDate(selectedDate)}
        </span>
      </div>
      
      <button
        onClick={handleNextDay}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
      >
        <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      </button>
      
      <button
        onClick={handleToday}
        className="px-3 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
      >
        Dzisiaj
      </button>
    </div>
  );
};

export default DatePicker;