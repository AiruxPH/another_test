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
