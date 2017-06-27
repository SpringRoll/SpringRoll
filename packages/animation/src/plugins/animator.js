import {ApplicationPlugin} from '@springroll/core';
import Animator from '../Animator';
import GenericMovieClipInstance from '../GenericMovieClipInstance';

(function() {
    /**
     * @class Application
     */
    let plugin = new ApplicationPlugin('animator');

    //init the animator
    plugin.setup = function() {
        /**
         * The class for playing animation
         * @property {springroll.Animator} animator
         */
        this.animator = new Animator(this);
        this.animator.captions = this.captions || null;
        this.animator.register(GenericMovieClipInstance, 0);
    };

    //destroy the animator
    plugin.teardown = function() {
        if (this.animator) {
            this.animator.destroy();
            this.animator = null;
        }
    };

}());