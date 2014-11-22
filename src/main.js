// consts
var STAGE_WIDTH = 800;
var STAGE_HEIGHT = 600;

var WORLD_WIDTH = 1779;
var WORLD_HEIGHT = STAGE_HEIGHT;

var GROUND_HEIGHT = 200;
var Y_GROUND = STAGE_HEIGHT - GROUND_HEIGHT;

var ROBOT_WIDTH = 50;
var ROBOT_HEIGHT = 54;
var ROBOT_SPEED = 150;

var PLANK_X = 100;
var PLANK_W = 50;
var POISON_X = 200;
var POISON_W = 50;
var CAKE_X = 400;
var CAKE_W = 300;
var BEES_X = 700;
var BEES_W = 100;

// globals
var robot, plank, poison, cake, bees;
var game = new Phaser.Game(
	STAGE_WIDTH,
	STAGE_HEIGHT,
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
	game.load.image('background', 'assets/backgrounds/bare_stage.png');
	game.load.image('rain', 'assets/sprites/rain.png');
	game.load.image('plank', 'assets/sprites/plank_item.png');
	game.load.image('cake', 'assets/sprites/cake_item.png');
	game.load.image('bees', 'assets/sprites/bees_item.png');
	game.load.image('poison', 'assets/sprites/poison_item.png');
}

function create() {
	// game poperties
	game.stage.backgroundColor = '#bed0ee';
	game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
	bg = game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'background');

	// rain
	var emitter = game.add.emitter(game.world.centerX, 0, 400);
	emitter.width = game.world.width;
	emitter.angle = 30; // uncomment to set an angle for the rain.
	emitter.makeParticles('rain');
	emitter.minParticleScale = 0.1;
	emitter.maxParticleScale = 0.5;
	emitter.setYSpeed(300, 500);
	emitter.setXSpeed(-5, 5);
	emitter.minRotation = 0;
	emitter.maxRotation = 0;
	emitter.start(false, 1600, 5, 0);

	// the robot
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

	// place objects
	plank = game.add.sprite(PLANK_X, Y_GROUND, 'plank');
	plank_scale = PLANK_W / plank.width;
	plank.scale.x = plank_scale;
	plank.scale.y = plank_scale;

	poison = game.add.sprite(POISON_X, Y_GROUND, 'poison');
	poison_scale = POISON_W / poison.width;
	poison.scale.x = poison_scale;
	poison.scale.y = poison_scale;

	cake = game.add.sprite(CAKE_X, Y_GROUND, 'cake');
	cake_scale = CAKE_W / cake.width;
	cake.scale.x = cake_scale;
	cake.scale.y = cake_scale;
	cake.y = Y_GROUND - 150; // TODO(mbforbes) Change.

	bees = game.add.sprite(BEES_X, Y_GROUND, 'bees');
	bees_scale = BEES_W / bees.width;
	bees.scale.x = bees_scale;
	bees.scale.y = bees_scale;
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
