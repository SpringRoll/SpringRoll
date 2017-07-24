import {ApplicationPlugin} from '@springroll/core';
import Animator from '../Animator';
import GenericMovieClipInstance from '../GenericMovieClipInstance';

(function() {

    const plugin = new ApplicationPlugin('animator');

    //init the animator
    plugin.setup = function() {
        /**
         * Property for playing animations.
         * ### module: @springroll/animation
         * @member {springroll.Animator} springroll.Application#animator
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