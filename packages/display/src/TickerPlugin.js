import {ApplicationPlugin} from '@springroll/core';

/**
 * @module PIXI Display
 * @namespace springroll
 * @requires Core
 */
(function()
{
    /**
     *    @class Application
     */
    var plugin = new ApplicationPlugin();

    /**
     *  Keep track of total time elapsed to feed to the Ticker
     *  @property {Number} _time
     *  @private
     *  @default 0
     */
    var _time = 0;

    PIXI.ticker.shared.autoStart = false;
    PIXI.ticker.shared.stop();

    plugin.setup = function()
    {
        //update early so that the InteractionManager updates in response to mouse movements
        //and what the user saw the previous frame
        this.on('update', updateTicker, 300);
    };

    function updateTicker(elapsed)
    {
        _time += elapsed;
        PIXI.ticker.shared.update(_time);
    }

}());