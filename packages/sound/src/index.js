import {expose} from '@springroll/core';

import './plugins';
import Sound from './Sound';
import SoundContext from './SoundContext';
import SoundInstance from './SoundInstance';
import SoundTask from './SoundTask';
import VOPlayer from './VOPlayer';

expose({
    Sound,
    SoundContext,
    SoundInstance,
    SoundTask,
    VOPlayer
});

export {
    Sound,
    SoundContext,
    SoundInstance,
    SoundTask,
    VOPlayer
};