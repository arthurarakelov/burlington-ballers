import React from 'react';

const TimePicker = ({ value, onChange }) => {
  const hours = value.split(':')[0] || '11';
  const minutes = value.split(':')[1] || '00';

  return (
    <div className="flex justify-center gap-2">
      <select
        value={hours}
        onChange={(e) => onChange(`${e.target.value}:${minutes}`)}
        className="bb-select max-w-[96px] text-center text-lg"
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
          <option key={hour} value={hour.toString().padStart(2, '0')} className="bg-[#182621]">{hour}</option>
        ))}
        {Array.from({ length: 12 }, (_, i) => i + 13).map(hour => (
          <option key={hour} value={hour.toString()} className="bg-[#182621]">{hour}</option>
        ))}
      </select>
      <span className="flex items-center text-white/30 text-lg">:</span>
      <select
        value={minutes}
        onChange={(e) => onChange(`${hours}:${e.target.value}`)}
        className="bb-select max-w-[96px] text-center text-lg"
      >
        {['00', '15', '30', '45'].map(minute => (
          <option key={minute} value={minute} className="bg-[#182621]">{minute}</option>
        ))}
      </select>
    </div>
  );
};

export default React.memo(TimePicker);
