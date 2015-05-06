/**
 * @module Core
 * @namespace window
 */
(function()
{
	/**
	*  Simplified fork of async (https://github.com/caolan/async) which only contains waterfall.
	*  @class async
	*/
	var async = {};

	/**
	 * Process the next task
	 * @method  setImmediate
	 * @param  {function}   fn    The next process function to call
	 */
	async.setImmediate = function (fn)
	{
		setTimeout(fn, 0);
	};

	/**
	 * Async waterfall
	 * @method  waterfall
	 * @param  {array}   tasks    Collection of functions
	 * @param  {Function} callback The callback when all functions are called
	 */
	async.waterfall = function (tasks, callback)
	{
		callback = callback || function () {};

		if (!_isArray(tasks))
		{
			var err = new Error('First argument to waterfall must be an array of functions');
			return callback(err);
		}

		if (!tasks.length)
		{
			return callback();
		}

		var wrapIterator = function(iterator)
		{
			return function(err)
			{
				if (err)
				{
					callback.apply(null, arguments);
					callback = function () {};
				}
				else 
				{
					var args = Array.prototype.slice.call(arguments, 1);
					var next = iterator.next();
					
					if (next)
					{
						args.push(wrapIterator(next));
					}
					else 
					{
						args.push(callback);
					}
					async.setImmediate(function()
					{
						iterator.apply(null, args);
					});
				}
			};
		};
		wrapIterator(async.iterator(tasks))();
	};

	/**
	 * Async waterfall
	 * @method  iterator
	 * @private
	 * @param  {array}   tasks    Collection of functions
	 */
	async.iterator = function(tasks)
	{
        var makeCallback = function(index)
        {
            var fn = function()
            {
                if (tasks.length)
                {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            };
            fn.next = function()
            {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        };
        return makeCallback(0);
    };

	//// cross-browser compatiblity functions ////

	var _toString = Object.prototype.toString;

	var _isArray = Array.isArray || function(obj)
	{
		return _toString.call(obj) === '[object Array]';
	};

	// Assign to namespace
	namespace('springroll').async = async;

}());