import {expose} from '@springroll/core';

import './plugins';

import Positioner from './Positioner';
import ScaleImage from './ScaleImage';
import ScaleItem from './ScaleItem';
import ScaleManager from './ScaleManager';

expose({
    Positioner,
    ScaleImage,
    ScaleItem,
    ScaleManager
});

export {
    Positioner,
    ScaleImage,
    ScaleItem,
    ScaleManager
};