/**
 *	@module Core
 *	@namespace springroll
 */
(function()
{
	// Include classes
	var ticker = include('PIXI.ticker.shared', false),
		ApplicationPlugin = include('springroll.ApplicationPlugin');
	
	if(!ticker) return;

	/**
	 *	Create an app plugin for resizing application, all properties and methods documented
	 *	in this class are mixed-in to the main Application
	 *	@class TickerPlugin
	 *	@extends springroll.ApplicationPlugin
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