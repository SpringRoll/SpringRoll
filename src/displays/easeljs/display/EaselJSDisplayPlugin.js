/**
 * @module EaselJS Display
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
		var assetManager = this.assetManager;
		
		assetManager.register('springroll.easeljs.TextureAtlasTask', 30);
		assetManager.register('springroll.easeljs.FlashArtTask', 50);
		assetManager.register('springroll.easeljs.FlashArtAtlasTask', 60);
		assetManager.register('springroll.easeljs.SpriteSheetTask', 70);
		assetManager.register('springroll.easeljs.FlashSpriteSheetTask', 80);
		assetManager.register('springroll.easeljs.BitmapTask', 90);

		this.once('displayAdded', function(display)
		{
			var options = this.options;
			if (!options.defaultAssetType && display instanceof include('springroll.EaselJSDisplay'))
			{
				options.defaultAssetType = 'easeljs';
			}
		});
	};

}());