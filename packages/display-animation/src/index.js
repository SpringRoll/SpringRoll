import {expose} from '@springroll/core';

import './plugins';

import SpriteClip from './SpriteClip';
import SpriteClipInstance from './SpriteClipInstance';
import SpriteClipTask from './SpriteClipTask';

expose({
    SpriteClip,
    SpriteClipInstance,
    SpriteClipTask
});

export {
    SpriteClip,
    SpriteClipInstance,
    SpriteClipTask
};
