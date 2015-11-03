/**
 * @module Container
 * @namespace springroll
 */
(function(document, undefined)
{
	//Import classes
	var SavedData = include('springroll.SavedData'),
		EventDispatcher = include('springroll.EventDispatcher'),
		PageVisibility = include('springroll.PageVisibility'),
		SavedDataHandler = include('springroll.SavedDataHandler'),
		Features = include('springroll.Features'),
		Bellhop = include('Bellhop'),
		$ = include('jQuery');

	/**
	 * The application container
	 * @class Container
	 * @extends springroll.EventDispatcher
	 * @constructor
	 * @param {string} iframeSelector jQuery selector for application iframe container
	 * @param {object} [options] Optional parameteres
	 * @param {string} [options.helpButton] jQuery selector for help button
	 * @param {string} [options.captionsButton] jQuery selector for captions button
	 * @param {string} [options.soundButton] jQuery selector for captions button
	 * @param {string} [options.voButton] jQuery selector for vo button
	 * @param {string} [options.sfxButton] jQuery selector for sounf effects button
	 * @param {string} [options.musicButton] jQuery selector for music button
	 * @param {string} [options.pauseButton] jQuery selector for pause button
	 * @param {string} [options.pauseFocusSelector='.pause-on-focus'] The class to pause
	 *        the application when focused on. This is useful for form elements which
	 *        require focus and play better with Application's keepFocus option.
	 */
	var Container = function(iframeSelector, options)
	{
		EventDispatcher.call(this);

		/**
		 * The options
		 * @property {Object} options
		 * @readOnly
		 */
		this.options = options = $.extend(
		{
			pauseFocusSelector: '.pause-on-focus'
		}, options ||
		{});

		/**
		 * The name of this class
		 * @property {string} name
		 */
		this.name = 'springroll.Container';

		/**
		 * The current iframe jquery object
		 * @property {jquery} iframe
		 */
		this.main = $(iframeSelector);

		/**
		 * The DOM object for the iframe
		 * @property {Element} dom
		 */
		this.dom = this.main[0];

		/**
		 * Reference to the help button
		 * @property {jquery} helpButton
		 */
		this.helpButton = $(options.helpButton)
			.click(onPlayHelp.bind(this));

		/**
		 * Reference to the captions button
		 * @property {jquery} captionsButton
		 */
		this.captionsButton = $(options.captionsButton)
			.click(onCaptionsToggle.bind(this));

		/**
		 * Reference to the all sound mute button
		 * @property {jquery} soundButton
		 */
		this.soundButton = $(options.soundButton)
			.click(onSoundToggle.bind(this));

		/**
		 * Reference to the music mute button
		 * @property {jquery} musicButton
		 */
		this.musicButton = $(options.musicButton)
			.click(onMusicToggle.bind(this));

		/**
		 * Reference to the sound effects mute button
		 * @property {jquery} sfxButton
		 */
		this.sfxButton = $(options.sfxButton)
			.click(onSFXToggle.bind(this));

		/**
		 * Reference to the voice-over mute button
		 * @property {jquery} voButton
		 */
		this.voButton = $(options.voButton)
			.click(onVOToggle.bind(this));

		/**
		 * Reference to the pause application button
		 * @property {jquery} pauseButton
		 */
		this.pauseButton = $(options.pauseButton)
			.click(onPauseToggle.bind(this));

		/**
		 * Communication layer between the container and application
		 * @property {Bellhop} client
		 */
		this.client = null;

		/**
		 * The current release data
		 * @property {Object} release
		 */
		this.release = null;

		/**
		 * Check to see if a application is loaded
		 * @property {Boolean} loaded
		 * @readOnly
		 */
		this.loaded = false;

		/**
		 * Check to see if a application is loading
		 * @property {Boolean} loading
		 * @readOnly
		 */
		this.loading = false;

		/**
		 * The collection of captions styles
		 * @property {string} _captionsStyles
		 * @private
		 */
		this._captionsStyles = Object.merge(
			{},
			DEFAULT_CAPTIONS_STYLES,
			SavedData.read(CAPTIONS_STYLES) ||
			{}
		);

		/**
		 * Whether the Game is currently "blurred" (not focused) - for pausing/unpausing
		 * @property {Boolean} _appBlurred
		 * @private
		 * @default  false
		 */
		this._appBlurred = false;

		/**
		 * Always keep the focus on the application iframe
		 * @property {Boolean} _keepFocus
		 * @private
		 * @default  false
		 */
		this._keepFocus = false;

		/**
		 * Whether the Container is currently "blurred" (not focused) - for pausing/unpausing
		 * @property {Boolean} _containerBlurred
		 * @private
		 * @default  false
		 */
		this._containerBlurred = false;

		/**
		 * Delays pausing of application to mitigate issues with asynchronous communication
		 * between Game and Container
		 * @property {int} _pauseTimer
		 */
		this._pauseTimer = null;

		/**
		 * If the application is currently paused manually
		 * @property {boolean} _isManualPause
		 * @private
		 * @default false
		 */
		this._isManualPause = false;

		/**
		 * If the current application is paused
		 * @property {Boolean} _paused
		 * @private
		 * @default false
		 */
		this._paused = false;

		/**
		 * Should we send bellhop messages for the mute (etc) buttons?
		 * @property {Boolean} sendMutes
		 * @default true
		 */
		this.sendMutes = true;

		/**
		 * The external handler class, must include `remove`, `write`, `read` methods
		 * make it possible to use something else to handle the external, default
		 * is to use cookies/localStorage. See {{#crossLink "springroll.SavedDataHandler"}}{{/crossLink}}
		 * as an example.
		 * @property {Object} userDataHandler
		 * @default springroll.SavedDataHandler
		 */
		this.userDataHandler = new SavedDataHandler();

		//Set the defaults if we have none for the controls
		if (SavedData.read(CAPTIONS_MUTED) === null)
		{
			this.captionsMuted = true;
		}
		if (SavedData.read(SOUND_MUTED) === null)
		{
			this.soundMuted = false;
		}

		this._pageVisibility = new PageVisibility(
			onContainerFocus.bind(this),
			onContainerBlur.bind(this)
		);

		// Focus on the window on focusing on anything else
		// without the .pause-on-focus class
		this._onDocClick = _onDocClick.bind(this);
		$(document).on('focus click', this._onDocClick);

		// On elements with the class name pause-on-focus
		// we will pause the game until a blur event to that item
		// has been sent
		var self = this;
		$(options.pauseFocusSelector).on('focus', function()
		{
			self._isManualPause = self.paused = true;
			$(this).one('blur', function()
			{
				self._isManualPause = self.paused = false;
				self.focus();
			});
		});
	};

	//Reference to the prototype
	var s = EventDispatcher.prototype;
	var p = EventDispatcher.extend(Container);

	/**
	 * Fired when the pause state is toggled
	 * @event pause
	 * @param {boolean} paused If the application is now paused
	 */

	/**
	 * Fired when the application resumes from a paused state
	 * @event resumed
	 */

	/**
	 * Fired when the application becomes paused
	 * @event paused
	 */

	/**
	 * Fired when the application is unsupported
	 * @event unsupported
	 * @param {String} err The error message
	 */

	/**
	 * Fired when the API cannot be called
	 * @event remoteFailed
	 */

	/**
	 * There was a problem with the API call
	 * @event remoteError
	 */

	/**
	 * Event when the application gives the load done signal
	 * @event opened
	 */

	/**
	 * Event when a application starts closing
	 * @event close
	 */

	/**
	 * Event when a application closes
	 * @event closed
	 */

	/**
	 * Event when a application start loading
	 * @event open
	 */

	/**
	 * Fired when the enabled status of the help button changes
	 * @event helpEnabled
	 * @param {boolean} enabled If the help button is enabled
	 */

	/**
	 * The features supported by the application
	 * @event features
	 * @param {Boolean} data.vo If VO vo context is supported
	 * @param {Boolean} data.music If music context is supported
	 * @param {Boolean} data.sound If Sound is supported
	 * @param {Boolean} data.sfx If SFX context is supported
	 * @param {Boolean} data.captions If captions is supported
	 * @param {Boolean} data.hints If hinting is supported
	 */

	/**
	 * When the document is clicked
	 * @method _onDocClicked
	 * @private
	 * @param  {Event} e Click or focus event
	 */
	var _onDocClick = function(e)
	{
		if (!this.loaded) return;

		if (!$(e.target).filter(this.options.pauseFocusSelector).length)
		{
			this.focus();
		}
	};

	/**
	 * Open a application or path
	 * @method _internalOpen
	 * @private
	 * @param {string} path The full path to the application to load
	 * @param {Object} [options] The open options
	 * @param {Boolean} [options.singlePlay=false] If we should play in single play mode
	 * @param {Object} [options.playOptions=null] The optional play options
	 */
	p._internalOpen = function(path, options)
	{
		options = $.extend(
		{
			singlePlay: false,
			playOptions: null
		}, options);

		this.reset();

		// Dispatch event for unsupported browsers
		// and then bail, don't continue with loading the application
		var err = Features.basic();
		if (err)
		{
			return this.trigger('unsupported', err);
		}

		this.loading = true;

		this.initClient();

		//Open the application in the iframe
		this.main
			.addClass('loading')
			.prop('src', path);

		if (options.singlePlay)
		{
			this.client.send('singlePlay');
		}

		if (options.playOptions)
		{
			this.client.send('playOptions', options.playOptions);
		}

		this.trigger('open');
	};

	/**
	 * Open a application or path
	 * @method openPath
	 * @param {string} path The full path to the application to load
	 * @param {Object} [options] The open options
	 * @param {Boolean} [options.singlePlay=false] If we should play in single play mode
	 * @param {Object} [options.playOptions=null] The optional play options
	 */
	p.openPath = function(path, options, playOptions)
	{
		options = options ||
		{};

		// This should be deprecated, support for old function signature
		if (typeof options === "boolean")
		{
			options = {
				singlePlay: singlePlay,
				playOptions: playOptions
			};
		}
		this._internalOpen(path, options);
	};

	/**
	 * Open application based on an API Call to SpringRoll Connect
	 * @method openRemote
	 * @param {string} api The path to API call, this can be a full URL
	 * @param {Object} [options] The open options
	 * @param {Boolean} [options.singlePlay=false] If we should play in single play mode
	 * @param {Object} [options.playOptions=null] The optional play options
	 * @param {String} [options.query=''] The application query string options (e.g., "?level=1")
	 */
	p.openRemote = function(api, options, playOptions)
	{
		// This should be deprecated, support for old function signature
		if (typeof options === "boolean")
		{
			options = {
				singlePlay: singlePlay,
				playOptions: playOptions
			};
		}
		options = $.extend(
		{
			query: '',
			playOptions: null,
			singlePlay: false
		}, options);

		this.release = null;

		$.getJSON(api, function(result)
				{
					if (this._destroyed) return;

					if (!result.success)
					{
						return this.trigger('remoteError', result.error);
					}
					var release = result.data;

					var err = Features.test(release.capabilities);

					if (err)
					{
						return this.trigger('unsupported', err);
					}

					this.release = release;

					// Open the application
					this._internalOpen(release.url + options.query, options);
				}
				.bind(this))
			.fail(function()
				{
					if (this._destroyed) return;
					return this.trigger('remoteFailed');
				}
				.bind(this));
	};

	/**
	 * Set up communication layer between site and application.
	 * May be called from subclasses if they create/destroy Bellhop instances.
	 * @protected
	 * @method initClient
	 */
	p.initClient = function()
	{
		//Setup communication layer between site and application
		this.client = new Bellhop();
		this.client.connect(this.dom);

		//Handle bellhop events coming from the application
		this.client.on(
		{
			loadDone: onLoadDone.bind(this),
			endGame: onEndGame.bind(this),
			focus: onFocus.bind(this),
			helpEnabled: onHelpEnabled.bind(this),
			features: onFeatures.bind(this),
			keepFocus: onKeepFocus.bind(this),
			userDataRemove: onUserDataRemove.bind(this),
			userDataRead: onUserDataRead.bind(this),
			userDataWrite: onUserDataWrite.bind(this)
		});
	};

	/**
	 * Removes the Bellhop communication layer altogether.
	 * @protected
	 * @method destroyClient
	 */
	p.destroyClient = function()
	{
		if (this.client)
		{
			this.client.destroy();
			this.client = null;
		}
	};

	/**
	 * Handler for the userDataRemove event
	 * @method onUserDataRemove
	 * @private
	 */
	var onUserDataRemove = function(event)
	{
		var client = this.client;
		this.userDataHandler.remove(event.data, function()
		{
			client.send(event.type);
		});
	};

	/**
	 * Handler for the userDataRead event
	 * @method onUserDataRead
	 * @private
	 */
	var onUserDataRead = function(event)
	{
		var client = this.client;
		this.userDataHandler.read(event.data, function(value)
		{
			client.send(event.type, value);
		});
	};

	/**
	 * Handler for the userDataWrite event
	 * @method onUserDataWrite
	 * @private
	 */
	var onUserDataWrite = function(event)
	{
		var data = event.data;
		var client = this.client;
		this.userDataHandler.write(data.name, data.value, function()
		{
			client.send(event.type);
		});
	};

	/**
	 * Reset the mutes for audio and captions
	 * @method onLoadDone
	 * @private
	 */
	var onLoadDone = function()
	{
		this.loading = false;
		this.loaded = true;
		this.main.removeClass('loading');

		this.captionsButton.removeClass('disabled');
		this.soundButton.removeClass('disabled');
		this.sfxButton.removeClass('disabled');
		this.voButton.removeClass('disabled');
		this.musicButton.removeClass('disabled');
		this.pauseButton.removeClass('disabled');

		this.captionsMuted = !!SavedData.read(CAPTIONS_MUTED);
		this.soundMuted = !!SavedData.read(SOUND_MUTED);
		this.musicMuted = !!SavedData.read(MUSIC_MUTED);
		this.sfxMuted = !!SavedData.read(SFX_MUTED);
		this.voMuted = !!SavedData.read(VO_MUTED);

		this.setCaptionsStyles(SavedData.read(CAPTIONS_STYLES));

		// Loading is done
		this.trigger('opened');

		// Focus on the content
		this.focus();

		// Reset the paused state
		this.paused = this._paused;
	};

	/**
	 * Handle focus events sent from iFrame children
	 * @method onFocus
	 * @private
	 */
	var onFocus = function(e)
	{
		this._appBlurred = !e.data;
		this.manageFocus();
	};

	/**
	 * Handle focus events sent from container's window
	 * @method onContainerFocus
	 * @private
	 */
	var onContainerFocus = function(e)
	{
		this._containerBlurred = false;
		this.manageFocus();
	};

	/**
	 * Handle blur events sent from container's window
	 * @method onContainerBlur
	 * @private
	 */
	var onContainerBlur = function(e)
	{
		//Set both container and application to blurred,
		//because some blur events are only happening on the container.
		//If container is blurred because application area was just focused,
		//the application's focus event will override the blur imminently.
		this._containerBlurred = this._appBlurred = true;
		this.manageFocus();
	};

	/**
	 * Focus on the iframe's contentWindow
	 * @method focus
	 */
	p.focus = function()
	{
		this.dom.contentWindow.focus();
	};

	/**
	 * Unfocus on the iframe's contentWindow
	 * @method blur
	 */
	p.blur = function()
	{
		this.dom.contentWindow.blur();
	};

	/**
	 * Manage the focus change events sent from window and iFrame
	 * @method manageFocus
	 * @protected
	 */
	p.manageFocus = function()
	{
		// Unfocus on the iframe
		if (this._keepFocus)
		{
			this.blur();
		}

		// we only need one delayed call, at the end of any
		// sequence of rapidly-fired blur/focus events
		if (this._pauseTimer)
		{
			clearTimeout(this._pauseTimer);
		}

		// Delay setting of 'paused' in case we get another focus event soon.
		// Focus events are sent to the container asynchronously, and this was
		// causing rapid toggling of the pause state and related issues,
		// especially in Internet Explorer
		this._pauseTimer = setTimeout(
			function()
			{
				this._pauseTimer = null;
				// A manual pause cannot be overriden by focus events.
				// User must click the resume button.
				if (this._isManualPause) return;

				this.paused = this._containerBlurred && this._appBlurred;

				// Focus on the content window when blurring the app
				// but selecting the container
				if (this._keepFocus && !this._containerBlurred && this._appBlurred)
				{
					this.focus();
				}

			}.bind(this),
			100
		);
	};

	/**
	 * Handle the application features
	 * @method onFeatures
	 * @param {event} event The bellhop features
	 * @private
	 */
	var onFeatures = function(event)
	{
		var features = event.data;

		this.voButton.hide();
		this.musicButton.hide();
		this.soundButton.hide();
		this.captionsButton.hide();
		this.helpButton.hide();

		if (features.vo) this.voButton.show();
		if (features.music) this.musicButton.show();
		if (features.sound) this.soundButton.show();
		if (features.captions) this.captionsButton.show();
		if (features.hints) this.helpButton.show();

		this.trigger('features', features);
	};

	/**
	 * Handle the keep focus event for the window
	 * @method onKeepFocus
	 * @private
	 */
	var onKeepFocus = function(event)
	{
		this._keepFocus = !!event.data;
		this.manageFocus();
	};

	/**
	 * Reset the mutes for audio and captions
	 * @method onHelpEnabled
	 * @private
	 */
	var onHelpEnabled = function(event)
	{
		this.helpEnabled = !!event.data;
	};

	/**
	 * Handler when the play hint button is clicked
	 * @method onPlayHelp
	 * @private
	 */
	var onPlayHelp = function()
	{
		if (!this.paused && !this.helpButton.hasClass('disabled'))
		{
			this.client.send('playHelp');
		}
	};

	/**
	 * The application ended and destroyed itself
	 * @method onEndGame
	 * @private
	 */
	var onEndGame = function()
	{
		this.destroyClient();

		this.reset();
	};

	/**
	 * Handler when the captions mute button is clicked
	 * @method onCaptionsToggle
	 * @private
	 */
	var onCaptionsToggle = function()
	{
		this.captionsMuted = !this.captionsMuted;
	};

	/**
	 * If the current application is paused
	 * @property {Boolean} paused
	 * @default false
	 */
	Object.defineProperty(p, 'paused',
	{
		set: function(paused)
		{
			this._paused = paused;

			if (this.client)
			{
				this.client.send('pause', paused);
			}
			this.trigger(paused ? 'paused' : 'resumed');
			this.trigger('pause', paused);

			// Set the pause button state
			this.pauseButton.removeClass('unpaused paused')
				.addClass(paused ? 'paused' : 'unpaused');

			// Disable the help button when paused if it's active
			if (paused && !this.helpButton.hasClass('disabled'))
			{
				this.helpButton.data('paused', true);
				this.helpEnabled = false;
			}
			else if (this.helpButton.data('paused'))
			{
				this.helpButton.removeData('paused');
				this.helpEnabled = true;
			}
		},
		get: function()
		{
			return this._paused;
		}
	});

	/**
	 * Set the captions are muted
	 * @property {Boolean} helpEnabled
	 */
	Object.defineProperty(p, 'helpEnabled',
	{
		set: function(enabled)
		{
			this._helpEnabled = enabled;
			this.helpButton.removeClass('disabled enabled')
				.addClass(enabled ? 'enabled' : 'disabled');

			this.trigger('helpEnabled', enabled);
		},
		get: function()
		{
			return this._helpEnabled;
		}
	});

	/**
	 * Handler when the sound mute button is clicked
	 * @method onSoundToggle
	 * @private
	 */
	var onSoundToggle = function()
	{
		var muted = !this.soundMuted;
		this.soundMuted = muted;
		this.musicMuted = muted;
		this.voMuted = muted;
		this.sfxMuted = muted;
	};

	/**
	 * Handler when the music mute button is clicked
	 * @method onMusicToggle
	 * @private
	 */
	var onMusicToggle = function()
	{
		this.musicMuted = !this.musicMuted;
		this._checkSoundMute();
	};

	/**
	 * Handler when the voice-over mute button is clicked
	 * @method onVOToggle
	 * @private
	 */
	var onVOToggle = function()
	{
		this.voMuted = !this.voMuted;
		this._checkSoundMute();
	};

	/**
	 * Handler when the voice-over mute button is clicked
	 * @method onSFXToggle
	 * @private
	 */
	var onSFXToggle = function()
	{
		this.sfxMuted = !this.sfxMuted;
		this._checkSoundMute();
	};

	/**
	 * Check for when all mutes are muted or unmuted
	 * @method _checkSoundMute
	 * @private
	 */
	p._checkSoundMute = function()
	{
		this.soundMuted = this.sfxMuted && this.voMuted && this.musicMuted;
	};

	/**
	 * Toggle the current paused state of the application
	 * @method onPauseToggle
	 * @private
	 */
	var onPauseToggle = function()
	{
		this.paused = !this.paused;
		this._isManualPause = this.paused;
	};

	/**
	 * The name of the saved property if the captions are muted or not
	 * @property {string} CAPTIONS_MUTED
	 * @static
	 * @private
	 * @final
	 */
	var CAPTIONS_MUTED = 'captionsMuted';

	/**
	 * The name of the saved property if the sound is muted or not
	 * @property {string} SOUND_MUTED
	 * @static
	 * @private
	 * @final
	 */
	var SOUND_MUTED = 'soundMuted';

	/**
	 * The name of the saved property if the music is muted or not
	 * @property {string} MUSIC_MUTED
	 * @static
	 * @private
	 * @final
	 */
	var MUSIC_MUTED = 'musicMuted';

	/**
	 * The name of the saved property if the voice-over is muted or not
	 * @property {string} VO_MUTED
	 * @static
	 * @private
	 * @final
	 */
	var VO_MUTED = 'voMuted';

	/**
	 * The name of the saved property if the effects are muted or not
	 * @property {string} SFX_MUTED
	 * @static
	 * @private
	 * @final
	 */
	var SFX_MUTED = 'sfxMuted';

	/**
	 * The name of the saved property for the captions styles
	 * @property {string} CAPTIONS_STYLES
	 * @static
	 * @private
	 * @final
	 */
	var CAPTIONS_STYLES = 'captionsStyles';

	/**
	 * The map of the default caption style settings
	 * @property {object} DEFAULT_CAPTIONS_STYLES
	 * @static
	 * @private
	 * @final
	 */
	var DEFAULT_CAPTIONS_STYLES = {
		size: "md",
		background: "black-semi",
		color: "white",
		edge: "none",
		font: "arial",
		align: "top"
	};

	/**
	 * Abstract method to handle the muting
	 * @method _setMuteProp
	 * @param {string} prop The name of the property to save
	 * @param {jquery} button Reference to the jquery button
	 * @param {boolean} muted  If the button is muted
	 */
	p._setMuteProp = function(prop, button, muted)
	{
		button.removeClass('unmuted muted')
			.addClass(muted ? 'muted' : 'unmuted');

		SavedData.write(prop, muted);
		if (this.client && this.sendMutes)
		{
			this.client.send(prop, muted);
		}
	};

	/**
	 * Set the captions styles
	 * @method setCaptionsStyles
	 * @param {object|String} [styles] The style options or the name of the
	 * property (e.g., "color", "edge", "font", "background", "size")
	 * @param {string} [styles.color='white'] The text color, the default is white
	 * @param {string} [styles.edge='none'] The edge style, default is none
	 * @param {string} [styles.font='arial'] The font style, default is arial
	 * @param {string} [styles.background='black-semi'] The background style, black semi-transparent
	 * @param {string} [styles.size='md'] The font style default is medium
	 * @param {string} [styles.align='top'] The align style default is top of the window
	 * @param {string} [value] If setting styles parameter as a string, this is the value of the property.
	 */
	p.setCaptionsStyles = function(styles, value)
	{
		if (typeof styles === "object")
		{
			Object.merge(
				this._captionsStyles,
				styles ||
				{}
			);
		}
		else if (typeof styles === "string")
		{
			this._captionsStyles[styles] = value;
		}

		styles = this._captionsStyles;

		// Do some validation on the style settings
		if (DEBUG)
		{
			if (!styles.color || !/^(black|white|red|yellow|pink|blue)(-semi)?$/.test(styles.color))
			{
				throw "Setting captions color style is invalid value : " + styles.color;
			}
			if (!styles.background || !/^none|((black|white|red|yellow|pink|blue)(-semi)?)$/.test(styles.background))
			{
				throw "Setting captions background style is invalid value : " + styles.background;
			}
			if (!styles.size || !/^(xs|sm|md|lg|xl)$/.test(styles.size))
			{
				throw "Setting captions size style is invalid value : " + styles.size;
			}
			if (!styles.edge || !/^(raise|depress|uniform|drop|none)$/.test(styles.edge))
			{
				throw "Setting captions edge style is invalid value : " + styles.edge;
			}
			if (!styles.font || !/^(georgia|palatino|times|arial|arial-black|comic-sans|impact|lucida|tahoma|trebuchet|verdana|courier|console)$/.test(styles.font))
			{
				throw "Setting captions font style is invalid value : " + styles.font;
			}
			if (!styles.align || !/^(top|bottom)$/.test(styles.align))
			{
				throw "Setting captions align style is invalid value : " + styles.align;
			}
		}

		SavedData.write(CAPTIONS_STYLES, styles);
		if (this.client)
		{
			this.client.send(CAPTIONS_STYLES, styles);
		}
	};

	/**
	 * Get the captions styles
	 * @method getCaptionsStyles
	 * @param {string} [prop] The optional property, values are "size", "edge", "font", "background", "color"
	 * @return {object} The collection of styles, see setCaptionsStyles for more info.
	 */
	p.getCaptionsStyles = function(prop)
	{
		var styles = this._captionsStyles;
		return prop ? styles[prop] : styles;
	};

	/**
	 * Reset the captions styles
	 * @method clearCaptionsStyles
	 */
	p.clearCaptionsStyles = function()
	{
		this._captionsStyles = Object.merge(
		{}, DEFAULT_CAPTIONS_STYLES);
		this.setCaptionsStyles();
	};

	/**
	 * Set the captions are enabled or not
	 * @property {boolean} captionsMuted
	 * @default true
	 */
	Object.defineProperty(p, CAPTIONS_MUTED,
	{
		set: function(muted)
		{
			this._captionsMuted = muted;
			this._setMuteProp(CAPTIONS_MUTED, this.captionsButton, muted);
		},
		get: function()
		{
			return this._captionsMuted;
		}
	});

	/**
	 * Set the all sound is enabled or not
	 * @property {boolean} soundMuted
	 * @default false
	 */
	Object.defineProperty(p, SOUND_MUTED,
	{
		set: function(muted)
		{
			this._soundMuted = muted;
			this._setMuteProp(SOUND_MUTED, this.soundButton, muted);
		},
		get: function()
		{
			return this._soundMuted;
		}
	});

	/**
	 * Set the voice-over audio is muted
	 * @property {boolean} voMuted
	 * @default true
	 */
	Object.defineProperty(p, VO_MUTED,
	{
		set: function(muted)
		{
			this._voMuted = muted;
			this._setMuteProp(VO_MUTED, this.voButton, muted);
		},
		get: function()
		{
			return this._voMuted;
		}
	});

	/**
	 * Set the music audio is muted
	 * @property {boolean} musicMuted
	 * @default true
	 */
	Object.defineProperty(p, MUSIC_MUTED,
	{
		set: function(muted)
		{
			this._musicMuted = muted;
			this._setMuteProp(MUSIC_MUTED, this.musicButton, muted);
		},
		get: function()
		{
			return this._musicMuted;
		}
	});

	/**
	 * Set the sound effect audio is muted
	 * @property {boolean} sfxMuted
	 * @default true
	 */
	Object.defineProperty(p, SFX_MUTED,
	{
		set: function(muted)
		{
			this._sfxMuted = muted;
			this._setMuteProp(SFX_MUTED, this.sfxButton, muted);
		},
		get: function()
		{
			return this._sfxMuted;
		}
	});

	/**
	 * Reset all the buttons back to their original setting
	 * and clear the iframe.
	 * @method reset
	 */
	p.reset = function()
	{
		var wasLoaded = this.loaded || this.loading;
		// Disable the hint button
		this.helpEnabled = false;

		disableButton(this.soundButton);
		disableButton(this.captionsButton);
		disableButton(this.musicButton);
		disableButton(this.voButton);
		disableButton(this.sfxButton);
		disableButton(this.pauseButton);

		// Reset state
		this.loaded = false;
		this.loading = false;
		this.paused = false;

		// Clear the iframe src location
		this.main.attr('src', '');

		if (wasLoaded)
			this.trigger('closed');
	};

	/**
	 * Tell the application to start closing
	 * @method close
	 */
	p.close = function()
	{
		if (this.loading || this.loaded)
		{
			this.trigger('close');
			this.client.send('close');
		}
		else
		{
			this.reset();
		}
	};

	/**
	 * Disable a button
	 * @method disableButton
	 * @private
	 * @param {jquery} button The button to disable
	 */
	var disableButton = function(button)
	{
		button.removeClass('enabled')
			.addClass('disabled');
	};

	/**
	 * Destroy and don't use after this
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.reset();

		s.destroy.call(this);

		// Remove listener
		$(document).off('focus click', this._onDocClick);

		this.main = null;
		this.dom = null;
		this.options = null;

		this._onDocClick = null;
		this.userDataHandler = null;
		this.helpButton = null;
		this.soundButton = null;
		this.pauseButton = null;
		this.captionsButton = null;
		this.musicButton = null;
		this.voButton = null;
		this.sfxButton = null;

		if (this._pageVisibility)
		{
			this._pageVisibility.destroy();
			this._pageVisibility = null;
		}

		this.destroyClient();
	};

	namespace('springroll').Container = Container;
}(document));