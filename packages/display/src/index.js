import {expose} from '@springroll/core';

if (typeof PIXI === 'undefined') {
    throw 'pixi.js is not found';
}

import './Display.sass';
import './mixins';
import './plugins';

import Display from './Display';

expose({ Display });
export { Display };