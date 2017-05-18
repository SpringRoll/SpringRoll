/*! SpringRoll 1.0.3 */
/**
 * @module Container Client
 * @namespace springroll
 */
(function()
{
	// Impor classes
	var SavedData = include('springroll.SavedData');

	/**
	 * This class is responsible for saving the user-specific data
	 * within an Application. This can be player-progress data, high
	 * score information, or other data that needs be saved between
	 * sessions of running an app.
	 * @class UserData
	 * @constructor
	 * @param {Bellhop} container The container instance
	 */
	var UserData = function(container)
	{
		/**
		 * Reference to the container. If the app is not connected
		 * to the Container (running standalone) then the container
		 * is set to be `null`.
		 * @property {Bellhop} container
		 * @default  null
		 * @readOnly
		 */
		this.container = container;

		/**
		 * The name to preprend to each property name, this is set
		 * by default as the Application's name, which is required
		 * for the Container Client module.
		 * @property {String} id
		 * @default ""
		 */
		this.id = "";
	};

	// Reference to prototype
	var p = extend(UserData);

	/**
	 * Read a saved setting
	 * @method read
	 * @param  {String}   prop The property name
	 * @param  {Function} callback Callback when save completes, returns the value
	 */
	p.read = function(prop, callback)
	{
		if (!this.container.supported)
		{
			return callback(SavedData.read(this.id + prop));
		}
		this.container.fetch(
			'userDataRead',
			function(event)
			{
				callback(event.data);
			},
			this.id + prop,
			true // run-once
		);
	};

	/**
	 * Write a setting
	 * @method write
	 * @param  {String}   prop The property name
	 * @param  {*}   value The property value to save
	 * @param  {Function} [callback] Callback when write completes
	 */
	p.write = function(prop, value, callback)
	{
		if (!this.container.supported)
		{
			SavedData.write(this.id + prop, value);
			if (callback) callback();
			return;
		}
		this.container.fetch(
			'userDataWrite',
			function(event)
			{
				if (callback) callback();
			},
			{
				name: this.id + prop,
				value: value
			},
			true // run-once
		);
	};

	/**
	 * Delete a saved setting by name
	 * @method remove
	 * @param  {String}   prop The property name
	 * @param  {Function} [callback] Callback when remove completes
	 */
	p.remove = function(prop, callback)
	{
		if (!this.container.supported)
		{
			SavedData.remove(this.id + prop);
			if (callback) callback();
			return;
		}
		this.container.fetch(
			'userDataRemove',
			function(event)
			{
				if (callback) callback();
			},
			this.id + prop,
			true // run-once
		);
	};

	/**
	 * Destroy and don't use after this
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.id = null;
		this.container = null;
	};

	// Assign to namespace
	namespace('springroll').UserData = UserData;

}());
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
			if (true && window.console) console.error(error);
			this.container.send('localError', String(error));
			return false; // handle gracefully in release mode
		}
	};

	// Check for application name
	plugin.preload = function(done)
	{
		if (!this.name)
		{
			if (true)
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
			this.container.on(
			{
				soundMuted: onSoundMuted.bind(this),
				captionsMuted: onCaptionsMuted.bind(this),
				musicMuted: onContextMuted.bind(this, 'music'),
				voMuted: onContextMuted.bind(this, 'vo'),
				sfxMuted: onContextMuted.bind(this, 'sfx'),
				captionsStyles: onCaptionsStyles.bind(this),
				pause: onPause.bind(this),
				close: onClose.bind(this)
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
	 * Handler when a application enters single play mode
	 * @method onPlayOptions
	 * @private
	 * @param {event} e The Bellhop event
	 */
	var onPlayOptions = function(e)
	{
		Object.merge(this.playOptions, e.data ||
		{});
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