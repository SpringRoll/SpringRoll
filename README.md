![SpringRoll Logo](http://springroll.io/assets/images/logo.png)

#SpringRoll [![Build Status](https://travis-ci.org/SpringRoll/SpringRoll.svg?branch=master)](https://travis-ci.org/SpringRoll/SpringRoll) [![Dependency Status](https://david-dm.org/SpringRoll/SpringRoll.svg?style=flat)](https://david-dm.org/SpringRoll/SpringRoll) [![GitHub version](https://badge.fury.io/gh/SpringRoll%2FSpringRoll.svg)](https://github.com/SpringRoll/SpringRoll/releases/latest) [![Inline docs](http://inch-ci.org/github/springroll/springroll.svg?branch=master)](http://inch-ci.org/github/springroll/springroll)

A light-weight, extensible, future-forward framework for building HTML5 canvas-based games and applications. The framework is built on a display plugin architecture to work with [PixiJS](http://pixijs.org), [EaselJS](http://www.createjs.com/EaselJS) and native canvas rendering. The framework comes with several modules for doing common multimedia development tasks, such as:

* Adding Sound (WebAudio)
* Hardware Rendered Games (via WebGL)
* Implementing Captions
* Remote Debugging
* Responsive Interfaces
* Game State Management
* Preloading Assets
* Browser Cache Control

##Browser Support

The primary objective of the framework is to build content which supports WebAudio API and WebGL (with Context2d fallback). With the exception of the WebAudio API fallback to Flash, there are very few fallbacks implemented. We want to produce canvas content that is about the future. Here are the currently planned browser support:

* Internet Explorer 9+
* iOS Safari & iOS WebView 6+
* Chrome for Android 37+
* Chrome 30+
* Firefox 25+

We have intentionally avoided support for these browsers:
	
* Android stock browser (no WebAudio support or suitable fallback support)
* Internet Explorer 7/8 (no HTML5 canvas support)

##Installation

SpringRoll can be installed using Bower.

```bash
bower install springroll
```

##Examples

To test the examples, run the grunt task `examples`. This will download any dependencies and automatically launch the examples in your browser.

```bash
grunt examples
```

##Dependencies

* [PreloadJS](https://github.com/SpringRoll/PreloadJS) SpringRoll's fork of PreloadJS

##Usage

The basic usage is to create a canvas element on the DOM, assign it an ID and then create a new Application to render that canvas.

```html
<html>
	<head>
		<!-- Core is required! -->
		<script src="dist/core.min.js"></script>

		<!-- Optional modules -->
		<script src="dist/modules/easeljs-display.min.js"></script>
	</head>
	<body>
		<canvas id="stage" width="600" height="400"></canvas>
		<script>

			// Create the application
			var app = new springroll.Application({
				canvasId : "stage",
				display : springroll.EaselJSDisplay
			});

			// Listen for when the application
			// has been fully initialized
			app.once('init', function(){
				// Ready!
			});

		</script>
	</body>
</html>
```

##Modules

Modules are components which contain common code classes, documentation and/or related tools that can easily be bundled into a project. The goal of these modules is to provide convenient solutions to common problems producers face when authoring games. All modules are optional and located in the **dist/modules** folder, except the Core Module.

* **[Core Module](https://github.com/SpringRoll/SpringRoll/wiki/Core-Module)** (required)
* **[Container Client Module](https://github.com/SpringRoll/SpringRoll/wiki/Container-Client-Module)** _container-client_
* **[Captions Module](https://github.com/SpringRoll/SpringRoll/wiki/Captions-Module)** _captions_
* **[Debug Module](https://github.com/SpringRoll/SpringRoll/wiki/Debug-Module)** _debug_
* EaselJS
	* **[EaselJS Animation Module](https://github.com/SpringRoll/SpringRoll/wiki/EaselJS-Animation-Module)** _easeljs-animation_
	* **[EaselJS Cutscene Module](https://github.com/SpringRoll/SpringRoll/wiki/EaselJS-Cutscene-Module)** _easeljs-cutscene_
	* **[EaselJS Display Module](https://github.com/SpringRoll/SpringRoll/wiki/EaselJS-Display-Module)** _easeljs-display_
	* **[EaselJS States Module](https://github.com/SpringRoll/SpringRoll/wiki/EaselJS-States-Module)** _easeljs-states_
	* **[EaselJS UI Module](https://github.com/SpringRoll/SpringRoll/wiki/EaselJS-UI-Module)** _easeljs-ui_
* **[Hints Module](https://github.com/SpringRoll/SpringRoll/wiki/Hints-Module)** _hints_
* **[Languages Module](https://github.com/SpringRoll/SpringRoll/wiki/Languages-Module)** _languages_
* **[Native Display Module](https://github.com/SpringRoll/SpringRoll/wiki/Native-Display-Module)** _native-display_
* Pixi.js
	* **[Pixi.js Animation Module](https://github.com/SpringRoll/SpringRoll/wiki/Pixi.js-Animation-Module)** _pixi-animation_
	* **[Pixi.js Display Module](https://github.com/SpringRoll/SpringRoll/wiki/Pixi.js-Display-Module)** _pixi-display_
	* **[Pixi.js Spine Module](https://github.com/SpringRoll/SpringRoll/wiki/Pixi.js-Spine-Module)** _pixi-spine_
	* **[Pixi.js UI Module](https://github.com/SpringRoll/SpringRoll/wiki/Pixi.js-UI-Module)**  _pixi-ui_
* **[Sound Module](https://github.com/SpringRoll/SpringRoll/wiki/Sound-Module)** _sound_
* **[States Module](https://github.com/SpringRoll/SpringRoll/wiki/States-Module)** _states_
* **[UI Module](https://github.com/SpringRoll/SpringRoll/wiki/UI-Module)** _ui_

##Displays

The Framework is inherently canvas-rendering agnostic. We support two different rendering display plugins for [EaselJS](http://www.createjs.com/EaselJS) and [Pixi.js](http://www.pixijs.com/). Features within the different modules require SpringRoll's forks of EaselJS and PixiJS. In addition, there is a generic display for rendering using [Context2d](http://www.w3.org/TR/2014/CR-2dcontext-20140821/) or [WebGL](http://get.webgl.org/). An Application built with the Framework can support all three displays methods simultaneously.

##Examples

* [Application](https://springroll.github.io/SpringRoll/examples/basic.html)
* [Asset Loading &amp; Caching](https://springroll.github.io/SpringRoll/examples/asset-caching.html)
* [Color-Alpha](https://springroll.github.io/SpringRoll/examples/color-alpha.html)
* [Max-Width](https://springroll.github.io/SpringRoll/examples/max-width.html)
* [UI Scaling](https://springroll.github.io/SpringRoll/examples/ui.html)
* [Cutscene](https://springroll.github.io/SpringRoll/examples/cutscene.html)
* [Tweening](https://springroll.github.io/SpringRoll/examples/tween.html)
* [Sound](https://springroll.github.io/SpringRoll/examples/sound.html)
* [Captions](https://springroll.github.io/SpringRoll/examples/captions.html)
* [Captions &amp; Sound](https://springroll.github.io/SpringRoll/examples/captions-sound.html)
* [Multi-Display](https://springroll.github.io/SpringRoll/examples/multiple-displays.html)
* [States](https://springroll.github.io/SpringRoll/examples/states.html)

##Documentation

[API Documentation](http://springroll.io/SpringRoll/docs/) has full documentation for the core and related modules. For examples of implementing each module please consult the [wiki](/SpringRoll/SpringRoll/wiki).

##License

Copyright (c) 2015 [CloudKid](http://github.com/cloudkidstudio)

Released under the MIT License.
