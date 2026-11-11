const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const context = {URL}
vm.runInNewContext(fs.readFileSync('content/gitee-images.js', 'utf8'), context)
const resolve = context.giteeImageUrl
const page = 'https://raw.giteeusercontent.com/owner/repo/raw/main/docs/article.md?signature=secret'
assert.equal(resolve('assets/hero.png', page), 'https://gitee.com/owner/repo/raw/main/docs/assets/hero.png')
assert.equal(resolve('../hero.png?size=2', page), 'https://gitee.com/owner/repo/raw/main/hero.png?size=2')
assert.equal(resolve('https://example.com/a.png', page), null)
assert.equal(resolve('//example.com/a.png', page), null)
assert.equal(resolve('data:image/png;base64,abc', page), null)
assert.equal(resolve('assets/a.png', 'https://example.com/article.md'), null)
assert.equal(resolve('../../../outside.png', page), null)
console.log('Gitee image URL checks passed')
