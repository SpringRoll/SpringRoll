const {Application} = springroll;
const path = require('path');

describe('springroll.AssetManager', function() {

    before(function(done) {
        this.app = new Application({
            name: 'test',
            basePath: path.resolve(__dirname, '..', 'resources') + path.sep
        });
        this.app.on('ready', done);
    });

    after(function() {
        this.app.destroy();
        this.app = null;
    });

    it('should have the APIs', function() {
        assert(!!this.app.assetManager, 'Asset Manager exists');
        assert(!!this.app.load, 'Application load');
        assert(!!this.app.unload, 'Application unload');
        assert(!!this.app.getCache, 'Application getCache');
    });

    it('should load single asset', function(done) {
        const src = 'file.txt';
        this.app.load(src, (txt) => {
            assert(typeof txt === 'string', 'Result is object');
            const objectCallback = (txt2, asset, assets) => {
                assert.equal(txt, txt2, 'Object-based loading');
                assert(typeof asset === 'object', 'Asset is plain object');
                assert(Array.isArray(assets), 'Assets is available');
                assert.strictEqual(objectCallback, asset.complete, 'Asset object check');
                assets.push(
                    {
                        src: 'config.json',
                        complete: function(config) {
                            assert(!!config, 'Created sub-load');
                            done();
                        }
                    });
            };
            this.app.load(
                {
                    src,
                    complete: objectCallback
                });
        });
    });

    it('should List Assets', function(done) {
        const assets = [
            'config.json',
            'image.png',
            function(callback) {
                callback(100);
            }
        ];
        this.app.load(assets,
            {
                startAll: false,
                complete: (results) => {
                    assert.ok(Array.isArray(results), 'Results is a list');
                    assert.equal(results.length, assets.length, 'Length matches assets');
                    assert.equal(typeof results[0], 'object', 'JSON loaded');
                    assert.equal(results[1].tagName, 'IMG', 'Image loaded');
                    assert.equal(results[2], 100, 'Asynchronous loaded');
                    done();
                }
            });
    });

    it('should Mapped Assets', function(done) {
        const assets = [
            {
                src: 'config.json',
                id: 'config'
            },
            {
                src: 'image.png',
                id: 'image'
            },
            {
                assets: [
                    'file.txt',
                    'captions.json'
                ],
                id: 'files'
            }];
        this.app.load(assets, (results) => {
            assert.ok(!!results, 'Results is returned');
            assert.ok(typeof results === 'object', 'Results is a map');
            assert.equal(results.image.tagName, 'IMG', 'Mapped Image Loaded');
            assert.ok(typeof results.config === 'object', 'Mapped JSON Loaded');
            assert.ok(Array.isArray(results.files), 'Asset list loaded');
            done();
        });
    });

    it('should Cached Assets', function(done) {
        const assets = [
            {
                src: 'file.json',
                id: '_FILE_',
                complete: function(obj, asset, assets) {
                    assets.push('captions.json');
                }
            },
            {
                src: 'config.json',
                cache: false
            },
            'image.png'
        ];
        this.app.load(assets,
            {
                complete: (results) => {
                    assert.ok(!!this.app.getCache('image'), 'Cache Image is returned');
                    assert.ok(!this.app.getCache('config'), 'Override cache all');
                    assert.ok(!!this.app.getCache('_FILE_'), 'Custom ID specified');
                    assert.ok(!!this.app.getCache('captions'), 'Sub task is cached');
                    done();
                },
                cacheAll: true
            });
    });

    it('should Color-Alpha Task', function(done) {
        const asset = {
            color: 'image.png',
            alpha: 'image-alpha.png'
        };
        this.app.load(asset, (image) => {
            assert.ok(!!image, 'Color-alpha asset is loaded');
            assert.equal(image.tagName, 'CANVAS', 'Color-alpha is canvas');
            done();
        });
    });

});
