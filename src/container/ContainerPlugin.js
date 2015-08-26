/**
*  @module Container Client
*  @namespace springroll
*/
(function(undefined)
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		PageVisibility = include('springroll.PageVisibility'),
		Bellhop = include('Bellhop');

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin(50);

	// Init the animator
	plugin.setup = function()
	{
		var options = this.options;

		/**
		 * The default play-mode for the application is continuous, if the application is
		 * running as part of a sequence is it considered in "single play" mode
		 * and the application will therefore close itself.
		 * @property {Boolean} options.singlePlay
		 * @readOnly
		 * @default false
		 */
		options.add('singlePlay', false, true);

		/**
		 * The optional play options to use if the application is played in "single play"
		 * mode. These options are passed from the application container to specify
		 * options that are used for this single play session. For instance,
		 * if you want the single play to focus on a certain level or curriculum
		 * such as `{ "shape": "square" }`
		 * @property {Object} options.playOptions
		 * @readOnly
		 */
		options.add('playOptions', null, true);

		/**
		 * Send a message to let the site know that this has
		 * been loaded, if the site is there
		 * @property {Bellhop} container
		 */
		var container = this.container = new Bellhop();
		container.connect();

		/**
		 * This option tells the container to always keep focus on the iframe even
		 * when the focus is lost. This is useful mostly if your Application
		 * requires keyboard input.
		 * @property {Boolean} options.keepFocus
		 */
		options.add('keepFocus', false)
			.on('keepFocus', function(data)
			{
				container.send('keepFocus', data);
			});

		// Handle the learning event
		this.on('learningEvent', function(data)
		{
			container.send('learningEvent', data);
		});

		// Handle google analtyics event
		this.on('analyticEvent', function(data)
		{
			container.send('analyticEvent', data);
		});

		// When the preloading is done
		this.once('beforeInit', function()
		{
			container.send('loadDone');
		});

		/**
		 * The default play-mode for the application is continuous, if the application is
		 * running as part of a sequence is it considered in "single play" mode
		 * and the application will therefore close itself.
		 * @property {Boolean} singlePlay
		 * @readOnly
		 * @default false
		 */
		this.singlePlay = false;

		/**
		 * The optional play options to use if the application is played in "single play"
		 * mode. These options are passed from the application container to specify
		 * options that are used for this single play session. For instance,
		 * if you want the single play to focus on a certain level or curriculum
		 * such as `{ "shape": "square" }`
		 * @property {Object} playOptions
		 * @readOnly
		 */
		this.playOptions = null;

		/**
		 * When a application is in singlePlay mode it will end.
		 * It's unnecessary to check `if (this.singlePlay)` just
		 * call the method and it will end the application if it can.
		 * @method singlePlayEnd
		 */
		this.singlePlayEnd = function()
		{
			if (this.singlePlay)
			{
				this.endGame();
			}
		};

		/**
		 * Manually close the application, this can happen when playing through once
		 * @method endGame
		 * @param {String} [exitType='game_completed'] The type of exit
		 */
		this.endGame = function(exitType)
		{
			this.trigger('endGame', exitType || 'game_completed');
			this.destroy();
		};

		/**
		 * Track a Google Analytics event
		 * @method analyticEvent
		 * @param {String} action The action label
		 * @param {String} [label] The optional label for the event
		 * @param {Number} [value] The optional value for the event
		 */
		this.analyticEvent = function(action, label, value)
		{
			this.trigger('analyticEvent',
			{
				category: this.name,
				action: action,
				label: label,
				value: value
			});
		};

		// Listen when the browser closes or redirects
		window.onunload = window.onbeforeunload = onWindowUnload.bind(this);
	};

	// Handler for when a window is unloaded
	var onWindowUnload = function()
	{
		// Remove listener to not trigger twice
		window.onunload = window.onbeforeunload = null;
		this.endGame('left_site');
		return undefined;
	};

	// Check for application name
	plugin.preload = function(done)
	{
		if (!this.name)
		{
			if (DEBUG)
			{
				throw "Application name is empty, please add a Application option of 'name'";
			}
			else
			{
				throw "Application name is empty";
			}
		}
		
		// Add the options to properties
		this.singlePlay = !!this.options.singlePlay;
		this.playOptions = this.options.playOptions || {};

		// Merge the container options with the current
		// application options
		if (this.container.supported)
		{
			//Setup the container listeners for site soundMute and captionsMute events
			this.container.on(
			{
				soundMuted: onSoundMuted.bind(this),
				captionsMuted: onCaptionsMuted.bind(this),
				musicMuted: onContextMuted.bind(this, 'music'),
				voMuted: onContextMuted.bind(this, 'vo'),
				sfxMuted: onContextMuted.bind(this, 'sfx'),
				captionsStyles: onCaptionsStyles.bind(this),
				pause: onPause.bind(this),
				singlePlay: onSinglePlay.bind(this),
				playOptions: onPlayOptions.bind(this),
				close: onClose.bind(this)
			});

			var hasSound = !!this.sound;

			// Add the features that are enabled
			this.container.send('features', {
				learning: !!this.learning,
				sound: hasSound,
				hints: !!this.hints,
				music: hasSound && this.sound.contextExists('music'),
				vo: hasSound && this.sound.contextExists('vo'),
				sfx: hasSound && this.sound.contextExists('sfx'),
				captions: !!this.captions
			});

			// Turn off the page hide and show auto pausing the App
			this.options.autoPause = false;

			//handle detecting and sending blur/focus events
			var container = this.container;
			this._pageVisibility = new PageVisibility(
				container.send.bind(container, 'focus', true),
				container.send.bind(container, 'focus', false)
			);
		}
		done();
	};

	/**
	 * When the container pauses the application
	 * @method onPause
	 * @private
	 * @param {event} e The Bellhop event
	 */
	var onPause = function(e)
	{
		this.paused = !!e.data;
		this.enabled = !this.paused;
	};

	/**
	 * Handler when the sound is muted
	 * @method onSoundMuted
	 * @private
	 * @param {Event} e The bellhop event
	 */
	var onSoundMuted = function(e)
	{
		if (this.sound)
		{
			this.sound.muteAll = !!e.data;
		}
	};

	/**
	 * Handler when the captions are muted
	 * @method onCaptionsMuted
	 * @private
	 * @param {Event} e The bellhop event
	 */
	var onCaptionsMuted = function(e)
	{
		if (this.captions)
		{
			this.captions.mute = !!e.data;
		}
	};

	/**
	 * Handler when the context is muted
	 * @method onContextMuted
	 * @private
	 * @param {String} context The name of the sound context
	 * @param {Event} e The bellhop event
	 */
	var onContextMuted = function(context, e)
	{
		if (this.sound)
		{
			this.sound.setContextMute(context, !!e.data);
		}
	};

	/**
	 * The captions style is being set
	 * @method onCaptionsStyles
	 * @private
	 * @param {Event} e The bellhop event
	 */
	var onCaptionsStyles = function(e)
	{
		var styles = e.data;
		var captions = this.captions || {};
		var textField = captions.textField || null;

		// Make sure we have a text field and a DOM object
		if (textField && textField.nodeName)
		{
			textField.className = "size-" + styles.size + " " +
				"bg-" + styles.background + " " +
				"color-" + styles.color + " " +
				"edge-" + styles.edge + " " +
				"font-" + styles.font + " " +
				"align-" + styles.align;
		}
	};

	/**
	 * Handler when a application enters single play mode
	 * @method onPlayOptions
	 * @private
	 * @param {event} e The Bellhop event
	 */
	var onPlayOptions = function(e)
	{
		Object.merge(this.playOptions, e.data || {});
	};

	/**
	 * Handler when a application enters single play mode
	 * @method onSinglePlay
	 * @private
	 */
	var onSinglePlay = function()
	{
		this.singlePlay = true;
	};

	/**
	 * Game container requests closing the application
	 * @method onClose
	 * @private
	 */
	var onClose = function()
	{
		this.endGame('closed_container');
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		if (this._pageVisibility)
		{
			this._pageVisibility.destroy();
			this._pageVisibility = null;
		}

		// Send the end application event to the container
		if (this.container)
		{
			this.container.send('endGame');
			this.container.destroy();
			this.container = null;
		}
	};

}());