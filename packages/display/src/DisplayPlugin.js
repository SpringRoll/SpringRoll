import {ApplicationPlugin} from '@springroll/core';
import TextureTask from './TextureTask';
import TextureAtlasTask from './TextureAtlasTask';
import BitmapFontTask from './BitmapFontTask';
import Display from './Display';

(function()
{
    /**
     * @class Application
     */
    const plugin = new ApplicationPlugin();

    // Register the tasks
    plugin.setup = function()
    {
        this.assetManager.register(TextureTask, 60);
        this.assetManager.register(TextureAtlasTask, 70);
        this.assetManager.register(BitmapFontTask, 80);

        this.once('displayAdded', function(display)
        {
            const options = this.options;

            if (!options.defaultAssetType && display instanceof Display)
            {
                options.defaultAssetType = 'pixi';
            }
        });
    };

}());