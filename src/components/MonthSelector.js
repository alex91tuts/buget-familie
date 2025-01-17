import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

function MonthSelector({ currentDate, onDateChange }) {
  const months = [
    'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
  ];

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={handlePrevMonth}
        className="p-1 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400"
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {months[currentDate.getMonth()]} {currentDate.getFullYear()}
      </span>
      <button
        onClick={handleNextMonth}
        className="p-1 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400"
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>
    </div>
  );
}

export default MonthSelector;
