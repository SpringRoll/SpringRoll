import {ApplicationPlugin} from '@springroll/core';

(function() {

    const plugin = new ApplicationPlugin('display/ticker', 'ticker');

    /**
     *  Keep track of total time elapsed to feed to the Ticker
     *  @member {Number}
     *  @private
     *  @default 0
     */
    let time = 0;

    plugin.setup = function() {
        // Stop the pixi ticker
        PIXI.ticker.shared.stop();

        // update early so that the InteractionManager 
        // updates in response to mouse movements
        // and what the user saw the previous frame
        this.on('update', updateTicker);
    };

    plugin.teardown = function() {
        this.off('update', updateTicker);
        PIXI.ticker.shared.start();
    };

    function updateTicker(elapsed) {
        time += elapsed;
        PIXI.ticker.shared.update(time);
    }

}());