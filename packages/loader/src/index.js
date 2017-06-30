import {expose} from '@springroll/core';

import './plugins';

import {ColorAlphaTask, FunctionTask, ListTask, LoadTask, Task} from './tasks';
import Loader from './Loader';
import LoaderResult from './LoaderResult';
import LoaderItem from './LoaderItem';
import CacheManager from './CacheManager';
import AssetManager from './AssetManager';
import AssetSizes from './AssetSizes';
import AssetLoad from './AssetLoad';
import AssetCache from './AssetCache';

expose({
    ColorAlphaTask,
    FunctionTask,
    ListTask,
    LoadTask,
    Task,
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
    ColorAlphaTask,
    FunctionTask,
    ListTask,
    LoadTask,
    Task,
    Loader,
    LoaderResult,
    LoaderItem,
    CacheManager,
    AssetManager,
    AssetSizes,
    AssetLoad,
    AssetCache
};