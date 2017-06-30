const {MathUtils} = springroll;

describe('springroll.MathUtils', function() {

    it('should do clamp', function() {
        assert.strictEqual(10, MathUtils.clamp(20, 2, 10), 'Upper clamp');
        assert.strictEqual(2, MathUtils.clamp(-1, 2, 10), 'Lower clamp');
        assert.strictEqual(0, MathUtils.clamp(-1, 10), 'Zero-based clamp');
    });

    it('should do dist', function() {
        assert.strictEqual(4, MathUtils.dist(
            {
                x: 0,
                y: 4
            },
            {
                x: 0,
                y: 0
            }), '2 Point distance');
        assert.strictEqual(4, MathUtils.dist(0, 4, 0, 0), 'X, Y, X1, Y1 distance');
    });

    it('should do distSq', function() {
        assert.strictEqual(16, MathUtils.distSq(
            {
                x: 0,
                y: 4
            },
            {
                x: 0,
                y: 0
            }), '2 Point distance squared');
        assert.strictEqual(16, MathUtils.distSq(0, 4, 0, 0), 'X, Y, X1, Y1 distance squared');
    });

    it('should do randomInt', function() {
        let i = MathUtils.randomInt(4, 10);
        assert.ok(i >= 4, 'Random Int Min');
        assert.ok(i <= 10, 'Random Int Max');
        assert.equal(parseInt(i), i, 'Is Int');

        i = MathUtils.randomInt(100);
        assert.ok(i >= 0, 'Zero-based Random Int Min');
        assert.ok(i <= 100, 'Zero-based Random Int Max');
        assert.equal(parseInt(i), i, 'Zero-based Is Int');
    });

});