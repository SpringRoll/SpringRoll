const {ArrayUtils} = springroll;

describe('springroll.ArrayUtils', function() {

    it ('should do last', function() {
        const arr = [1, 2, 3];
        assert.strictEqual(3, ArrayUtils.last(arr), 'Last property');
    });

    it('should do random', function() {
        const arr = [1, 2, 3];
        assert.ok(arr.indexOf(ArrayUtils.random(arr)) > -1, 'Random item');
    });
    
    it('should do shuffle', function() {
        const arr = [1, 2, 3];
        ArrayUtils.shuffle(arr);
        assert.strictEqual(arr.length, 3, 'Array length after shuffle');
        assert.ok(arr.indexOf(1) > -1, 'First item index');
        assert.ok(arr.indexOf(2) > -1, 'Second item index');
        assert.ok(arr.indexOf(3) > -1, 'Third item index');
    });
});