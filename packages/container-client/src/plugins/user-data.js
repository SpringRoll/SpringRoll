import {ApplicationPlugin} from '@springroll/core';
import UserData from '../UserData';

(function() {
    /**
     * @class Application
     */
    let plugin = new ApplicationPlugin('user-data', 'container-client');

    // Init the animator
    plugin.setup = function() {
        /**
         * The API for saving user data, default is to save
         * data to the container, if not connected, it will
         * save user data to local cookies
         * @property {springroll.UserData} userData
         */
        this.userData = new UserData(this.container);
    };

    // Check for application name
    plugin.preload = function(done) {
        if (!this.name) {
            // @if DEBUG
            throw 'Application name is empty, please add a Application option of \'name\'';
            // @endif

            // @if RELEASE
            // eslint-disable-next-line
            throw 'Application name is empty';
            // @endif
        }

        // Connect the user data to container
        this.userData.id = this.name;

        done();
    };

    // Destroy the animator
    plugin.teardown = function() {
        if (this.userData) {
            this.userData.destroy();
            this.userData = null;
        }
    };

}());