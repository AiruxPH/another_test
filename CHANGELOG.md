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
