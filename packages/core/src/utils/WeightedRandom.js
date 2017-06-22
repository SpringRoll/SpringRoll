/**
 * A class for generating weighted random values. Input objects are dictionary objects
 * where the keys are the strings to be picked from, and the values are the corresponding
 * odds as integers. For example:
 *
 *  {
 *      itemWith25PercentChance: 2,
 *      itemWith50PercentChance: 4,
 *      otherItemWith25PercentChance: 2
 *  }
 *
 * @class WeightedRandom
 * @constructor
 * @param {Object} object The configuration object for this weighted value generator.
 */
export default class WeightedRandom
{
    constructor(values)
    {
        this.max = -1;
        this.options = [];
        let value = 0;

        for (let key in values)
        {
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
    random()
    {
        let rand = Math.randomInt(0, this.max);

        for (let i = 0, options = this.options, length = options.length; i < length; ++i)
        {
            if (rand < options[i].value)
            {
                return options[i].key;
            }
        }

        //if we are somehow here, then return null
        return null;
    }
}
