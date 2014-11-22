// consts
var WIDTH = 800;
var HEIGHT = 600;
var GROUND_HEIGHT = 200;
var Y_GROUND = HEIGHT - GROUND_HEIGHT;
var ROBOT_WIDTH = 50;
var ROBOT_HEIGHT = 54;
var ROBOT_SPEED = 200;

// globals
var robot;
var game = new Phaser.Game(
	WIDTH, HEIGHT,
	Phaser.CANVAS,
	'phaser-example',
	{
		preload: preload,
		create: create,
		render: render,
		update: update,
	}
);

// Types

// Robot
var Robot = function() {
	this.sprite = null;
	this.facing = null;
};

// item types
var Items = {
	EMPTY: -1,
	PLANK: 0,
	CAKE: 1,
	POISON: 2,
	BEES: 3,
};

// Inventory
var Inventory = function() {
	// State
	this.slots = [
		Items.EMPTY,
		Items.EMPTY,
		Items.EMPTY,
		Items.EMPTY,
	];
};

Inventory.prototype = {
	// Args:
	//  - one of Items.*
	// Returns:
	//  - bool (whether it was added)
	add: function(item) {
		var i;
		for (i = 0; i < this.slots.length; i++) {
			if (this.slots[i] == Items.EMPTY) {
				this.slots[i] = item;
				return true;
			}
		}
		// Shouldn't happen.
		return false;
	},
};

// Core game functions.

function preload() {
	game.load.spritesheet('robotsprite', 'assets/sprites/robot_ss.png', ROBOT_WIDTH, ROBOT_HEIGHT);
}

function create() {
	robot = new Robot();
	robot.sprite = game.add.sprite(0, Y_GROUND - ROBOT_HEIGHT, 'robotsprite');
	robot.sprite.animations.add('left', [3, 4, 3, 5], 10, true);
	robot.sprite.animations.add('right', [0, 1, 0, 2], 10, true);

	// physics
	game.physics.enable(robot.sprite, Phaser.Physics.ARCADE);
	robot.sprite.body.collideWorldBounds = true;

	// camera
	game.camera.follow(robot.sprite);

	// input
	cursors = game.input.keyboard.createCursorKeys();

	// defaults
	robot.sprite.animations.frame = 3; // left
}

function update() {
    if (cursors.left.isDown) {
        robot.sprite.body.velocity.x = -ROBOT_SPEED;
        if (robot.facing != 'left') {
            robot.sprite.animations.play('left');
            robot.facing = 'left';
        }
    } else if (cursors.right.isDown) {
        robot.sprite.body.velocity.x = ROBOT_SPEED;
        if (robot.facing != 'right') {
            robot.sprite.animations.play('right');
            robot.facing = 'right';
        }
    } else {
    	robot.sprite.body.velocity.x = 0;
    	if (robot.facing == 'right') {
			robot.sprite.animations.frame = 0; // right
    	} else {
    		// default
			robot.sprite.animations.frame = 3; // left
    	}
    }
}

function render() {
	// temp background stuff
}
