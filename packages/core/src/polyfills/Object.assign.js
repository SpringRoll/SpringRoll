(function() {

    // From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
    if (typeof Object.assign !== 'function') {
        // .length of function is 2
        Object.assign = function(target, ...varArgs) {
            // TypeError if undefined or null
            if (target === null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }

            const to = Object(target);

            for (let index = 0; index < varArgs.length; index++) {
                let nextSource = varArgs[index];

                // Skip over if undefined or null
                if (nextSource !== null) {
                    for (let nextKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    }

}());