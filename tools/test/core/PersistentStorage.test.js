const {PersistentStorage} = springroll;

describe('springroll.PersistentStorage', function() {
    
    before(function() {
        this.storage = new PersistentStorage();
    });

    after(function() {
        this.storage = null;
    });

    it('should read undefined value', function() {
        const value = this.storage.read('doesnotexist');
        assert.strictEqual(value, null, 'Data does not exist');
    });

    it('should write an option', function() {
        this.storage.write('choice', 1);
        assert.strictEqual(this.storage.read('choice'), 1, 'Write works');
    });

    it('should remove a value', function() {
        this.storage.remove('choice');
        assert.strictEqual(this.storage.read('choice'), null, 'Remove works');
    });

});