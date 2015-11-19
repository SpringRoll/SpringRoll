/**
 * @module EaselJS UI
 * @namespace springroll.easeljs
 * @requires Core, EaselJS Display
 */
(function()
{
	var Tween,
		Stage,
		DragData = include("springroll.easeljs.DragData"),
		Application = include("springroll.Application");

	/**
	 * Drag manager is responsible for handling the dragging of stage elements.
	 * Supports click-n-stick (click to start, move mouse, click to release) and click-n-drag (standard dragging) functionality.
	 *
	 * @class DragManager
	 * @constructor
	 * @param {PixiDisplay} display The display that this DragManager is handling objects on.
	 *                               Optionally, this parameter an be omitted and the
	 *                               Application's default display will be used.
	 * @param {function} startCallback The callback when when starting
	 * @param {function} endCallback The callback when ending
	 */
	var DragManager = function(display, startCallback, endCallback)
	{
		if (!Stage)
		{
			Tween = include('createjs.Tween', false);
			Stage = include("createjs.Stage");
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
		 * @property {createjs.DisplayObject|Dictionary} draggedObj
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
		 * @property {object} mouseDownStagePos
		 */
		this.mouseDownStagePos = {
			x: 0,
			y: 0
		};

		/**
		 * The position x, y of the object when interaction with it started. If multitouch is
		 * true, then this will only be set during a drag stop callback, for the object that just
		 * stopped getting dragged.
		 * @property {object} mouseDownObjPos
		 */
		this.mouseDownObjPos = {
			x: 0,
			y: 0
		};

		/**
		 * If sticky click dragging is allowed.
		 * @public
		 * @property {Boolean} allowStickyClick
		 * @default true
		 */
		this.allowStickyClick = true;

		/**
		 * Is the move touch based
		 * @public
		 * @readOnly
		 * @property {Boolean} isTouchMove
		 * @default false
		 */
		this.isTouchMove = false;

		/**
		 * Is the drag being held on mouse down (not sticky clicking)
		 * @public
		 * @readOnly
		 * @property {Boolean} isHeldDrag
		 * @default false
		 */
		this.isHeldDrag = false;

		/**
		 * Is the drag a sticky clicking (click on a item, then mouse the mouse)
		 * @public
		 * @readOnly
		 * @property {Boolean} isStickyClick
		 * @default false
		 */
		this.isStickyClick = false;

		/**
		 * Settings for snapping.
		 *
		 * Format for snapping to a list of points:
		 * {
		 * 	mode:"points",
		 * 	dist:20,//snap when within 20 pixels/units
		 * 	points:[
		 * 		{ x: 20, y:30 },
		 * 		{ x: 50, y:10 }
		 * 	]
		 * }
		 *
		 * @public
		 * @property {Object} snapSettings
		 * @default null
		 */
		this.snapSettings = null;

		/**
		 * Reference to the stage
		 * @private
		 * @property {createjs.Stage} _theStage
		 */
		//passing stage is deprecated - we should be using the display
		if (stage instanceof Stage)
			this._theStage = display;
		else
			this._theStage = display.stage;
		/**
		 * The offset from the dragged object's position that the initial mouse event
		 * was at. This is only used when multitouch is false - the DragData has
		 * it when multitouch is true.
		 * @private
		 * @property {createjs.Point} _dragOffset
		 */
		this._dragOffset = null;

		/**
		 * The pointer id that triggered the drag. This is only used when multitouch is false
		 * - the DragData is indexed by pointer id when multitouch is true.
		 * @private
		 * @property {Number} _dragPointerID
		 */
		this._dragPointerID = 0;

		/**
		 * Callback when we start dragging
		 * @private
		 * @property {Function} _dragStartCallback
		 */
		this._dragStartCallback = startCallback;

		/**
		 * Callback when we are done dragging
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
		 * A point for reuse instead of lots of object creation.
		 * @private
		 * @property {createjs.Point} _helperPoint
		 */
		this._helperPoint = null;

		/**
		 * If this DragManager is using multitouch for dragging.
		 * @private
		 * @property {Boolean} _multitouch
		 */
		this._multitouch = false;
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
	 * Manually starts dragging an object. If a mouse down event is not
	 * supplied as the second argument, it defaults to a held drag, that ends as
	 * soon as the mouse is released. When using multitouch, passing a mouse event is
	 * required.
	 * @method startDrag
	 * @public
	 * @param {createjs.DisplayObject} object The object that should be dragged.
	 * @param {createjs.MouseEvent} ev A mouse down event that should be considered to have
	 *                                started the drag, to determine what type of drag should be
	 *                                used.
	 */
	p.startDrag = function(object, ev)
	{
		this._objMouseDown(ev, object);
	};

	/**
	 * Mouse down on an obmect
	 * @method _objMouseDown
	 * @private
	 * @param {createjs.MouseEvent} ev A mouse down event to listen to to determine
	 *                                what type of drag should be used.
	 * @param {createjs.DisplayObject} object The object that should be dragged.
	 */
	p._objMouseDown = function(ev, obj)
	{
		// if we are dragging something, then ignore any mouse downs
		// until we release the currently dragged stuff
		if ((!this._multitouch && this.draggedObj) ||
			(this._multitouch && !ev)) return;

		var dragData, mouseDownObjPos, mouseDownStagePos, dragOffset;
		if (this._multitouch)
		{
			dragData = new DragData(obj);
			this.draggedObj[ev.pointerID] = dragData;
			mouseDownObjPos = dragData.mouseDownObjPos;
			mouseDownStagePos = dragData.mouseDownStagePos;
			dragOffset = dragData.dragOffset;
		}
		else
		{
			this.draggedObj = obj;
			mouseDownObjPos = this.mouseDownObjPos;
			mouseDownStagePos = this.mouseDownStagePos;
			dragOffset = this._dragOffset = new createjs.Point();
		}
		//stop any active tweens on the object, in case it is moving around or something
		if (Tween)
			Tween.removeTweens(obj);

		if (ev)
		{
			if (obj._dragOffset)
			{
				dragOffset.x = obj._dragOffset.x;
				dragOffset.y = obj._dragOffset.y;
			}
			else
			{
				//get the mouse position in global space and convert it to parent space
				dragOffset = obj.parent.globalToLocal(ev.stageX, ev.stageY, dragOffset);
				//move the offset to respect the object's current position
				dragOffset.x -= obj.x;
				dragOffset.y -= obj.y;
			}
		}

		//save the position of the object before dragging began, for easy restoration, if desired
		mouseDownObjPos.x = obj.x;
		mouseDownObjPos.y = obj.y;

		//if we don't get an event (manual call neglected to pass one) then default to a held drag
		if (!ev)
		{
			this.isHeldDrag = true;
			this._dragPointerID = -1; //allow any touch/mouse up to stop drag
			this._startDrag();
		}
		else
		{
			//override the target for the mousedown/touchstart event to be
			//this object, in case we are dragging a cloned object
			this._theStage._getPointerData(ev.pointerID).target = obj;
			this._dragPointerID = ev.pointerID;
			//if it is a touch event, force it to be the held drag type
			if (!this.allowStickyClick || ev.nativeEvent.type == 'touchstart')
			{
				this.isTouchMove = ev.nativeEvent.type == 'touchstart';
				this.isHeldDrag = true;
				this._startDrag(ev);
			}
			//otherwise, wait for a movement or a mouse up in order to do a
			//held drag or a sticky click drag
			else
			{
				mouseDownStagePos.x = ev.stageX;
				mouseDownStagePos.y = ev.stageY;
				obj.addEventListener("pressmove", this._triggerHeldDrag);
				obj.addEventListener("pressup", this._triggerStickyClick);
			}
		}
	};

	/**
	 * Start the sticky click
	 * @method _triggerStickyClick
	 * @param {createjs.MouseEvent} ev The mouse down event
	 * @private
	 */
	p._triggerStickyClick = function(ev)
	{
		this.isStickyClick = true;
		var draggedObj = this._multitouch ? this.draggedObj[ev.pointerID].obj : this.draggedObj;
		draggedObj.removeEventListener("pressmove", this._triggerHeldDrag);
		draggedObj.removeEventListener("pressup", this._triggerStickyClick);
		this._startDrag(ev);
	};

	/**
	 * Start hold dragging
	 * @method _triggerHeldDrag
	 * @private
	 * @param {createjs.MouseEvent} ev The mouse down event
	 */
	p._triggerHeldDrag = function(ev)
	{
		this.isHeldMove = true;
		var mouseDownStagePos, draggedObj;
		if (this._multitouch)
		{
			draggedObj = this.draggedObj[ev.pointerID].obj;
			mouseDownStagePos = this.draggedObj[ev.pointerID].mouseDownStagePos;
		}
		else
		{
			draggedObj = this.draggedObj;
			mouseDownStagePos = this.mouseDownStagePos;
		}
		var xDiff = ev.stageX - mouseDownStagePos.x;
		var yDiff = ev.stageY - mouseDownStagePos.y;
		if (xDiff * xDiff + yDiff * yDiff >= this.dragStartThreshold * this.dragStartThreshold)
		{
			this.isHeldDrag = true;
			draggedObj.removeEventListener("pressmove", this._triggerHeldDrag);
			draggedObj.removeEventListener("pressup", this._triggerStickyClick);
			this._startDrag(ev);
		}
	};

	/**
	 * Internal start dragging on the stage
	 * @method _startDrag
	 * @private
	 */
	p._startDrag = function(ev)
	{
		var stage = this._theStage;
		//duplicate listeners are ignored
		stage.addEventListener("stagemousemove", this._updateObjPosition);
		stage.addEventListener("stagemouseup", this._stopDrag);

		this._updateObjPosition(ev);

		this._dragStartCallback(this._multitouch ?
			this.draggedObj[ev.pointerID].obj :
			this.draggedObj);
	};

	/**
	 * Stops dragging the currently dragged object.
	 * @public
	 * @method stopDrag
	 * @param {Boolean} [doCallback=false] If the drag end callback should be called.
	 * @param {createjs.DisplayObject} [obj] A specific object to stop dragging, if multitouch
	 *                                     is true. If this is omitted, it stops all drags.
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
	 * @param {createjs.MouseEvent} ev Mouse up event
	 * @param {Boolean} doCallback If we should do the callback
	 */
	p._stopDrag = function(ev, doCallback)
	{
		var obj, id;
		if (this._multitouch)
		{
			if (ev)
			{
				//stop a specific drag
				id = ev;
				if (ev instanceof createjs.MouseEvent)
					id = ev.pointerID;

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
			//don't stop the drag if a different finger than the dragging one was released
			if (ev && ev.pointerID != this._dragPointerID && this._dragPointerID > -1) return;

			obj = this.draggedObj;
			this.draggedObj = null;
		}

		if (!obj) return;

		obj.removeEventListener("pressmove", this._triggerHeldDrag);
		obj.removeEventListener("pressup", this._triggerStickyClick);
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
		if (removeGlobalListeners)
		{
			this._theStage.removeEventListener("stagemousemove", this._updateObjPosition);
			this._theStage.removeEventListener("stagemouseup", this._stopDrag);
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
	 * @param {createjs.MouseEvent} ev Mouse move event
	 */
	p._updateObjPosition = function(ev)
	{
		if (!this.isTouchMove && !this._theStage.mouseInBounds) return;

		var draggedObj, dragOffset;
		if (this._multitouch)
		{
			var data = this.draggedObj[ev.pointerID];
			if (!data) return;

			draggedObj = data.obj;
			dragOffset = data.dragOffset;
		}
		else
		{
			if (ev.pointerID != this._dragPointerID && this._dragPointerID > -1) return;

			draggedObj = this.draggedObj;
			dragOffset = this._dragOffset;
		}
		var mousePos = draggedObj.parent.globalToLocal(ev.stageX, ev.stageY, this._helperPoint);
		var bounds = draggedObj._dragBounds;
		if (bounds)
		{
			draggedObj.x = Math.clamp(mousePos.x - dragOffset.x, bounds.x, bounds.right);
			draggedObj.y = Math.clamp(mousePos.y - dragOffset.y, bounds.y, bounds.bottom);
		}
		else
		{
			draggedObj.x = mousePos.x - dragOffset.x;
			draggedObj.y = mousePos.y - dragOffset.y;
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
	 * @param {createjs.Point} localMousePos The mouse position in the same
	 *                                     space as the dragged object.
	 * @param {createjs.Point} dragOffset The drag offset for the dragged object.
	 * @param {createjs.DisplayObject} obj The object to snap.
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

		var p, distSq;
		for (var i = points.length - 1; i >= 0; --i)
		{
			p = points[i];
			distSq = Math.distSq(objX, objY, p.x, p.y);
			if (distSq <= minDistSq && (distSq < leastDist || leastDist == -1))
			{
				leastDist = distSq;
				closestPoint = p;
			}
		}
		if (closestPoint)
		{
			obj.x = closestPoint.x;
			obj.y = closestPoint.y;
		}
	};

	//=== Giving functions and properties to draggable objects objects
	var enableDrag = function(enable)
	{
		// Allow for the enableDrag(false)
		if (enable === false)
		{
			disableDrag.apply(this);
			return;
		}

		this.addEventListener("mousedown", this._onMouseDownListener);
		this.cursor = "pointer";
	};

	var disableDrag = function()
	{
		this.removeEventListener("mousedown", this._onMouseDownListener);
		this.cursor = null;
	};

	var _onMouseDown = function(ev)
	{
		this._dragMan._objMouseDown(ev, this);
	};

	/**
	 * Adds properties and functions to the object - use enableDrag() and disableDrag() on
	 * objects to enable/disable them (they start out disabled). Properties added to objects:
	 * _dragBounds (Rectangle), _dragOffset (Point), _onMouseDownListener (Function),
	 * _dragMan (springroll.DragManager) reference to the DragManager
	 * these will override any existing properties of the same name
	 * @method addObject
	 * @public
	 * @param {createjs.DisplayObject} obj The display object
	 * @param {createjs.Rectangle} [bounds] The rectangle bounds. 'right' and 'bottom' properties
	 *                                    will be added to this object.
	 * @param {createjs.Point} [dragOffset] A specific drag offset to use each time, instead of
	 *                                      the mousedown/touchstart position relative to the
	 *                                      object. This is useful if you want something to always
	 *                                      be dragged from a specific position, like the base of
	 *                                      a torch.
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
	 * @param {createjs.DisplayObject} obj The display object
	 */
	p.removeObject = function(obj)
	{
		if (!obj.disableDrag) return;

		obj.disableDrag();
		delete obj.enableDrag;
		delete obj.disableDrag;
		delete obj._onMouseDownListener;
		delete obj._dragMan;
		delete obj._dragBounds;
		delete obj._dragOffset;
		var index = this._draggableObjects.indexOf(obj);
		if (index >= 0)
			this._draggableObjects.splice(index, 1);
	};

	/**
	 * Destroy the manager
	 * @public
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.stopDrag(false);
		this.draggedObj = null;
		this._updateObjPosition = null;
		this._dragStartCallback = null;
		this._dragEndCallback = null;
		this._triggerHeldDrag = null;
		this._triggerStickyClick = null;
		this._stopDrag = null;
		this._theStage = null;

		var obj;
		for (var i = this._draggableObjects.length - 1; i >= 0; --i)
		{
			obj = this._draggableObjects[i];
			obj.disableDrag();
			delete obj.enableDrag;
			delete obj.disableDrag;
			delete obj._onMouseDownListener;
			delete obj._dragMan;
			delete obj._dragBounds;
			delete obj._dragOffset;
		}
		this._draggableObjects = null;
		this._helperPoint = null;
	};

	// Assign to the global namespace
	namespace('springroll').DragManager = DragManager;
	namespace('springroll.easeljs').DragManager = DragManager;
}());