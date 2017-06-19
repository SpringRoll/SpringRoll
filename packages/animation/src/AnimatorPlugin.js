/**
 * @module Animation
 * @namespace springroll
 * @requires Core
 */
(function()
{
    //include classes
    var ApplicationPlugin = include('springroll.ApplicationPlugin'),
        Animator = include('springroll.Animator');

    /**
     * @class Application
     */
    var plugin = new ApplicationPlugin(50);

    //init the animator
    plugin.setup = function()
    {
        /**
         * The class for playing animation
         * @property {springroll.Animator} animator
         */
        this.animator = new Animator(this);
        this.animator.captions = this.captions || null;
        this.animator.register('springroll.GenericMovieClipInstance', 0);
    };

    //destroy the animator
    plugin.teardown = function()
    {
        if (this.animator)
        {
            this.animator.destroy();
            this.animator = null;
        }
    };

}());