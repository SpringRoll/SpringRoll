/**
 * Convenience utilitys for Arrays.
 * ### module: @springroll/utils
 * @class
 * @memberof springroll
 */
export default class ArrayUtils {
    /**
     * Shuffles the array
     */
    static shuffle(arr) {
        for (let j, x, i = arr.length; i; ) {
            j = Math.floor(Math.random() * i);
            x = arr[--i];
            arr[i] = arr[j];
            arr[j] = x;
        }
        return arr;
    }

    /**
     * Get a random item from an array
     * @param {Array<mixed>} array The array
     * @return {mixed} The random item
     */
    static random(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    /**
     * Get the last item in the array
     * @param {Array<mixed>} array The array
     * @return {mixed} The last item
     */
    static list(arr) {
        return arr[arr.length - 1];
    }

    /**
     * Appends a list of items or list of arrays to the end of this array. This functions
     * like concat(), but works on the original array instead of making a copy.
     * @param {Array<mixed>} arr - Source arry to add to
     * @param {mixed} arguments A list of arrays or individual items.
     * @return {Array<mixed>} This array.
     */
    static append(arr, ...additional) {
        for (let i = 1, length = additional.length; i < length; ++i) {
            let add = additional[i];

            if (Array.isArray(add)) {
                for (let j = 0, jLength = add.length; j < jLength; ++j) {
                    arr.push(add[j]);
                }
            }
            else {
                arr.push(add);
            }
        }
        return arr;
    }
}
