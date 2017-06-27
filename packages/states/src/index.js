import {expose} from '@springroll/core';

import './plugins';

import State from './State';
import StateEvent from './StateEvent';
import StateManager from './StateManager';

expose({
    State,
    StateEvent,
    StateManager
});

export {
    State,
    StateEvent,
    StateManager
};