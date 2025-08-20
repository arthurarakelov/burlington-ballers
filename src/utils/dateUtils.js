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

// Check if a game date/time is in the past
export const isGameInPast = (dateString, timeString) => {
  const gameDateTime = new Date(`${dateString} ${timeString}`);
  const now = new Date();
  return gameDateTime < now;
};