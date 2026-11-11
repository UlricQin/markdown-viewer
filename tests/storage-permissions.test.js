const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')

const removed = []
let granted = []
const context = {
  md: {},
  chrome: {
    runtime: {getURL: (path) => path, getManifest: () => ({host_permissions: ['file:///*', 'https://gitee.com/*', 'https://raw.giteeusercontent.com/*']})},
    permissions: {
      getAll: (callback) => callback({origins: granted}),
      remove: (permissions, callback) => { removed.push(permissions.origins); callback() },
    },
  },
  console,
}
vm.runInNewContext(fs.readFileSync('background/storage.js', 'utf8'), context)
const clean = context.md.storage.bug

granted = ['file:///*', 'https://gitee.com/*', 'https://raw.giteeusercontent.com/*', 'https://example.com/*']
clean({})
assert.equal(removed.length, 0, 'first install must not remove permissions')
clean({origins: {'file://': {}, 'https://example.com': {}}})
assert.equal(removed.length, 0, 'required and configured permissions must remain')
clean({origins: {'file://': {}}})
assert.deepEqual(Array.from(removed[0]), ['https://example.com/*'])
const compilers = {
  marked: {defaults: {}},
  remark: {defaults: {}},
  'markdown-it': {defaults: {}},
}
const defaults = context.md.storage.defaults(compilers)
assert.ok(defaults.origins['https://gitee.com'])
assert.ok(defaults.origins['https://raw.giteeusercontent.com'])
const existing = JSON.parse(JSON.stringify(defaults))
delete existing.origins['https://gitee.com']
delete existing.origins['https://raw.giteeusercontent.com']
context.md.storage.migrations(existing)
assert.equal(existing.origins['https://gitee.com'].match, existing.match)
assert.equal(existing.origins['https://raw.giteeusercontent.com'].match, existing.match)
console.log('Storage permission and migration checks passed')
