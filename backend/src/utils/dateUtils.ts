/**
 * Date utility functions that consistently use New Zealand timezone
 */

// Set the timezone to New Zealand
process.env.TZ = 'Pacific/Auckland';

/**
 * Get the current date in New Zealand timezone
 * @returns Date object representing the current date in NZ
 */
export function getCurrentDate(): Date {
  return new Date();
}

/**
 * Check if a date is today in New Zealand timezone
 * @param date The date to check
 * @returns boolean indicating if the date is today
 */
export function isToday(date: Date): boolean {
  const today = getCurrentDate();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

/**
 * Get the start of today in New Zealand timezone
 * @returns Date object representing the start of today (midnight)
 */
export function getStartOfToday(): Date {
  const today = getCurrentDate();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Get the end of today in New Zealand timezone
 * @returns Date object representing the end of today (23:59:59.999)
 */
export function getEndOfToday(): Date {
  const today = getCurrentDate();
  today.setHours(23, 59, 59, 999);
  return today;
}

/**
 * Format a date to an ISO string that indicates NZ timezone
 * @param date The date to format
 * @returns ISO string with NZ timezone indicator
 */
export function formatToNZTimezone(date: Date): string {
  return date.toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' });
}

/**
 * Get a date that is N days ago from now
 * @param days Number of days to go back
 * @returns Date object for N days ago
 */
export function getDateDaysAgo(days: number): Date {
  const date = getCurrentDate();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Get today's date period (from start of today to end of today)
 * @returns Object with start and end dates
 */
export function getTodayPeriod(): { start: Date; end: Date } {
  const start = getStartOfToday();
  const end = getEndOfToday();
  return { start, end };
}

/**
 * Get yesterday's date period (from start of yesterday to end of yesterday)
 * @returns Object with start and end dates
 */
export function getYesterdayPeriod(): { start: Date; end: Date } {
  const today = getStartOfToday();
  
  const end = new Date(today);
  end.setMilliseconds(-1); // End of yesterday (23:59:59.999)
  
  const start = new Date(today);
  start.setDate(start.getDate() - 1); // Start of yesterday
  
  return { start, end };
}

/**
 * Get period for the last N days including today
 * @param days Number of days to include
 * @returns Object with start and end dates
 */
export function getLastDaysPeriod(days: number): { start: Date; end: Date } {
  return { 
    start: getDateDaysAgo(days - 1), // -1 because it includes today
    end: getEndOfToday()
  };
}
