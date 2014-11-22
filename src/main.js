// consts
var MAX_AGENTS = 5;
var MIN_CREATION_PAUSE = 1;
var TRAIL_SPACING = 35;
var TRAIL_SIZE = 100;
var AGENT_DIAMETER = 35;
var AGENT_SPEED = 3;
var TRAIL_DIAMETER = 10;
var WIDTH = 800;
var HEIGHT = 600;

// globals
var agents;
var lastCreateTime;
var game = new Phaser.Game(
	WIDTH, HEIGHT,
	Phaser.CANVAS,
	'phaser-example',
	{
		create: create,
		render: render,
		update: update,
	}
);

// Types

// Agent
Agent = function() {
	// State
	this.alive = false;
	this.lastTrail = -1;   // Points to the last valid trail. -1 means invalid.
	this.trail = Array(TRAIL_SIZE);
	this.trailCircles = Array(TRAIL_SIZE);
	for (var i = 0; i < TRAIL_SIZE; i++) {
		this.trail[i] = new Phaser.Circle(0, 0);
	}
	this.trailSize = 0;

	// Constants
	this.speed = AGENT_SPEED;

	// Defaults: Positions
	this.p = new Phaser.Point(0, 0);
	this.goal = new Phaser.Point(0, 0);

	// Defaults: rendering
	this.outer = new Phaser.Circle(0, 0);
	this.inner = new Phaser.Circle(0, 0);
	this.goalOuter = new Phaser.Circle(0, 0);
	this.goalInner = new Phaser.Circle(0, 0);
};

Agent.prototype = {
	setGoal: function(x, y) {
		this.goal.x = x;
		this.goal.y = y;
		this.alive = true;
	},

	setP: function(x, y) {
		this.p.x = x;
		this.p.y = y;
	},

	update: function() {
		// console.log("Updaing agent")
		this._checkGoal();
		this._move();
		this._maybeMakeTrail();
	},

	render: function() {
		if (this.alive) {
			// Redner goal.
			this.goalOuter.x = this.goal.x;
			this.goalOuter.y = this.goal.y;
			this.goalOuter.diameter = AGENT_DIAMETER;
			this.goalInner.x = this.goal.x;
			this.goalInner.y = this.goal.y;
			this.goalInner.diameter = AGENT_DIAMETER - 3;
			game.debug.geom(this.goalOuter, '#262626');
			game.debug.geom(this.goalInner, '#ff6666');

			// Render trail.
			console.log("Trail size: " + this.trailSize + "; trail end:" + this.lastTrail);
			if (this.trailSize < this.trail.length) {
				// Not wrapped; just iterate from 0.
				for (var i = 0; i <= this.lastTrail; i++) {
					console.log("--rendering[<cap] " + this.trail[i].x + ", " + this.trail[i].y + ", " + this.trail[i].diameter);
					game.debug.geom(this.trail[i], "#bbbbbb")
				}
			} else {
				// At capactiy, waybe wrapped; iterate from one after last to
				// end, then from beginning to last.
				var start = (this.lastTrail + 1) % (this.trail.length);
				console.log("--start= " + start);
				for (var i = start; i < this.trail.length; i++) {
					console.log("--rendering[>=cap,s->e] " + this.trail[i].x + ", " + this.trail[i].y + ", " + this.trail[i].diameter);
					game.debug.geom(this.trail[i], "#bbbbbb")
				}
				for (var i = 0; i < start; i++) {
					console.log("--rendering[>=cap,b->s] " + this.trail[i].x + ", " + this.trail[i].y + ", " + this.trail[i].diameter);
					game.debug.geom(this.trail[i], "#bbbbbb")
				}
			}

			// Render agent.
			// console.log("Rendering agent: " + this + " with d=" + d + " at: " + this._pos())
			this.outer.x = this.p.x;
			this.outer.y = this.p.y;
			this.inner.x = this.p.x;
			this.inner.y = this.p.y;
			this.outer.diameter = AGENT_DIAMETER;
			this.inner.diameter = AGENT_DIAMETER - 3;
			game.debug.geom(this.outer, '#262626');
			game.debug.geom(this.inner, '#555555');
		}
	},

	_move: function() {
		// console.log("Moving agent at:" + this._pos());
		if (!this.alive) {
			// console.log("--null");
			return;
		}
		var distance = Phaser.Math.distance(this.p.x, this.p.y, this.goal.x, this.goal.y);
		// console.log("--this.p:" + this.p);
		// console.log("--this.goal:" + this.goal);
		if (distance < this.speed) {
			// console.log("--clamping to goal");
			this.p.x = this.goal.x;
			this.p.y = this.goal.y;
			return;
		}
		// console.log("--normal movement");
		// console.log("--distance=" + distance);
		var angle = Phaser.Math.angleBetweenPoints(this.p, this.goal);
		// console.log("--angle=" + angle);
		var dx = Math.cos(angle) * this.speed;
		var dy = Math.sin(angle) * this.speed;
		// console.log("--dx,dy=" + dx + "," + dy);
		this.p.x = this.p.x + dx;
		this.p.y = this.p.y + dy;
		// console.log("--now at: " + this._pos());
	},

	_maybeMakeTrail: function() {
		if (!this.alive) {
			return;
		}
		if (this.lastTrail == -1) {
			// No trail yet; add first element.
			this.lastTrail = 0;
			this.trail[this.lastTrail].x = this.p.x;
			this.trail[this.lastTrail].y = this.p.y;
			this.trail[this.lastTrail].diameter = TRAIL_DIAMETER;
			this.trailSize = 1;
		} else {
			// We have at least one last trail; check whether we have enough
			// (physical) space to add a new trail.
			var last = this.trail[this.lastTrail];
			var delta = Phaser.Math.distance(this.p.x, this.p.y, last.x, last.y);
			if (delta >= TRAIL_SPACING) {
				// We have enough physical space; do the queue adjustments.
				if (this.trailSize < this.trail.length) {
					// Just add to queue.
					this.lastTrail++;
					this.trailSize++;
				} else {
					// Shift, wrapping if necessary.
					this.lastTrail = (this.lastTrail + 1) % (this.trail.length)
				}
				// Add the new element.
				this.trail[this.lastTrail].x = this.p.x;
				this.trail[this.lastTrail].y = this.p.y;
				this.trail[this.lastTrail].diameter = TRAIL_DIAMETER;
			}
		}
	},

	_checkGoal: function() {
		// console.log("Checking agent goal")
		if (this.alive && this.p.x == this.goal.x && this.p.y == this.goal.y) {
			// "Kill" agent.
			this.alive = false;
			// Do lazy clearing of trail.
			this.trailSize = 0;
			this.lastTrail = -1;
		}
	},

	_pos: function() {
		return "(" + this.p.x + "," + this.p.y +")"
	}
};


function create() {
	agents = Array(MAX_AGENTS);
	for (var i = 0; i < MAX_AGENTS; i++) {
		agents[i] = new Agent();
	}
    // circle = new Phaser.Circle(game.world.centerX, 100, 68);
};

// Core game functions.

function render() {
	// console.log("Rendering");
	for (var i = 0; i < MAX_AGENTS; i++) {
		agents[i].render();
	}
    // game.debug.geom(circle,'#cfffff');
    // game.debug.text('Diameter: '+ circle.diameter, 50, 200);
    // game.debug.text('Circumference: '+ circle.circumference(), 50, 230);
};

function update() {
	var dead = _.filter(agents, function(a){return !a.alive})
	// TODO(mbforbes): Check creation time between adding more agents.
	if (dead.length > 0) {
		// console.log("Resurrecting agent " + dead[0]);
		dead[0].setP(0, Math.random() * HEIGHT);
		dead[0].setGoal(WIDTH, Math.random() * HEIGHT);
	}
	for (var i = 0; i < MAX_AGENTS; i++) {
		agents[i].update();
	}
}
