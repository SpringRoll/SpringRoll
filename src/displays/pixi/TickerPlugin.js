/**
 * @module PIXI Display
 * @namespace springroll
 * @requires Core
 */
(function()
{
	// Include classes
	var ticker = include('PIXI.ticker.shared', false),
		ApplicationPlugin = include('springroll.ApplicationPlugin');

	if (!ticker) return;

	/**
	 *	@class Application
	 */
	var plugin = new ApplicationPlugin();

	/**
	 *  Keep track of total time elapsed to feed to the Ticker
	 *  @property {Number} _time
	 *  @private
	 *  @default 0
	 */
	var _time = 0;

	ticker.autoStart = false;
	ticker.stop();

	plugin.setup = function()
	{
		//update early so that the InteractionManager updates in response to mouse movements
		//and what the user saw the previous frame
		this.on('update', updateTicker, 300);
	};

	function updateTicker(elapsed)
	{
		_time += elapsed;
		ticker.update(_time);
	}

}());