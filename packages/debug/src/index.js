import {expose} from '@springroll/core';

import './Debug.sass';
import './plugins';
import Debug from './Debug';
import DebugOptions from './DebugOptions';

expose({
    Debug,
    DebugOptions
});

export {
    Debug,
    DebugOptions
};