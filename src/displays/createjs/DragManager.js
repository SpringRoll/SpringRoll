/**
*  @module cloudkid
*/
(function() {
	
	"use strict";
	
	/**
	*  Drag manager is responsible for handling the dragging of stage elements.
	*  Supports click-n-stick (click to start, move mouse, click to release) and click-n-drag (standard dragging) functionality.
	*  
	*  @class DragManager
	*  @constructor
	*  @param {createjs.Stage} stage The stage that this DragManager is monitoring.
	*  @param {function} startCallback The callback when when starting
	*  @param {function} endCallback The callback when ending
	*/
	var DragManager = function(stage, startCallback, endCallback)
	{
		this.initialize(stage, startCallback, endCallback);
	};
	
	/** Reference to the drag manager */
	var p = DragManager.prototype = {};
	
	/**
	* The object that's being dragged
	* @public
	* @readOnly
	* @property {createjs.DisplayObject} draggedObj
	*/
	p.draggedObj = null;
	
	/**
	* The radius in pixel to allow for dragging, or else does sticky click
	* @public
	* @property dragStartThreshold
	* @default 20
	*/
	p.dragStartThreshold = 20;
	
	/**
	* The position x, y of the mouse down on the stage
	* @private
	* @property {object} mouseDownStagePos
	*/
	p.mouseDownStagePos = null;

	/**
	* The position x, y of the object when interaction with it started.
	* @private
	* @property {object} mouseDownObjPos
	*/
	p.mouseDownObjPos = null;

	/**
	* If sticky click dragging is allowed.
	* @public
	* @property {Bool} allowStickyClick
	* @default true
	*/
	p.allowStickyClick = true;
	
	/**
	* Is the move touch based
	* @public
	* @readOnly
	* @property {Bool} isTouchMove
	* @default false
	*/
	p.isTouchMove = false;
	
	/**
	* Is the drag being held on mouse down (not sticky clicking)
	* @public
	* @readOnly
	* @property {Bool} isHeldDrag
	* @default false
	*/
	p.isHeldDrag = false;
	
	/**
	* Is the drag a sticky clicking (click on a item, then mouse the mouse)
	* @public
	* @readOnly
	* @property {Bool} isStickyClick
	* @default false
	*/
	p.isStickyClick = false;

	/**
	* Settings for snapping.
	*
	*  Format for snapping to a list of points:
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
	p.snapSettings = null;
	
	/**
	* Reference to the stage
	* @private
	* @property {createjsStage} _theStage
	*/
	p._theStage = null;
	
	/**
	* The local to global position of the drag
	* @private
	* @property {createjs.Point} _dragOffset
	*/
	p._dragOffset = null;
	
	/**
	* Callback when we start dragging
	* @private
	* @property {Function} _dragStartCallback
	*/
	p._dragStartCallback = null;
	
	/**
	* Callback when we are done dragging
	* @private
	* @property {Function} _dragEndCallback
	*/
	p._dragEndCallback = null;
	
	/**
	* Callback to test for the start a held drag
	* @private
	* @property {Function} _triggerHeldDragCallback
	*/
	p._triggerHeldDragCallback = null;
	
	/**
	* Callback to start a sticky click drag
	* @private
	* @property {Function} _triggerStickyClickCallback
	*/
	p._triggerStickyClickCallback = null;
	
	/**
	* Callback when we are done with the drag
	* @private
	* @property {Function} _stageMouseUpCallback
	*/
	p._stageMouseUpCallback = null;
	
	/**
	* The collection of draggable objects
	* @private
	* @property {Array} _draggableObjects
	*/
	p._draggableObjects = null;
		
	/**
	* The function call when the mouse/touch moves
	* @private
	* @property {function} _updateCallback 
	*/
	p._updateCallback = null;

	/**
	* A point for reuse instead of lots of object creation.
	* @private
	* @property {createjs.Point} _helperPoint 
	*/
	p._helperPoint = null;
	
	/** 
	* Constructor 
	* @method initialize
	* @constructor
	* @param {createjs.Stage} stage The stage that this DragManager is monitoring.
	* @param {function} startCallback The callback when when starting
	* @param {function} endCallback The callback when ending
	*/
	p.initialize = function(stage, startCallback, endCallback)
	{
		this._updateCallback = this._updateObjPosition.bind(this);
		this._triggerHeldDragCallback = this._triggerHeldDrag.bind(this);
		this._triggerStickyClickCallback = this._triggerStickyClick.bind(this);
		this._stageMouseUpCallback = this._stopDrag.bind(this);
		this._theStage = stage;
		this._dragStartCallback = startCallback;
		this._dragEndCallback = endCallback;
		this._draggableObjects = [];
		this.mouseDownStagePos = {x:0, y:0};
		this.mouseDownObjPos = {x:0, y:0};
	};
	
	/**
	*	Manually starts dragging an object. If a mouse down event is not supplied as the second argument, it 
	*   defaults to a held drag, that ends as soon as the mouse is released.
	*  @method startDrag
	*  @public
	*  @param {createjs.DisplayObject} object The object that should be dragged.
	*  @param {createjs.MouseEvent} ev A mouse down event to listen to to determine what type of drag should be used.
	*/
	p.startDrag = function(object, ev)
	{
		this._objMouseDown(ev, object);
	};
	
	/**
	* Mouse down on an obmect
	*  @method _objMouseDown
	*  @private
	*  @param {createjs.MouseEvent} ev A mouse down event to listen to to determine what type of drag should be used.
	*  @param {createjs.DisplayObject} object The object that should be dragged.
	*/
	p._objMouseDown = function(ev, obj)
	{
		// if we are dragging something, then ignore any mouse downs
		// until we release the currently dragged stuff
		if(this.draggedObj !== null) return;

		this.draggedObj = obj;
		//stop any active tweens on the object, in case it is moving around or something
		createjs.Tween.removeTweens(obj);
		
		//get the mouse position in global space and convert it to parent space
		this._dragOffset = this.draggedObj.parent.globalToLocal(ev ? ev.stageX : 0, ev ? ev.stageY : 0);
		
		//move the offset to respect the object's current position
		this._dragOffset.x -= obj.x;
		this._dragOffset.y -= obj.y;

		//save the position of the object before dragging began, for easy restoration, if desired
		this.mouseDownObjPos.x = obj.x;
		this.mouseDownObjPos.y = obj.y;
		
		if(!ev)//if we don't get an event (manual call neglected to pass one) then default to a held drag
		{
			this.isHeldDrag = true;
			this._startDrag();
		}
		else
		{
			//override the target for the mousedown/touchstart event to be this object, in case we are dragging a cloned object
			this._theStage._getPointerData(ev.pointerID).target = obj;

			if(!this.allowStickyClick || ev.nativeEvent.type == 'touchstart')//if it is a touch event, force it to be the held drag type
			{
				this.mouseDownStagePos.x = ev.stageX;
				this.mouseDownStagePos.y = ev.stageY;
				this.isTouchMove = ev.nativeEvent.type == 'touchstart';
				this.isHeldDrag = true;
				this._startDrag();
			}
			else//otherwise, wait for a movement or a mouse up in order to do a held drag or a sticky click drag
			{
				this.mouseDownStagePos.x = ev.stageX;
				this.mouseDownStagePos.y = ev.stageY;
				obj.addEventListener("pressmove", this._triggerHeldDragCallback);
				obj.addEventListener("pressup", this._triggerStickyClickCallback);
			}
		}
	};
	
	/**
	* Start the sticky click
	* @method _triggerStickyClick
	* @private
	*/
	p._triggerStickyClick = function()
	{
		this.isStickyClick = true;
		this.draggedObj.removeEventListener("pressmove", this._triggerHeldDragCallback);
		this.draggedObj.removeEventListener("pressup", this._triggerStickyClickCallback);
		this._startDrag();
	};

	/**
	* Start hold dragging
	* @method _triggerHeldDrag
	* @private
	* @param {createjs.MouseEvent} ev The mouse down event
	*/
	p._triggerHeldDrag = function(ev)
	{
		var xDiff = ev.stageX - this.mouseDownStagePos.x;
		var yDiff = ev.stageY - this.mouseDownStagePos.y;
		if(xDiff * xDiff + yDiff * yDiff >= this.dragStartThreshold * this.dragStartThreshold)
		{
			this.isHeldDrag = true;
			this.draggedObj.removeEventListener("pressmove", this._triggerHeldDragCallback);
			this.draggedObj.removeEventListener("pressup", this._triggerStickyClickCallback);
			this._startDrag();
		}
	};

	/**
	* Internal start dragging on the stage
	* @method _startDrag
	* @private 
	*/
	p._startDrag = function()
	{
		var stage = this._theStage;
		stage.removeEventListener("stagemousemove", this._updateCallback);
		stage.addEventListener("stagemousemove", this._updateCallback);
		stage.removeEventListener("stagemouseup", this._stageMouseUpCallback);
		stage.addEventListener("stagemouseup", this._stageMouseUpCallback);
		
		this._dragStartCallback(this.draggedObj);
	};
	
	/**
	* Stops dragging the currently dragged object.
	* @public
	* @method stopDrag
	* @param {Bool} doCallback If the drag end callback should be called. Default is false.
	*/
	p.stopDrag = function(doCallback)
	{
		this._stopDrag(null, doCallback === true);//pass true if it was explicitly passed to us, false and undefined -> false
	};

	/**
	* Internal stop dragging on the stage
	* @method _stopDrag
	* @private 
	* @param {createjs.MouseEvent} ev Mouse up event
	* @param {Bool} doCallback If we should do the callback
	*/
	p._stopDrag = function(ev, doCallback)
	{
		var obj = this.draggedObj;
		obj.removeEventListener("pressmove", this._triggerHeldDragCallback);
		obj.removeEventListener("pressup", this._triggerStickyClickCallback);
		this._theStage.removeEventListener("stagemousemove", this._updateCallback);
		this._theStage.removeEventListener("stagemouseup", this._stageMouseUpCallback);
		this.draggedObj = null;
		this.isTouchMove = false;
		this.isStickyClick = false;
		this.isHeldMove = false;

		if(doCallback !== false) // true or undefined
			this._dragEndCallback(obj);
	};

	/**
	* Update the object position based on the mouse
	* @method _updateObjPosition
	* @private
	* @param {createjs.MouseEvent} e Mouse move event
	*/
	p._updateObjPosition = function(e)
	{
		if(!this.isTouchMove && !this._theStage.mouseInBounds) return;
		
		var draggedObj = this.draggedObj;
		var mousePos = draggedObj.parent.globalToLocal(e.stageX, e.stageY, this._helperPoint);
		var bounds = draggedObj._dragBounds;
		draggedObj.x = clamp(mousePos.x - this._dragOffset.x, bounds.x, bounds.right);
		draggedObj.y = clamp(mousePos.y - this._dragOffset.y, bounds.y, bounds.bottom);
		if(this.snapSettings)
		{
			switch(this.snapSettings.mode)
			{
				case "points":
					this._handlePointSnap(mousePos);
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
	* @param {createjs.Point} localMousePos The mouse position in the same space as the dragged object.
	*/
	p._handlePointSnap = function(localMousePos)
	{
		var snapSettings = this.snapSettings;
		var minDistSq = snapSettings.dist * snapSettings.dist;
		var points = snapSettings.points;
		var objX = localMousePos.x - this._dragOffset.x;
		var objY = localMousePos.y - this._dragOffset.y;
		var leastDist = -1;
		var closestPoint = null;
		for(var i = points.length - 1; i >= 0; --i)
		{
			var p = points[i];
			var distSq = distSquared(objX, objY, p.x, p.y);
			if(distSq <= minDistSq && (distSq < leastDist || leastDist == -1))
			{
				leastDist = distSq;
				closestPoint = p;
			}
		}
		if(closestPoint)
		{
			this.draggedObj.x = closestPoint.x;
			this.draggedObj.y = closestPoint.y;
		}
	};

	/*
	* Small distance squared function
	*/
	var distSquared = function(x1, y1, x2, y2)
	{
		var xDiff = x1 - x2;
		var yDiff = y1 - y2;
		return xDiff * xDiff + yDiff * yDiff;
	};
	
	/*
	* Simple clamp function
	*/
	var clamp = function(x,a,b)
	{
		return (x < a ? a : (x > b ? b : x));
	};
	
	//=== Giving functions and properties to draggable objects objects
	var enableDrag = function()
	{
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
	* _dragBounds (Rectangle), _onMouseDownListener (Function), _dragMan (cloudkid.DragManager) reference to the DragManager
	* these will override any existing properties of the same name
	* @method addObject
	* @public
	* @param {createjs.DisplayObject} obj The display object
	* @param {createjs.Rectangle} bound The rectangle bounds
	*/
	p.addObject = function(obj, bounds)
	{
		if(!bounds)
		{
			bounds = {x:0, y:0, width:this._theStage.canvas.width, height:this._theStage.canvas.height};
		}
		bounds.right = bounds.x + bounds.width;
		bounds.bottom = bounds.y + bounds.height;
		obj._dragBounds = bounds;
		if(this._draggableObjects.indexOf(obj) >= 0)
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
		obj.disableDrag();
		delete obj.enableDrag;
		delete obj.disableDrag;
		delete obj._onMouseDownListener;
		delete obj._dragMan;
		delete obj._dragBounds;
		var index = this._draggableObjects.indexOf(obj);
		if(index >= 0)
			this._draggableObjects.splice(index, 1);
	};
	
	/**
	*  Destroy the manager
	*  @public
	*  @method destroy
	*/
	p.destroy = function()
	{
		if(this.draggedObj !== null)
		{
			//clean up dragged obj
			this.draggedObj.removeEventListener("pressmove", this._triggerHeldDragCallback);
			this.draggedObj.removeEventListener("pressup", this._triggerStickyClickCallback);
			this._theStage.removeEventListener("stagemousemove", this._updateCallback);
			this.draggedObj = null;
		}
		this._updateCallback = null;
		this._dragStartCallback = null;
		this._dragEndCallback = null;
		this._triggerHeldDragCallback = null;
		this._triggerStickyClickCallback = null;
		this._stageMouseUpCallback = null;
		this._theStage = null;
		for(var i = this._draggableObjects.length - 1; i >= 0; --i)
		{
			var obj = this._draggableObjects[i];
			obj.disableDrag();
			delete obj.enableDrag;
			delete obj.disableDrag;
			delete obj._onMouseDownListener;
			delete obj._dragMan;
			delete obj._dragBounds;
		}
		this._draggableObjects = null;
		this._helperPoint = null;
	};
	
	/** Assign to the global namespace */
	namespace('cloudkid').DragManager = DragManager;
	namespace('cloudkid.createjs').DragManager = DragManager;
}());