import {ApplicationPlugin} from '@springroll/core';
import HintsPlayer from '../HintsPlayer';

(function()
{
    /**
     * @class Application
     */
    const plugin = new ApplicationPlugin('hints');

    // Init the animator
    plugin.setup = function()
    {
        /**
         * The hint player API
         * @property {springroll.HintsPlayer} hints
         */
        this.hints = new HintsPlayer(this);
    };

    // Check for dependencies
    plugin.preload = function(done)
    {
        if (!this.animator)
        {
            // @if DEBUG
            throw 'Hints requires the Animator to run';
            // @endif

            // @if RELEASE
            // eslint-disable-next-line no-unreachable
            throw 'No animator';
            // @endif
        }

        if (!this.voPlayer)
        {
            // @if DEBUG
            throw 'Hints requires the Sound module to be included';
            // @endif

            // @if RELEASE
            // eslint-disable-next-line no-unreachable
            throw 'No sound';
            // @endif
        }

        // Listen for events
        this.hints.on('vo', onVOHint, this);
        this.hints.on('anim', onAnimatorHint, this);

        // Send messages to the container
        if (this.container)
        {
            // Listen for manual help clicks
            this.container.on('playHelp', this.hints.play);

            // Listen whtn the hint changes
            this.hints.on('enabled', enabled => 
            {
                this.container.send('helpEnabled', enabled);
            });
        }
        done();
    };

    /**
     * Handle the VO event
     * @method onVOHint
     * @private
     * @param {object} data The VO data
     */
    var onVOHint = function(data)
    {
        if (this.media)
        {
            this.media.playInstruction(
                data.events,
                data.complete,
                data.cancel
            );
        }
        else
        {
            this.voPlayer.play(
                data.events,
                data.complete,
                data.cancel
            );
        }
    };

    /**
     * Handle the animator event
     * @method onAnimatorHint
     * @private
     * @param {object} data The animator data
     */
    var onAnimatorHint = function(data)
    {
        if (this.media)
        {
            this.media.playInstruction(
                data.instance,
                data.events,
                data.complete,
                data.cancel
            );
        }
        else
        {
            this.animator.play(
                data.instance,
                data.events,
                data.complete,
                data.cancel
            );
        }
    };

    // Destroy the animator
    plugin.teardown = function()
    {
        if (this.container)
        {
            this.container.off('playHelp');
        }
        if (this.hints)
        {
            this.hints.off('enabled vo anim');
            this.hints.destroy();
            this.hints = null;
        }
    };

}());