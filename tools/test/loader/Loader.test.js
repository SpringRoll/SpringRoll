const path = require('path');
const {Application} = springroll;

describe('springroll.Loader', function() {

    before(function(done) {
        this.basePath = path.resolve(__dirname, '..', 'resources') + path.sep;
        this.app = new Application({
            name: 'test',
            cacheBust: true,
            basePath: this.basePath
        });
        this.app.on('ready', () => {
            this.loader = this.app.loader;
            done();
        });
    });

    after(function() {
        this.app.destroy();
        this.app = null;
        this.loader = null;
    });

    it('should prepare urls', function() {
        let url = 'test.jpg';
        let cbUrl = this.loader.cacheManager.prepare(url);
        let basePathUrl = this.loader.cacheManager.prepare(url, true);

        assert.ok(/^test\.jpg\?cb\=[0-9]+$/.test(cbUrl), 'Cache Busting works');
        assert.equal(basePathUrl.indexOf(this.basePath + url), 0, 'Found base path');
    });

    it('should not cacheBust', function() {
        // Turn off cache busting and base path
        this.app.options.cacheBust = false;

        this.loader.load('nothing.txt', function() {});
        assert.ok(this.loader.cancel('nothing.txt'), 'Canceling load');
    });

    it('should manage cache', function(done) {
        // Test loading a basic file
        const url = 'file.txt';
        this.loader.load(url, (result) => {
            assert.strictEqual(result.content, 'info', 'Loaded plain text file');
            assert.strictEqual(result.url, url, 'Result url is the same');
            this.loader.load('file.json', (result) => {
                assert.ok(typeof result.content === 'object', 'JSON parsed return');
                assert.strictEqual(result.content.example, 1, 'JSON content return');
                this.loader.load('image.png', (result) => {
                    assert.equal(result.content.nodeName, 'IMG', 'DOM image element loaded');
                    assert.equal(result.content.width, 15, 'DOM image element width');
                    done();
                });
            });
        });
    });
    
});