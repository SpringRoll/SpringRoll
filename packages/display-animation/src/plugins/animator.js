import {ApplicationPlugin} from '@springroll/core';
import SpriteClipTask from '../SpriteClipTask';
import SpriteClipInstance from '../SpriteClipInstance';

(function() {

    const plugin = new ApplicationPlugin('display/animator', ['animator', 'asset-manager']);

    // Init the animator
    plugin.setup = function() {
        this.assetManager.register(SpriteClipTask, 80);
        this.animator.register(SpriteClipInstance, 10);
    };

}());