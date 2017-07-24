/**
 * All classes for SpringRoll are available within the "springroll" window
 * namespace. All SpringRoll modules can either be included and used with the namespace
 * or are accessible through importing specific classes. For instance:
 * @example
 * // Import using namespace
 * import '@springroll/core';
 * const app = springroll.Application();
 *
 * // Import using classes
 * import {Application} from '@springroll/core';
 * const app = new Application();
 * @namespace springroll
 */
import './polyfills';
import './plugins';

import {expose} from './utils';
import * as utils from './utils';
import * as events from './events';
import ApplicationPlugin from './ApplicationPlugin';
import ApplicationOptions from './ApplicationOptions';
import Application from './Application';
import PersistentStorage from './plugins/storage/PersistentStorage';
import StringFilters from './plugins/filters/StringFilters';
import DelayedCall from './plugins/ticker/DelayedCall';
import Ticker from './plugins/ticker/Ticker';
import PageVisibility from './plugins/visibility/PageVisibility';

expose(utils);
expose(events);

expose({
    ApplicationPlugin,
    ApplicationOptions,
    Application,
    PersistentStorage,
    StringFilters,
    DelayedCall,
    Ticker,
    PageVisibility
});

export * from './utils';
export * from './events';

export {
    ApplicationPlugin,
    ApplicationOptions,
    Application,
    PersistentStorage,
    StringFilters,
    DelayedCall,
    Ticker,
    PageVisibility
};