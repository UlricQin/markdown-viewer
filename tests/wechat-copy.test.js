const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const context = {URL, document: {createElement: (name) => {
  assert.equal(name, 'textarea')
  return {set innerHTML(value) {
    this.value = value.replace(/&(?:amp|quot|lt|gt|#39|#x27);/g, entity => ({
      '&amp;': '&', '&quot;': '"', '&lt;': '<', '&gt;': '>', '&#39;': "'", '&#x27;': "'",
    })[entity])
  }}
}}}
vm.createContext(context)
for (const file of ['vendor/marked.min.js', 'vendor/wechat-highlight.min.js', 'popup/wechat.js']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), context)
}
const sample = `---\ntitle: example\n---\n# 标题\n\n## 二级标题\n\n**重点** [链接](https://example.com)\n\n![封面](assets/pic.png)\n\n\`\`\`js\nconst value = 1;\n\`\`\``
const result = context.formatWechat(sample, 'https://raw.giteeusercontent.com/a/b/raw/main/post.md?signature=secret')
assert.match(result.html, /background-color: rgb\(33, 33, 34\)/)
assert.match(result.html, /参考资料/)
assert.match(result.html, /https:\/\/example.com/)
assert.match(result.html, /https:\/\/gitee.com\/a\/b\/raw\/main\/assets\/pic.png/)
assert.doesNotMatch(result.html, /signature=secret/)
assert.match(result.html, /#c678dd/)
assert.ok(result.warnings.some(w => w.includes('Gitee')))
const embedded = context.formatWechat(sample, 'https://raw.giteeusercontent.com/a/b/raw/main/post.md?signature=secret', {
  'https://gitee.com/a/b/raw/main/assets/pic.png': 'data:image/png;base64,AQID',
})
assert.match(embedded.html, /src="data:image\/png;base64,AQID"/)
assert.ok(!embedded.warnings.some(w => w.includes('Gitee')))
const invalid = context.formatWechat(sample, 'https://raw.giteeusercontent.com/a/b/raw/main/post.md', {
  'https://gitee.com/a/b/raw/main/assets/pic.png': 'data:image/svg+xml;base64,abc',
})
assert.ok(invalid.warnings.some(w => w.includes('Gitee')))
const quotes = context.formatWechat('正文 "hello" & < 5；`"inline"`；["链接"](https://example.com)\n\n!["图片"](pic.png)\n\n```js\nconst x = "code";\n```', 'https://example.com/a.md')
assert.doesNotMatch(quotes.html, /&amp;quot;/)
assert.match(quotes.html, /&quot;hello&quot; &amp; &lt; 5/)
assert.match(quotes.html, /&quot;inline&quot;/)
assert.match(quotes.html, /&quot;链接&quot;/)
assert.match(quotes.html, /alt="&quot;图片&quot;"/)
assert.match(quotes.html, /&quot;code&quot;/)
const literal = context.formatWechat('`&quot;`', 'https://example.com/a.md')
assert.match(literal.html, /&amp;quot;/)
const entities = context.formatWechat('# &quot;标题&quot; &amp; &#39;单引号&#39; &copy;\n\n- A &amp; B \\& \\* \\<\n\n| &lt;表头&gt; | 内容 |\n|---|---|\n| **A &amp; B** | `&lt;literal&gt;` |\n\n[**A &amp; B**](https://example.com/?x=1&amp;y=2)\n\n![&quot;A&quot; &amp; B](https://example.com/a.png?x=1&amp;y=2)', 'https://example.com/article.md')
assert.match(entities.html, /&quot;标题&quot; &amp; &#39;单引号&#39; &copy;/)
assert.match(entities.html, /A &amp; B &amp; \* &lt;/)
assert.match(entities.html, /&lt;表头&gt;/)
assert.match(entities.html, /&amp;lt;literal&amp;gt;/)
assert.match(entities.html, /\[1\] A &amp; B：/)
assert.match(entities.html, /https:\/\/example.com\/\?x=1&amp;y=2/)
assert.match(entities.html, /src="https:\/\/example.com\/a.png\?x=1&amp;y=2"/)
assert.doesNotMatch(entities.html, /&amp;amp; B/)
const codeChars = context.formatWechat('```text\n<a title="x"> &amp; \' \u4e2d\n```\n\n```js\nconst s = "a & b < c";\n```', 'https://example.com/article.md')
assert.match(codeChars.html, /&lt;a&nbsp;title=&quot;x&quot;&gt;&nbsp;&amp;amp;/)
assert.match(codeChars.html, /a&nbsp;&amp;&nbsp;b&nbsp;&lt;&nbsp;c/)
const sameLink = context.formatWechat('[一 &amp; 二](https://example.com/?x=1&amp;y=2) [再一次](https://example.com/?x=1&y=2)', 'https://example.com/article.md')
assert.equal((sameLink.html.match(/\[1\]/g) || []).length, 3)
assert.doesNotMatch(sameLink.html, /\[2\]/)
const again = context.formatWechat('纯文本', 'file:///tmp/example.md')
assert.doesNotMatch(again.html, /参考资料/)
assert.equal(again.warnings.length, 0)
const local = context.formatWechat('![图片](photo.png)', 'file:///tmp/example.md')
assert.ok(local.warnings.some(w => w.includes('本地图片')))
console.log('WeChat copy formatting checks passed')
