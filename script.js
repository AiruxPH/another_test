// Physics logic following listings 1, 3, 4, 5, 9
const GRAVITY_Y = 2000; // Pixels per second squared
const JUMP_VELOCITY = -800; // Initial upward velocity
const MOVE_ACCELERATION = 2000; // Horizontal acceleration (pixels/s^2)
const MAX_SPEED = 600; // Maximum horizontal speed (pixels/s)
const FRICTION = 0.85; // Friction multiplier (sliding to a stop)

// Simple PhysicsEntity structure
const entity = {
    x: 0,       // current horizontal offset
    y: 0,       // current vertical offset (0 is floor)
    vx: 0,      // velocity in x
    vy: 0,      // velocity in y
    ax: 0,      // acceleration in x
    ay: GRAVITY_Y // acceleration in y (gravity)
};

const keys = {
    ArrowLeft: false,
    ArrowRight: false
};

const box = document.getElementById("main-box");
let lastTime = 0;
let jumpBufferTimer = 0; // Timer to remember jump inputs

function handleKeyDown(event) {
    if (event.code === "Space" || event.key === "w" || event.key === "W") {
        // Set a jump buffer for 150ms (0.15 seconds)
        jumpBufferTimer = 0.15;
    }
    if (event.code === "ArrowLeft" || event.key === "a" || event.key === "A") {
        keys.ArrowLeft = true;
    }
    if (event.code === "ArrowRight" || event.key === "d" || event.key === "D") {
        keys.ArrowRight = true;
    }
}

function handleKeyUp(event) {
    if (event.code === "ArrowLeft" || event.key === "a" || event.key === "A") {
        keys.ArrowLeft = false;
    }
    if (event.code === "ArrowRight" || event.key === "d" || event.key === "D") {
        keys.ArrowRight = false;
    }
}

// Game Loop
function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const elapsed = (timestamp - lastTime) / 1000; // convert to seconds
    lastTime = timestamp;

    // Handle horizontal input (apply acceleration)
    if (keys.ArrowLeft) {
        entity.ax = -MOVE_ACCELERATION;
    } else if (keys.ArrowRight) {
        entity.ax = MOVE_ACCELERATION;
    } else {
        entity.ax = 0; // stop accelerating when key is released
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

    // Apply friction (frame-rate independent approximation)
    entity.vx *= Math.pow(FRICTION, elapsed * 60);

    // Clamp velocity to max speed
    if (entity.vx > MAX_SPEED) entity.vx = MAX_SPEED;
    if (entity.vx < -MAX_SPEED) entity.vx = -MAX_SPEED;

    // Stop completely if moving very slowly to avoid micro-sliding
    if (Math.abs(entity.vx) < 5 && entity.ax === 0) entity.vx = 0;

    // p(n+1) = v * t + p(n)
    entity.y += entity.vy * elapsed;
    entity.x += entity.vx * elapsed;

    // Collision Detection & Resolution (Listing 2, 7, 8 concept - simplified to a floor constraint)
    if (entity.y > 0) {
        entity.y = 0; // Rest position (floor)
        // Stop vertical motion only if we aren't currently jumping up
        if (entity.vy > 0) {
            entity.vy = 0;
        }
    }

    // DOM rendering mapping the physics position
    box.style.transform = `translate(${entity.x}px, ${entity.y}px)`;

    // Request next frame
    requestAnimationFrame(gameLoop);
}

// Start the engine
requestAnimationFrame(gameLoop);

// Event Listeners (moved from body inline attributes)
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
