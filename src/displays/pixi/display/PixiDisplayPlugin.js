/**
 * @module PIXI Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin();

	// Register the tasks
	plugin.setup = function()
	{

		/**
		 * Used by loading Pixi Assets, default behavior
		 * is to load assets from the same domain.
		 * @property {Boolean} options.crossOrigin
		 * @default false
		 */
		this.options.add('crossOrigin', false);

		this.assetManager.register('springroll.pixi.PixiLoadTask', 60);

		this.once('displayAdded', function(display)
		{
			var options = this.options;
			if (!options.defaultAssetType && display instanceof include('springroll.PixiDisplay'))
			{
				options.defaultAssetType = 'easeljs';
			}
		});
	};

}());