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
    "fr": { "path": "assets/fr/" },
    "fr-ca": { "path": "assets/fr-CA/" }
  }
}

const localizer = new Localizer(config);
```

The localizer will automatically look for the browser's language and use it. A fallback locale will also be set from default in the config. the fallback is used automatically if a language is specified can't found in locales.

An options object can also be provided to manually set the target and fallback languages.
```javascript
const localizer = new Localizer(config, { language:'fr', fallback:'en'});
```

## Loading a File

`localizer.resolve()` returns a promise that can contains the resolved path.

```javascript
	localizer.resolve('vo/welcome.mp3')
		.then(result => {
			// your load function here
			loader.load(result.path, 'welcome');
		});
```

this will load a file relative to the current locale, for example if the browser language was set to french-canadian. the path supplied to the load function would look like: `assets/fr-CA/vo/welcome.mp3`

you can also provide an options object to override the target and fallback languages for only a single load event.

```javascript
	localizer.resolve('vo/welcome.mp3', { language: 'es-ES', fallback: 'en' })
		.then(result => {
			// your load function here
			loader.load(result.path, 'welcome');
		});
```

if the language or fallback are not found in the locales, then it will load with the default fallback. For example: if `'es-ES'` is not found the load function will try `'es'` if that isn't found it will use the fallback language `'en'`

result also contains the language key of the language used

```javascript
	localizer.resolve('vo/welcome.mp3', { language: 'es-ES', fallback: 'en' })
		.then(result => {
			console.log(result.language); // 'en'
		});
```

### _Example:_
```javascript
class YourGame
{
	init()
		this.localizer = new Localizer(this.localizerConfig);
	}

	preload()
	{
		// load all your localized files.
		this.localizer.resolve('vo/welcome.mp3')
			.then(result => {
				this.loader.load(result.path, 'welcome');
			});
		this.localizer.resolve('local.json')
			.then(result => {
				this.loader.load(result.path, 'local');
			});
		//...

		// Any non localized files don't have to go though the localizer.
		this.loader.load('assets/images/Foo.png', 'fooSprite');
		//...
	}

	start()
	{
		//Do things with loaded files;
		let welcome = new Sound('welcome');
		welcome.play();
		//...
	}
}
```