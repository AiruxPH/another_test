// Physics logic following listings 1, 3, 4, 5, 9
const GRAVITY_Y = 2000; // Pixels per second squared
const JUMP_VELOCITY = -800; // Initial upward velocity
const MOVE_ACCELERATION = 2000; // Horizontal acceleration (pixels/s^2)
const MAX_SPEED = 600; // Maximum horizontal speed (pixels/s)
const FRICTION = 0.85; // Friction multiplier (sliding to a stop)
const DASH_SPEED = 2000; // Explosive dash velocity
const DASH_DURATION = 0.15; // How long the dash lasts (seconds)
const DASH_COOLDOWN = 0.5; // Seconds before next dash is allowed
const FAST_FALL_GRAVITY = 15000; // Drastically increased gravity when holding down (downward dash)
const WALL_BOUNCE = 0.5; // Restitution factor when hitting a wall (0 to 1)

const SPRINT_MAX_SPEED = 1200; // Max horizontal speed when sprinting
const SPRINT_ACCELERATION = 4000; // Horizontal acceleration when sprinting

const PLAYER_SIZE = 40; // Player width/height in px
const PLAYER_HALF_SIZE = PLAYER_SIZE / 2;

// Simple PhysicsEntity structure
const entity = {
    x: 0,       // current horizontal offset
    y: 0,       // current vertical offset (0 is floor)
    vx: 0,      // velocity in x
    vy: 0,      // velocity in y
    ax: 0,      // acceleration in x
    ay: GRAVITY_Y, // acceleration in y (gravity)
    hasDoubleJumped: false, // tracks if double jump was used
    isDashing: false,     // is currently dashing
    dashTimer: 0,         // time left in current dash
    dashCooldownTimer: 0, // time left before can dash again
    facingDirection: 1,    // 1 for right, -1 for left
    isSprinting: false,    // tracks if the character is sprinting
    onGround: true         // tracked by collision engine
};

const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowDown: false
};

const box = document.getElementById("main-box");
let lastTime = 0;
let jumpBufferTimer = 0; // Timer to remember jump inputs

// Variables for double-tap detection
let lastLeftTapTime = 0;
let lastRightTapTime = 0;
const DOUBLE_TAP_DELAY = 0.25; // seconds

// --- PLATFORMS ---
// Coordinates are relative to the player's start position (0,0)
const platforms = [
    { x: -300, y: -100, width: 200, height: 20 }, // Left step
    { x: 100, y: -200, width: 200, height: 20 },  // Right high step
    { x: -100, y: -350, width: 200, height: 20 }  // Top middle step
];

// Reference to HTML container to append platforms
const container = document.querySelector('.container');

function initPlatforms() {
    platforms.forEach(plat => {
        const platDiv = document.createElement('div');
        platDiv.classList.add('platform');
        platDiv.style.width = plat.width + 'px';
        platDiv.style.height = plat.height + 'px';

        // --- VISUAL RENDERING OFFSET ---
        // Platform x is its horizontal center. CSS left:50% means 0 is center.
        // To center it physically, we translate the left edge back by half width.
        const renderX = plat.x - (plat.width / 2);

        // Platform y is its TOP surface. CSS bottom:20vh means 0 is the floor baseline.
        // translateY(y) moves the bottom edge downwards to y.
        // We want the TOP edge to be at plat.y, so we push the bottom edge down by plat.height
        // resulting in the top edge sitting exactly at plat.y.
        const renderY = plat.y + plat.height;

        platDiv.style.transform = `translate(${renderX}px, ${renderY}px)`;
        container.appendChild(platDiv);
    });
}
// Run once on load
initPlatforms();
// -----------------

function handleKeyDown(event) {
    if (event.code === "Space" || event.key === "w" || event.key === "W" || event.code === "ArrowUp") {
        if (entity.onGround) {
            // On the ground: jump instantly
            entity.vy = JUMP_VELOCITY;
        } else if (entity.vy > 0 && Math.abs(entity.y) < 100) {
            // Falling and very close to the ground: buffer a ground jump for when we land
            jumpBufferTimer = 0.15;
        } else if (!entity.hasDoubleJumped) {
            // High in the air and haven't double jumped yet: double jump instantly
            entity.vy = JUMP_VELOCITY;
            entity.hasDoubleJumped = true;
        }
    }
    if (event.code === "ArrowLeft" || event.key === "a" || event.key === "A") {
        if (!keys.ArrowLeft) { // newly pressed
            const now = performance.now() / 1000;
            if (now - lastLeftTapTime < DOUBLE_TAP_DELAY) {
                entity.isSprinting = true;
            }
            lastLeftTapTime = now;
        }
        keys.ArrowLeft = true;
        if (!entity.isDashing) entity.facingDirection = -1; // Only change facing if not dashing
    }
    if (event.code === "ArrowRight" || event.key === "d" || event.key === "D") {
        if (!keys.ArrowRight) { // newly pressed
            const now = performance.now() / 1000;
            if (now - lastRightTapTime < DOUBLE_TAP_DELAY) {
                entity.isSprinting = true;
            }
            lastRightTapTime = now;
        }
        keys.ArrowRight = true;
        if (!entity.isDashing) entity.facingDirection = 1; // Only change facing if not dashing
    }
    if (event.code === "ArrowDown" || event.key === "s" || event.key === "S") {
        keys.ArrowDown = true;
    }
    if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
        if (!entity.isDashing && entity.dashCooldownTimer <= 0) {
            entity.isDashing = true;
            entity.dashTimer = DASH_DURATION;
            // Instantly override velocity for the dash burst
            entity.vx = DASH_SPEED * entity.facingDirection;

            // Dynamic vertical bump based on current trajectory
            if (entity.vy < 0) {
                // Moving up: extend the jump arc slightly
                entity.vy = -300;
            } else if (entity.vy > 0) {
                // Moving down: thrust diagonally downwards
                entity.vy = 300;
            } else {
                // Perfectly flat: slight upward bump
                entity.vy = -150;
            }
        }
    }
}

function handleKeyUp(event) {
    if (event.code === "Space" || event.key === "w" || event.key === "W" || event.code === "ArrowUp") {
        // Variable Jump Height: If releasing the jump key while moving upwards, 
        // cut the upward velocity to half. This creates a "short hop".
        if (entity.vy < 0) {
            entity.vy *= 0.5;
        }
    }
    if (event.code === "ArrowLeft" || event.key === "a" || event.key === "A") {
        keys.ArrowLeft = false;
        if (!keys.ArrowRight) entity.isSprinting = false; // Stop sprinting if released
    }
    if (event.code === "ArrowRight" || event.key === "d" || event.key === "D") {
        keys.ArrowRight = false;
        if (!keys.ArrowLeft) entity.isSprinting = false; // Stop sprinting if released
    }
    if (event.code === "ArrowDown" || event.key === "s" || event.key === "S") {
        keys.ArrowDown = false;
    }
}

// Game Loop
function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const elapsed = (timestamp - lastTime) / 1000; // convert to seconds
    lastTime = timestamp;

    // Manage Dash timers
    if (entity.dashCooldownTimer > 0) {
        entity.dashCooldownTimer -= elapsed;
    }

    if (entity.isDashing) {
        entity.dashTimer -= elapsed;
        if (entity.dashTimer <= 0) {
            // End dash
            entity.isDashing = false;
            entity.dashCooldownTimer = DASH_COOLDOWN;
            // Optionally scale down velocity immediately after dash so we don't slide forever
            entity.vx *= 0.5;
        } else {
            // While dashing, enforce dash velocity
            entity.vx = DASH_SPEED * entity.facingDirection;
            // Apply a fraction of gravity (e.g., 20%) so it arcs slightly downwards over time
            entity.ay = GRAVITY_Y * 0.2;
            entity.ax = 0;
        }
    } else {
        // Fast falling: if holding down and moving downwards (or at apex)
        if (keys.ArrowDown && entity.vy >= -100) {
            entity.ay = FAST_FALL_GRAVITY;
        } else {
            // Restore normal gravity when not dashing
            entity.ay = GRAVITY_Y;
        }

        // Handle horizontal input (apply acceleration)
        let currentAcceleration = entity.isSprinting ? SPRINT_ACCELERATION : MOVE_ACCELERATION;

        if (keys.ArrowLeft) {
            entity.ax = -currentAcceleration;
            entity.facingDirection = -1;
        } else if (keys.ArrowRight) {
            entity.ax = currentAcceleration;
            entity.facingDirection = 1;
        } else {
            entity.ax = 0; // stop accelerating when key is released
            entity.isSprinting = false; // ensure sprinting stops when keys are released entirely
        }
    }

    // Handle jump buffering
    if (jumpBufferTimer > 0) {
        jumpBufferTimer -= elapsed;
        // If we are on the floor and the jump is buffered, jump!
        if (entity.y === 0) {
            entity.vy = JUMP_VELOCITY;
            jumpBufferTimer = 0; // Consume the jump buffer
        }
    }

    // Euler Integration
    // v(n+1) = a * t + v(n)
    entity.vy += entity.ay * elapsed;
    entity.vx += entity.ax * elapsed;

    if (!entity.isDashing) {
        // Apply friction (frame-rate independent approximation)
        entity.vx *= Math.pow(FRICTION, elapsed * 60);

        // Clamp velocity to max speed (only when not dashing)
        let currentMaxSpeed = entity.isSprinting ? SPRINT_MAX_SPEED : MAX_SPEED;
        if (entity.vx > currentMaxSpeed) entity.vx = currentMaxSpeed;
        if (entity.vx < -currentMaxSpeed) entity.vx = -currentMaxSpeed;

        // Stop completely if moving very slowly to avoid micro-sliding
        if (Math.abs(entity.vx) < 5 && entity.ax === 0) entity.vx = 0;
    }

    // p(n+1) = v * t + p(n)

    // 1. Move X and check horizontal collisions
    entity.x += entity.vx * elapsed;
    for (let p of platforms) {
        if (checkAABB(entity, p)) {
            if (entity.vx > 0) {
                // Moving right, hit left edge
                entity.x = p.x - (p.width / 2) - PLAYER_HALF_SIZE;
            } else if (entity.vx < 0) {
                // Moving left, hit right edge
                entity.x = p.x + (p.width / 2) + PLAYER_HALF_SIZE;
            }
            entity.vx = 0;
            if (entity.isDashing) {
                entity.isDashing = false;
                entity.dashCooldownTimer = DASH_COOLDOWN;
            }
        }
    }

    // 2. Move Y and check vertical collisions
    // Track floor state to allow jumping
    let onFloor = false;
    entity.y += entity.vy * elapsed;

    for (let p of platforms) {
        if (checkAABB(entity, p)) {
            if (entity.vy > 0) {
                // Falling down, landed on top
                entity.y = p.y - (p.height / 2) - PLAYER_HALF_SIZE;
                entity.vy = 0;
                onFloor = true;
                entity.hasDoubleJumped = false; // Reset double jump
            } else if (entity.vy < 0) {
                // Jumping up, hit bottom (bonk head)
                entity.y = p.y + (p.height / 2) + PLAYER_HALF_SIZE;
                entity.vy = 0;
            }
        }
    }

    // Original Floor Constraint (y = 0 is absolute bottom floor)
    if (entity.y >= 0) {
        entity.y = 0;
        entity.hasDoubleJumped = false;
        onFloor = true;
        if (entity.vy > 0) entity.vy = 0;
    }

    // If we are on ANY valid floor surface, allow ground jumps (buffered or future)
    // Note: The jump condition check in handleKeyDown needs to know if we are on floor. 
    // We update a global or entity property so events can see it.
    entity.onGround = onFloor;

    // --- SCREEN BOUNDS (Walls) ---
    // The square is centered at x=0. 
    // The window width is window.innerWidth. 
    const max_x = (window.innerWidth / 2) - PLAYER_HALF_SIZE;
    const min_x = -max_x;

    if (entity.x > max_x) {
        entity.x = max_x;
        // Bounce off the right wall
        entity.vx = -entity.vx * WALL_BOUNCE;
        if (entity.isDashing) {
            entity.isDashing = false;
            entity.dashCooldownTimer = DASH_COOLDOWN;
        }
    } else if (entity.x < min_x) {
        entity.x = min_x;
        // Bounce off the left wall
        entity.vx = -entity.vx * WALL_BOUNCE;
        if (entity.isDashing) {
            entity.isDashing = false;
            entity.dashCooldownTimer = DASH_COOLDOWN;
        }
    }
    // -----------------------------

    // Collision Detection & Resolution (Listing 2, 7, 8 concept - simplified to a floor constraint)
    if (entity.y > 0) {
        entity.y = 0; // Rest position (floor)
        entity.hasDoubleJumped = false; // Reset double jump when landing
        // Stop vertical motion only if we aren't currently jumping up
        if (entity.vy > 0) {
            entity.vy = 0;
        }
    }

    // DOM rendering mapping the physics position
    // Player x is horizontal center. CSS left:50% baseline.
    const renderX = entity.x - PLAYER_HALF_SIZE;
    // Player y is absolute bottom edge. CSS bottom:20vh baseline.
    const renderY = entity.y;
    box.style.transform = `translate(${renderX}px, ${renderY}px)`;

    // Request next frame
    requestAnimationFrame(gameLoop);
}

// AABB Collision Helper
// Returns true if entity rect overlaps platform rect
function checkAABB(ent, plat) {
    // Player is PLAYER_SIZE, centered
    const pLeft = ent.x - PLAYER_HALF_SIZE;
    const pRight = ent.x + PLAYER_HALF_SIZE;
    const pTop = ent.y - PLAYER_HALF_SIZE;
    const pBottom = ent.y + PLAYER_HALF_SIZE;

    // Platform is centered at (plat.x, plat.y)
    const bLeft = plat.x - (plat.width / 2);
    const bRight = plat.x + (plat.width / 2);
    const bTop = plat.y - (plat.height / 2);
    const bBottom = plat.y + (plat.height / 2);

    // strictly < and > to prevent sticking when perfectly adjacent
    return (pLeft < bRight && pRight > bLeft && pTop < bBottom && pBottom > bTop);
}

// Start the engine
requestAnimationFrame(gameLoop);

// Event Listeners (moved from body inline attributes)
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
