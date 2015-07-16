(function(){
	
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
	var WeightedRandom = function(object)
	{
		this.max = -1;
		this.options = [];
		var total = 0;
		for(var key in object)
		{
			total += object[key];
			this.options.push({key:key, value:total});
			this.max += object[key];
		}
	};

	var p = WeightedRandom.prototype = {};
	
	/**
	 * Picks an item at random.
	 * @method random
	 * @return {String} The randomly chosen value.
	 */
	p.random = function()
	{
		var rand = Math.randomInt(0, this.max);
		for(var i = 0, options = this.options, length = options.length; i < length; ++i)
		{
			if(rand < options[i].value)
				return options[i].key;
		}
		//if we are somehow here, then return null
		return null;
	};

	// Assign to namespace
	namespace('springroll').WeightedRandom = WeightedRandom;
}());