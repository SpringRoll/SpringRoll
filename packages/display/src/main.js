if (typeof PIXI === 'undefined')
{
    throw 'pixi.js is not found';
}

import './mixins/index';
import './TickerPlugin';
import './DisplayPlugin';

export {default as Display} from './Display';
export {default as DisplayAdapter} from './DisplayAdapter';
export {default as TextureAtlasTask} from './TextureAtlasTask';
export {default as TextureAtlas} from './TextureAtlas';
export {default as TextureTask} from './TextureTask';
