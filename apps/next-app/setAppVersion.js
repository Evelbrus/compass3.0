const fs = require('fs');
const packageJson = require('./package.json');

const appVersion = packageJson.version;

fs.writeFileSync('.env.app', `APP_VERSION=${appVersion}\n`);
