/**
 * @module PIXI UI
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display
 */
(function()
{

	var Application,
		Tween,
		Point,
		DragData = include("springroll.pixi.DragData");

	/**
	 * Drag manager is responsible for handling the dragging of stage elements
	 * supports click-n-stick and click-n-drag functionality.
	 *
	 * @class DragManager
	 * @constructor
	 *  @param {PixiDisplay} display The display that this DragManager is handling objects on.
	 *                               Optionally, this parameter can be omitted and the Application's
	 *                               default display will be used.
	 *  @param {Function} startCallback The callback when when starting
	 *  @param {Function} endCallback The callback when ending
	 */
	var DragManager = function(display, startCallback, endCallback)
	{
		if (!Application)
		{
			Application = include('springroll.Application');
			Tween = include('createjs.Tween', false);
			Point = include('PIXI.Point');
		}

		if (typeof display == "function" && !endCallback)
		{
			endCallback = startCallback;
			startCallback = display;
			display = Application.instance.display;
		}

		/**
		 * The object that's being dragged, or a dictionary of DragData being dragged
		 * by id if multitouch is true.
		 * @public
		 * @readOnly
		 * @property {PIXI.DisplayObject|Dictionary} draggedObj
		 */
		this.draggedObj = null;

		/**
		 * The radius in pixel to allow for dragging, or else does sticky click
		 * @public
		 * @property dragStartThreshold
		 * @default 20
		 */
		this.dragStartThreshold = 20;

		/**
		 * The position x, y of the mouse down on the stage. This is only used
		 * when multitouch is false - the DragData has it when multitouch is true.
		 * @private
		 * @property {PIXI.Point} mouseDownStagePos
		 */
		this.mouseDownStagePos = new Point(0, 0);

		/**
		 * The position x, y of the object when interaction with it started. If multitouch is
		 * true, then this will only be set during a drag stop callback, for the object that just
		 * stopped getting dragged.
		 * @property {PIXI.Point} mouseDownObjPos
		 */
		this.mouseDownObjPos = new Point(0, 0);

		/**
		 * If sticky click dragging is allowed.
		 * @public
		 * @property {Bool} allowStickyClick
		 * @default true
		 */
		this.allowStickyClick = true;

		/**
		 * Is the move touch based
		 * @public
		 * @readOnly
		 * @property {Bool} isTouchMove
		 * @default false
		 */
		this.isTouchMove = false;

		/**
		 * Is the drag being held on mouse down (not sticky clicking)
		 * @public
		 * @readOnly
		 * @property {Bool} isHeldDrag
		 * @default false
		 */
		this.isHeldDrag = false;

		/**
		 * Is the drag a sticky clicking (click on a item, then mouse the mouse)
		 * @public
		 * @readOnly
		 * @property {Bool} isStickyClick
		 * @default false
		 */
		this.isStickyClick = false;

		/**
		 * Settings for snapping.
		 *
		 * Format for snapping to a list of points:
		 *	{
		 *		mode:"points",
		 *		dist:20,//snap when within 20 pixels/units
		 *		points:[
		 *			{ x: 20, y:30 },
		 *			{ x: 50, y:10 }
		 *		]
		 *	}
		 *
		 * @public
		 * @property {Object} snapSettings
		 * @default null
		 */
		this.snapSettings = null;

		/**
		 * Reference to the Pixi InteractionManager.
		 * @private
		 * @property {PIXI.interaction.InteractionManager} _interaction
		 */
		this._interaction = display.renderer.plugins.interaction;

		/**
		 * The offset from the dragged object's position that the initial mouse event
		 * was at. This is only used when multitouch is false - the DragData has
		 * it when multitouch is true.
		 * @private
		 * @property {PIXI.Point} _dragOffset
		 */
		this._dragOffset = null;

		/**
		 * External callback when we start dragging
		 * @private
		 * @property {Function} _dragStartCallback
		 */
		this._dragStartCallback = startCallback;

		/**
		 * External callback when we are done dragging
		 * @private
		 * @property {Function} _dragEndCallback
		 */
		this._dragEndCallback = endCallback;

		this._triggerHeldDrag = this._triggerHeldDrag.bind(this);
		this._triggerStickyClick = this._triggerStickyClick.bind(this);
		this._stopDrag = this._stopDrag.bind(this);
		this._updateObjPosition = this._updateObjPosition.bind(this);

		/**
		 * The collection of draggable objects
		 * @private
		 * @property {Array} _draggableObjects
		 */
		this._draggableObjects = [];

		/**
		 * If this DragManager is using multitouch for dragging.
		 * @private
		 * @property {Boolean} _multitouch
		 */
		this._multitouch = false;

		/**
		 * If this DragManager has added drag listeners to the InteractionManager
		 * @private
		 * @property {Boolean} _addedDragListeners
		 */
		this._addedDragListeners = false;

		this.helperPoint = new Point(0, 0);
	};

	// Reference to the drag manager
	var p = extend(DragManager);

	/**
	 * If the DragManager allows multitouch dragging. Setting this stops any current
	 * drags.
	 * @property {Boolean} multitouch
	 */
	Object.defineProperty(p, "multitouch",
	{
		get: function()
		{
			return this._multitouch;
		},
		set: function(value)
		{
			if (this.draggedObj)
			{
				if (this._multitouch)
				{
					for (var id in this.draggedObj)
					{
						this._stopDrag(id, true);
					}
				}
				else
					this._stopDrag(null, true);
			}
			this._multitouch = !!value;
			this.draggedObj = value ?
			{} : null;
		}
	});

	/**
	 * Manually starts dragging an object. If a mouse down event is not supplied
	 * as the second argument, it defaults to a held drag, that ends as soon as
	 * the mouse is released. When using multitouch, passing a interaction data is
	 * required.
	 * @method startDrag
	 * @public
	 * @param {PIXI.DisplayObject} object The object that should be dragged.
	 * @param {PIXI.InteractionData} interactionData The interaction data about
	 *                                            the input event that triggered this.
	 */
	p.startDrag = function(object, interactionData)
	{
		this._objMouseDown(object, interactionData);
	};

	/**
	 * Mouse down on an object
	 * @method _objMouseDown
	 * @private
	 * @param {PIXI.DisplayObject} object The object that should be dragged.
	 * @param {PIXI.InteractionData} interactionData The interaction data about
	 *                                            the input event that triggered this.
	 */
	p._objMouseDown = function(obj, interactionData)
	{
		//get the InteractionData we want from the Pixi v3 events
		if (interactionData.data && interactionData.data.global)
			interactionData = interactionData.data;
		// if we are dragging something, then ignore any mouse downs
		// until we release the currently dragged stuff
		if ((!this._multitouch && this.draggedObj) ||
			(this._multitouch && !interactionData)) return;

		var dragData, mouseDownObjPos, mouseDownStagePos, dragOffset;
		if (this._multitouch)
		{
			dragData = new DragData(obj);
			this.draggedObj[interactionData.identifier] = dragData;
			mouseDownObjPos = dragData.mouseDownObjPos;
			mouseDownStagePos = dragData.mouseDownStagePos;
			dragOffset = dragData.dragOffset;
		}
		else
		{
			this.draggedObj = obj;
			mouseDownObjPos = this.mouseDownObjPos;
			mouseDownStagePos = this.mouseDownStagePos;
			dragOffset = this._dragOffset = new Point();
		}
		//Stop any tweens on the object (mostly the position)
		if (Tween)
		{
			Tween.removeTweens(obj);
			Tween.removeTweens(obj.position);
		}

		if (obj._dragOffset)
		{
			dragOffset.x = obj._dragOffset.x;
			dragOffset.y = obj._dragOffset.y;
		}
		else
		{
			//get the mouse position and convert it to object parent space
			interactionData.getLocalPosition(obj.parent, dragOffset);

			//move the offset to respect the object's current position
			dragOffset.x -= obj.position.x;
			dragOffset.y -= obj.position.y;
		}

		mouseDownObjPos.x = obj.position.x;
		mouseDownObjPos.y = obj.position.y;

		//if we don't get an event (manual call neglected to pass one) then default to a held drag
		if (!interactionData)
		{
			this.isHeldDrag = true;
			this._startDrag();
		}
		else
		{
			mouseDownStagePos.x = interactionData.global.x;
			mouseDownStagePos.y = interactionData.global.y;
			//if it is a touch event, force it to be the held drag type
			if (!this.allowStickyClick || interactionData.originalEvent.type == "touchstart")
			{
				this.isTouchMove = interactionData.originalEvent.type == "touchstart";
				this.isHeldDrag = true;
				this._startDrag(interactionData);
			}
			//otherwise, wait for a movement or a mouse up in order to do a
			//held drag or a sticky click drag
			else
			{
				this._interaction.on("stagemove", this._triggerHeldDrag);
				this._interaction.on("stageup", this._triggerStickyClick);
			}
		}
	};

	/**
	 * Start the sticky click
	 * @method _triggerStickyClick
	 * @param {PIXI.InteractionData} interactionData The interaction data about
	 *                                            the input event that triggered this.
	 * @private
	 */
	p._triggerStickyClick = function(interactionData)
	{
		//get the InteractionData we want from the Pixi v3 events
		interactionData = interactionData.data;
		this.isStickyClick = true;
		var draggedObj = this._multitouch ?
			this.draggedObj[interactionData.identifier].obj :
			this.draggedObj;
		this._interaction.off("stagemove", this._triggerHeldDrag);
		this._interaction.off("stageup", this._triggerStickyClick);
		this._startDrag(interactionData);
	};

	/**
	 * Start hold dragging
	 * @method _triggerHeldDrag
	 * @private
	 * @param {PIXI.InteractionData} interactionData The ineraction data about the moved mouse
	 */
	p._triggerHeldDrag = function(interactionData)
	{
		//get the InteractionData we want from the Pixi v3 events
		interactionData = interactionData.data;
		var mouseDownStagePos, draggedObj;
		if (this._multitouch)
		{
			draggedObj = this.draggedObj[interactionData.identifier].obj;
			mouseDownStagePos = this.draggedObj[interactionData.identifier].mouseDownStagePos;
		}
		else
		{
			draggedObj = this.draggedObj;
			mouseDownStagePos = this.mouseDownStagePos;
		}
		var xDiff = interactionData.global.x - mouseDownStagePos.x;
		var yDiff = interactionData.global.y - mouseDownStagePos.y;
		if (xDiff * xDiff + yDiff * yDiff >= this.dragStartThreshold * this.dragStartThreshold)
		{
			this.isHeldDrag = true;
			this._interaction.off("stagemove", this._triggerHeldDrag);
			this._interaction.off("stageup", this._triggerStickyClick);
			this._startDrag(interactionData);
		}
	};

	/**
	 * Internal start dragging on the stage
	 * @method _startDrag
	 * @param {PIXI.InteractionData} interactionData The ineraction data about the moved mouse
	 * @private
	 */
	p._startDrag = function(interactionData)
	{
		var draggedObj;
		if (this._multitouch)
			draggedObj = this.draggedObj[interactionData.identifier].obj;
		else
			draggedObj = this.draggedObj;

		this._updateObjPosition(
		{
			data: interactionData
		});

		if (!this._addedDragListeners)
		{
			this._addedDragListeners = true;
			this._interaction.on("stagemove", this._updateObjPosition);
			this._interaction.on("stageup", this._stopDrag);
		}

		this._dragStartCallback(draggedObj);
	};

	/**
	 * Stops dragging the currently dragged object.
	 * @public
	 * @method stopDrag
	 * @param {Bool} [doCallback=false] If the drag end callback should be called.
	 * @param {PIXI.DisplayObject} [obj] A specific object to stop dragging, if multitouch
	 *                                   is true. If this is omitted, it stops all drags.
	 */
	p.stopDrag = function(doCallback, obj)
	{
		var id = null;
		if (this._multitouch && obj)
		{
			for (var key in this.draggedObj)
			{
				if (this.draggedObj[key].obj == obj)
				{
					id = key;
					break;
				}
			}
		}
		//pass true if it was explicitly passed to us, false and undefined -> false
		this._stopDrag(id, doCallback === true);
	};

	/**
	 * Internal stop dragging on the stage
	 * @method _stopDrag
	 * @private
	 * @param {PIXI.InteractionData} interactionData The ineraction data about the moved mouse
	 * @param {Bool} doCallback If we should do the callback
	 */
	p._stopDrag = function(interactionData, doCallback)
	{
		var obj, id = null;
		//if touch id was passed directly
		if (typeof interactionData == "number")
			id = interactionData;
		else if (interactionData)
		{
			//get the InteractionData we want from the Pixi v3 events
			if (interactionData.data && interactionData.data.global)
				id = interactionData.data.identifier;
			else if (interactionData instanceof PIXI.interaction.InteractionData)
				id = interactionData.identifier;
		}
		if (this._multitouch)
		{
			if (id !== null)
			{
				//stop a specific drag
				var data = this.draggedObj[id];
				if (!data) return;
				obj = data.obj;
				//save the position that it started at so the callback can make use of it
				//if they want
				this.mouseDownObjPos.x = data.mouseDownObjPos.x;
				this.mouseDownObjPos.y = data.mouseDownObjPos.y;
				delete this.draggedObj[id];
			}
			else
			{
				//stop all drags
				for (id in this.draggedObj)
				{
					this._stopDrag(id, doCallback);
				}
				return;
			}
		}
		else
		{
			obj = this.draggedObj;
			this.draggedObj = null;
		}

		if (!obj) return;

		var removeGlobalListeners = !this._multitouch;
		if (this._multitouch)
		{
			//determine if this was the last drag
			var found = false;
			for (id in this.draggedObj)
			{
				found = true;
				break;
			}
			removeGlobalListeners = !found;
		}
		if (removeGlobalListeners && this._addedDragListeners)
		{
			this._addedDragListeners = false;
			this._interaction.off("stagemove", this._updateObjPosition);
			this._interaction.off("stageup", this._stopDrag);
		}

		this.isTouchMove = false;
		this.isStickyClick = false;
		this.isHeldMove = false;

		if (doCallback !== false) // true or undefined
			this._dragEndCallback(obj);
	};

	/**
	 * Update the object position based on the mouse
	 * @method _updateObjPosition
	 * @private
	 * @param {PIXI.InteractionData} interactionData Mouse move event
	 */
	p._updateObjPosition = function(interactionData)
	{
		//get the InteractionData we want from the Pixi v3 events
		interactionData = interactionData.data;

		//if(!this.isTouchMove && !this._theStage.interactionManager.mouseInStage) return;

		var draggedObj, dragOffset;
		if (this._multitouch)
		{
			var data = this.draggedObj[interactionData.identifier];
			draggedObj = data.obj;
			dragOffset = data.dragOffset;
		}
		else
		{
			draggedObj = this.draggedObj;
			dragOffset = this._dragOffset;
		}

		if (!draggedObj || !draggedObj.parent) //not quite sure what chain of events would lead to this, but we'll stop dragging to be safe
		{
			this.stopDrag(false, draggedObj);
			return;
		}

		var mousePos = interactionData.getLocalPosition(draggedObj.parent, this.helperPoint);
		var bounds = draggedObj._dragBounds;
		if (bounds)
		{
			draggedObj.position.x = Math.clamp(mousePos.x - dragOffset.x, bounds.x, bounds.right);
			draggedObj.position.y = Math.clamp(mousePos.y - dragOffset.y, bounds.y, bounds.bottom);
		}
		else
		{
			draggedObj.position.x = mousePos.x - dragOffset.x;
			draggedObj.position.y = mousePos.y - dragOffset.y;
		}
		if (this.snapSettings)
		{
			switch (this.snapSettings.mode)
			{
				case "points":
					this._handlePointSnap(mousePos, dragOffset, draggedObj);
					break;
				case "grid":
					//not yet implemented
					break;
				case "line":
					//not yet implemented
					break;
			}
		}
	};

	/**
	 * Handles snapping the dragged object to the nearest among a list of points
	 * @method _handlePointSnap
	 * @private
	 * @param {PIXI.Point} localMousePos The mouse position in the same space as the dragged object.
	 * @param {PIXI.Point} dragOffset The drag offset for the dragged object.
	 * @param {PIXI.DisplayObject} obj The object to snap.
	 */
	p._handlePointSnap = function(localMousePos, dragOffset, obj)
	{
		var snapSettings = this.snapSettings;
		var minDistSq = snapSettings.dist * snapSettings.dist;
		var points = snapSettings.points;
		var objX = localMousePos.x - dragOffset.x;
		var objY = localMousePos.y - dragOffset.y;
		var leastDist = -1;
		var closestPoint = null;
		for (var i = points.length - 1; i >= 0; --i)
		{
			var p = points[i];
			var distSq = Math.distSq(objX, objY, p.x, p.y);
			if (distSq <= minDistSq && (distSq < leastDist || leastDist == -1))
			{
				leastDist = distSq;
				closestPoint = p;
			}
		}
		if (closestPoint)
		{
			draggedObj.position.x = closestPoint.x;
			draggedObj.position.y = closestPoint.y;
		}
	};

	//=== Giving functions and properties to draggable objects objects
	var enableDrag = function()
	{
		this.on("touchstart", this._onMouseDownListener);
		this.on("mousedown", this._onMouseDownListener);
		this.buttonMode = this.interactive = true;
	};

	var disableDrag = function()
	{
		this.off("touchstart", this._onMouseDownListener);
		this.off("mousedown", this._onMouseDownListener);
		this.buttonMode = this.interactive = false;
	};

	var _onMouseDown = function(mouseData)
	{
		this._dragMan._objMouseDown(this, mouseData);
	};

	/**
	 * Adds properties and functions to the object - use enableDrag() and disableDrag() on
	 * objects to enable/disable them (they start out disabled). Properties added to objects:
	 * _dragBounds (Rectangle), _dragOffset (Point), _onMouseDownListener (Function),
	 * _dragMan (springroll.DragManager) reference to the DragManager
	 * these will override any existing properties of the same name
	 * @method addObject
	 * @public
	 * @param {PIXI.DisplayObject} obj The display object
	 * @param {PIXI.Rectangle} [bounds] The rectangle bounds. 'right' and 'bottom' properties
	 *                                  will be added to this object.
	 * @param {PIXI.Point} [dragOffset] A specific drag offset to use each time, instead of
	 *                                  the mousedown/touchstart position relative to the
	 *                                  object. This is useful if you want something to always
	 *                                  be dragged from a specific position, like the base of
	 *                                  a torch.
	 */
	p.addObject = function(obj, bounds, dragOffset)
	{
		if (bounds)
		{
			bounds.right = bounds.x + bounds.width;
			bounds.bottom = bounds.y + bounds.height;
		}
		obj._dragBounds = bounds;
		obj._dragOffset = dragOffset || null;
		if (this._draggableObjects.indexOf(obj) >= 0)
		{
			//don't change any of the functions or anything, just quit the function after having updated the bounds
			return;
		}
		obj.enableDrag = enableDrag;
		obj.disableDrag = disableDrag;
		obj._onMouseDownListener = _onMouseDown.bind(obj);
		obj._dragMan = this;
		this._draggableObjects.push(obj);
	};

	/**
	 * Removes properties and functions added by addObject().
	 * @public
	 * @method removeObject
	 * @param {PIXI.DisplayObject} obj The display object
	 */
	p.removeObject = function(obj)
	{
		var index = this._draggableObjects.indexOf(obj);
		if (index >= 0)
		{
			obj.disableDrag();
			delete obj.enableDrag;
			delete obj.disableDrag;
			delete obj._onMouseDownListener;
			delete obj._dragMan;
			delete obj._dragBounds;
			delete obj._dragOffset;
			this._draggableObjects.splice(index, 1);
		}
	};

	/**
	 * Destroy the manager
	 * @public
	 * @method destroy
	 */
	p.destroy = function()
	{
		//clean up dragged obj
		this.stopDrag(false);

		this._updateObjPosition = null;
		this._dragStartCallback = null;
		this._dragEndCallback = null;
		this._triggerHeldDrag = null;
		this._triggerStickyClick = null;
		this._stopDrag = null;
		this._interaction = null;
		for (var i = this._draggableObjects.length - 1; i >= 0; --i)
		{
			var obj = this._draggableObjects[i];
			obj.disableDrag();
			delete obj.enableDrag;
			delete obj.disableDrag;
			delete obj._onMouseDownListener;
			delete obj._dragMan;
			delete obj._dragBounds;
			delete obj._dragOffset;
		}
		this._draggableObjects = null;
	};

	// Assign to the global namespace
	namespace('springroll').DragManager = DragManager;
	namespace('springroll.pixi').DragManager = DragManager;
}());