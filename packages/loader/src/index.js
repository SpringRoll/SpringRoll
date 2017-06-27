import {expose} from '@springroll/core';

import './plugins';

import * as tasks from './tasks';
import Loader from './Loader';
import LoaderResult from './LoaderResult';
import LoaderItem from './LoaderItem';
import CacheManager from './CacheManager';
import AssetManager from './AssetManager';
import AssetSizes from './AssetSizes';
import AssetLoad from './AssetLoad';
import AssetCache from './AssetCache';

expose({
    tasks,
    Loader,
    LoaderResult,
    LoaderItem,
    CacheManager,
    AssetManager,
    AssetSizes,
    AssetLoad,
    AssetCache
});

export {
    tasks,
    Loader,
    LoaderResult,
    LoaderItem,
    CacheManager,
    AssetManager,
    AssetSizes,
    AssetLoad,
    AssetCache
};