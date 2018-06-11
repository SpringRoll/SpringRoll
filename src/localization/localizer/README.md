# Localizer
The localizer object provides a layer above your file loader to help with loading localized files. 

## Initializing
in order to use the localizer you'll have to provide a config with a default locale
as well as all the locales you wish to use.
```javascript
import { Localizer } from 'springroll/localization';

const config = {
  "default":"en",
  "locales":
  {
    "en": { "path": "assets/en/" }, 
    "fr": { "path": "asstes/fr/" },
    "fr-ca": { "path": "assets/fr-CA/" }
  }
}

const localizer = new Localizer((path, key, options) => {
  // Your loading function here;
}, config);
```

The localizer will automatically look for the browser's language and use it, if it is found in locales. A fallback locale will also be set from default in the config. the fallback is used automatically if a language is specified that isn't found in locales.

An options object can also be provided to manually set the target and fallback languages.
```javascript
const localizer = new Localizer((path, key, options) => {
  // Your loading function here;
}, config, { language:'fr', fallback:'en'});
```

## Loading a File

loading is fairly straight forward.

```javascript
  localizer.load('vo/welcome.mp3', 'welcome');
```

this will load a file relitive to the current locale, for example if the browser language was set to french-canadian. the path supplied to the load function would look like: `assets/fr-CA/vo/welcome.mp3`


you can also provide an options object to overide the target and fallback languages for only a single load event.

```javascript
  localizer.load('vo/welcome.mp3', 'welcome', { language: 'es-ES', fallback: 'en' });
```

if the language or fallback are not found in the locales, then it will load with the default fallback. For example: if `'es-ES'` is not found the load function will try `'es'` if that isn't found it will use the fallback language `'en'`

any options set will be forwarded to the load callback except for `language` and `fallback`. They will be overwitten with the locales used. `'en-US'` becomes `'en'`

```javascript
  localizer.load('vo/welcome.mp3', 'welcome', { type: 'sound' });
```

### _Example:_
```javascript
class YourGame
{
	init()
		this.localizer = new Localizer((path, key, options) => {
			// This function is called everytime you load a file though
			this.loader.load(path, key); // <-- replace with your usual load function
		}, this.localizerConfig);
	}

	preload()
	{
		// load all your localized files.
		this.localizer.load('vo/welcome.mp3', 'welcome');
		this.localizer.load('local.json', 'local');
		//...

		// Any non localized files don't have to go though the localizer.
		this.loader.load('assets/images/Foo.png', 'fooSprite');
		//...
	}

	start()
	{
		//Do things with loaded files;
		let welcome = new Sound('welcome');
		//...
	}
}
```