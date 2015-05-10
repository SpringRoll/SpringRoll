/*! SpringRoll 0.3.0 */
/**
 * @module Container
 * @namespace springroll
 * @requires  Core
 */
(function(undefined)
{
	var Debug = include('springroll.Debug', false);
	
	/**
	 * Provide feature detection
	 * @class Features
	 */
	var Features = {};

	/**
	 * If the browser has flash
	 * @property {boolean} flash
	 */
	Features.flash = function()
	{
		var hasFlash = false;
		try
		{
			var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
			if (fo)
			{
				hasFlash = true;
			}
		}
		catch (e)
		{
			if (navigator.mimeTypes &&
				navigator.mimeTypes['application/x-shockwave-flash'] !== undefined &&
				navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin)
			{
				hasFlash = true;
			}
		}
		return hasFlash;
	}();

	/**
	 * If the browser has WebGL support
	 * @property {boolean} webgl
	 */
	Features.webgl = function()
	{
		var canvas = document.createElement('canvas');
		if ('supportsContext' in canvas)
		{
			return canvas.supportsContext('webgl') ||
				canvas.supportsContext('experimental-webgl');
		}
		return !!window.WebGLRenderingContext;
	}();

	/**
	 * If the browser has Canvas support
	 * @property {boolean} canvas
	 */
	Features.canvas = function()
	{
		var elem = document.createElement('canvas');
		return !!(elem.getContext && elem.getContext('2d'));
	}();

	/**
	 * If the browser has WebAudio API support
	 * @property {boolean} webaudio
	 */
	Features.webaudio = function()
	{
		return 'webkitAudioContext' in window || 'AudioContext' in window;
	}();

	/**
	 * If the browser has Web Sockets API
	 * @property {boolean} websockets
	 */
	Features.websockets = function()
	{
		return 'WebSocket' in window || 'MozWebSocket' in window;
	}();

	/**
	 * If the browser has Geolocation API
	 * @property {boolean} geolocation
	 */
	Features.geolocation = function()
	{
		return 'geolocation' in navigator;
	}();

	/**
	 * If the browser has Web Workers API
	 * @property {boolean} webworkers
	 */
	Features.webworkers = function()
	{
		return !!window.Worker;
	}();

	/**
	 * If the browser has touch
	 * @property {boolean} touch
	 */
	Features.touch = function()
	{
		return !!(('ontouchstart' in window) ||// iOS & Android
			(navigator.msPointerEnabled && navigator.msMaxTouchPoints > 0) || // IE10
			(navigator.pointerEnabled && navigator.maxTouchPoints > 0)); // IE11+
	}();

	/**
	 * See if the current bowser has the correct features
	 * @method test
	 * @static
	 * @param {object} capabilities The capabilities
	 * @param {object} capabilities.features The features
	 * @param {object} capabilities.features.webgl WebGL required
	 * @param {object} capabilities.features.geolocation Geolocation required
	 * @param {object} capabilities.features.webworkers Web Workers API required
	 * @param {object} capabilities.features.webaudio WebAudio API required
	 * @param {object} capabilities.features.websockets WebSockets required
	 * @param {object} capabilities.sizes The sizes
	 * @param {Boolean} capabilities.sizes.xsmall Screens < 480
	 * @param {Boolean} capabilities.sizes.small Screens < 768
	 * @param {Boolean} capabilities.sizes.medium Screens < 992
	 * @param {Boolean} capabilities.sizes.large Screens < 1200
	 * @param {Boolean} capabilities.sizes.xlarge Screens >= 1200
	 * @param {object} capabilities.ui The ui
	 * @param {Boolean} capabilities.ui.touch Touch capable
	 * @param {Boolean} capabilities.ui.mouse Mouse capable
	 * @return {String|null} The error, or else returns null
	 */
	Features.test = function(capabilities)
	{
		var features = capabilities.features;
		var ui = capabilities.ui;
		var sizes = capabilities.sizes;		
		
		for(var name in features)
		{
			if (Features[name] !== undefined)
			{
				// Failed built-in feature check
				if (features[name] && !Features[name])
				{
					return "Browser does not support " + name;
				}
				else
				{
					if (true && Debug) 
						Debug.log("Browser has "+ name);
				}
			}
			else
			{
				if (true && Debug) 
					Debug.warn("The feature " + name + " is not supported");
			}
		}
		
		// Failed negative touch requirement
		if (!ui.touch && Features.touch)
		{
			return "Game does not support touch input";
		}

		// Failed mouse requirement
		if (!ui.mouse && !Features.touch)
		{
			return "Game does not support mouse input";
		}

		// Check the sizes
		var size = Math.max(window.screen.width, window.screen.height);

		if (!sizes.xsmall && size < 480)
		{
			return "Game doesn't support extra small screens";
		}
		if (!sizes.small && size < 768)
		{
			return "Game doesn't support small screens";
		}
		if (!sizes.medium && size < 992)
		{
			return "Game doesn't support medium screens";
		}
		if (!sizes.large && size < 1200)
		{
			return "Game doesn't support large screens";
		}
		if (!sizes.xlarge && size >= 1200)
		{
			return "Game doesn't support extra large screens";
		}
		return null;
	};

	if (true && Debug)
	{
		Debug.info("Browser Feature Detection" +
			("\n\tFlash support " + (Features.flash ? "\u2713" : "\u00D7")) +
			("\n\tCanvas support " + (Features.canvas ? "\u2713" : "\u00D7")) +
			("\n\tWebGL support " + (Features.webgl ? "\u2713" : "\u00D7")) +
			("\n\tWebAudio support " + (Features.webaudio ? "\u2713" : "\u00D7"))
		);
	}

	//Leak Features namespace
	namespace('springroll').Features = Features;

})();
/**
 * @module Container
 * @namespace springroll
 * @requires  Core
 */
(function(document, undefined)
{
	//Import classes
	var SavedData = include('springroll.SavedData'),
		EventDispatcher = include('springroll.EventDispatcher'),
		PageVisibility = include('springroll.PageVisibility'),
		Features = include('springroll.Features'),
		Bellhop = include('Bellhop'),
		$ = include('jQuery');

	/**
	 * The application container
	 * @class Container
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
	 */
	var Container = function(iframeSelector, options)
	{
		EventDispatcher.call(this);

		options = options || {};

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
		 * @property {Bellhop} messenger
		 */
		this.messenger = null;

		/**
		*  The current release data
		*  @property {Object} release
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
			SavedData.read(CAPTIONS_STYLES) || {}
		);

		/**
		 * Whether the Game is currently "blurred" (not focused) - for pausing/unpausing
		 * @type {Boolean}
		 */
		this._appBlurred = false;

		/**
		 * Whether the Container is currently "blurred" (not focused) - for pausing/unpausing
		 * @type {Boolean}
		 */
		this._containerBlurred = false;

		/**
		 * Delays pausing of application to mitigate issues with asynchronous communication 
		 * between Game and Container
		 * @type {Timeout}
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
	};

	//Reference to the prototype
	var s = EventDispatcher.prototype;
	var p = extend(Container, EventDispatcher);

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
	 * @param {Boolean} data.learning If learning dispatcher is supported
	 * @param {Boolean} data.captions If captions is supported
	 * @param {Boolean} data.hints If hinting is supported
	 */

	/**
	 * Event when dispatching a Learning Dispatcher event
	 * @event learningEvent
	 * @param {object} data The event data
	 */

	/**
	 * Event when dispatching a Google Analytics event
	 * @event analyticEvent
	 * @param {object} data The event data
	 * @param {string} data.category The event category
	 * @param {string} data.action The event action
	 * @param {string} [data.label] The optional label
	 * @param {number} [data.value] The optional value
	 */

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
		options = $.extend({
			singlePlay: false,
			playOptions: null
		}, options);

		this.reset();

		// Dispatch event for unsupported browsers
		// and then bail, don't continue with loading the application
		if (!Features.canvas || !(Features.webaudio || Features.flash))
		{
			return this.trigger('unsupported');
		}

		this.loading = true;

		//Setup communication layer between site and application
		this.messenger = new Bellhop();
		this.messenger.connect(this.dom);

		//Handle bellhop events coming from the application
		this.messenger.on(
		{
			trackEvent: onTrackEvent.bind(this),
			progressEvent: onProgressEvent.bind(this),
			loadDone: onLoadDone.bind(this),
			endGame: onEndGame.bind(this),
			focus: onFocus.bind(this),
			analyticEvent: onAnalyticEvent.bind(this),
			learningEvent: onLearningEvent.bind(this),
			helpEnabled: onHelpEnabled.bind(this),
			features: onFeatures.bind(this)
		});

		//Open the application in the iframe
		this.main
			.addClass('loading')
			.prop('src', path)
			.prop('width', window.innerWidth)
			.prop('height', window.innerHeight);

		if (options.singlePlay)
		{
			this.messenger.send('singlePlay');
		}

		if (options.playOptions)
		{
			this.messenger.send('playOptions', options.playOptions);
		}

		this.trigger('open');
	};

	/**
	 * Open a application or path
	 * @method open
	 * @param {string} path The full path to the application to load
	 * @param {Object} [options] The open options
	 * @param {Boolean} [options.singlePlay=false] If we should play in single play mode
	 * @param {Object} [options.playOptions=null] The optional play options
	 */
	p.open = function(path, options, playOptions)
	{
		options = options || {};

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
		options = $.extend({
			query: '',
			playOptions: null,
			singlePlay: false
		}, options);

		this.release = null;

		$.getJSON(api, function(result)
		{
			if (!result.success)
			{
				return this.trigger('remoteError', result.error);
			}
			var release = result.data;

			var err = Features.test(release.capabilities);

			if (err)
			{
				return this.trigger('unsupported');
			}

			this.release = release;

			// Open the application
			this._internalOpen(release.url + options.query, options);
		}
		.bind(this))
		.fail(function()
		{
		    return this.trigger('remoteFailed');
		}
		.bind(this));
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
	 * Manage the focus change events sent from window and iFrame
	 * @method manageFocus
	 * @protected
	 */
	p.manageFocus = function()
	{
		if (this._pauseTimer)//we only need one delayed call, at the end of any sequence of rapidly-fired blur/focus events
			clearTimeout(this._pauseTimer);

		//Delay setting of 'paused' in case we get another focus event soon.
		//Focus events are sent to the container asynchronously, and this was
		//causing rapid toggling of the pause state and related issues, 
		//especially in Internet Explorer
		this._pauseTimer = setTimeout(
			function()
			{
				this._pauseTimer = null;
				// A manual pause cannot be overriden by focus events.
				// User must click the resume button.
				if (this._isManualPause === true) return;

				this.paused = this._containerBlurred && this._appBlurred;
			}.bind(this), 
			100
		);
	};

	/**
	 * Track an event for springroll Learning
	 * @method onLearningEvent
	 * @param {event} event The bellhop learningEvent
	 * @private
	 */
	var onLearningEvent = function(event)
	{
		this.trigger('learningEvent', event.data);
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
		if (features.helpButton) this.helpButton.show();

		this.trigger('features', features);
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
	 * Track an event for Google Analtyics
	 * @method onAnalyticEvent
	 * @private
	 * @param {event} event Bellhop analyticEvent
	 */
	var onAnalyticEvent = function(event)
	{
		var data = event.data;

		// PBS Specifc implementation of Google Analytics
		var GoogleAnalytics = include("GA_obj", false);
		if (GoogleAnalytics)
		{
			GoogleAnalytics.analyticEvent(
				data.category,
				data.action,
				data.label,
				data.value
			);
		}

		// Generic implementation of Google Analytics
		GoogleAnalytics = include('ga', false);
		if (GoogleAnalytics)
		{
			GoogleAnalytics('send',
			{
				'hitType': 'event',
				'eventCategory': data.category,
				'eventAction': data.action,
				'eventLabel': data.label,
				'eventValue': data.value
			});
		}

		this.trigger('analyticEvent', event.data);
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
			this.messenger.send('playHelp');
		}
	};

	/**
	 * The application ended and destroyed itself
	 * @method onEndGame
	 * @private
	 */
	var onEndGame = function()
	{
		this.messenger.destroy();
		this.messenger = null;

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
			if (this.messenger)
			{
				this.messenger.send('pause', paused);
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
		if (this.messenger)
		{
			this.messenger.send(prop, muted);
		}
	};

	/**
	 * Set the captions styles
	 * @method setCaptionsStyles
	 * @param {object|String} [styles] The style options or the name of the
	 *	property (e.g., "color", "edge", "font", "background", "size")
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
		if (true)
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
		if (this.messenger)
		{
			this.messenger.send(CAPTIONS_STYLES, styles);
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
			this.messenger.send('close');
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

		this.main = null;
		this.dom = null;

		this.helpButton = null;
		this.soundButton = null;
		this.pauseButton = null;
		this.captionsButton = null;
		this.musicButton = null;
		this.voButton = null;
		this.sfxButton = null;
		
		if(this._pageVisibility)
		{
			this._pageVisibility.destroy();
			this._pageVisibility = null;
		}
		
		if (this.messenger)
		{
			this.messenger.destroy();
			this.messenger = null;
		}

		s.destroy.call(this);
	};

	namespace('springroll').Container = Container;
}(document));