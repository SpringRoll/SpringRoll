import { CaptionFactory } from '../CaptionFactory';
import testData from './CaptionTestData';

describe('TimedLine', function() {
  const lineData = testData.HelloWorld[0];
  const line = CaptionFactory.createLine(lineData);
  describe('$.content', function() {
    it('should exist', function() {
      expect(line.content).to.exist;
    });
  });
});
