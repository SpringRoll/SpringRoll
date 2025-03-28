
/**
 * Utility class for date-related operations.
 */
export class DateUtil {
/**
 * Checks if the current date falls within a provided date range.
 * 
 * @param {string|Date} startDate - The start date of the range (inclusive)
 * @param {string|Date} endDate - The end date of the range (inclusive)
 * @returns {boolean} - True if current date is within the range, false otherwise
 * 
 * @example
 * // Check if current date is within Christmas season
 * if (isInSeason('2024-12-01', '2024-12-31')) {
 *   showChristmasContent();
 * }
 * 
 * @example
 * // Using Date objects
 * const summerStart = new Date(2024, 5, 21); // June 21, 2024
 * const summerEnd = new Date(2024, 8, 22);   // September 22, 2024
 * if (isInSeason(summerStart, summerEnd)) {
 *   showSummerContent();
 * }
 */
  static isInSeason(startDate, endDate) {
    // Convert string dates to Date objects if needed
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date input: startDate and endDate must be valid dates.');
    }

    // Ensure startDate is not after endDate
    if (start > end) {
      throw new Error('Invalid date range: startDate cannot be after endDate.');
    }

    // Set time to midnight for consistent comparison
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Get current date
    const today = new Date();
    
    // Check if today is within the range
    return today >= start && today <= end;
  }
}