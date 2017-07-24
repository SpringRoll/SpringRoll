import {expose} from '@springroll/core';

import './plugins';

import AbstractHint from './AbstractHint';
import AnimatorHint from './AnimatorHint';
import FunctionHint from './FunctionHint';
import GroupHint from './GroupHint';
import VOHint from './VOHint';
import HintsPlayer from './HintsPlayer';

expose({
    AbstractHint,
    AnimatorHint,
    FunctionHint,
    GroupHint,
    VOHint,
    HintsPlayer
});

export {
    AbstractHint,
    AnimatorHint,
    FunctionHint,
    GroupHint,
    VOHint,
    HintsPlayer
};