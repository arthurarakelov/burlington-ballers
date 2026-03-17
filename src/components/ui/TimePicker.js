import React from 'react';

const TimePicker = ({ value, onChange }) => {
  const hours = value.split(':')[0] || '11';
  const minutes = value.split(':')[1] || '00';

  return (
    <div className="flex justify-center gap-2">
      <select
        value={hours}
        onChange={(e) => onChange(`${e.target.value}:${minutes}`)}
        className="bg-white/[0.07] rounded-xl px-3 py-3 text-lg text-white outline-none focus:ring-2 focus:ring-orange-500/40 transition-all text-center"
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
          <option key={hour} value={hour.toString().padStart(2, '0')} className="bg-[#18181b]">{hour}</option>
        ))}
        {Array.from({ length: 12 }, (_, i) => i + 13).map(hour => (
          <option key={hour} value={hour.toString()} className="bg-[#18181b]">{hour}</option>
        ))}
      </select>
      <span className="flex items-center text-white/30 text-lg">:</span>
      <select
        value={minutes}
        onChange={(e) => onChange(`${hours}:${e.target.value}`)}
        className="bg-white/[0.07] rounded-xl px-3 py-3 text-lg text-white outline-none focus:ring-2 focus:ring-orange-500/40 transition-all text-center"
      >
        {['00', '15', '30', '45'].map(minute => (
          <option key={minute} value={minute} className="bg-[#18181b]">{minute}</option>
        ))}
      </select>
    </div>
  );
};

export default React.memo(TimePicker);
