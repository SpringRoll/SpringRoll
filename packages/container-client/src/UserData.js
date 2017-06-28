import {SavedData} from '@springroll/core';

/**
 * This class is responsible for saving the user-specific data
 * within an Application. This can be player-progress data, high
 * score information, or other data that needs be saved between
 * sessions of running an app.
 * ### module: @springroll/container-client
 * @class
 * @memberof springroll
 */
export default class UserData {
    /**
     * @param {Bellhop} container The container instance
     */
    constructor(container) {
        /**
         * Reference to the container. If the app is not connected
         * to the Container (running standalone) then the container
         * is set to be `null`.
         * @member {Bellhop}
         * @default  null
         * @readOnly
         */
        this.container = container;

        /**
         * The name to preprend to each property name, this is set
         * by default as the Application's name, which is required
         * for the Container Client module.
         * @member {String}
         * @default ""
         */
        this.id = '';
    }

    /**
     * Read a saved setting
     * @param  {String}   prop The property name
     * @param  {Function} callback Callback when save completes, returns the value
     */
    read(prop, callback) {
        if (!this.container.supported) {
            return callback(SavedData.read(this.id + prop));
        }
        this.container.fetch(
            'userDataRead',
            function(event) {
                callback(event.data);
            },
            this.id + prop,
            true // run-once
        );
    }

    /**
     * Write a setting
     * @param  {String}   prop The property name
     * @param  {*}   value The property value to save
     * @param  {Function} [callback] Callback when write completes
     */
    write(prop, value, callback) {
        if (!this.container.supported) {
            SavedData.write(this.id + prop, value);
            if (callback) {
                callback();
            }
            return;
        }
        this.container.fetch(
            'userDataWrite',
            function() {
                if (callback) {
                    callback();
                }
            },
            {
                name: this.id + prop,
                value: value
            },
            true // run-once
        );
    }

    /**
     * Delete a saved setting by name
     * @param  {String}   prop The property name
     * @param  {Function} [callback] Callback when remove completes
     */
    remove(prop, callback) {
        if (!this.container.supported) {
            SavedData.remove(this.id + prop);
            if (callback) {
                callback();
            }
            return;
        }
        this.container.fetch(
            'userDataRemove',
            function() {
                if (callback) {
                    callback();
                }
            },
            this.id + prop,
            true // run-once
        );
    }

    /**
     * Destroy and don't use after this
     */
    destroy() {
        this.id = null;
        this.container = null;
    }
}
