import * as assert from 'assert';
import {
  computeAppRoute,
  discoverAppRoutes,
  computePagesRoute,
  discoverPagesRoutes,
  mergeRoutes,
} from '../parser';

// ============================================================
// App Router — computeAppRoute
// ============================================================

describe('computeAppRoute', () => {
  // --- page files ---
  it('should parse root page', () => {
    assert.deepStrictEqual(computeAppRoute('page.tsx'), {
      routePath: '/', filePath: 'page.tsx', type: 'page',
    });
  });

  it('should parse nested page', () => {
    assert.deepStrictEqual(computeAppRoute('blog/page.tsx'), {
      routePath: '/blog', filePath: 'blog/page.tsx', type: 'page',
    });
  });

  it('should parse deeply nested page', () => {
    assert.deepStrictEqual(computeAppRoute('dashboard/settings/profile/page.tsx'), {
      routePath: '/dashboard/settings/profile',
      filePath: 'dashboard/settings/profile/page.tsx',
      type: 'page',
    });
  });

  // --- layout files ---
  it('should parse root layout', () => {
    assert.deepStrictEqual(computeAppRoute('layout.tsx'), {
      routePath: '/', filePath: 'layout.tsx', type: 'layout',
    });
  });

  it('should parse nested layout', () => {
    assert.deepStrictEqual(computeAppRoute('blog/layout.tsx'), {
      routePath: '/blog', filePath: 'blog/layout.tsx', type: 'layout',
    });
  });

  it('should parse layout in route group', () => {
    assert.deepStrictEqual(computeAppRoute('(web)/layout.tsx'), {
      routePath: '/', filePath: '(web)/layout.tsx', type: 'layout',
    });
  });

  it('should parse layout in nested route group', () => {
    assert.deepStrictEqual(computeAppRoute('(app)/(dashboard)/layout.tsx'), {
      routePath: '/', filePath: '(app)/(dashboard)/layout.tsx', type: 'layout',
    });
  });

  it('should parse layout under real segment inside route group', () => {
    assert.deepStrictEqual(computeAppRoute('(web)/blog/layout.tsx'), {
      routePath: '/blog', filePath: '(web)/blog/layout.tsx', type: 'layout',
    });
  });

  // --- template files ---
  it('should parse root template', () => {
    assert.deepStrictEqual(computeAppRoute('template.tsx'), {
      routePath: '/', filePath: 'template.tsx', type: 'template',
    });
  });

  it('should parse nested template', () => {
    assert.deepStrictEqual(computeAppRoute('dashboard/template.tsx'), {
      routePath: '/dashboard', filePath: 'dashboard/template.tsx', type: 'template',
    });
  });

  it('should parse template in route group', () => {
    assert.deepStrictEqual(computeAppRoute('(auth)/template.tsx'), {
      routePath: '/', filePath: '(auth)/template.tsx', type: 'template',
    });
  });

  // --- route (handler) files ---
  it('should parse API route handler', () => {
    assert.deepStrictEqual(computeAppRoute('api/users/route.ts'), {
      routePath: '/api/users', filePath: 'api/users/route.ts', type: 'route',
    });
  });

  it('should parse API route with dynamic segment', () => {
    assert.deepStrictEqual(computeAppRoute('api/users/[id]/route.ts'), {
      routePath: '/api/users/[id]', filePath: 'api/users/[id]/route.ts', type: 'route',
    });
  });

  it('should parse API route in route group', () => {
    assert.deepStrictEqual(computeAppRoute('(cms)/api/outstatic/[[...ost]]/route.ts'), {
      routePath: '/api/outstatic/[[...ost]]',
      filePath: '(cms)/api/outstatic/[[...ost]]/route.ts',
      type: 'route',
    });
  });

  it('should parse root API route', () => {
    assert.deepStrictEqual(computeAppRoute('api/route.ts'), {
      routePath: '/api', filePath: 'api/route.ts', type: 'route',
    });
  });

  // --- dynamic segments ---
  it('should parse [param]', () => {
    assert.deepStrictEqual(computeAppRoute('blog/[slug]/page.tsx'), {
      routePath: '/blog/[slug]', filePath: 'blog/[slug]/page.tsx', type: 'page',
    });
  });

  it('should parse catch-all [...slug]', () => {
    assert.deepStrictEqual(computeAppRoute('docs/[...slug]/page.tsx'), {
      routePath: '/docs/[...slug]', filePath: 'docs/[...slug]/page.tsx', type: 'page',
    });
  });

  it('should parse optional catch-all [[...slug]]', () => {
    assert.deepStrictEqual(computeAppRoute('outstatic/[[...ost]]/page.tsx'), {
      routePath: '/outstatic/[[...ost]]',
      filePath: 'outstatic/[[...ost]]/page.tsx',
      type: 'page',
    });
  });

  it('should parse multiple dynamic segments', () => {
    assert.deepStrictEqual(computeAppRoute('shop/[category]/[product]/page.tsx'), {
      routePath: '/shop/[category]/[product]',
      filePath: 'shop/[category]/[product]/page.tsx',
      type: 'page',
    });
  });

  it('should parse layout with dynamic segment', () => {
    assert.deepStrictEqual(computeAppRoute('blog/[slug]/layout.tsx'), {
      routePath: '/blog/[slug]', filePath: 'blog/[slug]/layout.tsx', type: 'layout',
    });
  });

  // --- route groups ---
  it('should strip single route group', () => {
    assert.deepStrictEqual(computeAppRoute('(web)/page.tsx'), {
      routePath: '/', filePath: '(web)/page.tsx', type: 'page',
    });
  });

  it('should strip route group from nested path', () => {
    assert.deepStrictEqual(computeAppRoute('(web)/blog/page.tsx'), {
      routePath: '/blog', filePath: '(web)/blog/page.tsx', type: 'page',
    });
  });

  it('should strip multiple route groups', () => {
    assert.deepStrictEqual(computeAppRoute('(marketing)/(web)/blog/page.tsx'), {
      routePath: '/blog', filePath: '(marketing)/(web)/blog/page.tsx', type: 'page',
    });
  });

  it('should handle route group names with hyphens', () => {
    assert.deepStrictEqual(computeAppRoute('(my-group)/about/page.tsx'), {
      routePath: '/about', filePath: '(my-group)/about/page.tsx', type: 'page',
    });
  });

  it('should handle route group names with underscores', () => {
    assert.deepStrictEqual(computeAppRoute('(my_group)/about/page.tsx'), {
      routePath: '/about', filePath: '(my_group)/about/page.tsx', type: 'page',
    });
  });

  it('should handle route group names with numbers', () => {
    assert.deepStrictEqual(computeAppRoute('(group1)/about/page.tsx'), {
      routePath: '/about', filePath: '(group1)/about/page.tsx', type: 'page',
    });
  });

  // --- parallel routes (@slots) — included, stripped from URL ---
  it('should include page in parallel slot and strip @slot from URL', () => {
    assert.deepStrictEqual(computeAppRoute('@modal/page.tsx'), {
      routePath: '/', filePath: '@modal/page.tsx', type: 'page',
    });
  });

  it('should include nested parallel slot page', () => {
    assert.deepStrictEqual(computeAppRoute('dashboard/@analytics/page.tsx'), {
      routePath: '/dashboard', filePath: 'dashboard/@analytics/page.tsx', type: 'page',
    });
  });

  it('should include layout in parallel slot', () => {
    assert.deepStrictEqual(computeAppRoute('@modal/layout.tsx'), {
      routePath: '/', filePath: '@modal/layout.tsx', type: 'layout',
    });
  });

  it('should include template in parallel slot', () => {
    assert.deepStrictEqual(computeAppRoute('dashboard/@team/template.tsx'), {
      routePath: '/dashboard', filePath: 'dashboard/@team/template.tsx', type: 'template',
    });
  });

  it('should include nested page under parallel slot', () => {
    assert.deepStrictEqual(computeAppRoute('dashboard/@team/members/page.tsx'), {
      routePath: '/dashboard/members',
      filePath: 'dashboard/@team/members/page.tsx',
      type: 'page',
    });
  });

  it('should handle parallel slot combined with route group', () => {
    assert.deepStrictEqual(computeAppRoute('(app)/@sidebar/settings/page.tsx'), {
      routePath: '/settings', filePath: '(app)/@sidebar/settings/page.tsx', type: 'page',
    });
  });

  it('should handle intercepting route inside parallel slot', () => {
    assert.deepStrictEqual(computeAppRoute('@modal/(.)photo/[id]/page.tsx'), {
      routePath: '/(.)photo/[id]',
      filePath: '@modal/(.)photo/[id]/page.tsx',
      type: 'page',
    });
  });

  // --- private folders (_prefix) — excluded ---
  it('should exclude files in private folders', () => {
    assert.strictEqual(computeAppRoute('_components/something/page.tsx'), null);
  });

  it('should exclude files in nested private folders', () => {
    assert.strictEqual(computeAppRoute('blog/_utils/page.tsx'), null);
  });

  it('should exclude deeply nested private folder paths', () => {
    assert.strictEqual(computeAppRoute('dashboard/settings/_internal/admin/page.tsx'), null);
  });

  it('should exclude layout in private folder', () => {
    assert.strictEqual(computeAppRoute('_private/layout.tsx'), null);
  });

  // --- intercepting routes — preserved in URL ---
  it('should preserve (.)name intercepting routes', () => {
    assert.deepStrictEqual(computeAppRoute('feed/(.)photo/[id]/page.tsx'), {
      routePath: '/feed/(.)photo/[id]',
      filePath: 'feed/(.)photo/[id]/page.tsx',
      type: 'page',
    });
  });

  it('should preserve (..)name intercepting routes', () => {
    assert.deepStrictEqual(computeAppRoute('feed/(..)photo/page.tsx'), {
      routePath: '/feed/(..)photo',
      filePath: 'feed/(..)photo/page.tsx',
      type: 'page',
    });
  });

  it('should preserve (...)name intercepting routes', () => {
    assert.deepStrictEqual(computeAppRoute('feed/(...)settings/page.tsx'), {
      routePath: '/feed/(...)settings',
      filePath: 'feed/(...)settings/page.tsx',
      type: 'page',
    });
  });

  // --- non-convention files — excluded ---
  it('should return null for loading files', () => {
    assert.strictEqual(computeAppRoute('loading.tsx'), null);
  });

  it('should return null for error files', () => {
    assert.strictEqual(computeAppRoute('error.tsx'), null);
  });

  it('should return null for not-found files', () => {
    assert.strictEqual(computeAppRoute('not-found.tsx'), null);
  });

  it('should return null for default files', () => {
    assert.strictEqual(computeAppRoute('default.tsx'), null);
  });

  it('should return null for arbitrary TypeScript files', () => {
    assert.strictEqual(computeAppRoute('utils/helpers.ts'), null);
  });

  it('should return null for CSS files', () => {
    assert.strictEqual(computeAppRoute('globals.css'), null);
  });

  // --- file extensions ---
  it('should accept page.ts', () => {
    assert.deepStrictEqual(computeAppRoute('about/page.ts'), {
      routePath: '/about', filePath: 'about/page.ts', type: 'page',
    });
  });

  it('should accept page.jsx', () => {
    assert.deepStrictEqual(computeAppRoute('about/page.jsx'), {
      routePath: '/about', filePath: 'about/page.jsx', type: 'page',
    });
  });

  it('should accept page.js', () => {
    assert.deepStrictEqual(computeAppRoute('about/page.js'), {
      routePath: '/about', filePath: 'about/page.js', type: 'page',
    });
  });

  it('should accept layout.ts', () => {
    assert.deepStrictEqual(computeAppRoute('layout.ts'), {
      routePath: '/', filePath: 'layout.ts', type: 'layout',
    });
  });

  it('should accept layout.jsx', () => {
    assert.deepStrictEqual(computeAppRoute('layout.jsx'), {
      routePath: '/', filePath: 'layout.jsx', type: 'layout',
    });
  });

  it('should accept layout.js', () => {
    assert.deepStrictEqual(computeAppRoute('layout.js'), {
      routePath: '/', filePath: 'layout.js', type: 'layout',
    });
  });

  it('should accept template.ts', () => {
    assert.deepStrictEqual(computeAppRoute('template.ts'), {
      routePath: '/', filePath: 'template.ts', type: 'template',
    });
  });

  it('should accept route.tsx', () => {
    assert.deepStrictEqual(computeAppRoute('api/route.tsx'), {
      routePath: '/api', filePath: 'api/route.tsx', type: 'route',
    });
  });

  it('should accept route.js', () => {
    assert.deepStrictEqual(computeAppRoute('api/route.js'), {
      routePath: '/api', filePath: 'api/route.js', type: 'route',
    });
  });

  it('should accept route.jsx', () => {
    assert.deepStrictEqual(computeAppRoute('api/route.jsx'), {
      routePath: '/api', filePath: 'api/route.jsx', type: 'route',
    });
  });

  it('should return null for page.css', () => {
    assert.strictEqual(computeAppRoute('about/page.css'), null);
  });

  it('should return null for layout.md', () => {
    assert.strictEqual(computeAppRoute('layout.md'), null);
  });
});

// ============================================================
// App Router — discoverAppRoutes
// ============================================================

describe('discoverAppRoutes', () => {
  it('should return empty array for empty input', () => {
    assert.deepStrictEqual(discoverAppRoutes([]), []);
  });

  it('should return empty array when no convention files exist', () => {
    const files = [
      'loading.tsx',
      'error.tsx',
      'not-found.tsx',
      'globals.css',
      '_utils/helpers.ts',
    ];
    assert.deepStrictEqual(discoverAppRoutes(files), []);
  });

  it('should sort by route path then type (page before layout)', () => {
    const files = [
      'blog/layout.tsx',
      'blog/page.tsx',
      'layout.tsx',
      'page.tsx',
    ];
    const result = discoverAppRoutes(files);
    assert.deepStrictEqual(result, [
      { routePath: '/', filePath: 'page.tsx', type: 'page' },
      { routePath: '/', filePath: 'layout.tsx', type: 'layout' },
      { routePath: '/blog', filePath: 'blog/page.tsx', type: 'page' },
      { routePath: '/blog', filePath: 'blog/layout.tsx', type: 'layout' },
    ]);
  });

  it('should sort page → layout → template → route for same path', () => {
    const files = [
      'dashboard/template.tsx',
      'dashboard/layout.tsx',
      'dashboard/page.tsx',
    ];
    const result = discoverAppRoutes(files);
    assert.deepStrictEqual(result.map(r => r.type), ['page', 'layout', 'template']);
  });

  it('should handle mixed types across routes', () => {
    const files = [
      'page.tsx',
      'layout.tsx',
      'blog/page.tsx',
      'api/users/route.ts',
      'dashboard/template.tsx',
      'dashboard/page.tsx',
    ];
    const result = discoverAppRoutes(files);
    assert.deepStrictEqual(result, [
      { routePath: '/', filePath: 'page.tsx', type: 'page' },
      { routePath: '/', filePath: 'layout.tsx', type: 'layout' },
      { routePath: '/api/users', filePath: 'api/users/route.ts', type: 'route' },
      { routePath: '/blog', filePath: 'blog/page.tsx', type: 'page' },
      { routePath: '/dashboard', filePath: 'dashboard/page.tsx', type: 'page' },
      { routePath: '/dashboard', filePath: 'dashboard/template.tsx', type: 'template' },
    ]);
  });

  it('should include parallel route files', () => {
    const files = [
      'page.tsx',
      'layout.tsx',
      '@modal/page.tsx',
      '@modal/layout.tsx',
      'dashboard/@analytics/page.tsx',
    ];
    const result = discoverAppRoutes(files);
    assert.deepStrictEqual(result, [
      { routePath: '/', filePath: 'page.tsx', type: 'page' },
      { routePath: '/', filePath: '@modal/page.tsx', type: 'page' },
      { routePath: '/', filePath: 'layout.tsx', type: 'layout' },
      { routePath: '/', filePath: '@modal/layout.tsx', type: 'layout' },
      { routePath: '/dashboard', filePath: 'dashboard/@analytics/page.tsx', type: 'page' },
    ]);
  });

  it('should filter out non-convention files and private folders', () => {
    const files = [
      'page.tsx',
      'layout.tsx',
      'loading.tsx',
      'error.tsx',
      'blog/page.tsx',
      'blog/loading.tsx',
      '_components/footer/index.tsx',
      'globals.css',
    ];
    const result = discoverAppRoutes(files);
    assert.deepStrictEqual(result, [
      { routePath: '/', filePath: 'page.tsx', type: 'page' },
      { routePath: '/', filePath: 'layout.tsx', type: 'layout' },
      { routePath: '/blog', filePath: 'blog/page.tsx', type: 'page' },
    ]);
  });

  it('should handle route groups correctly', () => {
    const files = [
      '(web)/page.tsx',
      '(web)/layout.tsx',
      '(web)/blog/page.tsx',
      '(web)/blog/[slug]/page.tsx',
      '(cms)/layout.tsx',
      '(cms)/outstatic/[[...ost]]/page.tsx',
      '(cms)/api/outstatic/[[...ost]]/route.ts',
    ];
    const result = discoverAppRoutes(files);
    assert.deepStrictEqual(result, [
      { routePath: '/', filePath: '(web)/page.tsx', type: 'page' },
      { routePath: '/', filePath: '(web)/layout.tsx', type: 'layout' },
      { routePath: '/', filePath: '(cms)/layout.tsx', type: 'layout' },
      { routePath: '/api/outstatic/[[...ost]]', filePath: '(cms)/api/outstatic/[[...ost]]/route.ts', type: 'route' },
      { routePath: '/blog', filePath: '(web)/blog/page.tsx', type: 'page' },
      { routePath: '/blog/[slug]', filePath: '(web)/blog/[slug]/page.tsx', type: 'page' },
      { routePath: '/outstatic/[[...ost]]', filePath: '(cms)/outstatic/[[...ost]]/page.tsx', type: 'page' },
    ]);
  });

  it('should handle real-world scenario (ludicrous-old1)', () => {
    const files = [
      '(cms)/layout.tsx',
      '(cms)/types.ts',
      '(cms)/_utils/fetch.ts',
      '(cms)/api/outstatic/[[...ost]]/route.ts',
      '(cms)/outstatic/[[...ost]]/page.tsx',
      '(web)/_components/footer/index.tsx',
      '(web)/_components/navbar/index.tsx',
      '(web)/_components/navbar/index.client.tsx',
      '(web)/globals.css',
      '(web)/layout.tsx',
      '(web)/not-found.tsx',
      '(web)/page.tsx',
      '(web)/blog/page.tsx',
      '(web)/blog/[slug]/page.tsx',
    ];
    const result = discoverAppRoutes(files);
    assert.deepStrictEqual(result, [
      { routePath: '/', filePath: '(web)/page.tsx', type: 'page' },
      { routePath: '/', filePath: '(cms)/layout.tsx', type: 'layout' },
      { routePath: '/', filePath: '(web)/layout.tsx', type: 'layout' },
      { routePath: '/api/outstatic/[[...ost]]', filePath: '(cms)/api/outstatic/[[...ost]]/route.ts', type: 'route' },
      { routePath: '/blog', filePath: '(web)/blog/page.tsx', type: 'page' },
      { routePath: '/blog/[slug]', filePath: '(web)/blog/[slug]/page.tsx', type: 'page' },
      { routePath: '/outstatic/[[...ost]]', filePath: '(cms)/outstatic/[[...ost]]/page.tsx', type: 'page' },
    ]);
  });

  it('should handle deeply nested dynamic routes with layouts', () => {
    const files = [
      'dashboard/layout.tsx',
      'dashboard/page.tsx',
      'dashboard/[orgId]/layout.tsx',
      'dashboard/[orgId]/page.tsx',
      'dashboard/[orgId]/settings/[settingId]/page.tsx',
    ];
    const result = discoverAppRoutes(files);
    assert.deepStrictEqual(result, [
      { routePath: '/dashboard', filePath: 'dashboard/page.tsx', type: 'page' },
      { routePath: '/dashboard', filePath: 'dashboard/layout.tsx', type: 'layout' },
      { routePath: '/dashboard/[orgId]', filePath: 'dashboard/[orgId]/page.tsx', type: 'page' },
      { routePath: '/dashboard/[orgId]', filePath: 'dashboard/[orgId]/layout.tsx', type: 'layout' },
      { routePath: '/dashboard/[orgId]/settings/[settingId]', filePath: 'dashboard/[orgId]/settings/[settingId]/page.tsx', type: 'page' },
    ]);
  });

  it('should handle multiple route groups at different levels', () => {
    const files = [
      '(marketing)/page.tsx',
      '(marketing)/layout.tsx',
      '(app)/(dashboard)/overview/page.tsx',
      '(app)/(dashboard)/settings/page.tsx',
      '(app)/(auth)/login/page.tsx',
      '(app)/(auth)/layout.tsx',
    ];
    const result = discoverAppRoutes(files);
    assert.deepStrictEqual(result, [
      { routePath: '/', filePath: '(marketing)/page.tsx', type: 'page' },
      { routePath: '/', filePath: '(marketing)/layout.tsx', type: 'layout' },
      { routePath: '/', filePath: '(app)/(auth)/layout.tsx', type: 'layout' },
      { routePath: '/login', filePath: '(app)/(auth)/login/page.tsx', type: 'page' },
      { routePath: '/overview', filePath: '(app)/(dashboard)/overview/page.tsx', type: 'page' },
      { routePath: '/settings', filePath: '(app)/(dashboard)/settings/page.tsx', type: 'page' },
    ]);
  });

  it('should handle catch-all API routes', () => {
    const files = [
      'api/[...path]/route.ts',
      'api/auth/[...nextauth]/route.ts',
    ];
    const result = discoverAppRoutes(files);
    assert.deepStrictEqual(result, [
      { routePath: '/api/[...path]', filePath: 'api/[...path]/route.ts', type: 'route' },
      { routePath: '/api/auth/[...nextauth]', filePath: 'api/auth/[...nextauth]/route.ts', type: 'route' },
    ]);
  });

  it('should handle mixed file extensions', () => {
    const files = [
      'page.tsx',
      'layout.js',
      'blog/page.jsx',
      'api/health/route.ts',
    ];
    const result = discoverAppRoutes(files);
    assert.deepStrictEqual(result, [
      { routePath: '/', filePath: 'page.tsx', type: 'page' },
      { routePath: '/', filePath: 'layout.js', type: 'layout' },
      { routePath: '/api/health', filePath: 'api/health/route.ts', type: 'route' },
      { routePath: '/blog', filePath: 'blog/page.jsx', type: 'page' },
    ]);
  });
});

// ============================================================
// Pages Router — computePagesRoute
// ============================================================

describe('computePagesRoute', () => {
  // --- basic routes ---
  it('should parse index.tsx as root', () => {
    assert.deepStrictEqual(computePagesRoute('index.tsx'), {
      routePath: '/', filePath: 'index.tsx', type: 'page',
    });
  });

  it('should parse about.tsx', () => {
    assert.deepStrictEqual(computePagesRoute('about.tsx'), {
      routePath: '/about', filePath: 'about.tsx', type: 'page',
    });
  });

  it('should parse nested file route', () => {
    assert.deepStrictEqual(computePagesRoute('blog/post.tsx'), {
      routePath: '/blog/post', filePath: 'blog/post.tsx', type: 'page',
    });
  });

  it('should parse nested index route', () => {
    assert.deepStrictEqual(computePagesRoute('blog/index.tsx'), {
      routePath: '/blog', filePath: 'blog/index.tsx', type: 'page',
    });
  });

  it('should parse deeply nested route', () => {
    assert.deepStrictEqual(computePagesRoute('products/category/item.tsx'), {
      routePath: '/products/category/item',
      filePath: 'products/category/item.tsx',
      type: 'page',
    });
  });

  // --- dynamic segments ---
  it('should parse [param] file', () => {
    assert.deepStrictEqual(computePagesRoute('blog/[slug].tsx'), {
      routePath: '/blog/[slug]', filePath: 'blog/[slug].tsx', type: 'page',
    });
  });

  it('should parse [param] folder with index', () => {
    assert.deepStrictEqual(computePagesRoute('blog/[slug]/index.tsx'), {
      routePath: '/blog/[slug]', filePath: 'blog/[slug]/index.tsx', type: 'page',
    });
  });

  it('should parse nested file under dynamic folder', () => {
    assert.deepStrictEqual(computePagesRoute('blog/[slug]/comments.tsx'), {
      routePath: '/blog/[slug]/comments',
      filePath: 'blog/[slug]/comments.tsx',
      type: 'page',
    });
  });

  it('should parse multiple dynamic segments', () => {
    assert.deepStrictEqual(computePagesRoute('users/[userId]/posts/[postId].tsx'), {
      routePath: '/users/[userId]/posts/[postId]',
      filePath: 'users/[userId]/posts/[postId].tsx',
      type: 'page',
    });
  });

  it('should parse catch-all [...slug]', () => {
    assert.deepStrictEqual(computePagesRoute('docs/[...slug].tsx'), {
      routePath: '/docs/[...slug]', filePath: 'docs/[...slug].tsx', type: 'page',
    });
  });

  it('should parse optional catch-all [[...slug]]', () => {
    assert.deepStrictEqual(computePagesRoute('blog/[[...slug]].tsx'), {
      routePath: '/blog/[[...slug]]', filePath: 'blog/[[...slug]].tsx', type: 'page',
    });
  });

  // --- API routes ---
  it('should parse api route as route handler', () => {
    assert.deepStrictEqual(computePagesRoute('api/users.ts'), {
      routePath: '/api/users', filePath: 'api/users.ts', type: 'route',
    });
  });

  it('should parse api index route', () => {
    assert.deepStrictEqual(computePagesRoute('api/index.ts'), {
      routePath: '/api', filePath: 'api/index.ts', type: 'route',
    });
  });

  it('should parse dynamic api route', () => {
    assert.deepStrictEqual(computePagesRoute('api/posts/[id].ts'), {
      routePath: '/api/posts/[id]', filePath: 'api/posts/[id].ts', type: 'route',
    });
  });

  it('should parse catch-all api route', () => {
    assert.deepStrictEqual(computePagesRoute('api/auth/[...nextauth].ts'), {
      routePath: '/api/auth/[...nextauth]',
      filePath: 'api/auth/[...nextauth].ts',
      type: 'route',
    });
  });

  it('should parse nested api route', () => {
    assert.deepStrictEqual(computePagesRoute('api/v1/users/list.ts'), {
      routePath: '/api/v1/users/list',
      filePath: 'api/v1/users/list.ts',
      type: 'route',
    });
  });

  // --- special files — excluded ---
  it('should exclude _app', () => {
    assert.strictEqual(computePagesRoute('_app.tsx'), null);
  });

  it('should exclude _document', () => {
    assert.strictEqual(computePagesRoute('_document.tsx'), null);
  });

  it('should exclude _error', () => {
    assert.strictEqual(computePagesRoute('_error.tsx'), null);
  });

  // --- non-JS files — excluded ---
  it('should return null for CSS files', () => {
    assert.strictEqual(computePagesRoute('styles/globals.css'), null);
  });

  it('should return null for JSON files', () => {
    assert.strictEqual(computePagesRoute('data.json'), null);
  });

  it('should return null for markdown files', () => {
    assert.strictEqual(computePagesRoute('about.md'), null);
  });

  // --- file extensions ---
  it('should accept .ts', () => {
    assert.deepStrictEqual(computePagesRoute('about.ts'), {
      routePath: '/about', filePath: 'about.ts', type: 'page',
    });
  });

  it('should accept .jsx', () => {
    assert.deepStrictEqual(computePagesRoute('about.jsx'), {
      routePath: '/about', filePath: 'about.jsx', type: 'page',
    });
  });

  it('should accept .js', () => {
    assert.deepStrictEqual(computePagesRoute('about.js'), {
      routePath: '/about', filePath: 'about.js', type: 'page',
    });
  });
});

// ============================================================
// Pages Router — discoverPagesRoutes
// ============================================================

describe('discoverPagesRoutes', () => {
  it('should return empty array for empty input', () => {
    assert.deepStrictEqual(discoverPagesRoutes([]), []);
  });

  it('should return empty array when only special files exist', () => {
    const files = ['_app.tsx', '_document.tsx', '_error.tsx'];
    assert.deepStrictEqual(discoverPagesRoutes(files), []);
  });

  it('should discover basic routes sorted', () => {
    const files = [
      'blog.tsx',
      'about.tsx',
      'index.tsx',
      'contact.tsx',
    ];
    const result = discoverPagesRoutes(files);
    assert.deepStrictEqual(result.map(r => r.routePath), [
      '/',
      '/about',
      '/blog',
      '/contact',
    ]);
  });

  it('should handle mixed page and API routes', () => {
    const files = [
      'index.tsx',
      'api/users.ts',
      'blog/index.tsx',
      'api/posts/[id].ts',
    ];
    const result = discoverPagesRoutes(files);
    assert.deepStrictEqual(result, [
      { routePath: '/', filePath: 'index.tsx', type: 'page' },
      { routePath: '/api/posts/[id]', filePath: 'api/posts/[id].ts', type: 'route' },
      { routePath: '/api/users', filePath: 'api/users.ts', type: 'route' },
      { routePath: '/blog', filePath: 'blog/index.tsx', type: 'page' },
    ]);
  });

  it('should filter out special files', () => {
    const files = [
      '_app.tsx',
      '_document.tsx',
      '_error.tsx',
      'index.tsx',
      'about.tsx',
    ];
    const result = discoverPagesRoutes(files);
    assert.deepStrictEqual(result, [
      { routePath: '/', filePath: 'index.tsx', type: 'page' },
      { routePath: '/about', filePath: 'about.tsx', type: 'page' },
    ]);
  });

  it('should filter out non-JS files', () => {
    const files = [
      'index.tsx',
      'styles/globals.css',
      'data.json',
      'README.md',
    ];
    const result = discoverPagesRoutes(files);
    assert.deepStrictEqual(result, [
      { routePath: '/', filePath: 'index.tsx', type: 'page' },
    ]);
  });

  it('should handle complex pages router structure', () => {
    const files = [
      '_app.tsx',
      '_document.tsx',
      'index.tsx',
      'about.tsx',
      'blog/index.tsx',
      'blog/[slug].tsx',
      'docs/[...slug].tsx',
      'api/users.ts',
      'api/posts/[id].ts',
      'api/auth/[...nextauth].ts',
      'dashboard/settings.tsx',
      'dashboard/[orgId]/index.tsx',
    ];
    const result = discoverPagesRoutes(files);
    assert.deepStrictEqual(result, [
      { routePath: '/', filePath: 'index.tsx', type: 'page' },
      { routePath: '/about', filePath: 'about.tsx', type: 'page' },
      { routePath: '/api/auth/[...nextauth]', filePath: 'api/auth/[...nextauth].ts', type: 'route' },
      { routePath: '/api/posts/[id]', filePath: 'api/posts/[id].ts', type: 'route' },
      { routePath: '/api/users', filePath: 'api/users.ts', type: 'route' },
      { routePath: '/blog', filePath: 'blog/index.tsx', type: 'page' },
      { routePath: '/blog/[slug]', filePath: 'blog/[slug].tsx', type: 'page' },
      { routePath: '/dashboard/[orgId]', filePath: 'dashboard/[orgId]/index.tsx', type: 'page' },
      { routePath: '/dashboard/settings', filePath: 'dashboard/settings.tsx', type: 'page' },
      { routePath: '/docs/[...slug]', filePath: 'docs/[...slug].tsx', type: 'page' },
    ]);
  });

  it('should handle optional catch-all at root', () => {
    const files = [
      '[[...slug]].tsx',
    ];
    const result = discoverPagesRoutes(files);
    assert.deepStrictEqual(result, [
      { routePath: '/[[...slug]]', filePath: '[[...slug]].tsx', type: 'page' },
    ]);
  });

  it('should handle mixed file extensions', () => {
    const files = [
      'index.tsx',
      'about.js',
      'blog.jsx',
      'api/health.ts',
    ];
    const result = discoverPagesRoutes(files);
    assert.deepStrictEqual(result, [
      { routePath: '/', filePath: 'index.tsx', type: 'page' },
      { routePath: '/about', filePath: 'about.js', type: 'page' },
      { routePath: '/api/health', filePath: 'api/health.ts', type: 'route' },
      { routePath: '/blog', filePath: 'blog.jsx', type: 'page' },
    ]);
  });
});

// ============================================================
// mergeRoutes
// ============================================================

describe('mergeRoutes', () => {
  it('should return app routes when pages is empty', () => {
    const appRoutes = [
      { routePath: '/', filePath: 'page.tsx', type: 'page' as const },
    ];
    const result = mergeRoutes(appRoutes, []);
    assert.deepStrictEqual(result, appRoutes);
  });

  it('should return pages routes when app is empty', () => {
    const pagesRoutes = [
      { routePath: '/', filePath: 'index.tsx', type: 'page' as const },
    ];
    const result = mergeRoutes([], pagesRoutes);
    assert.deepStrictEqual(result, pagesRoutes);
  });

  it('should return empty when both are empty', () => {
    assert.deepStrictEqual(mergeRoutes([], []), []);
  });

  it('should prefer app route over pages route for same path+type', () => {
    const appRoutes = [
      { routePath: '/', filePath: 'page.tsx', type: 'page' as const },
    ];
    const pagesRoutes = [
      { routePath: '/', filePath: 'index.tsx', type: 'page' as const },
    ];
    const result = mergeRoutes(appRoutes, pagesRoutes);
    assert.deepStrictEqual(result, [
      { routePath: '/', filePath: 'page.tsx', type: 'page' as const },
    ]);
  });

  it('should keep both when same path but different types', () => {
    const appRoutes = [
      { routePath: '/dashboard', filePath: 'dashboard/layout.tsx', type: 'layout' as const },
    ];
    const pagesRoutes = [
      { routePath: '/dashboard', filePath: 'dashboard.tsx', type: 'page' as const },
    ];
    const result = mergeRoutes(appRoutes, pagesRoutes);
    assert.deepStrictEqual(result, [
      { routePath: '/dashboard', filePath: 'dashboard.tsx', type: 'page' as const },
      { routePath: '/dashboard', filePath: 'dashboard/layout.tsx', type: 'layout' as const },
    ]);
  });

  it('should prefer app API route over pages API route', () => {
    const appRoutes = [
      { routePath: '/api/users', filePath: 'api/users/route.ts', type: 'route' as const },
    ];
    const pagesRoutes = [
      { routePath: '/api/users', filePath: 'api/users.ts', type: 'route' as const },
    ];
    const result = mergeRoutes(appRoutes, pagesRoutes);
    assert.deepStrictEqual(result, [
      { routePath: '/api/users', filePath: 'api/users/route.ts', type: 'route' as const },
    ]);
  });

  it('should merge non-overlapping routes and sort', () => {
    const appRoutes = [
      { routePath: '/', filePath: 'page.tsx', type: 'page' as const },
      { routePath: '/', filePath: 'layout.tsx', type: 'layout' as const },
      { routePath: '/blog', filePath: 'blog/page.tsx', type: 'page' as const },
    ];
    const pagesRoutes = [
      { routePath: '/about', filePath: 'about.tsx', type: 'page' as const },
      { routePath: '/api/users', filePath: 'api/users.ts', type: 'route' as const },
    ];
    const result = mergeRoutes(appRoutes, pagesRoutes);
    assert.deepStrictEqual(result, [
      { routePath: '/', filePath: 'page.tsx', type: 'page' as const },
      { routePath: '/', filePath: 'layout.tsx', type: 'layout' as const },
      { routePath: '/about', filePath: 'about.tsx', type: 'page' as const },
      { routePath: '/api/users', filePath: 'api/users.ts', type: 'route' as const },
      { routePath: '/blog', filePath: 'blog/page.tsx', type: 'page' as const },
    ]);
  });

  it('should handle complex mixed scenario', () => {
    const appRoutes = [
      { routePath: '/', filePath: 'page.tsx', type: 'page' as const },
      { routePath: '/', filePath: 'layout.tsx', type: 'layout' as const },
      { routePath: '/blog', filePath: 'blog/page.tsx', type: 'page' as const },
      { routePath: '/api/users', filePath: 'api/users/route.ts', type: 'route' as const },
    ];
    const pagesRoutes = [
      { routePath: '/', filePath: 'index.tsx', type: 'page' as const },         // clash → dropped
      { routePath: '/about', filePath: 'about.tsx', type: 'page' as const },     // unique → kept
      { routePath: '/blog', filePath: 'blog.tsx', type: 'page' as const },       // clash → dropped
      { routePath: '/api/users', filePath: 'api/users.ts', type: 'route' as const }, // clash → dropped
      { routePath: '/api/posts', filePath: 'api/posts.ts', type: 'route' as const }, // unique → kept
    ];
    const result = mergeRoutes(appRoutes, pagesRoutes);
    assert.deepStrictEqual(result, [
      { routePath: '/', filePath: 'page.tsx', type: 'page' as const },
      { routePath: '/', filePath: 'layout.tsx', type: 'layout' as const },
      { routePath: '/about', filePath: 'about.tsx', type: 'page' as const },
      { routePath: '/api/posts', filePath: 'api/posts.ts', type: 'route' as const },
      { routePath: '/api/users', filePath: 'api/users/route.ts', type: 'route' as const },
      { routePath: '/blog', filePath: 'blog/page.tsx', type: 'page' as const },
    ]);
  });
});
