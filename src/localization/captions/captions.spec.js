import CaptionFactory from './CaptionFactory';
import CaptionPlayer from './CaptionPlayer';
import Caption from './Caption';
import TimedLine from './TimedLine';

const testData = {
  HelloWorld: [
    {
      content: 'hello',
      start: 0,
      end: 1200
    },
    {
      content: 'world',
      start: 1300,
      end: 2500
    }
  ],
  Other: [
    {
      content: 'things',
      start: 0,
      end: 1200
    }
  ]
};

const htmlRegex = /(<([^>]+)>)/gi;
/** */
const milliToSec = function(time) {
  return time / 1000;
};

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

describe('TimedLine', function() {
  const lineData = testData.HelloWorld[0];
  const line = CaptionFactory.createLine(lineData);

  describe('$.content', function() {
    it('should exist', function() {
      expect(line.content).to.exist;
    });
  });

  describe('$.text', function() {
    it('should exist', function() {
      expect(line.text).to.exist;
    });

    it('should not contain html tags', function() {
      expect(htmlRegex.exec(line.text)).to.equal(null);
    });
  });
});

describe('Caption', function() {
  const captionData = testData.HelloWorld;
  const caption = CaptionFactory.createCaption(captionData);

  beforeEach(function() {
    caption.reset();
  });

  describe('#isFinished()', function() {
    it('should return false when time is less than last line end time.', function() {
      caption.start();
      caption.update(0);
      expect(caption.isFinished()).to.be.false;
    });

    it('should return true when time is greater than last line end time.', function() {
      caption.start();
      caption.update(milliToSec(captionData[1].end + 1));
      expect(caption.isFinished()).to.be.true;
    });
  });

  describe('#start()', function() {
    it('should set caption to the correct line', function() {
      caption.start(captionData[1].start, line => {
        expect(line.content).to.equal(captionData[1].content);
      });
    });

    it('should not call lineEnd before lineBegin', function() {
      let lineEndCalled = false;
      caption.start(
        captionData[1].start,
        () => {
          expect(lineEndCalled).to.equal(false);
        },
        () => {
          lineEndCalled = true;
        }
      );
    });
  });

  describe('#update()', function() {
    it('should call lineEndCallback if between lines', function() {
      let lineEndCalled = false;
      caption.start(
        0,
        () => {},
        () => {
          lineEndCalled = true;
        }
      );
      caption.update(milliToSec(1250));
      expect(lineEndCalled).to.equal(true);
    });

    it('should call lineBeginCallback when next line starts', function() {
      let lineBeginCalled = 0;
      caption.start(
        1250,
        () => {
          lineBeginCalled = true;
        },
        () => {}
      );
      caption.update(milliToSec(50));
      expect(lineBeginCalled).to.equal(true);
    });

    it('should call lineEndCallback then lineBeginCallback between lines', function() {
      let lineBeginCount = 0;
      let correctOrder = false;
      caption.start(
        0,
        () => {
          lineBeginCount++;
        },
        () => {
          if (lineBeginCount == 1) {
            correctOrder = true;
          }
        }
      );
      caption.update(milliToSec(600));
      caption.update(milliToSec(600));
      caption.update(milliToSec(600));
      expect(correctOrder).to.equal(true);
    });
  });
});

describe('CaptionPlayer', function() {
  const captions = CaptionFactory.createCaptionMap(testData);

  describe('#start(name)', function() {
    it('should call ICaptionRenderer.start', function() {
      let startCalled = false;

      const player = new CaptionPlayer(captions, {
        start: () => {
          startCalled = true;
        }
      });

      player.start('HelloWorld');
      expect(startCalled).to.equal(true);
    });

    it('should call ICaptionRenderer.lineBegin after ICaptionRenderer.start ', function() {
      let startCalled = false;
      let failed = false;
      const player = new CaptionPlayer(captions, {
        start: () => {
          startCalled = true;
        },
        lineBegin: () => {
          if (!startCalled) {
            failed = true;
          }
        }
      });

      player.start('HelloWorld');
      expect(failed).to.equal(false);
    });

    it('should call ICaptionRenderer.lineBegin with the correct line ', function() {
      const player = new CaptionPlayer(captions, {
        lineBegin: line => {
          expect(line.content).to.equal('world');
        }
      });
      player.start('HelloWorld', 1400);
    });

    it('should not call ICaptionRenderer.lineBegin if time is greater than the end time', function() {
      let lineBeginCalled = false;
      const player = new CaptionPlayer(captions, {
        lineBegin: () => {
          lineBeginCalled = true;
        }
      });
      player.start('HelloWorld', 5000);
      expect(lineBeginCalled).to.equal(false);
    });

    it('should not call ICaptionRenderer.lineEnd', function() {
      let lineEndCalled = false;
      const player = new CaptionPlayer(captions, {
        lineEnd: () => {
          lineEndCalled = true;
        }
      });
      player.start('HelloWorld', 1400);
      expect(lineEndCalled).to.equal(false);
    });

    it('should not call ICaptionRenderer.stop', function() {
      let stopCalled = false;
      const player = new CaptionPlayer(captions, {
        stop: () => {
          stopCalled = true;
        }
      });
      player.start('HelloWorld');
      expect(stopCalled).to.equal(false);
    });

    it('should call ICaptionRenderer.stop if a caption is already playing', function() {
      let stopCalled = false;
      const player = new CaptionPlayer(captions, {
        stop: () => {
          stopCalled = true;
        }
      });
      player.start('HelloWorld');
      player.start('Other');
      expect(stopCalled).to.equal(true);
    });
  });

  describe('#stop()', function() {
    const captions = CaptionFactory.createCaptionMap(testData);

    it('should call ICaptionRenderer.stop', function() {
      let stopCalled = false;
      const player = new CaptionPlayer(captions, {
        stop: () => {
          stopCalled = true;
        }
      });
      player.start('HelloWorld');
      player.stop();
      expect(stopCalled).to.equal(true);
    });

    it('should not call ICaptionRenderer.stop if no caption is started', function() {
      let stopCalled = false;
      const player = new CaptionPlayer(captions, {
        stop: () => {
          stopCalled = true;
        }
      });

      player.stop();
      expect(stopCalled).to.equal(false);
    });
  });

  describe('#update()', function() {
    it('should not call ICaptionRenderer.stop if not enough time has passed', function() {
      let stopCalled = false;
      const player = new CaptionPlayer(captions, {
        stop: () => {
          stopCalled = true;
        }
      });
      player.start('HelloWorld');
      player.update(milliToSec(500));
      expect(stopCalled).to.equal(false);
    });

    it('should not call ICaptionRenderer.stop if enough time has passed', function() {
      let stopCalled = false;
      const player = new CaptionPlayer(captions, {
        stop: () => {
          stopCalled = true;
        }
      });
      player.start('HelloWorld');
      player.update(milliToSec(3000));
      expect(stopCalled).to.equal(true);
    });
  });
});
