import MathUtils from './MathUtils';

/**
 * A class for generating weighted random values. Input objects are dictionary objects
 * where the keys are the strings to be picked from, and the values are the corresponding
 * odds as integers.
 * ### module: @springroll/utils
 * @example
 * import {WeightedRandom} from '@springroll/utils';
 *
 * const weight = new WeightedRandom({
 *   boots: 2, // 25%
 *   slippers: 4, // 50%
 *   shoes: 2 // 25%
 * });
 *
 * console.log(weight.random());
 * @class
 * @memberof springroll
 */
export default class WeightedRandom {
    /**
     * @param {Object} object The configuration object for this weighted value generator.
     */
    constructor(values) {
        this.max = -1;
        this.options = [];
        let value = 0;

        for (let key in values) {
            value += values[key];
            this.options.push({ key, value });
            this.max += values[key];
        }
    }

    /**
     * Picks an item at random.
     * @method random
     * @return {String} The randomly chosen value.
     */
    random() {
        let rand = MathUtils.randomInt(0, this.max);

        for (let i = 0, options = this.options, length = options.length; i < length; ++i) {
            if (rand < options[i].value) {
                return options[i].key;
            }
        }

        //if we are somehow here, then return null
        return null;
    }
}
