const {UserData, PersistentStorage} = springroll;

describe('springroll.UserData', function() {
    
    before(function() {
        this.userData = new UserData(new Bellhop(), new PersistentStorage());
    });

    after(function() {
        this.userData.destroy();
        this.userData = null;
    });

    it('should have userData Application API', function(){
        assert.ok(!!this.userData, 'Application userData property');

    });

    it('should write and read property', function(done) {
        this.userData.write('highScore', 1000);
        this.userData.read('highScore', function(value) {
            assert.strictEqual(value, 1000, 'Read/write works');
            done();
        });
    });

    it('should remove highScore', function(done) {
        this.userData.remove('highScore');
        this.userData.read('highScore', function(value) {
            assert.strictEqual(value, null, 'Removed works');
            done();
        });
    });
    
});