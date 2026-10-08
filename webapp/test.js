// Run: node webapp/test.js
const assert = require('node:assert/strict');

global.window = {basename: '/mm'};
const {isMarkdown, asCodeBlock, fileUrl} = require('./main.js');

assert.equal(isMarkdown({extension: 'md'}), true);
assert.equal(isMarkdown({extension: 'MARKDOWN'}), true);
assert.equal(isMarkdown({extension: 'txt'}), false);
assert.equal(isMarkdown({}), false);

assert.equal(asCodeBlock('plain'), '```markdown\nplain\n```');
assert.equal(asCodeBlock('a\n```js\nx\n```'), '````markdown\na\n```js\nx\n```\n````');

assert.equal(fileUrl('abc/../x'), '/mm/api/v4/files/abc%2F..%2Fx');
window.basename = undefined;
assert.equal(fileUrl('abc'), '/api/v4/files/abc');

console.log('ok');
