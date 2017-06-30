process.env.NODE_ENV = 'development';

const fs = require('fs');
const pkg = require('./package');

window.createjs = {};

require('pixi.js');
require('./resources/vendor/preloadjs.min');
require('./resources/vendor/soundjs.min');

for (const name in pkg.devDependencies) {
    if (name.indexOf('@springroll') === 0) {
        require(name);
    }
}

require('./core/Application.test');
require('./core/Enum.test');
require('./core/include.test');
require('./core/PersistentStorage.test');
require('./core/StringFilters.test');
require('./container-client/UserData.test');
require('./languages/Languages.test');
require('./loader/Loader.test');
require('./loader/AssetManager.test');
require('./utils/ArrayUtils.test');
require('./utils/MathUtils.test');
require('./utils/StringUtils.test');