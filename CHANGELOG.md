# Changelog

All notable changes to Next.js Route Jumper will be documented in this file.

## [0.0.1] - 2026-02-08

### Added

- `Next.js Route Jumper: Open` command to jump to any route's source file
- Keyboard shortcut: `Cmd+Shift+R` (macOS) / `Ctrl+Shift+R` (Windows/Linux)
- Automatic activation when workspace contains `next.config.*`
- **App Router support**: `page`, `layout`, `template`, `route` file conventions
  - Route groups `(name)` stripped from URL
  - Parallel routes `@slot` included, slot stripped from URL
  - Private folders `_prefix` excluded
  - Intercepting routes `(.)`, `(..)`, `(...)` preserved
  - Dynamic segments `[param]`, catch-all `[...slug]`, optional catch-all `[[...slug]]`
- **Pages Router support**: file-based routing in `pages/` directory
  - `index.tsx` maps to parent path
  - API routes (`api/`) detected as route handlers
  - Special files `_app`, `_document`, `_error` excluded
- **Mixed usage**: App Router takes priority on clashes, non-overlapping routes merged and sorted
- Works with both `app/` and `src/app/`, `pages/` and `src/pages/`
- Debug logging via Output channel "Next.js Route Jumper"
