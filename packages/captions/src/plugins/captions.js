import {ApplicationPlugin} from '@springroll/core';
import Captions from '../Captions';
// @if DEBUG
import {Debug} from '@springroll/debug';
// @endif

(function() {

    const plugin = new ApplicationPlugin('captions');

    //Initialize
    plugin.setup = function() {
        /**
         * The captions text field object to use for the 
         * VOPlayer captions object.
         * ### module: @springroll/captions
         * @member {DOMElement|String|PIXI.Text|PIXI.BitmapText} captions
         * @memberof springroll.ApplicationOptions#
         * @default 'springroll-captions'
         * @readOnly
         */
        this.options.add('captions', 'springroll-captions', true);

        /**
         * The path to the captions file to preload.
         * ### module: @springroll/captions
         * @member {string} captionsPath
         * @memberof springroll.ApplicationOptions#
         * @default null
         * @readOnly
         */
        this.options.add('captionsPath', null, true);

        /**
         * The global captions object.
         * ### module: @springroll/captions
         * @member {springroll.Captions} captions
         * @memberof springroll.Application#
         */
        this.captions = new Captions();
    };

    //Preload the captions
    plugin.preload = function(done) {
        //Give the player a reference
        if (this.voPlayer) {
            this.voPlayer.captions = this.captions;
        }

        //Setup the text field
        this.captions.textField = this.options.captions;

        let captionsPath = this.options.captionsPath;
        if (captionsPath) {
            this.load(captionsPath, data => {
                this.captions.data = data;
                done();
            });
        }
        else {
            // @if DEBUG
            Debug.info('Application option \'captionsPath\' is empty, set to automatically load captions JSON');
            // @endif
            done();
        }
    };

    //Destroy the animator
    plugin.teardown = function() {
        if (this.captions) {
            this.captions.destroy();
            this.captions = null;
        }
    };

}());