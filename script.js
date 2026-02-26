// --- PHASER 3 CONFIGURATION ---
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#ffffff', // Explicitly set white background so black player is visible
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 2000 }, // Match our old GRAVITY_Y roughly
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

// --- GLOBAL VARIABLES ---
let player;
let platforms;
let cursors;
let keys;

// Movement constants (Tweaked for Phaser Arcade Physics)
const MOVE_ACCELERATION = 2000;
const MAX_SPEED = 400;
const SPRINT_ACCELERATION = 4000;
const SPRINT_MAX_SPEED = 800;
const JUMP_VELOCITY = -800;
const FRICTION = 0.85; // Arcade physics damping

// Dash & Special Move State
let isDashing = false;
let dashTimer = 0;
let dashCooldownTimer = 0;
const DASH_SPEED = 1500;
const DASH_DURATION = 150; // ms in Phaser
const DASH_COOLDOWN = 500; // ms
let facingDirection = 1;

let hasDoubleJumped = false;
let isSprinting = false;

// Double tap detection
let lastLeftTapTime = 0;
let lastRightTapTime = 0;
const DOUBLE_TAP_DELAY = 250; // ms

// --- SCENE FUNCTIONS ---

function preload() {
    // No external assets yet. We will generate graphics dynamically.
}

function create() {
    // 1. Create Platforms (Static Physics Group)
    platforms = this.physics.add.staticGroup();

    // Recreate our old platforms visually using Phaser Rectangles
    // Note: Arcade physics static groups need a texture generally, but we can make one on the fly
    const graphics = this.add.graphics();
    graphics.fillStyle(0x333333, 1);
    graphics.fillRect(0, 0, 10, 10);
    graphics.generateTexture('platformTexture', 10, 10);
    graphics.destroy();

    // Base floor (to replace our y=0 constraint)
    const floor = platforms.create(window.innerWidth / 2, window.innerHeight - 50, 'platformTexture');
    floor.setDisplaySize(window.innerWidth, 100).refreshBody();

    // Floating platforms (adjusting coordinates to fit center-origin screens roughly)
    const p1 = platforms.create(window.innerWidth / 2 - 300, window.innerHeight - 200, 'platformTexture');
    p1.setDisplaySize(200, 20).refreshBody();

    const p2 = platforms.create(window.innerWidth / 2 + 100, window.innerHeight - 300, 'platformTexture');
    p2.setDisplaySize(200, 20).refreshBody();

    const p3 = platforms.create(window.innerWidth / 2 - 100, window.innerHeight - 450, 'platformTexture');
    p3.setDisplaySize(200, 20).refreshBody();

    // 2. Create Player
    // Generate a quick texture for the 40x40 black square
    const pGraphics = this.add.graphics();
    pGraphics.fillStyle(0x000000, 1);
    pGraphics.fillRect(0, 0, 40, 40);
    pGraphics.generateTexture('playerTexture', 40, 40);
    pGraphics.destroy();

    player = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight - 150, 'playerTexture');

    // Player Physics Properties
    player.setCollideWorldBounds(true); // Replaces our manual screen bounds!
    player.setBounce(0.5, 0); // Wall bouncing (50% restitution on X, 0 on Y)
    player.setMaxVelocity(MAX_SPEED, 3000); // Limit max speeds
    player.setDragX(1000); // Friction replacement

    // 3. Collisions
    this.physics.add.collider(player, platforms, onPlatformLand, null, this);

    // 4. Input Setup
    cursors = this.input.keyboard.createCursorKeys();
    keys = this.input.keyboard.addKeys('W,A,S,D,SHIFT');
}

function onPlatformLand(playerBody, platform) {
    if (player.body.touching.down) {
        hasDoubleJumped = false;
    }
}

function update(time, delta) {
    // --- TIMERS ---
    if (dashCooldownTimer > 0) dashCooldownTimer -= delta;

    // --- DASH LOGIC ---
    if (isDashing) {
        dashTimer -= delta;
        if (dashTimer <= 0) {
            // End dash
            isDashing = false;
            dashCooldownTimer = DASH_COOLDOWN;
            player.body.setAllowGravity(true);
            player.setVelocityX(player.body.velocity.x * 0.5); // cut speed so we don't slide forever
        } else {
            // Enforce dash velocity
            player.setVelocityX(DASH_SPEED * facingDirection);
            // Apply a fraction of gravity (20%) so it arcs slightly downwards over time
            player.body.setAllowGravity(true);
            player.setGravityY(-1600); // 2000 standard gravity - 1600 = 400 effective gravity (20%)
            return; // Skip normal movement while dashing
        }
    }

    // Dash Initiation
    if (Phaser.Input.Keyboard.JustDown(keys.SHIFT) && !isDashing && dashCooldownTimer <= 0) {
        isDashing = true;
        dashTimer = DASH_DURATION;
        player.setVelocityX(DASH_SPEED * facingDirection);

        // Dynamic vertical bump based on current trajectory
        if (player.body.velocity.y < -50) {
            // Moving up: extend the jump arc slightly
            player.setVelocityY(-400);
        } else if (player.body.velocity.y > 50) {
            // Moving down: thrust diagonally downwards
            player.setVelocityY(400);
        } else {
            // perfectly flat: slight upward bump
            player.setVelocityY(-200);
        }
        return;
    }

    // --- HORIZONTAL MOVEMENT ---
    const leftDown = cursors.left.isDown || keys.A.isDown;
    const rightDown = cursors.right.isDown || keys.D.isDown;

    // Double tap to sprint
    if (Phaser.Input.Keyboard.JustDown(cursors.left) || Phaser.Input.Keyboard.JustDown(keys.A)) {
        if (time - lastLeftTapTime < DOUBLE_TAP_DELAY) isSprinting = true;
        lastLeftTapTime = time;
    }
    if (Phaser.Input.Keyboard.JustDown(cursors.right) || Phaser.Input.Keyboard.JustDown(keys.D)) {
        if (time - lastRightTapTime < DOUBLE_TAP_DELAY) isSprinting = true;
        lastRightTapTime = time;
    }
    if (!leftDown && !rightDown) {
        isSprinting = false;
    }

    const currentAccel = isSprinting ? SPRINT_ACCELERATION : MOVE_ACCELERATION;
    const currentMaxV = isSprinting ? SPRINT_MAX_SPEED : MAX_SPEED;
    player.setMaxVelocity(currentMaxV, 3000); // Adjust max velocity dynamic

    if (leftDown) {
        player.setAccelerationX(-currentAccel);
        facingDirection = -1;
    } else if (rightDown) {
        player.setAccelerationX(currentAccel);
        facingDirection = 1;
    } else {
        player.setAccelerationX(0); // Let drag/friction take over
    }

    // --- VERTICAL MOVEMENT (Jumping) ---
    const jumpDown = Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(keys.W) || Phaser.Input.Keyboard.JustDown(cursors.space);
    const jumpHeld = cursors.up.isDown || keys.W.isDown || cursors.space.isDown;
    const downDown = cursors.down.isDown || keys.S.isDown;

    if (jumpDown) {
        if (player.body.touching.down) {
            // Ground jump
            player.setVelocityY(JUMP_VELOCITY);
        } else if (!hasDoubleJumped) {
            // Double jump
            player.setVelocityY(JUMP_VELOCITY);
            hasDoubleJumped = true;
        }
    }

    // Variable jump height (release early to cut speed)
    if (!jumpHeld && player.body.velocity.y < -100) {
        player.setVelocityY(player.body.velocity.y * 0.9); // Smoother dampening in Phaser
    }

    // Fast Fall (downward dash)
    if (downDown && player.body.velocity.y >= -100) {
        player.setGravityY(10000); // Extra gravity multiplier
    } else {
        player.setGravityY(0); // Reset to world default
    }
}

// Handle window resizing seamlessly
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
    // Note: In a real game, you'd also need to reposition platforms/world bounds on resize,
    // but this suffices for the immediate demo bounding.
});
