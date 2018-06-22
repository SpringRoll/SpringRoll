import Localizer from './Localizer';

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
    let localizer = new Localizer(config);

    it('should return the locale key if found in config.locales', function() {
      expect(localizer.getLocaleKey('en')).to.equal('en');
    });

    it('should return the key as lower case', function() {
      expect(localizer.getLocaleKey('EN')).to.equal('en');
    });

    it('should return the language key if country key is not found', function() {
      expect(localizer.getLocaleKey('en-US')).to.equal('en');
    });

    it('should return the key if locales also has language', function() {
      expect(localizer.getLocaleKey('fr-CA')).to.equal('fr-ca');
    });

    it('should return undefined if key not found', function() {
      expect(localizer.getLocaleKey('es')).to.equal(undefined);
    });
  });

  describe('#resolve()', function() {
    it('should resolve with default locale', function() {
      let localizer = new Localizer(config);
      let result = localizer.resolve('sounds/test.mp3');
      
      expect(result.path).to.equal('assets/en-US/sounds/test.mp3');
    });

    it('should resolve with options locale', function() {
      let localizer = new Localizer(config);
      let result = localizer.resolve('sounds/test.mp3', { language: 'fr-CA' });

      expect(result.path).to.equal('assets/fr-CA/sounds/test.mp3');
    });

    it('should resolve with fallback locale', function() {
      let localizer = new Localizer(config);
      let result = localizer.resolve('sounds/test.mp3', { language: 'es' });

      expect(result.path).to.equal('assets/en-US/sounds/test.mp3');        
    });

    it('should resolve with options fallback locale', function() {
      let localizer = new Localizer(config, { language: 'es' });
      let result = localizer.resolve('sounds/test.mp3', { language: 'fr-CA' });

      expect(result.path).to.equal('assets/fr-CA/sounds/test.mp3');
    });

    it('should resolve with fallback locale if option not found', function() {
      let localizer = new Localizer(config);
      let result =localizer.resolve('sounds/test.mp3', { language: 'es' });

      expect(result.path).to.equal('assets/en-US/sounds/test.mp3');
    });

    it('should resolve with default fallback locale if option fallback not found', function() {
      let localizer = new Localizer(config, { fallback: 'fr' });
      let result = localizer.resolve('sounds/test.mp3', { language: 'de', fallback: 'es' });

      expect(result.path).to.equal('assets/fr/sounds/test.mp3');
    });

    it('should resolve with default fallback locale if option fallback not found', function() {
      let localizer = new Localizer(config, { fallback: 'fr' });
      let result = localizer.resolve('sounds/test.mp3', { language: 'de', fallback: 'es' });

      expect(result.path).to.equal('assets/fr/sounds/test.mp3');
    });

    it('should fail to resolve if no locales can be found', function() {
      let localizer = new Localizer(config, { fallback: 'de' });
      let result = localizer.resolve('sounds/test.mp3', { language: 'as', fallback: 'es' });

      expect(result).to.not.exist;
    });
  });

  describe('#getBrowsersLocaleKey()', function() {
    let localizer = new Localizer(config);

    it('should return an array', function() {
      expect(localizer.getBrowserLanguages()).to.be.instanceOf(Array);
    });
  });
});
