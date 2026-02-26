# Changelog

All notable changes to this project will be documented in this file.

## [2026-02-26]
### Added
- `index.html`: Base structure for a centered box.
- `style.css`: Modern CSS for centering and styling the box (Flexbox, HSL colors).
- Created a simple centered box layout as per user request.

## [2026-02-26] - Simplified
### Changed
- `index.html`: Removed content, kept only a single div.
- `style.css`: Simplified to basic fundamentals, made the box a 200x200 square.

## [2026-02-26] - Screen Bounds & Layout
### Added
- `script.js`: Added Screen Bounds (invisible walls) dynamically calculated based on `window.innerWidth`. The square will now hard-stop (and cancel dashes) upon hitting the edges of the browser window.
- `script.js`: Added Wall Bumping (`WALL_BOUNCE = 0.5`). Hitting the window bounds now reflects horizontal velocity instead of just dead-stopping.
### Changed
- `style.css`: Changed layout from perfectly centered to resting near the bottom (`align-items: flex-end` with `padding-bottom: 20%`), proving more vertical airspace for the jump mechanics.

## [2026-02-26] - Polish & Tweaks (Controls, Dash, Sprint, Platforms)
### Added
- `script.js`: Added "Double Tap to Sprint". Tapping a directional key (`ArrowLeft/A` or `ArrowRight/D`) twice within 250ms triggers a sprint state, increasing max speed and acceleration (`SPRINT_MAX_SPEED = 1200`, `SPRINT_ACCELERATION = 4000`).
- `script.js`: Added **AABB Collision** to allow the player to collide with solid platforms. Separated X and Y movement steps in the `gameLoop` for accurate collision resolution (head-bonking, landing, and wall-hugging).
- `style.css`: Added `.platform` class to render purely aesthetic solid rectangles in the DOM that map exactly to the physics engine coordinates.
- `script.js`: Updated jump logic to use an `entity.onGround` state tracked by the platform collider, allowing jumping off arbitrary surfaces rather than just `y === 0`.
### Changed
- `script.js`: Fixed a bug where players couldn't jump immediately after landing from a long fall. The jump buffer now correctly queues a ground jump if the jump key is pressed slightly before hitting the floor, rather than burning the double jump.
- `script.js`: Refined the dash mechanic. Added dynamic vertical velocity to the dash based on current movement state (arcs upwards if jumping, angles downwards if falling, slight bump if flat).
- `script.js`: Applied 20% normal gravity (`ay = GRAVITY_Y * 0.2`) during the dash so it travels in a natural arc.
- `script.js`: Prevented the dash from being deliberately canceled or reversed mid-dash by pressing the opposite movement key.
- `script.js`: Increased `FAST_FALL_GRAVITY` from `6000` to `15000` based on user feedback, making the fast fall act more like a downward dash.
- `script.js`: Added the `Up Arrow` (`ArrowUp`) as an additional input for jumping to pair naturally with the `Down Arrow` fast fall.

## [2026-02-26] - Fast Fall Mechanic
### Added
- `script.js`: Added Fast Falling. Holding `Down` or `S` while moving downwards (or near the peak of a jump) drastically increases gravity (`ay = 6000`), allowing for precise, rapid landings.

## [2026-02-26] - Dash Mechanic
### Added
- `script.js`: Added Dash ability. Pressing `Shift` creates a 0.15-second horizontal burst of speed (`DASH_SPEED = 2000`) in the facing direction, suspending gravity and normal friction. Includes a 0.5-second cooldown.

## [2026-02-26] - Double Jump
### Added
- `script.js`: Added `hasDoubleJumped` state to the physics entity. You can now press the jump key a second time while in the air to execute a double jump.

## [2026-02-26] - Polish & Tweaks
### Changed
- `style.css`: Reduced the square size from 100x100 to 40x40 to make the movement mechanics feel more proportional to its visual weight.

## [2026-02-26] - Variable Jump Height
### Added
- `script.js`: Added jump cut logic in `handleKeyUp`. Releasing the jump key (Space or W) while moving upwards reduces the upward velocity, allowing for short taps to result in small hops, and holding the button to provide full jump height.

## [2026-02-26] - Refactoring
### Changed
- `index.html`: Extracted all physics, movement logic, and event listeners out of the HTML file.
- `script.js`: Created a new file to hold the extracted JavaScript game loop and logic for better code organization.

## [2026-02-26] - Enhanced Controls (Horizontal & Buffering & Friction)
### Added
- `index.html`: Added left and right movement using Arrow keys and A/D keys.
- `index.html`: Implemented a 150ms "Jump Buffer" allowing a split-millisecond late/early space click to register exactly upon landing.
- `index.html`: Added 'W' key mapping for jump.
### Changed
- `index.html`: Refactored horizontal movement to use acceleration (`ax`) and friction in the physics engine, replacing rigid velocity setting. This adds inertia and sliding.

## [2026-02-26] - Physics Engine Integration
### Changed
- `index.html`: Replaced CSS animation jump with a JavaScript `gameLoop` using `requestAnimationFrame`, Euler integration for gravity and velocity, and floor collision detection based on IBM tutorial listings.
- `style.css`: Removed CSS animations. The square now moves using DOM `transform: translateY` updated by the JS physics engine.
