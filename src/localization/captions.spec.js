import CaptionFactory from './captions/CaptionFactory';
import Caption from './captions/Caption';
import TimedLine from './captions/TimedLine';

let testData = {
  HelloWorld: [
    {
      content: 'hello',
      start: 0,
      end: 1200
    },
    {
      content: 'world',
      start: 1200,
      end: 2400
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

describe('CaptionFactory', function() {
  let line = CaptionFactory.createLine(testData.Hello[0]);

  describe('#createLine()', function() {
    it('should return instanceOf TimedLine', function() {      
      expect(line).to.be.a(TimedLine);
    });

    it('content should be formatted properly', function()
    {
      expect(line.content).to.equal('hello');
    });
  });
  
  describe('#createCaption()', function()
  {
    let caption = CaptionFactory.createCaption(testData.Hello);

    it('should return instanceOf Caption', function()
    {  
      expect(caption).to.be.a(Caption);
    });

    it('should have the correct number of lines', function()
    {
      expect(caption.lines.length).to.equal(testData.Hello.length);
    });
  });

  describe('#createCaptionMap()', function()
  {
    let captionMap = CaptionFactory.createCaptionMap(testData);

    it('should exist', function()
    {  
      expect(captionMap).to.exist();
    });

    it('should have the correct number of keys', function()
    {
      expect(Object.keys(captionMap).length).to.equal(Object.keys(testData).length);
    });

  });
});
