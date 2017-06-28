// @if DEBUG
import {Debug} from '@springroll/debug';
// @endif

/**
 * Used for managing the browser cache of loading external elements
 * can easily load version manifest and apply it to the media loader
 * supports cache busting all media load requests
 * uses the query string to bust browser versions.
 * ### module: @springroll/loader
 *
 * @class
 * @memberof springroll
 */
export default class CacheManager {
    /**
     * @param {springroll.Application} app Reference to application
     */
    constructor(app) {
        /**
         * The current application
         * @private
         * @member {springroll.Application}
         */
        this._app = app;

        /**
         * The collection of version numbers
         * @private
         * @member {Dictionary}
         */
        this._versions = {};

        /**
         * The list of URL filtering functions.
         * @private
         * @member {Array}
         */
        this._filters = [];

        /**
         * A global version or cache busting string to apply to every url.
         * @private
         * @member {String}
         */
        this._globalVersion = null;

        // Function bindings
        this._applySpecificVersion = this._applySpecificVersion.bind(this);
        this._applyGlobalVersion = this._applyGlobalVersion.bind(this);

        // Initial set
        this.cacheBust = false;
    }

    /**
     * If we are suppose to cache bust every file
     * @member {Boolean}
     * @default false
     */
    get cacheBust() {
        return !!(this._globalVersion && this._globalVersion.indexOf('cb=') === 0);
    }
    set cacheBust(value) {
        if (value) {
            this._globalVersion = 'cb=' + Date.now();
            this.unregisterURLFilter(this._applySpecificVersion);
            this.registerURLFilter(this._applyGlobalVersion);
        }
        else {
            let version = this._app.options.version;
            this._globalVersion = version ? 'v=' + version : null;
            if (this._globalVersion) {
                this.unregisterURLFilter(this._applySpecificVersion);
                this.registerURLFilter(this._applyGlobalVersion);
            }
            else {
                this.unregisterURLFilter(this._applyGlobalVersion);
                this.registerURLFilter(this._applySpecificVersion);
            }
        }
    }

    /**
     * Destroy the cache manager, don't use after this.
     */
    destroy() {
        this._app = null;
        this._versions = null;
        this._filters = null;
        this._applySpecificVersion = null;
        this._applyGlobalVersion = null;
    }

    /**
     * Adds a versions text file containing versions for different assets.
     * @param {String} url The url of the versions file.
     * @param {Function} callback Callback when the versions file has been loaded.
     * @param {String} baseUrl A base url to prepend all lines of the file.
     */
    addVersionsFile(url, callback, baseUrl) {
        // @if DEBUG
        Debug.assert(/^.*\.txt$/.test(url), 'The versions file must be a *.txt file');
        // @endif

        // If we already cache busting, we can ignore this
        if (this.cacheBust) {
            if (callback) {
                callback();
            }
            return;
        }

        // Add a random version number to never cache the text file
        this.addVersion(url, Date.now().toString());

        //ensure that that cache busting version is applied
        url = this._applySpecificVersion(url);

        let cm = this;

        // Load the version
        this._app.load(url, function(versions) {
            // check for a valid result content
            if (versions) {
                // Remove carrage returns and split on newlines
                let lines = versions.replace(/\r/g, '').split('\n');
                let i, parts, len;

                // Go line by line
                for (i = 0, len = lines.length; i < len; i++) {
                    // Check for a valid line
                    if (!lines[i]) {
                        continue;
                    }

                    // Split lines
                    parts = lines[i].split(' ');

                    // Add the parts
                    if (parts.length !== 2) {
                        continue;
                    }

                    // Add the versioning
                    cm.addVersion((baseUrl || '') + parts[0], parts[1]);
                }
            }
            if (callback) {
                callback();
            }
        });
    }

    /**
     * Add a version number for a file
     * @param {String} url The url of the object
     * @param {String} version Version number or has of file
     */
    addVersion(url, version) {
        if (!this._versions[url]) {
            this._versions[url] = version;
        }
    }

    /**
     * Adds a function for running all urls through, to modify them if needed.
     * Functions used should accept one string parameter (the url), and return the
     * modified url.
     * @param {Function} filter The function that will handle urls.
     */
    registerURLFilter(filter) {
        if (this._filters.indexOf(filter) === -1) {
            this._filters.push(filter);
        }
    }

    /**
     * Removes a function from the list of filtering functions.
     * @param {Function} filter The function to remove.
     */
    unregisterURLFilter(filter) {
        let index = this._filters.indexOf(filter);
        if (index > -1) {
            this._filters.splice(index, 1);
        }
    }

    /**
     * Applies a url specific version to a url from the versions file.
     * @private
     * @param {String} url The url to apply versioning to.
     * @return {String} The modified url.
     */
    _applySpecificVersion(url) {
        //don't apply versioning if the asset is retrieved from a php service
        let basePath = this._app.options.basePath;
        if (basePath && basePath.indexOf('?') > 0) {
            return url;
        }

        let ver = this._versions[url];
        //if a version exists for this url, and the url doesn't already have 'v=' in it
        //then apply the url specific version.
        if (ver && /(\?|&)v=[0-9]*/.test(url) === false) {
            url = url + (url.indexOf('?') < 0 ? '?' : '&') + 'v=' + ver.version;
        }
        return url;
    }

    /**
     * Applies cache busting or a global version to a url.
     * @private
     * @param {String} url The url to apply versioning to.
     * @return {String} The modified url.
     */
    _applyGlobalVersion(url) {
        if (!this._globalVersion) {
            return url;
        }
        //don't apply versioning if the asset is retrieved from a php service
        let basePath = this._app.options.basePath;
        if (basePath && basePath.indexOf('?') > 0) {
            return url;
        }

        //apply the versioning if it isn't already on the url
        let test = this._globalVersion.indexOf('cb=') === 0 ?
            (/(\?|&)cb=[0-9]*/) : (/(\?|&)v=/);
        if (test.test(url) === false) {
            url = url + (url.indexOf('?') < 0 ? '?' : '&') + this._globalVersion;
        }
        return url;
    }

    /**
     * Applies a base path to a relative url. This is not used in the filtering
     * system because PreloadJS has its own method of prepending the base path
     * that we use. Instead, it is used with an extra parameter to prepare().
     * @private
     * @param {String} url The url to prepend the base path to.
     * @return {String} The modified url.
     */
    _applyBasePath(url) {
        let basePath = this._app.options.basePath;
        if (basePath && /^http(s)?:/.test(url) === false && url.search(basePath) === -1) {
            url = basePath + url;
        }
        return url;
    }

    /**
     * Prepare a URL with the necessary cache busting and/or versioning
     * as well as the base directory.
     * @param {String} url The url to prepare
     * @param {Boolean} [applyBasePath=false] If the global base path should be applied to the url.
     *        This defaults to false because it can potentially interfere with later regular
     *        expression checks, particularly with PreloadJS
     * @return {String} The final url with version/cache and basePath added
     */
    prepare(url, applyBasePath) {
        //apply first in case the base path is strange and makes the rest of the path a query string
        if (applyBasePath) {
            url = this._applyBasePath(url);
        }

        for (let i = 0, len = this._filters.length; i < len; ++i) {
            url = this._filters[i](url);
        }
        return url;
    }
}
