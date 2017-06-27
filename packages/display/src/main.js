if (typeof PIXI === 'undefined')
{
    throw 'pixi.js is not found';
}

import './Display.sass';
import './mixins';
import './plugins';

// export * from './tasks';

export {default as Display} from './Display';
export {default as DisplayAdapter} from './DisplayAdapter';
