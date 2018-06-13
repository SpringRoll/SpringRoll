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

/** */
const milliToSec = function(time) {
  return time / 1000;
};

describe('CaptionFactory', function() {
  let lineData = testData.HelloWorld[0];
  let line = CaptionFactory.createLine(lineData);

  describe('#createLine()', function() {
    it('should return undefined if data.start is not a number', function() {
      expect(CaptionFactory.createLine({ start: 0, content: 'hello' })).to.be.undefined;
    });

    it('should return undefined if data.end is not a number', function() {
      expect(CaptionFactory.createLine({ end: 1000, content: 'hello' })).to.be.undefined;
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
    let caption = CaptionFactory.createCaption(testData.HelloWorld);

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
    let captionMap = CaptionFactory.createCaptionMap(testData);

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
  let lineData = testData.HelloWorld[0];
  let line = CaptionFactory.createLine(lineData);

  describe('#getContent(time)', function() {
    it('should return empty if time less than start time', function() {
      expect(line.getContent(lineData.start - 1)).to.be.empty;
    });

    it('should return empty if time greater than end time', function() {
      expect(line.getContent(lineData.end + 1)).to.be.empty;
    });

    it('should return correct a content if time is between start and end time', function() {
      expect(line.getContent(lineData.start + 1)).to.equal(lineData.content);
    });
  });
});

describe('Caption', function() {
  let captionData = testData.HelloWorld;
  let caption = CaptionFactory.createCaption(captionData);

  beforeEach(function() {
    caption.reset();
  });

  describe('#getContent()', function() {
    it('should return correct line content at the beginning', function() {
      caption.update(milliToSec(captionData[0].start));
      expect(caption.getContent()).to.equal(captionData[0].content);
    });

    it('should return empty content if time is less than next line start', function() {
      caption.update(milliToSec(captionData[1].start - 1));
      expect(caption.getContent()).to.be.empty;
    });

    it('should return correct line content after time has passed', function() {
      caption.update(milliToSec(captionData[1].start + 1));
      expect(caption.getContent()).to.equal(captionData[1].content);
    });

    it('should return empty content if time is less greater than last line end', function() {
      caption.update(milliToSec(captionData[1].end + 1));
      expect(caption.getContent()).to.be.empty;
    });
  });

  describe('#isFinished()', function() {
    it('should return false when time is less than last line end time.', function() {
      caption.update(0);
      expect(caption.isFinished()).to.be.false;
    });

    it('should return true when time is greater than last line end time.', function() {
      caption.update(milliToSec(captionData[1].end + 1));
      expect(caption.isFinished()).to.be.true;
    });
  });

  describe('#start()', function() {
    it('should set caption to the correct line', function() {
      caption.start(captionData[1].start);
      expect(caption.getContent()).to.equal(captionData[1].content);
    });
  });
});

describe('CaptionPlayer', function() {
  let captions = CaptionFactory.createCaptionMap(testData);
  let htmlElement = document.createElement('p');
  let player;

  beforeEach(function() {
    player = new CaptionPlayer(captions, htmlElement);
  });

  describe('#update(deltaTime)', function() {
    beforeEach(function() {
      player.start('HelloWorld');
    });

    it('should properly set the elements innerHTML', function() {
      player.update(milliToSec(testData.HelloWorld[1].start));
      expect(htmlElement.innerHTML).to.be.equal(testData.HelloWorld[1].content);
    });

    it('should stop when caption line.endTime is exceeded ', function() {
      player.update(milliToSec(testData.HelloWorld[1].end + 1000));
      expect(htmlElement.innerHTML).to.be.equal('');
    });
  });

  describe('#start(name)', function() {
    it('should properly set the elements innerHTML', function() {
      player.start('HelloWorld');
      expect(htmlElement.innerHTML).to.be.equal(testData.HelloWorld[0].content);
    });

    it('should properly set caption to the correct time', function() {
      player.start('HelloWorld', testData.HelloWorld[1].start);
      expect(htmlElement.innerHTML).to.be.equal(testData.HelloWorld[1].content);
    });

    it('should not error if caption does not exist', function() {
      player.start('Not-In-Data');
      expect(htmlElement.innerText).to.be.equal('');
    });

    it('should interupt already playing captions', function() {
      player.start('HelloWorld');
      player.start('Other');
      expect(htmlElement.innerText).to.be.equal(testData.Other[0].content);
    });
  });

  describe('#stop()', function() {
    beforeEach(function() {
      player.start('HelloWorld');
    });

    it('should properly set the elements innerHTML', function() {
      player.stop();
      expect(htmlElement.innerText).to.be.equal('');
    });

    it('should not error if called twice', function() {
      player.stop();
      player.stop();
    });
  });
});
