(function(){

    if ("performance" in window === false)
    {
        window.performance = {};
    }

    if ("now" in window.performance === false)
    {
        var nowOffset = Date.now();

        if (performance.timing && performance.timing.navigationStart)
        {
            nowOffset = performance.timing.navigationStart;
        }

        window.performance.now = function now()
        {
            return Date.now() - nowOffset;
        };
    }

})();