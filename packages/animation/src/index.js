/**
 * Contains Animation playback APIs.
 * @module @springroll/animation
 */
import {expose} from '@springroll/core';

import './plugins';

import Animator from './Animator';
import AnimatorInstance from './AnimatorInstance';
import AnimatorTimeline from './AnimatorTimeline';
import GenericMovieClipInstance from './GenericMovieClipInstance';

expose({
    Animator,
    AnimatorInstance,
    AnimatorTimeline,
    GenericMovieClipInstance
});

export {
    Animator,
    AnimatorInstance,
    AnimatorTimeline,
    GenericMovieClipInstance
};
