/**
 * Throws Error if condition is not met.
 * 
 * @export
 * @param {Predicate} condition 
 * @param {String} message 
 */
export function assert(condition, message) {
  if (!condition) {
    message = message || 'Assertion failed';
    if (typeof Error !== 'undefined') {
      throw new Error(message);
    }
    throw message;
  }
}