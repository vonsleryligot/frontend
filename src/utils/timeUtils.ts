export const formatTime = (datetime: string): string => {
  const date = new Date(datetime);
  if (isNaN(date.getTime())) return "12:00 AM";
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
};

export const calculateTotalHours = (timeIn: string | null, timeOut: string | null): string => {
  if (!timeIn || !timeOut) return "0.00";

  const timeInDate = new Date(timeIn);
  const timeOutDate = new Date(timeOut);

  if (isNaN(timeInDate.getTime()) || isNaN(timeOutDate.getTime())) return "0.00";

  // Calculate the difference in milliseconds
  const diffMs = timeOutDate.getTime() - timeInDate.getTime();
  
  // Convert to hours and ensure it's positive
  const totalHours = Math.abs(diffMs / (1000 * 60 * 60)).toFixed(2);
  
  return totalHours;
};

export const formatTimeForDisplay = (time: string | null): string => {
  if (!time) return "N/A";
  return formatTime(time);
};

export const calculateDailyTotal = (shifts: Array<{ timeIn: string | null; timeOut: string | null }>): string => {
  let totalHours = 0;
  
  shifts.forEach(shift => {
    if (shift.timeIn && shift.timeOut) {
      const hours = parseFloat(calculateTotalHours(shift.timeIn, shift.timeOut));
      totalHours += hours;
    }
  });
  
  return totalHours.toFixed(2);
};

export const isTimeInRange = (time: string, startTime: string, endTime: string): boolean => {
  const timeDate = new Date(time);
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  
  return timeDate >= startDate && timeDate <= endDate;
}; 