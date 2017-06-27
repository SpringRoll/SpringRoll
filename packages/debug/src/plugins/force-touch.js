import {ApplicationPlugin} from '@springroll/core';
import DebugOptions from '../DebugOptions';

(function(){

    const plugin = new ApplicationPlugin('force-touch', 'touch');

    plugin.setup = function() {

        /**
         * Manually override the check for hasTouch
         * @property {Boolean} options.forceTouch
         * @default false
         */
        this.options.add('forceTouch', false)
            .on('forceTouch', value => {
                if (value === 'true' || value === true) {
                    this.hasTouch = true;
                }
            });

        DebugOptions.boolean('forceTouch', 'Force hasTouch to true');        
    };

})();