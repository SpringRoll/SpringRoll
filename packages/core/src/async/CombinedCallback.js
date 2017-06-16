    

/**
 * CombinedCallback is a utility class that creates a function to be passed to multiple
 * asynchronous functions as a callback, and will call your callback on the last time it
 * is called.
 *
 * @class CombinedCallback
 */
var CombinedCallback = {};

/**
 * Creates a callback function for use.
 *
 * @method create
 * @static
 * @param {Function} call The callback to call when everything is complete.
 * @param {int} [callCount=2] The number of times this function should expect to be called.
 * @return {Function} The callback to pass to your asynchronous actions. For reuse,
 *                    this function has a reset() function.
 */
CombinedCallback.create = function(call, callCount)
{
    if (!call) return null;

    if (typeof callCount != "number" || callCount < 1)
        callCount = 2;
    //create a function that can be called multiple times
    var result = function()
    {
        if (++result.currentCallCount >= callCount)
            call();
    };
    //set some properties on said function to make it reusable
    result.currentCallCount = 0;
    result.reset = function reset()
    {
        this.currentCallCount = 0;
    };

    return result;
};

export default CombinedCallback;