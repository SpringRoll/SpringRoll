import Localizer from './localizer/Localizer';

let config = {
  default: 'en',
  locales: {
    en: { path: 'assets/en-US/' },
    fr: { path: 'assets/fr/' },
    'fr-ca': { path: 'assets/fr-CA/' }
  }
};

describe('Localizer', function() {
  describe('#getLocaleKey()', function() {
    let localizer = new Localizer(null, config);

    it('should return the locale key if found in config.locales', function() {
      expect(localizer.getLocaleKey('en')).to.equal('en');
    });

    it('should return the key as lower case', function() {
      expect(localizer.getLocaleKey('EN')).to.equal('en');
    });

    it('should return the language key if contry key is not found', function() {
      expect(localizer.getLocaleKey('en-US')).to.equal('en');
    });

    it('should return the key if locales also has language', function() {
      expect(localizer.getLocaleKey('fr-CA')).to.equal('fr-ca');
    });

    it('should return undefined if key not found', function() {
      expect(localizer.getLocaleKey('es')).to.equal(undefined);
    });
  });

  describe('#load()', function() {
    it('should load with default locale', function() {
      let localizer = new Localizer(function(path) {
        expect(path).to.equal('assets/en-US/sounds/test.mp3');
      }, config);

      localizer.load('sounds/test.mp3', 'testSound');
    });

    it('should load with options locale', function() {
      let localizer = new Localizer(function(path) {
        expect(path).to.equal('assets/fr-CA/sounds/test.mp3');
      }, config);

      localizer.load('sounds/test.mp3', 'testSound', { language: 'fr-CA' });
    });

    it('should load with fallback locale', function() {
      let localizer = new Localizer(function(path) {
        expect(path).to.equal('assets/en-US/sounds/test.mp3');
      }, config, {language: 'es'});

      localizer.load('sounds/test.mp3', 'testSound');
    });

    it('should load with options fallback locale', function() {
      let localizer = new Localizer(function(path) {
        expect(path).to.equal('assets/fr-CA/sounds/test.mp3');
      }, config, {language: 'es'});

      localizer.load('sounds/test.mp3', 'testSound', { fallback: 'fr-CA'});
    });

    it('should load with fallback locale if option not found', function() {
      let localizer = new Localizer(function(path) {
        expect(path).to.equal('assets/en-US/sounds/test.mp3');
      }, config);

      localizer.load('sounds/test.mp3', 'testSound', { language: 'es'});
    });

    it('should load with default fallback locale if option fallback not found', function() {
      let localizer = new Localizer(function(path) {
        expect(path).to.equal('assets/fr/sounds/test.mp3');
      }, config, {fallback:'fr'});

      localizer.load('sounds/test.mp3', 'testSound', { language: 'de', fallback: 'es'});
    });

    it('should forward language options to load function', function() {
      let localizer = new Localizer(function(path, key, options) {
        expect(options).to.exist;
        expect(options.language).to.exist;
        expect(options.fallback).to.exist;
      }, config);

      localizer.load('sounds/test.mp3', 'testSound', { language: 'fr-CA'});
    });

    it('should not overwrite extra load options', function() {
      let localizer = new Localizer(function(path, key, options) {
        expect(options).to.exist;
        expect(options.type).to.exist;
      }, config);

      localizer.load('sounds/test.mp3', 'testSound', { language: 'fr-CA', type: 'sound'});
    });
  });

  describe('#getBrowsersLocaleKey()', function() {
    let localizer = new Localizer(null, config);

    it('should return an array', function() {
      expect(localizer.getBrowserLanguages()).to.be.instanceOf(Array);
    });
  });
});
