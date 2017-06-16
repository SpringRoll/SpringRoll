import ApplicationPlugin from '../ApplicationPlugin';

(function() {

    /**
     * @class Application
     */
    var plugin = new ApplicationPlugin(120);

    plugin.setup = function()
    {
        var options = this.options;
        /**
         * Use Request Animation Frame API
         * @property {Boolean} options.raf
         * @default true
         */
        options.add('raf', true, true);

        /**
         * The framerate to use for rendering the stage
         * @property {int} options.fps
         * @default 60
         */
        options.add('fps', 60, true);

        /**
         * Use the query string parameters for options overrides
         * @property {Boolean} options.useQueryString
         * @default false
         */
        options.add('useQueryString', DEBUG, true);

        /**
         * The default display DOM ID name
         * @property {String} options.canvasId
         */
        options.add('canvasId', null, true);

        /**
         * The name of the class to automatically instantiate as the
         * display (e.g. `springroll.PixiDisplay`)
         * @property {Function} options.display
         */
        options.add('display', null, true);

        /**
         * Display specific setup options
         * @property {Object} options.displayOptions
         */
        options.add('displayOptions', null, true);

        /**
         * If using TweenJS, the Application will update the Tween itself.
         * @property {Boolean} options.updateTween
         * @default true
         */
        var app = this;
        options.add('updateTween', true, true)
            .on('updateTween', function(value)
            {
                var Tween = include('createjs.Tween', false);
                var Ticker = include('createjs.Ticker', false);

                if (Tween)
                {
                    if (Ticker)
                    {
                        Ticker.setPaused(!!value);
                    }
                    app.off('update', Tween.tick);
                    if (value)
                    {
                        app.on('update', Tween.tick);
                    }
                }
            });

        /**
         * The name of the application
         * @property {String} options.name
         * @default ''
         */
        options.add('name', '', true);
    };

}());
