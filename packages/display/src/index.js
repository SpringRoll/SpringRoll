import {expose} from '@springroll/core';

if (typeof PIXI === 'undefined') {
    throw 'pixi.js is not found';
}

import './Display.sass';
import './mixins';
import './plugins';

import Display from './Display';
import {TextureAtlas, TextureAtlasTask, TextureTask, BitmapFontTask} from './tasks';

expose({
    Display,
    TextureAtlas,
    TextureAtlasTask,
    TextureTask,
    BitmapFontTask
});

export {
    Display,
    TextureAtlas,
    TextureAtlasTask,
    TextureTask,
    BitmapFontTask
};