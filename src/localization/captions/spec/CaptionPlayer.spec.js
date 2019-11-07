import { CaptionPlayer } from '../CaptionPlayer';
import { TextRenderer } from '../renderers/RendererText';
import { TestRenderer } from '../renderers/RendererTest';
import { TemplateRenderer } from '../renderers/RendererTemplate';
import testData from './CaptionTestData';

const newRenderer = () => new TextRenderer(document.createElement('div'));
const tester = new TestRenderer();

let player;
describe('CaptionPlayer', function() {
  beforeEach(() => {
    tester.reset();
    player = new CaptionPlayer(testData, tester);
  });
  describe('#start(name)', function() {
    it('should call ICaptionRenderer.start', function() {
      player.start('Html');
      expect(tester.content).to.equal('<b>hello</b>');
    });

    it('should call ICaptionRenderer.lineBegin after ICaptionRenderer.start ', function() {
      player.start('HelloWorld');
      expect(tester.failed).to.equal(false);
    });

    it('should call ICaptionRenderer.lineBegin with the correct line ', function() {
      player.start('HelloWorld', 1400);

      expect(tester.content).to.equal('world');
    });

    it('should not call ICaptionRenderer.lineBegin if time is greater than the end time', function() {
      player.start('HelloWorld', 5000);
      expect(tester.lineBeginCalled).to.equal(false);
    });

    it('should not call ICaptionRenderer.lineEnd', function() {
      player.start('HelloWorld', 1400);
      expect(tester.lineEndCalled).to.equal(false);
    });

    it('should not call ICaptionRenderer.stop', function() {
      player.start('HelloWorld');
      expect(tester.stopCalled).to.equal(false);
    });

    it('should call ICaptionRenderer.stop if a caption is already playing', function() {
      player.start('HelloWorld');
      player.start('Other');
      expect(tester.stopCalled).to.equal(true);
    });

    it('Should finish the first caption and wait for next update to start the second if start and end time of two captions are the same', function() {
      player.start('StartEnd', 900);
      expect(tester.content).to.equal('first');
      expect(tester.lineEndCalled).to.equal(false);

      //update to shared start/end time. First caption should still be playing
      player.update(0.1);
      expect(tester.content).to.equal('first');

      //on next update the second/last caption should be playing
      player.update(0.001);
      expect(tester.content).to.equal('last');
      expect(tester.lineEndCalled).to.equal(true);
    });
  });

  describe('#stop()', function() {
    it('should call ICaptionRenderer.stop', function() {
      const player = new CaptionPlayer(testData, tester);
      player.start('HelloWorld');
      player.stop();
      expect(tester.stopCalled).to.equal(true);
    });

    it('should not call ICaptionRenderer.stop if no caption is started', function() {
      const player = new CaptionPlayer(testData, tester);

      player.stop();
      expect(tester.stopCalled).to.equal(false);
    });
  });

  describe('#update()', function() {
    it('should not call ICaptionRenderer.stop if not enough time has passed', function() {
      const player = new CaptionPlayer(testData, tester);
      player.start('HelloWorld');

      player.update(0.5);
      expect(tester.stopCalled).to.equal(false);
    });

    it('should not call ICaptionRenderer.stop if enough time has passed', function() {
      const player = new CaptionPlayer(testData, tester);
      player.start('HelloWorld');
      player.update(3000);
      expect(tester.stopCalled).to.equal(true);
    });
  });

  describe('Template Renderer', () => {
    it('Should be able to replace placeholders with variables', () => {
      const testString = 'Johnny {{fruit}}seed';
      const t = TemplateRenderer(testString, { fruit: 'Apple' });

      expect(t).to.equal('Johnny Appleseed');
    });

    it('Should leave the placeholders if no matching key value pair was supplied', () => {
      const testString = 'Johnny {{fruit}}seed';
      const t = TemplateRenderer(testString, {});

      expect(t).to.equal('Johnny {{fruit}}seed');
    });

    it('Should work when inside a Caption Renderer', () => {
      const renderer = newRenderer();

      const player = new CaptionPlayer(testData, renderer);

      player.start('Template', 0, { greeting: 'hello' });
      expect(renderer.renderTarget.innerText).to.equal('hello');
    });
  });
});
