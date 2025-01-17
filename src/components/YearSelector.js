import React from 'react';

function YearSelector({ currentDate, onDateChange }) {
  const goToPreviousYear = () => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(newDate.getFullYear() - 1);
    onDateChange(newDate);
  };

  const goToNextYear = () => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(newDate.getFullYear() + 1);
    onDateChange(newDate);
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <button 
        onClick={goToPreviousYear}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-600"
      >
        <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <div className="text-lg font-semibold text-gray-900 dark:text-white">
        {currentDate.getFullYear()}
      </div>
      
      <button 
        onClick={goToNextYear}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-600"
      >
        <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

export default YearSelector;
