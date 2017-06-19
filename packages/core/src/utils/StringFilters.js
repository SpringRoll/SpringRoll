/**
 * Class for filtering strings
 * @constructor
 * @class StringFilters
 */
var StringFilters = function()
{
    /**
     * Dictionary of filters
     * @property {Array} _filters
     * @private
     */
    this._filters = [];
};

/**
 * Register a filter
 * @method add
 * @param {String|RegExp} replace The string or regex to replace
 * @param {String} replacement String to repalce with
 * @static
 */
StringFilters.prototype.add = function(replace, replacement)
{
    if (!replace || (typeof replace != 'string' && replace instanceof RegExp === false))
    {
        // @if DEBUG
        throw 'replace value must be a valid String or RegExp';
        // @endif

        // @if RELEASE
        // eslint-disable-next-line no-unreachable
        throw 'invalide replace value';
        // @endif
    }
    if (typeof replacement != 'string')
    {
        // @if DEBUG
        throw 'replacement value must be astring';
        // @endif

        // @if RELEASE
        // eslint-disable-next-line no-unreachable
        throw 'invalid replacement value';
        // @endif
    }

    if (this._filters)
    {
        for (var i = this._filters.length - 1; i >= 0; i--)
        {
            if (replace.toString() == this._filters[i].replace.toString())
            {
                // @if DEBUG
                throw "Filter " + replace +
                    " already exists in this._filters array.";
                // @endif

                // @if RELEASE
                // eslint-disable-next-line no-unreachable
                throw "Filter already exists.";
                // @endif
            }
        }
        this._filters.push(
        {
            replace: replace,
            replacement: replacement
        });
    }
};

/**
 * Test a string against all registered filters
 * @method filter
 * @param {String} str The string to check
 * @static
 */
StringFilters.prototype.filter = function(str)
{
    if (!this._filters)
    {
        return str;
    }
    for (var i = this._filters.length - 1; i >= 0; i--)
    {
        var replace = this._filters[i].replace;
        var replacement = this._filters[i].replacement;
        str = str.replace(replace, replacement);
    }
    return str;
};

/**
 * @method destroy
 * @static
 */
StringFilters.prototype.destroy = function()
{
    this._filters = null;
};

export default StringFilters;
