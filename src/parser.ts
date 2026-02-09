import * as path from 'path';

export interface RouteEntry {
  routePath: string;
  filePath: string;
  type: 'page' | 'layout' | 'template' | 'route';
}

// --- Shared constants ---

const JS_EXTENSIONS = /\.(tsx|ts|jsx|js)$/;

// --- App Router constants ---

const ROUTE_GROUP_PATTERN = /^\([a-zA-Z0-9_-]+\)$/;
const PRIVATE_FOLDER_PATTERN = /^_/;
const PARALLEL_SLOT_PATTERN = /^@/;

const APP_FILE_TYPE_PATTERNS: Array<{ pattern: RegExp; type: RouteEntry['type'] }> = [
  { pattern: /^page\.(tsx|ts|jsx|js)$/, type: 'page' },
  { pattern: /^layout\.(tsx|ts|jsx|js)$/, type: 'layout' },
  { pattern: /^template\.(tsx|ts|jsx|js)$/, type: 'template' },
  { pattern: /^route\.(tsx|ts|jsx|js)$/, type: 'route' },
];

// --- Pages Router constants ---

const PAGES_SPECIAL_FILES = new Set(['_app', '_document', '_error']);

// --- Sort order ---

const TYPE_SORT_ORDER: Record<RouteEntry['type'], number> = {
  page: 0,
  layout: 1,
  template: 2,
  route: 3,
};

function sortEntries(entries: RouteEntry[]): RouteEntry[] {
  return entries.sort((a, b) => {
    const pathCmp = a.routePath.localeCompare(b.routePath);
    if (pathCmp !== 0) {
      return pathCmp;
    }
    return TYPE_SORT_ORDER[a.type] - TYPE_SORT_ORDER[b.type];
  });
}

// ============================================================
// App Router
// ============================================================

/**
 * Discover routes from App Router file paths (relative to app/ directory).
 *
 * Supported file conventions: page, layout, template, route
 *
 * Segment handling:
 *   Route groups (name)     → stripped from URL, files included
 *   Parallel slots @name    → stripped from URL, files included
 *   Private folders _name   → entire subtree excluded
 *   Intercepting (.)name    → preserved in URL (not a route group)
 *   Dynamic [param]         → preserved in URL
 *   Catch-all [...param]    → preserved in URL
 *   Optional [[...param]]   → preserved in URL
 */
export function discoverAppRoutes(filePathsRelativeToAppDir: string[]): RouteEntry[] {
  const results: RouteEntry[] = [];
  for (const filePath of filePathsRelativeToAppDir) {
    const entry = computeAppRoute(filePath);
    if (entry) {
      results.push(entry);
    }
  }
  return sortEntries(results);
}

export function computeAppRoute(filePath: string): RouteEntry | null {
  const normalized = filePath.split(path.sep).join('/');
  const segments = normalized.split('/');
  const fileName = segments[segments.length - 1];

  let type: RouteEntry['type'] | undefined;
  for (const { pattern, type: t } of APP_FILE_TYPE_PATTERNS) {
    if (pattern.test(fileName)) {
      type = t;
      break;
    }
  }
  if (!type) {
    return null;
  }

  const dirSegments = segments.slice(0, -1);

  // Exclude if any segment is a private folder (_prefix)
  for (const seg of dirSegments) {
    if (PRIVATE_FOLDER_PATTERN.test(seg)) {
      return null;
    }
  }

  // Strip route groups and parallel slots from URL path
  const routeSegments = dirSegments.filter(
    seg => !ROUTE_GROUP_PATTERN.test(seg) && !PARALLEL_SLOT_PATTERN.test(seg),
  );
  const routePath = '/' + routeSegments.join('/');

  return { routePath, filePath: normalized, type };
}

// ============================================================
// Pages Router
// ============================================================

/**
 * Discover routes from Pages Router file paths (relative to pages/ directory).
 *
 * In Pages Router, every .tsx/.ts/.jsx/.js file is a route, except:
 *   _app, _document, _error  → special files, excluded
 *
 * Route mapping:
 *   index.tsx           → parent directory path (e.g., / or /blog)
 *   about.tsx           → /about
 *   blog/[slug].tsx     → /blog/[slug]
 *   api/users.ts        → /api/users (type: route)
 *   [...slug].tsx       → /[...slug]
 *   [[...slug]].tsx     → /[[...slug]]
 */
export function discoverPagesRoutes(filePathsRelativeToPagesDir: string[]): RouteEntry[] {
  const results: RouteEntry[] = [];
  for (const filePath of filePathsRelativeToPagesDir) {
    const entry = computePagesRoute(filePath);
    if (entry) {
      results.push(entry);
    }
  }
  return sortEntries(results);
}

export function computePagesRoute(filePath: string): RouteEntry | null {
  const normalized = filePath.split(path.sep).join('/');

  // Must be a JS/TS file
  if (!JS_EXTENSIONS.test(normalized)) {
    return null;
  }

  // Remove extension to get route segments
  const withoutExt = normalized.replace(JS_EXTENSIONS, '');
  const segments = withoutExt.split('/');
  const baseName = segments[segments.length - 1];

  // Exclude special Pages Router files
  if (PAGES_SPECIAL_FILES.has(baseName)) {
    return null;
  }

  // Determine type: files under api/ are route handlers
  const isApi = segments[0] === 'api';
  const type: RouteEntry['type'] = isApi ? 'route' : 'page';

  // index files map to parent path
  const routeSegments = baseName === 'index' ? segments.slice(0, -1) : segments;
  const routePath = '/' + routeSegments.join('/');

  return { routePath, filePath: normalized, type };
}

// ============================================================
// Merge (App Router takes priority on clashes)
// ============================================================

/**
 * Merge App Router and Pages Router entries. When both routers define
 * the same routePath + type combination, the App Router entry wins.
 */
export function mergeRoutes(appRoutes: RouteEntry[], pagesRoutes: RouteEntry[]): RouteEntry[] {
  const appKeys = new Set(appRoutes.map(r => `${r.routePath}\0${r.type}`));
  const merged = [...appRoutes];

  for (const entry of pagesRoutes) {
    if (!appKeys.has(`${entry.routePath}\0${entry.type}`)) {
      merged.push(entry);
    }
  }

  return sortEntries(merged);
}
