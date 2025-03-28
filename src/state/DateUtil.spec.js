import { DateUtil } from './DateUtil';

describe('DateUtil.isInSeason', () => {
  it('should return true when today is within the date range', () => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1); // Yesterday
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1); // Tomorrow

    expect(DateUtil.isInSeason(startDate, endDate)).to.be.true;
  });

  it('should return false when today is before the date range', () => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1); // Tomorrow
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2); // Day after tomorrow

    expect(DateUtil.isInSeason(startDate, endDate)).to.be.false;
  });

  it('should return false when today is after the date range', () => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2); // Two days ago
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1); // Yesterday

    expect(DateUtil.isInSeason(startDate, endDate)).to.be.false;
  });

  it('should handle string date inputs correctly', () => {
    const today = new Date();
    // Extracting the date portion of the ISO string: [YYYY-MM-DDTHH:mm:ss.sssZ]
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toISOString().split('T')[0]; // Yesterday
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString().split('T')[0]; // Tomorrow

    expect(DateUtil.isInSeason(startDate, endDate)).to.be.true;
  });

  it('should return true when today is exactly the start date', () => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // Today
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1); // Tomorrow

    expect(DateUtil.isInSeason(startDate, endDate)).to.be.true;
  });

  it('should return true when today is exactly the end date', () => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1); // Yesterday
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // Today

    expect(DateUtil.isInSeason(startDate, endDate)).to.be.true;
  });

  it('should throw an error for invalid date inputs', () => {
    const invalidStartDate = 'invalid-date';
    const validEndDate = '2025-03-31';

    expect(() => DateUtil.isInSeason(invalidStartDate, validEndDate)).to.throw(
      'Invalid date input: startDate and endDate must be valid dates.'
    );
  });
  
  it('should throw an error when startDate is after endDate', () => {
    const startDate = '2025-04-01'; // April 1, 2025
    const endDate = '2025-03-31'; // March 31, 2025

    expect(() => DateUtil.isInSeason(startDate, endDate)).to.throw(
      'Invalid date range: startDate cannot be after endDate.'
    );
  });
});