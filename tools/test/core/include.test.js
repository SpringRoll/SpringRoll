const {include} = springroll;

describe('springroll.include', function() {

    it('should do include successfully', function() {
        const includedClass = include('springroll.Application');
        assert.strictEqual(includedClass, springroll.Application, 'Application compare');
    });

    it('should fail for something that does not exist', function() {
        try {
            include('springroll.Untitled');
            assert(false, 'Should have failed');
        }
        catch(err) {
            assert(true, 'Failure worked');
        }
    });

    it('should not fail with option', function() {
        const fail = include('springroll.Untitled', false);
        assert.strictEqual(fail, null, 'Should be null');
    });

});