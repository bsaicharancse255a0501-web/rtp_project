import * as fs from 'fs';

const text = fs.readFileSync('output.txt', 'utf8');
const regex = /grok-[a-zA-Z0-9.-]+/g;
const matches = text.match(regex);
if (matches) {
  const unique = [...new Set(matches)];
  console.log(unique);
}
