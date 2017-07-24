const {StringFilters} = springroll;

describe('springroll.StringFilters', function() {

    before(function() {
        this.filters = new StringFilters();
        this.testStr = 'ClickOnGo%INTERACTION%';
    });

    after(function() {
        this.filters = null;
    });
    
    it('should add interaction', function() {
        const EXPECTED = 'ClickOnGo_mouse';
        this.filters.add('%INTERACTION%', '_mouse');
        const result = this.filters.filter(this.testStr);
        assert.strictEqual(result, EXPECTED, 'String filter passed');
        try {
            this.filters.add('%INTERACTION%', '_mouse');
        }
        catch (e) {
            assert.ok(true, 'stringFilters.add caught duplicate replacement String.');
        }
    });

    it('should add regexp', function() {
        const EXPECTED = 'You can also order food at the cocktail bar.';
        const testRegExp = 'You can also order food at the cocktail foo.';
        this.filters.add(/\bfoo\b/, 'bar');
        const result = this.filters.filter(testRegExp);
        assert.strictEqual(result, EXPECTED, 'RegExp filter passed');
        try {
            this.filters.add(/\bfoo\b/, 'baz');
        }
        catch (e) {
            assert.ok(true, 'stringFilters.add caught duplicate replacement RegExp.');
        }
    });

    it('should destoy the filters', function() {
        this.filters.destroy();
        const result = this.filters.filter(this.testStr);
        assert.ok(result === this.testStr, 'Destroy check passed.');
    });
});