import React from 'react';

const TimePicker = ({ value, onChange }) => {
  const hours = value.split(':')[0] || '11';
  const minutes = value.split(':')[1] || '00';

  return (
    <div className="flex justify-center gap-2">
      <select
        value={hours}
        onChange={(e) => onChange(`${e.target.value}:${minutes}`)}
        className="bg-gray-900 border border-gray-700 focus:border-blue-400 outline-none px-3 py-3 text-lg font-light text-white rounded-lg transition-colors duration-200 text-center"
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
          <option key={hour} value={hour.toString().padStart(2, '0')} className="bg-gray-900">{hour}</option>
        ))}
        {Array.from({ length: 12 }, (_, i) => i + 13).map(hour => (
          <option key={hour} value={hour.toString()} className="bg-gray-900">{hour}</option>
        ))}
      </select>
      <span className="flex items-center text-gray-400 text-lg">:</span>
      <select
        value={minutes}
        onChange={(e) => onChange(`${hours}:${e.target.value}`)}
        className="bg-gray-900 border border-gray-700 focus:border-blue-400 outline-none px-3 py-3 text-lg font-light text-white rounded-lg transition-colors duration-200 text-center"
      >
        {['00', '15', '30', '45'].map(minute => (
          <option key={minute} value={minute} className="bg-gray-900">{minute}</option>
        ))}
      </select>
    </div>
  );
};

export default React.memo(TimePicker);
