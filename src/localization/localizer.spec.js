import Localizer from './localizer/Localizer';

let languages = {
  'en-US': '/assets/en-US/'
};

describe('Localizer', function() {
  let localizer = new Localizer(null, languages);

  describe('#load()', function() {
    it('should run', function() {
      //localizer.load({ path: 'sound/test.mp3', key: 'test', type:'sound' });
    });
  });
});
