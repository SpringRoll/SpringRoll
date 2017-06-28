import {ApplicationPlugin} from '@springroll/core';
import Debug from '../Debug';

(function() {

    const plugin = new ApplicationPlugin('debug');

    // Init the animator
    plugin.setup = function() {
        const options = this.options;

        /**
         * Enable the Debug class. After initialization, this
         * is a pass-through to Debug.enabled.
         * ### module: @springroll/debug
         * @member {Boolean} debug
         * @memberof springroll.ApplicationOptions#
         * @default true
         */
        options.add('debug', true);

        /**
         * Minimum log level from 0 (Debug.Levels.GENERAL) to 4 (Debug.Levels.ERROR)
         * ### module: @springroll/debug
         * @member {int} minLogLevel
         * @memberof springroll.ApplicationOptions#
         * @default Debug.Levels.GENERAL
         * @see springroll.Debug.Levels
         */
        options.add('minLogLevel', Debug.Levels.GENERAL);

        /**
         * The host computer for remote debugging, the debug
         * module must be included to use this feature. Can be an
         * IP address or host name. After initialization, setting
         * this will still connect or disconect Debug for remote
         * debugging. This is a write-only property.
         * ### module: @springroll/debug
         * @member {String} debugRemote
         * @memberof springroll.ApplicationOptions#
         */
        options.add('debugRemote', null)
            .respond('debug', () => Debug.enabled)
            .on('debug', value => {
                Debug.enabled = value;
            })
            .on('debugRemote', value => {
                Debug.disconnect();
                if (value) {
                    Debug.connect(value);
                }
            })
            .respond('minLogLevel', () => Debug.minLogLevel.asInt)
            .on('minLogLevel', value => {
                Debug.minLogLevel = Debug.Levels.valueFromInt(
                    parseInt(value, 10)
                );
                if (!Debug.minLogLevel) {
                    Debug.minLogLevel = Debug.Levels.GENERAL;
                }
            });
    };

    // Destroy the animator
    plugin.teardown = function() {
        Debug.disconnect();
    };

}());