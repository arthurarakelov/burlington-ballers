export const getNextSaturday = () => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const nextSaturday = new Date(today);
  
  if (currentDay === 6) {
    // If today is Saturday, get next Saturday
    nextSaturday.setDate(today.getDate() + 7);
  } else {
    // Calculate days until next Saturday
    const daysUntilSaturday = 6 - currentDay;
    nextSaturday.setDate(today.getDate() + daysUntilSaturday);
  }
  
  // Use local date formatting to avoid timezone issues
  const year = nextSaturday.getFullYear();
  const month = String(nextSaturday.getMonth() + 1).padStart(2, '0');
  const day = String(nextSaturday.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`; // Format as YYYY-MM-DD
};

export const convertTo24Hour = (time12h) => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') {
    hours = '00';
  }
  if (modifier === 'PM') {
    hours = String(parseInt(hours, 10) + 12);
  }
  // Ensure hours is a string and pad it
  hours = String(hours).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const convertTo12Hour = (time24) => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const GAME_DURATION_HOURS = 3;
export const GAME_DELETE_GRACE_DAYS = 2;

export const parseGameDateTime = (dateString, timeString) => {
  if (!dateString || !timeString) return null;

  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return null;

  const normalizedTime = String(timeString).trim();
  let hours;
  let minutes;

  const twelveHourMatch = normalizedTime.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  const twentyFourHourMatch = normalizedTime.match(/^(\d{1,2}):(\d{2})$/);

  if (twelveHourMatch) {
    hours = parseInt(twelveHourMatch[1], 10);
    minutes = parseInt(twelveHourMatch[2], 10);
    const modifier = twelveHourMatch[3].toUpperCase();

    if (hours === 12) hours = 0;
    if (modifier === 'PM') hours += 12;
  } else if (twentyFourHourMatch) {
    hours = parseInt(twentyFourHourMatch[1], 10);
    minutes = parseInt(twentyFourHourMatch[2], 10);
  } else {
    return null;
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

export const getGameEndDate = (dateString, timeString) => {
  const startsAt = parseGameDateTime(dateString, timeString);
  if (!startsAt) return null;

  return new Date(startsAt.getTime() + GAME_DURATION_HOURS * 60 * 60 * 1000);
};

export const compareGamesByStartTime = (a, b) => {
  const aStart = parseGameDateTime(a.date, a.time);
  const bStart = parseGameDateTime(b.date, b.time);

  if (!aStart && !bStart) return 0;
  if (!aStart) return 1;
  if (!bStart) return -1;

  return aStart - bStart;
};

// Get today's date in YYYY-MM-DD format
export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Get max date (90 days from today) in YYYY-MM-DD format
export const getMaxDate = () => {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  return maxDate.toISOString().split('T')[0];
};

// Validate if a date is within allowed range (today to 90 days)
export const isValidGameDate = (dateString) => {
  const selectedDate = new Date(dateString);
  const today = new Date();
  const maxDate = new Date();
  
  // Reset time to start of day for accurate comparison
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);
  maxDate.setDate(maxDate.getDate() + 90);
  maxDate.setHours(23, 59, 59, 999);
  
  return selectedDate >= today && selectedDate <= maxDate;
};

export const isGameCompleted = (dateString, timeString, now = new Date()) => {
  const endsAt = getGameEndDate(dateString, timeString);
  if (!endsAt) return false;

  return now >= endsAt;
};

export const shouldAutoDeleteGame = (dateString, timeString, now = new Date()) => {
  const endsAt = getGameEndDate(dateString, timeString);
  if (!endsAt) return false;

  const deleteAfter = new Date(endsAt.getTime() + GAME_DELETE_GRACE_DAYS * 24 * 60 * 60 * 1000);
  return now >= deleteAfter;
};

// Backward-compatible name for cleanup callers.
export const isGameInPast = shouldAutoDeleteGame;

// Format date to include day of the week (e.g., "Saturday, 2025-08-23")
export const formatDateWithDay = (dateString) => {
  // Parse the date string as local time to avoid timezone issues
  const [year, month, day] = dateString.split('-');
  const date = new Date(year, month - 1, day); // month is 0-indexed
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = dayNames[date.getDay()];
  return `${dayOfWeek}, ${dateString}`;
};
