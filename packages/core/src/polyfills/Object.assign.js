(function() 
{

    // From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
    if (typeof Object.assign !== 'function')
    {
        Object.assign = function(target, ...varArgs) // .length of function is 2
        {
            if (target === null) // TypeError if undefined or null
            {
                throw new TypeError('Cannot convert undefined or null to object');
            }

            const to = Object(target);

            for (let index = 0; index < varArgs.length; index++)
            {
                let nextSource = varArgs[index];

                if (nextSource !== null) // Skip over if undefined or null
                {
                    for (let nextKey in nextSource)
                    {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey))
                        {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    }

}());