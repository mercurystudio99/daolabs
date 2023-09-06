// For sticker directory, spit out a list of sticker names

import fs from 'fs';

const files = fs.readdirSync('./static/stickers');
const names = files.map((file) => `"${file}"`);
console.log(names.join(',\n'));
