# Next.js Route Jumper

Quickly jump to any route's source file in [Next.js](https://nextjs.org) projects. Supports both App Router and Pages Router.

Scans your `app` and `pages` directories and presents every route in a searchable QuickPick. Select a route and jump straight to its source file.

## App Router support

- **File conventions**: `page`, `layout`, `template`, `route` (handler)
- **Segment conventions**: route groups `(name)`, dynamic `[param]`, catch-all `[...slug]`, optional catch-all `[[...slug]]`
- **Parallel routes**: `@slot` files included, slot stripped from URL
- **Intercepting routes**: `(.)`, `(..)`, `(...)` preserved
- **Private folders**: `_folder` subtrees excluded

## Pages Router support

- **File-based routing**: `index.tsx` → `/`, `about.tsx` → `/about`
- **Dynamic segments**: `[slug].tsx`, `[...slug].tsx`, `[[...slug]].tsx`
- **API routes**: `api/` files detected as route handlers
- **Special files**: `_app`, `_document`, `_error` excluded

## Mixed usage

When both routers are present, App Router entries take priority on clashes. Non-overlapping routes are merged and sorted together.

Works with both `app/` and `src/app/`, `pages/` and `src/pages/`.

## Usage

Open the command palette and run **Next.js Route Jumper: Open**, or use the keyboard shortcut:

| Platform        | Shortcut             |
| --------------- | -------------------- |
| macOS           | `Cmd + Shift + R`    |
| Windows / Linux | `Ctrl + Shift + R`   |

## Requirements

Your project must use Next.js with the App Router (`app` directory), Pages Router (`pages` directory), or both.

## Installation

Search for **Next.js Route Jumper** in the VS Code Extensions sidebar, or install from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/).

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on [GitHub](https://github.com/nahtnam/nextjs-route-jumper).

## License

[MIT](LICENSE)
