test('Loader', function(assert) {

    //expect(9);
    let Application = include('springroll.Application');

    // New Application
    let basePath = 'http://example.com/';
    let app = new Application(
        {
            cacheBust: true,
            basePath: basePath
        });
    let loader = app.loader;
    let url = 'test.jpg';
    let cbUrl = loader.cacheManager.prepare(url);
    let basePathUrl = loader.cacheManager.prepare(url, true);

    assert.ok(/^test\.jpg\?cb\=[0-9]+$/.test(cbUrl), 'Cache Busting works');
    assert.equal(basePathUrl.indexOf(basePath + url), 0, 'Found base path');

    // Turn off cache busting and base path
    app.options.cacheBust = false;
    app.options.basePath = '';

    loader.load('data/nothing.txt', function() {});
    assert.ok(loader.cancel('data/nothing.txt'), 'Canceling load');

    stop();
    // Test loading a basic file
    url = 'data/file.txt';
    loader.load(url, function(result) {
        start();
        assert.strictEqual(result.content, 'info', 'Loaded plain text file');
        assert.strictEqual(result.url, url, 'Result url is the same');
        stop();

        loader.load('data/file.json', function(result) {
            start();
            assert.ok(typeof result.content === 'object', 'JSON parsed return');
            assert.strictEqual(result.content.example, 1, 'JSON content return');
            stop();

            loader.load('data/image.png', function(result) {
                start();
                assert.equal(result.content.nodeName, 'IMG', 'DOM image element loaded');
                assert.equal(result.content.width, 15, 'DOM image element width');
            });
        });
    });
});