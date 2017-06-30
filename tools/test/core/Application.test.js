const {Application} = springroll;

describe('springroll.Application', function() {

    before(function(done) {
        this.app = new Application({
            name: 'test'
        });

        this.app.on('ready', done);
    });

    after(function() {
        this.app = null;
    });

    it('should create new Application', function() {
        
        assert.strictEqual(this.app, springroll.Application.instance, 'Application\'s singleton works');
    });

    it('should destroy Application', function() {
        this.app.destroy();
        assert.ok(this.app.destroyed, 'Destroyed worked');
        assert.ok(!Application.instance, 'Singleton was destroyed');
    });

});