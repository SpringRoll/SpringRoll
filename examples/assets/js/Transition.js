(function (lib, img, cjs) {

var p; // shortcut to reference prototypes
var Shape = cjs.Shape;
var Rectangle = cjs.Rectangle;
var Container = cjs.Container;
var MovieClip = cjs.MovieClip;
var Tween = cjs.Tween;

(lib.iris_solid = function() {
	this.initialize();

	// Layer 2
	this.shape = new Shape();
	this.shape.graphics.f("#000000").s().p("EhV7AiYMAAAhEvMCr2AAAMAAABEvg");
	this.shape.setTransform(550,220);

	this.addChild(this.shape);
}).prototype = p = new Container();
p.nominalBounds = new Rectangle(0,0,1100,440);


(lib.iris_circle = function() {
	this.initialize();

	// Layer 2
	this.shape = new Shape();
	this.shape.graphics.f("#000000").s().p("EtriFqmMAAArVMMbXFAAAMAAALVMgAwQ20QmUGUAAI8QAAI7GUGUQGUGUI8AAQI7AAGUmUQGUmUAAo7QAAo8mUmUQmUmUo7AAQo8AAmUGUg");
	this.shape.setTransform(6.5,48.5);

	this.addChild(this.shape);
}).prototype = p = new Container();
p.nominalBounds = new Rectangle(-5597,-2272.2,11207,4641.4);


// stage content:
(lib.Transition = function(mode,startPosition,loop) {
if (loop == null) { loop = false; }	this.initialize(mode,startPosition,loop,{hidden:0,onTransitionOut:1,onTransitionOut_stop:30,onTransitionIn:50,onTransitionIn_stop:70});

	// mask
	this.instance = new lib.iris_circle();
	this.instance.setTransform(546,231.1,6.782,6.782);
	this.instance._off = true;

	this.instance_1 = new lib.iris_solid();

	this.timeline.addTween(Tween.get({}).to({state:[]}).to({state:[{t:this.instance}]},2).to({state:[{t:this.instance}]},27).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance}]},21).to({state:[{t:this.instance}]},27).wait(7));
	this.timeline.addTween(Tween.get(this.instance).wait(2).to({_off:false},0).to({scaleX:0.1,scaleY:0.1,x:549.4,y:215.2},27).to({_off:true},1).wait(21).to({_off:false},0).to({scaleX:6.78,scaleY:6.78,x:546,y:231.1},27).wait(7));

}).prototype = p = new MovieClip();
p.nominalBounds = null;

})(lib = lib||{}, images = images||{}, createjs = createjs||{});
var lib, images, createjs;