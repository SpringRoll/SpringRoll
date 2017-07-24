/**
 * Common methods for Math functions.
 * ### module: @springroll/utils
 * @class
 * @memberof springroll
 */
export default class MathUtils {
    /**
     * Return a random int between minimum and maximum values.
     * If a single value is supplied, it will return a number between 0 and the supplied value.
     * @param {number} min Lowest number. If max is omitted, then this becomes max.
     * @param {number} max Highest number.
     * @return {number} The random value
     */
    static randomInt(min, max) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Return a random float between minimum and maximum values.
     * If a single value is supplied, it will return a number between 0 and the supplied value.
     * @param {number} min Lowest number. If max is omitted, then this becomes max.
     * @param {number} max Highest number.
     * @return {number} The random value
     */
    static randomFloat(min, max) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return Math.random() * (max - min) + min;
    }

    /**
     * Return distance between two points
     * @method springroll.MathUtils.dist
     * @param {number} x The x position of the first point
     * @param {number} y The y position of the first point
     * @param {number} x0 The x position of the second point
     * @param {number} y0 The y position of the second point
     * @return {number} The distance
     */

    /**
     * Return distance between two points
     * @param {object} p1 The first point
     * @param {object} p1.x The x position of the first point
     * @param {object} p1.y The y position of the first point
     * @param {object} p2 The second point
     * @param {object} p2.x The x position of the second point
     * @param {number} p2.y The y position of the second point
     * @return {number} The distance
     */
    static dist(x, y, x0, y0) {
        return Math.sqrt(MathUtils.distSq(x, y, x0, y0));
    }

    /**
     * Return squared distance between two points
     * @method springroll.MathUtils.distSq
     * @param {number} x The x position of the first point
     * @param {number} y The y position of the first point
     * @param {number} x0 The x position of the second point
     * @param {number} y0 The y position of the second point
     * @return {number} The distance
     */

    /**
     * Return squared distance between two points
     * @param {object} p1 The first point
     * @param {object} p1.x The x position of the first point
     * @param {object} p1.y The y position of the first point
     * @param {object} p2 The second point
     * @param {object} p2.x The x position of the second point
     * @param {number} p2.y The y position of the second point
     * @return {number} The distance
     */
    static distSq(x, y, x0, y0) {
        //see if the first parameter is a point
        //faster !isNaNinde
        if (typeof x.x === 'number' && x.x === x.x) {
            //shift later parameters back
            y0 = x0;
            x0 = y;

            y = x.y;
            x = x.x;
        }
        //see if the 2nd parameter is a point
        if (typeof x0.x === 'number' && x0.x === x0.x) {
            y0 = x0.y;
            x0 = x0.x;
        }
        return (x - x0) * (x - x0) + (y - y0) * (y - y0);
    }

    /**
     * Constrain a number between 0 and a max value.
     * @method springroll.MathUtils.clamp
     * @param {number} value The number to be constrained.
     * @param {number} max Highest number.
     * @return {number} The constrained value
     */

    /**
     * Constrain a number between a minimum and maximum values.
     * @param {number} value The number to be constrained.
     * @param {number} min Lowest number to constrain value to.
     * @param {number} max Highest number.
     * @return {number} The constrained value
     */
    static clamp(value, min, max) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        
        if (value > max) {
            return max;
        }

        if (value < min) {
            return min;
        }

        return value;
    }

    /**
     * Round a number to the nearest increment.
     * For example, 1.4 rounded to the nearest 0.5 is 1.5.
     * @param  {number} val       Value to round
     * @param  {number} increment Increment to round by
     * @return {number}           Rounded value
     */
    static roundDecimal(val, increment) {
        return Math.round(val / increment) * increment;
    }
}