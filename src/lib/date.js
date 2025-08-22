/**
 * Date utilities for America/Chicago timezone
 */

/**
 * Get the first day of the current month in America/Chicago timezone
 * @returns {Date} First day of current month
 */
export function getFirstDayOfCurrentMonth() {
  const now = new Date();
  // Convert to Chicago timezone
  const chicagoTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Chicago"}));
  
  // Get first day of the month
  const firstDay = new Date(chicagoTime.getFullYear(), chicagoTime.getMonth(), 1);
  return firstDay;
}

/**
 * Get today's date in America/Chicago timezone
 * @returns {Date} Today's date
 */
export function getTodayInChicago() {
  const now = new Date();
  const chicagoTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Chicago"}));
  return new Date(chicagoTime.getFullYear(), chicagoTime.getMonth(), chicagoTime.getDate());
}

/**
 * Generate a random date between the first day of current month and today (inclusive)
 * in America/Chicago timezone
 * @returns {Date} Random date
 */
export function getRandomDateInCurrentMonth() {
  const firstDay = getFirstDayOfCurrentMonth();
  const today = getTodayInChicago();
  
  const timeDiff = today.getTime() - firstDay.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
  
  // Generate random number of days to add (0 to daysDiff inclusive)
  const randomDays = Math.floor(Math.random() * (daysDiff + 1));
  
  const randomDate = new Date(firstDay);
  randomDate.setDate(firstDay.getDate() + randomDays);
  
  return randomDate;
}

/**
 * Format date as MM/DD/YYYY
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${month}/${day}/${year}`;
}
