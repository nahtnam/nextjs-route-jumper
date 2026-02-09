import * as vscode from 'vscode';
import * as path from 'path';
import { discoverAppRoutes, discoverPagesRoutes, mergeRoutes, type RouteEntry } from './parser';

const TYPE_LABELS: Record<RouteEntry['type'], string> = {
  page: 'page',
  layout: 'layout',
  template: 'template',
  route: 'route handler',
};

const log = vscode.window.createOutputChannel('Next.js Route Jumper', { log: true });

export function activate(context: vscode.ExtensionContext) {
  log.info('Extension activated');

  const disposable = vscode.commands.registerCommand('nextjs-route-jumper.openRoute', async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      log.warn('No workspace folder open');
      vscode.window.showWarningMessage('No workspace folder open.');
      return;
    }

    // Verify this is a Next.js project
    const nextConfigFiles = await vscode.workspace.findFiles(
      '**/next.config.{ts,mts,js,mjs,cjs}',
      '**/node_modules/**',
      1,
    );
    if (nextConfigFiles.length === 0) {
      // Silently bail — another extension (e.g. TanStack Route Jumper)
      // may share the same keybinding and should handle the shortcut instead.
      log.debug('No next.config.* found, skipping');
      return;
    }

    log.info(`Found next.config: ${nextConfigFiles[0].fsPath}`);

    // Find App Router files (page, layout, template, route)
    const appFiles = await vscode.workspace.findFiles(
      '**/app/**/{page,layout,template,route}.{tsx,ts,jsx,js}',
      '**/node_modules/**',
    );

    // Find Pages Router files (any .tsx/.ts/.jsx/.js in pages/)
    const pagesFiles = await vscode.workspace.findFiles(
      '**/pages/**/*.{tsx,ts,jsx,js}',
      '**/node_modules/**',
    );

    log.info(`Found ${appFiles.length} app file(s), ${pagesFiles.length} pages file(s)`);

    if (appFiles.length === 0 && pagesFiles.length === 0) {
      log.warn('No route files found in app/ or pages/ directories');
      vscode.window.showWarningMessage('No Next.js routes found in this workspace.');
      return;
    }

    // Process App Router files
    const appDirResults = groupByDirectory(appFiles, 'app');
    const appRoutes: RouteEntry[] = [];
    let primaryAppDir: vscode.Uri | undefined;

    if (appDirResults.length > 0) {
      const first = appDirResults[0];
      primaryAppDir = first.dirUri;
      appRoutes.push(...discoverAppRoutes(first.relativePaths));
    }

    // Process Pages Router files
    const pagesDirResults = groupByDirectory(pagesFiles, 'pages');
    const pagesRoutes: RouteEntry[] = [];
    let primaryPagesDir: vscode.Uri | undefined;

    if (pagesDirResults.length > 0) {
      const first = pagesDirResults[0];
      primaryPagesDir = first.dirUri;
      pagesRoutes.push(...discoverPagesRoutes(first.relativePaths));
    }

    // Merge: App Router wins on clashes
    const routes = mergeRoutes(appRoutes, pagesRoutes);

    log.info(`Discovered ${appRoutes.length} app route(s), ${pagesRoutes.length} pages route(s), ${routes.length} merged`);

    if (routes.length === 0) {
      log.warn('All files were filtered out — no routes to show');
      vscode.window.showInformationMessage('No routes found.');
      return;
    }

    // Build a set of app-router file paths for quick lookup
    const appFilePaths = new Set(appRoutes.map(r => r.filePath));

    const items = routes.map(r => ({
      label: r.routePath,
      description: `[${TYPE_LABELS[r.type]}] ${r.filePath}`,
      filePath: r.filePath,
      isAppRouter: appFilePaths.has(r.filePath),
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a route to open',
      matchOnDescription: true,
    });

    if (!selected) {
      return;
    }

    // Resolve against the correct directory
    const baseDir = selected.isAppRouter ? primaryAppDir : primaryPagesDir;
    if (!baseDir) {
      vscode.window.showWarningMessage('Could not resolve file path.');
      return;
    }

    const fullPath = vscode.Uri.joinPath(baseDir, selected.filePath);
    const doc = await vscode.workspace.openTextDocument(fullPath);
    await vscode.window.showTextDocument(doc);
  });

  context.subscriptions.push(disposable);
}

interface DirResult {
  dirUri: vscode.Uri;
  relativePaths: string[];
}

/**
 * Group files by their containing directory (app/ or pages/).
 * Handles both src/dir/ and dir/ layouts.
 */
function groupByDirectory(files: vscode.Uri[], dirName: string): DirResult[] {
  const dirMap = new Map<string, { uri: vscode.Uri; paths: string[] }>();

  for (const file of files) {
    const filePath = file.fsPath;
    const dirPath = findDirectory(filePath, dirName);
    if (!dirPath) {
      continue;
    }

    if (!dirMap.has(dirPath)) {
      dirMap.set(dirPath, { uri: vscode.Uri.file(dirPath), paths: [] });
    }

    const relativePath = path.relative(dirPath, filePath);
    dirMap.get(dirPath)!.paths.push(relativePath);
  }

  return Array.from(dirMap.values()).map(({ uri, paths }) => ({
    dirUri: uri,
    relativePaths: paths,
  }));
}

/**
 * Find the nearest app/ or pages/ directory in a file path.
 * Prefers src/dirName/ over dirName/.
 */
function findDirectory(filePath: string, dirName: string): string | null {
  const srcDir = path.sep + 'src' + path.sep + dirName + path.sep;
  const srcIndex = filePath.indexOf(srcDir);
  if (srcIndex !== -1) {
    return filePath.substring(0, srcIndex) + path.sep + 'src' + path.sep + dirName;
  }

  const plainDir = path.sep + dirName + path.sep;
  const plainIndex = filePath.indexOf(plainDir);
  if (plainIndex !== -1) {
    return filePath.substring(0, plainIndex) + path.sep + dirName;
  }

  return null;
}

export function deactivate() {}
