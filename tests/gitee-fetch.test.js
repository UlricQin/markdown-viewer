const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
let fetches = 0
let allowed = true
const context = {
  md: {}, URL, Uint8Array, btoa,
  chrome: {permissions: {contains: async () => allowed}},
  fetch: async (_url, options) => {
    fetches++
    assert.equal(options.credentials, 'include')
    return {ok: true, url: 'https://raw.giteeusercontent.com/signed', headers: {get: () => 'image/png'}, arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer}
  },
}
vm.runInNewContext(fs.readFileSync('background/gitee-images.js', 'utf8'), context)
const source = 'https://raw.giteeusercontent.com/owner/repo/raw/main/article.md?signature=secret'
const image = 'https://gitee.com/owner/repo/raw/main/assets/img.png'
;(async () => {
  assert.equal(await context.md.giteeImage(image, source), 'data:image/png;base64,AQID')
  await assert.rejects(context.md.giteeImage('https://gitee.com/other/repo/raw/main/a.png', source), /Unsupported/)
  allowed = false
  await assert.rejects(context.md.giteeImage(image, source), /Allow access/)
  assert.equal(fetches, 1)
  console.log('Authenticated Gitee image checks passed')
})().catch((err) => { console.error(err); process.exitCode = 1 })
