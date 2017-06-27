import './polyfills';
import './plugins';

import {expose} from './utils';
import * as utils from './utils';
import * as events from './events';
import ApplicationPlugin from './ApplicationPlugin';
import ApplicationOptions from './ApplicationOptions';
import Application from './Application';

expose(utils);
expose(events);

expose({
    ApplicationPlugin,
    ApplicationOptions,
    Application
});

export * from './utils';
export * from './events';

export {
    ApplicationPlugin,
    ApplicationOptions,
    Application
};