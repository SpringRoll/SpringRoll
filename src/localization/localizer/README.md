# Localizer
The localizer object provides a layer above your file loader to help with loading localized files. 

## Initializing
In order to use the localizer you'll have to provide a config with a default locale,
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

The localizer will automatically look for the browser's language and use it. A fallback locale will also be set from default in the config. The fallback is used automatically if a specified language can't be found in locales.

An options object can also be provided to manually set the target and fallback languages.
```javascript
const localizer = new Localizer(config, { language:'fr', fallback:'en'});
```

## Loading a File

`localizer.resolve()` Returns an object that contains the resolved path.

```javascript
let result = localizer.resolve('vo/welcome.mp3');
loader.load(result.path, 'welcome');
```

This will load a file relative to the current locale, for example if the browser language was set to French-Canadian, the path supplied to the load function would look like: `assets/fr-CA/vo/welcome.mp3`.

You can also provide an options object to override the target and fallback languages for only a single load event.

```javascript
let result = localizer.resolve('vo/welcome.mp3', { language: 'es-ES', fallback: 'en' });
loader.load(result.path, 'welcome');
```

If the language or fallback are not found in the locales, then it will load with the default fallback. For example: if `'es-ES'` is not found, the load function will try `'es'` if that isn't found, it will use the fallback language `'en'`.

Result also contains the language key of the language used.

```javascript
let result = localizer.resolve('vo/welcome.mp3', { language: 'es-ES', fallback: 'en' })
console.log(result.language); // 'en'
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
		let result = this.localizer.resolve('vo/welcome.mp3')		
		this.loader.load(result.path, 'welcome');
		
		result = this.localizer.resolve('local.json')
		this.loader.load(result.path, 'local');
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