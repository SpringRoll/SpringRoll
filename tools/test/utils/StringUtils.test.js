const {StringUtils} = springroll;

describe('springroll.StringUtils', function() {

    it('should reverse', function() {
        let str = 'Test String';
        assert.strictEqual(StringUtils.reverse(str), 'gnirtS tseT', 'String reverse');

    });

    it('should format', function() {
        str = 'My name is %s!';
        let sub = 'John';
        let result = 'My name is John!';
        assert.strictEqual(StringUtils.format(str, 'John'), result, 'String formatting');
    });
});