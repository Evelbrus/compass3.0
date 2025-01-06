const fs = require('fs');
const path = require('path');

function getRoutes(directory, basePath = '') {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  let routes = [];

  entries.forEach((entry) => {
    const fullPath = path.join(directory, entry.name);
    let routePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      if (entry.name.startsWith('[') && entry.name.endsWith(']')) {
        const paramName = entry.name.slice(1, -1);
        routePath = path.join(basePath, `:${paramName}`);
      }
      routes = [...routes, ...getRoutes(fullPath, routePath)];
    } else if (entry.name === 'page.tsx') {
      routePath = routePath.replace(/\\/g, '/').replace('/page.tsx', '');

      if (!routePath.startsWith('/')) {
        routePath = '/' + routePath;
      }

      routes.push(routePath);
    }
  });

  return routes;
}

try {
  const profileDirectory = path.join(__dirname, '../../../../apps/next-app/src/app/(profile)');
  const dashboardDirectory = path.join(__dirname, '../../../../apps/next-app/src/app/(admin)');

  const protectedPaths = getRoutes(profileDirectory);
  const protectedDashboardPaths = getRoutes(dashboardDirectory);

  const outputPath = path.join(__dirname, 'routesConfig.ts');
  fs.writeFileSync(
    outputPath,
    `export const protectedPaths = ${JSON.stringify(protectedPaths, null, 2)};
          export const protectedDashboardPaths = ${JSON.stringify(protectedDashboardPaths, null, 2)};`,
  );
} catch (error) {
  console.error('Ошибка:', error.message);
}
