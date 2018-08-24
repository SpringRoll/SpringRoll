import { CaptionFactory } from '../CaptionFactory';
import { TestRenderer } from '../renderers/RendererTest';
import testData from './CaptionTestData';

describe('Caption', function() {
  const tester = new TestRenderer();
  const captionData = testData.SameTime;
  const caption = CaptionFactory.createCaption(captionData);

  beforeEach(function() {
    caption.reset();
    tester.reset();
  });

  describe('#isFinished()', function() {
    it('should return false when time is less than last line end time.', function() {
      caption.start();
      caption.update(0);
      expect(caption.isFinished()).to.be.false;
    });

    it('should return true when time is greater than last line end time.', function() {
      caption.start();
      caption.update(captionData[1].end + 1);
      expect(caption.isFinished()).to.be.true;
    });
  });

  describe('#start()', function() {
    it('should set caption to the correct line', function() {
      caption.start(captionData[1].start, tester);
      console.log(tester.content, captionData[1].content);
      expect(tester.content).to.equal(captionData[1].content);
    });

    it('should not call lineEnd before lineBegin', function() {
      caption.start(captionData[1].start, tester);
      expect(tester.lineEndCalled).to.be.false;
    });
  });

  describe('#update()', function() {
    it('should call lineEndCallback if between lines', function() {
      caption.start(0, tester);
      caption.update(1250);
      expect(tester.lineEndCalled).to.true;
    });

    it('should call lineBeginCallback when next line starts', function() {
      caption.start(1000, tester);
      caption.update(0.05);
      expect(tester.lineBeginCalled).to.true;
    });

    it('should call lineEndCallback then lineBeginCallback between lines', function() {
      caption.start(0, tester);
      caption.update(600);
      caption.update(600);
      caption.update(600);
      expect(tester.lineEndCalled).to.equal(true);
    });
  });
});
