import { CaptionFactory } from '../CaptionFactory';
import { Caption } from '../Caption';
import { TimedLine } from '../TimedLine';
import testData from './CaptionTestData';
describe('CaptionFactory', function() {
  const lineData = testData.HelloWorld[0];
  const line = CaptionFactory.createLine(lineData);
  describe('#createLine()', function() {
    it('should return undefined if data.start is not a number', function() {
      expect(
        CaptionFactory.createLine({
          start: 0,
          content: 'hello'
        })
      ).to.be.undefined;
    });
    it('should return undefined if data.end is not a number', function() {
      expect(
        CaptionFactory.createLine({
          end: 1000,
          content: 'hello'
        })
      ).to.be.undefined;
    });
    it('should return instanceOf TimedLine', function() {
      expect(line).to.be.instanceOf(TimedLine);
    });
    it('should have content formatted properly', function() {
      expect(line.content).to.equal('hello');
    });
    it('should have the a correct start time', function() {
      expect(line.startTime).to.equal(lineData.start);
    });
    it('should have the a correct end time', function() {
      expect(line.endTime).to.equal(lineData.end);
    });
  });
  describe('#createCaption()', function() {
    const caption = CaptionFactory.createCaption(testData.HelloWorld);
    it('should return instanceOf Caption', function() {
      expect(caption).to.be.instanceOf(Caption);
    });
    it('should have the correct number of lines', function() {
      expect(caption.lines.length).to.equal(testData.HelloWorld.length);
    });
    it('should return undefined if number of lines is 0', function() {
      expect(CaptionFactory.createLine([])).to.be.undefined;
    });
  });
  describe('#createCaptionMap()', function() {
    const captionMap = CaptionFactory.createCaptionMap(testData);
    it('should exist', function() {
      expect(captionMap).to.exist;
    });
    it('should have the correct number of keys', function() {
      expect(Object.keys(captionMap).length).to.equal(
        Object.keys(testData).length
      );
    });
    it('should name keys correctly', function() {
      expect(captionMap['HelloWorld']).to.exist;
    });
  });
});
