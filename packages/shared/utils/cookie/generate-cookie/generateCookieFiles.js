const fs = require('fs');
const path = require('path');

function generateRandomString(length = 16) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const COOKIE_NAMES = ['accessToken', 'refreshToken', 'userProfile', 'lang'];

const OUTPUT_PATH = path.join(__dirname, 'cookieName.ts');

const generatedCookieNames = COOKIE_NAMES.reduce((acc, cookieName) => {
  acc[cookieName] = generateRandomString();
  return acc;
}, {});

const fileContent = `
export const cookieNames = {
  ${Object.entries(generatedCookieNames)
    .map(([key, value]) => `${key}: '${value}'`)
    .join(',\n  ')}
};

export const ACCESS_TOKEN_COOKIE = cookieNames.accessToken;
export const REFRESH_TOKEN_COOKIE = cookieNames.refreshToken;
export const USER_PROFILE_COOKIE = cookieNames.userProfile;
export const LANG_COOKIE = cookieNames.lang;
`;

fs.writeFileSync(OUTPUT_PATH, fileContent, 'utf8');
