/**
 * @module Storage
 */
(function(undefined)
{
	/**
	 * @constructor 
	 */
	var Storage = {};

	/**
	 * Retrieval of data from localStorage that handles from-String conversions.
	 * @method read 
	 * @param {String} name Value to retrieve from localStorage
	 */
	Storage.read = function(name)
	{
		var value = localStorage[name];
		//console.log('Storage.read', name, value);
		if (value)
		{
			try
			{
				return JSON.parse(value);
			}
			catch(e)
			{
				return null;
			}
		}
		return null;
	};

	/**
	 * Save the value
	 * @param  {String} name The property name
	 * @param  {*} value  The value to set
	 */
	Storage.write = function(name, value)
	{
		localStorage[name] = JSON.stringify(value);
	};

	//namespace
	namespace('springroll').Storage = Storage;

}());
/**
 *
 * @module Navigation
 */
(function()
{
	// Include classes
	var Storage = include('springroll.Storage');

	/**
	 * @param SCROLLING
	 * @constant 
	 */
	var SCROLLING = {
		ENABLED: true,
		TIME:
		{
			MIN: 300,
			MAX: 800
		}
	};

	/**
	 * @param HIGHGLIGHT_OPACITY
	 * @constant 
	 */
	var HIGHGLIGHT_OPACITY = 0.18;

	/**
	 * @constructor 
	 */
	var Navigation = {};

	/**
	 * @method init 
	 */
	Navigation.init = function()
	{
		// Check to see if user had last viewed the class in non-index tab view
		// and return to that view if so
		var activePanelForClass = Storage.read(_currClass());
		if (activePanelForClass)
		{
			_setActiveTab('#docs-', activePanelForClass);
		}
		else
		{
			_setActiveTab('#docs-', 'index');
		}

		// Store click events visibility
		$('.docs-toggle').click(
		{
			storageVar: 'activeDocs'
		}, _onDocsToggle);

		// Switch tabs on index item click
		$('.index-item').click(_onIndexItemClick);

		setTimeout(Navigation.gotoLine, 0);
	};

	/**
	 * @method gotoLine
	 */
	Navigation.gotoLine = function()
	{
		var href = $(location).attr('href');
		if (href.indexOf('src') > -1)
		{
			var lineNumber = href.slice(href.lastIndexOf('#') + 2);
			var li = $('.file .code .linenums').children().eq(lineNumber);
			li.addClass('active');
			var scrollTop = $(li).offset().top - $('header').height();
			$('body').scrollTop(scrollTop);
		}
	};

	/**
	 * @method _onIndexItemClick
	 * @private 
	 * @param {jQuery Event} e
	 */
	var _onIndexItemClick = function(e)
	{
		// Deactive the current index panel
		_setActiveTab('#docs-', 'index', false);

		hash = $(this).children('a')[0].hash;
		var underscore = hash.indexOf('_');
		var tab = hash.slice(1, underscore);

		// YuiDocs gives each list-item li id a singular id name (method, property, event)
		// when we actually need a plural to match the naming of tab panel ids (methods, properties)
		if (tab === 'property')
		{
			tab = 'properties';
		}
		else
		{
			tab += 's';
		}
		var item = hash.slice(underscore + 1);

		// Set which tab
		_setActiveTab('#docs-', tab);

		// Note: we don't have to manage the deep link to the item because
		// the href to an id takes care of itself, but here's a scrolling
		// version if you're feeling slick 
		var scrollTop = $(hash).offset().top - ($('header').height() + 20);
		var scrollLength = Math.abs($(window).scrollTop() - scrollTop);
		scrollLength = Math.min(Math.max(parseInt(scrollLength), SCROLLING.TIME.MIN), SCROLLING.TIME.MAX);
		if (SCROLLING.ENABLED)
		{
			e.preventDefault();
			$('html, body').delay(50).animate(
			{
				scrollTop: scrollTop
			}, scrollLength);
		}
		var highlightTop = $(hash).offset().top - ($('#classdocs').offset().top) - 10;
		_moveHighlight(highlightTop, scrollLength);
	};

	/**
	 * @method _moveHighlight
	 * @param {Number} top
	 * @param {int} time Animation length in milliseconds
	 */
	var _moveHighlight = function(top, time)
	{
		var opacity = top === 0 ? 0 : HIGHGLIGHT_OPACITY;
		time = top === 0 ? 0 : time;
		$('#docs-highlight').animate(
		{
			top: top,
			opacity: opacity
		}, time);
	};

	/**
	 * Respond to tab pane nav clicks. Store the most recently 
	 * clicked/viewed tab. 
	 * @method toggle
	 * @private
	 * @param {jQuery} event
	 */
	var _onDocsToggle = function(event)
	{
		_moveHighlight(0, 0);
		// Visibility is handle through css, so unlike the 
		// scope-toggle, we only need to capture the event and 
		// store the data for page refresh
		var id = this.id || this[0].id;
		// Remove 'toggle-'
		var view = id.slice(id.lastIndexOf('-') + 1);
		Storage.write(_currClass(), view);
	};


	/**
	 * Parse the window url for current class name
	 * @method _currClass
	 * @private
	 */
	var _currClass = function()
	{
		var path = window.location.pathname;
		return path.substring(
			path.indexOf('/classes/') + '/classes/'.length,
			path.indexOf('.html'));
	};

	/**
	 * Init tab-pane and nav-li elements on page to have a .active 
	 * based on localStorage, or to default view if localStorage is null.
	 * @method _setActiveTab
	 * @private
	 * @param {String} view Which sidebar view to init
	 */
	var _setActiveTab = function(paneId, view, activate)
	{
		console.log('_setActiveTab pane:', paneId, '\nview:', view, '\nactivate:', activate);
		if (activate === false)
		{
			$('#tab-' + view).removeClass('active');
			$(paneId + view).removeClass('active');
		}
		else
		{
			$('#tab-' + view).addClass('active');
			$(paneId + view).addClass('active');
		}
	};

	// Namespace
	namespace('springroll').Navigation = Navigation;

}());
/**
 * Handles the visibility of scope items in the docs. Such as
 * 'private', 'inherited', etc.
 * @module ScopeToggle
 */
(function()
{
	//imports
	var Storage = include('springroll.Storage');

	//local static
	var _tabContent = null;

	/**
	 * @class ScopeToggles
	 * @constructor 
	 */
	var ScopeToggles = {};

	/**
	 * @method init
	 */
	ScopeToggles.init = function()
	{
		_tabContent = $('#classdocs .tab-content');

		// set the default
		if (Storage.read('show_inherited') === null)
			Storage.write('show_inherited', true);

		if (Storage.read('show_inherited'))
			_defaultOn.call($('#toggle-inherited'));

		if (Storage.read('show_protected'))
			_defaultOn.call($('#toggle-protected'));

		if (Storage.read('show_private'))
			_defaultOn.call($('#toggle-private'));
		
		if (Storage.read('show_deprecated'))
			_defaultOn.call($('#toggle-deprecated'));

		//toggle visibility
		$('.scope-toggle').change(_onScopeToggle);
	};

	/**
	 * @method _onScopeToggle
	 * @private
	 */
	var _onScopeToggle = function()
	{
		var id = this.id || this[0].id;

		//remove 'toggle-'
		var which = id.slice(id.lastIndexOf('-') + 1);
		var value = Storage.read('show_' + which);

		//store a boolean in localStorage
		Storage.write('show_' + which, !value);

		//toggle show-[scope] on the content tab-pane,
		//css will handle the actual visibilty from there.
		_tabContent.toggleClass('show-' + which);
	};

	/**
	 * Set the checkbox to 'on' and visibilty of tab-pane
	 * @method _defaultOn
	 * @private 
	 */
	var _defaultOn = function()
	{
		this.prop('checked', true);
		var id = this.id || this[0].id;
		var which = id.slice(id.lastIndexOf('-') + 1); //remove 'toggle-'
		this.bootstrapToggle('on');
		Storage.write('show_' + which, true);
		_tabContent.addClass('show-' + which);
	};

	//namespace
	namespace('springroll').ScopeToggles = ScopeToggles;

}());
/**
 * The search bar/class filter in the side bar
 * @module Search
 */
(function()
{
	var _currSearch = null;
	var _searchbar = null;
	var _clearButton = null;

	/**
	 * @constructor 
	 */
	var SearchBar = function()
	{
		_searchbar = $("#api-filter");
		_clearButton = $('#sidebar .btn-close');
		_clearButton.addClass('hidden');
		_searchbar.keyup(function(e)
		{
			_currSearch = this.value;
			SearchBar.apply(_currSearch);
		});
		_clearButton.click(function(e)
		{
			console.log('_clearButton click');
			_searchbar[0].value = _currSearch = null;
			SearchBar.apply();
		});
	};

	SearchBar.apply = function()
	{
		var items = $('#sidebar .collapse.active ul').children();
		if (!_currSearch)
		{
			items.removeClass('hidden');
			_clearButton.addClass('hidden');
		}
		else
		{
			_clearButton.removeClass('hidden');
			var regex = new RegExp(_currSearch, 'i');
			items.each(function()
			{
				var item = $(this);
				item.removeClass('hidden');
				var label = item.text().replace(/ /g, "");
				if (!regex.test(label))
				{
					item.addClass('hidden');
				}
			});
		}
	};

	namespace('springroll').SearchBar = SearchBar;

}());
/**
 * Handles collapsing and switching of panes in the sidebar
 * @module Sidebar
 */
(function()
{
	var Storage = include('springroll.Storage');
	var _toggleIds = ['toggle-classes', 'toggle-modules'];

	/**
	 * @constructor 
	 */
	var Sidebar = {};

	/**
	 * @method init 
	 */
	Sidebar.init = function()
	{
		if ($(window).width() > 764)
		{
			var activeSidebar = '#' + (Storage.read('activeSidebar') || _toggleIds[0]);
			var button = $(activeSidebar);
			button.addClass('active');
			var target = button.data('target');
			$(target).show().addClass('active');
		}

		//store click events visibility
		$('.sidebar-toggle').click(_onApiToggle);
	};

	/**
	 * Respond to sidebar tab clicks. Store the most recently 
	 * clicked/viewed tab. 
	 * @method _onApiToggle
	 * @private 
	 * @param {jQuery} event
	 */
	var _onApiToggle = function(event)
	{
		var target = $(this).data('target');
		// Visibility is handle through css, so unlike the 
		// scope-toggle, we only need to capture the event and 
		// store the data for page refresh
		Storage.write('activeSidebar', this.id);

		// If another dropdown is already open,
		// swap them like they are tab-panes
		for (var i = 0; i < _toggleIds.length; i++)
		{
			if (_toggleIds[i] == this.id)
				continue;
		
			var otherToggle = $('#' + _toggleIds[i]);
			if (otherToggle.hasClass('active'))
			{
				// Remove old actives
				otherToggle.removeClass('active');
				$(otherToggle.data('target')).hide().removeClass('active');
				// Add new actives
				$(target).show().addClass('active');
				$(this).addClass('active');
				
				// Tell the search bar the sidebar list has changed and filter
				// incase the search field stil has contents
				springroll.SearchBar.apply(); 
				return;
			}
		}

		// If no other was active... 
		if ($(this).hasClass('active'))
		{
			// Don't collapse the nav in bigger sizes
			if ($(window).width() < 764)
			{
				$(this).removeClass('active');
				$(target).slideUp().removeClass('active');
			}
		}
		else
		{
			$(target).slideDown().addClass('active');
			$(this).addClass('active');
		}
	};

	namespace('springroll').Sidebar = Sidebar;
	
}());
/**
 * @module StickyHeader
 */
(function()
{
	/**
	 * @constructor 
	 */
	var StickyHeader = function()
	{
		var header = $('header');
		
		$(window).scroll(function()
		{
			if ($(this).scrollTop() > 1)
			{
				// animations are handled by css
				header.addClass("sticky");
			}
			else
			{
				header.removeClass("sticky");
			}
		});
	};

	namespace('springroll').StickyHeader = StickyHeader;

}());
$(function()
{
	include('springroll.Navigation').init();
	include('springroll.Sidebar').init();
	include('springroll.ScopeToggles').init();
	include('springroll.SearchBar')();
	include('springroll.StickyHeader')();
});
//# sourceMappingURL=main.js.map