/**
 * @module PIXI Display
 * @namespace springroll
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
		this.assetManager.register('springroll.pixi.TextureTask', 60);
		this.assetManager.register('springroll.pixi.TextureAtlasTask', 70);
		this.assetManager.register('springroll.pixi.BitmapFontTask', 80);


		this.once('displayAdded', function(display)
		{
			var options = this.options;
			if (!options.defaultAssetType && display instanceof include('springroll.PixiDisplay'))
			{
				options.defaultAssetType = 'pixi';
			}
		});
	};

}());