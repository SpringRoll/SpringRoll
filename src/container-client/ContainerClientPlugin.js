/**
 * @module Container Client
 * @namespace springroll
 */
(function(undefined)
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		PageVisibility = include('springroll.PageVisibility'),
		UserData = include('springroll.UserData'),
		Bellhop = include('Bellhop');

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin(200);

	// Init the animator
	plugin.setup = function()
	{
		var options = this.options;

		/**
		 * Send a message to let the site know that this has
		 * been loaded, if the site is there
		 * @property {Bellhop} container
		 */
		var container = this.container = new Bellhop();
		container.connect();

		/**
		 * The API for saving user data, default is to save
		 * data to the container, if not connected, it will
		 * save user data to local cookies
		 * @property {springroll.UserData} userData
		 */
		this.userData = new UserData(container);

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

		// Pass along preloading progress
		this.on('progress', function(e)
		{
			this.container.send('progress', e);
		});

		// When the preloading is done
		this.once('beforeInit', function()
		{
			container.send('loaded');
		});

		// Send the first event
		container.send('loading');

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
		this.playOptions = {};

		// attempt to load play options from the query string
		var match = /playOptions=[^&$]*/.exec(window.location.search);
		if (match !== null)
		{
			var matchedToken = match[0];
			var rawValue = decodeURIComponent(matchedToken.split('=')[1]);

			try
			{
				this.playOptions = JSON.parse(rawValue);
			}
			catch (e)
			{
				if (springroll.Debug)
				{
					springroll.Debug.warn('ContainerClientPlugin: Failed to parse playOptions from query string');
				}
			}
		}

		/**
		 * When a application is in singlePlay mode it will end.
		 * It's unnecessary to check `if (this.singlePlay)` just
		 * call the method and it will end the application if it can.
		 * @method singlePlayEnd
		 * @return {Boolean} If endGame is called
		 */
		this.singlePlayEnd = function()
		{
			if (this.singlePlay)
			{
				this.endGame();
				return true;
			}
			return false;
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

		// Dispatch the features
		this.once('beforeInit', function()
		{
			var hasSound = !!this.sound;

			// Add the features that are enabled
			this.container.send('features',
			{
				sound: hasSound,
				hints: !!this.hints,
				music: hasSound && this.sound.contextExists('music'),
				vo: hasSound && this.sound.contextExists('vo'),
				sfx: hasSound && this.sound.contextExists('sfx'),
				captions: !!this.captions,
				disablePause: !!this.options.disablePause
			});
		});

		if (container.supported)
		{
			container.fetch('singlePlay', onSinglePlay.bind(this));
			container.fetch('playOptions', onPlayOptions.bind(this));
		}

		// Handle errors gracefully
		window.onerror = onWindowError.bind(this);

		// Listen when the browser closes or redirects
		window.onunload = window.onbeforeunload = onWindowUnload.bind(this);
	};

	/**
	 * Handler for when a window is unloaded
	 * @method  onWindowUnload
	 * @private
	 */
	var onWindowUnload = function()
	{
		// Remove listener to not trigger twice
		window.onunload = window.onbeforeunload = null;
		this.endGame('left_site');
		return undefined;
	};

	/**
	 * Handle the window uncaught errors with the container
	 * @method  onWindowError
	 * @private
	 * @param  {Error} error Uncaught Error
	 */
	var onWindowError = function(error)
	{
		// If the container is supported
		// then handle the errors and pass to the container
		if (this.container.supported)
		{
			if (DEBUG && window.console) console.error(error);
			this.container.send('localError', String(error));
			return RELEASE; // handle gracefully in release mode
		}
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

		// Connect the user data to container
		this.userData.id = this.name;

		// Merge the container options with the current
		// application options
		if (this.container.supported)
		{
			//Setup the container listeners for site soundMute and captionsMute events
			this.container.on('soundMuted', onSoundMuted.bind(this));
			this.container.on('captionsMuted', onCaptionsMuted.bind(this));
			this.container.on('musicMuted', onContextMuted.bind(this, 'music'));
			this.container.on('voMuted', onContextMuted.bind(this, 'vo'));
			this.container.on('sfxMuted', onContextMuted.bind(this, 'sfx'));
			this.container.on('captionsStyles', onCaptionsStyles.bind(this));
			this.container.on('pause', onPause.bind(this));
			this.container.on('close', onClose.bind(this));

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
		var paused = !!e.data;
		// container pause events are also considered "autoPause" events
		// event if the event was fired by the container's pauseButton
		this.autoPaused = paused;
		this.enabled = !paused;
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
		var captions = this.captions ||
		{};
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
	 * Handler when a application receives playOptions from the container
	 * @method onPlayOptions
	 * @private
	 * @param {event} e The Bellhop event
	 */
	var onPlayOptions = function(e)
	{
		Object.merge(this.playOptions, e.data ||
		{});
		this.trigger('playOptions', this.playOptions);
	};

	/**
	 * Handler when a application enters single play mode
	 * @method onSinglePlay
	 * @private
	 * @param {event} e The Bellhop event
	 */
	var onSinglePlay = function(e)
	{
		this.singlePlay = !!e.data;
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
		window.onerror = null;

		if (this._pageVisibility)
		{
			this._pageVisibility.destroy();
			this._pageVisibility = null;
		}

		if (this.userData)
		{
			this.userData.destroy();
			this.userData = null;
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