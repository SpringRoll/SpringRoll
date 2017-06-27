(function() {
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    // requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
    // MIT license
    let vendors = ['ms', 'moz', 'webkit', 'o'];
    let len = vendors.length;
    for (let x = 0; x < len && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    // create a setTimeout based fallback if there wasn't an official or prefixed version
    if (!window.requestAnimationFrame) {
        let lastTime = 0;
        // Create the polyfill
        window.requestAnimationFrame = function(callback) {
            let currTime = performance.now(); //use the now function from down below
            let timeToCall = Math.max(0, 16 - (currTime - lastTime));
            let id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

        // Only set this up if the corresponding requestAnimationFrame was set up
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }

    // Short alias
    window.requestAnimFrame = window.requestAnimationFrame;

}());