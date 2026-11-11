// Adapted from wechat-mp-format/scripts/md2wechat.mjs.
// Each conversion owns its warnings and references so repeated copies stay independent.
function formatWechat (source, pageUrl, images = {}) {
  const hljs = wechatHighlight.default;
const ACCENT = 'rgb(239, 112, 96)';

const S = {
  root: "padding: 0 10px; font-family: Optima, 'Microsoft YaHei', PingFangSC-regular, sans-serif; font-size: 16px; color: rgb(0, 0, 0); line-height: 1.5em; letter-spacing: 0em; word-break: break-word; overflow-wrap: break-word; text-align: left;",
  p: 'color: rgb(0, 0, 0); font-size: 15px; line-height: 1.8em; letter-spacing: 0em; text-align: left; text-indent: 0em; margin: 0; padding: 8px 0;',
  blockquote: 'margin: 20px 0; padding: 10px 10px 10px 20px; border: none; border-left: 3px solid rgba(0, 0, 0, 0.4); background-color: rgba(0, 0, 0, 0.05); display: block; overflow: auto;',
  strong: `color: ${ACCENT}; font-weight: bold;`,
  em: `color: ${ACCENT}; font-style: italic;`,
  del: 'text-decoration: line-through;',
  link: `color: ${ACCENT}; font-weight: bold; word-break: break-all;`,
  footRef: `color: ${ACCENT}; font-size: 12px; line-height: 0;`,
  codespan: `color: ${ACCENT}; font-size: 14px; line-height: 1.8em; letter-spacing: 0em; background-color: rgba(27, 31, 35, 0.05); margin: 0 2px; padding: 2px 4px; border-radius: 4px; overflow-wrap: break-word; font-family: 'Operator Mono', Consolas, Monaco, Menlo, monospace; word-break: break-all;`,
  figure: 'margin: 10px 0; padding: 0; display: flex; flex-direction: column; justify-content: center; align-items: center;',
  img: 'display: block; margin: 0 auto; max-width: 100%;',
  figcaption: 'margin-top: 5px; color: rgb(136, 136, 136); font-size: 14px; line-height: 1.5em; text-align: center;',
  h: {
    1: ['margin: 30px 0 15px; padding: 0; display: block;',
      'font-size: 24px; color: rgb(0, 0, 0); line-height: 1.5em; letter-spacing: 0em; text-align: left; font-weight: bold; display: block;'],
    2: ['margin: 30px 0 15px; padding: 0; background-color: rgb(251, 251, 251); display: block; line-height: 1.5em; text-align: left;',
      'font-size: 18px; color: rgb(255, 255, 255); background-color: rgb(33, 33, 34); line-height: 2.4em; letter-spacing: 0em; padding: 0 30px 0 15px; border-bottom-right-radius: 40px; display: inline-block; font-weight: bold; margin: 0; text-align: left; text-indent: 0em;'],
    3: ['margin: 30px 0 15px; padding: 0; border-top: 1px solid rgb(33, 33, 34); display: flex; line-height: 1.5em; text-align: left;',
      'font-size: 18px; color: rgb(89, 89, 89); border-top: 2px solid rgb(34, 34, 34); line-height: 1.8em; letter-spacing: 0em; padding: 4px 6px 0; display: block; font-weight: bold; margin: 0; text-align: left; text-indent: 0em;'],
    4: ['margin: 30px 0 15px; padding: 0; border-top: 1px solid rgb(33, 33, 34); display: flex; line-height: 1.5em; text-align: left;',
      'font-size: 17px; color: rgb(89, 89, 89); border-top: 2px solid rgb(89, 89, 89); line-height: 1.8em; letter-spacing: 0em; padding: 4px 6px 0; display: block; font-weight: bold; margin: 0; text-align: left; text-indent: 0em;'],
    // 样例未覆盖 h5/h6，沿用正文配色、逐级缩小字号。
    5: ['margin: 30px 0 15px; padding: 0; display: block;',
      'font-size: 16px; color: rgb(89, 89, 89); line-height: 1.5em; font-weight: bold; display: block;'],
    6: ['margin: 30px 0 15px; padding: 0; display: block;',
      'font-size: 15px; color: rgb(89, 89, 89); line-height: 1.5em; font-weight: bold; display: block;'],
  },
  ul: 'list-style-type: disc; margin: 8px 0; padding: 0 0 0 25px; color: rgb(0, 0, 0);',
  ol: 'list-style-type: decimal; margin: 8px 0; padding: 0 0 0 25px; color: rgb(0, 0, 0);',
  liSection: 'margin-top: 5px; margin-bottom: 5px; color: rgb(1, 1, 1); font-size: 15px; line-height: 1.8em; letter-spacing: 0em; text-align: left; font-weight: normal;',
  hr: 'height: 1px; margin: 20px 0; padding: 0; border: none; border-top: 1px solid rgba(0, 0, 0, 0.2);',
  pre: 'border-radius: 5px; box-shadow: rgba(0, 0, 0, 0.55) 0px 2px 10px; text-align: left; margin: 10px 0; padding: 0;',
  // 样例用 mdnice CDN 上的 svg 画三色圆点，该 CDN 有防盗链；这里改成纯 CSS 圆点。
  preDots: 'display: block; height: 30px; padding: 10px 0 0 12px; background-color: #282c34; margin-bottom: -7px; border-radius: 5px; box-sizing: border-box; line-height: 0;',
  preDot: 'display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px;',
  code: 'overflow-x: auto; padding: 16px; color: #abb2bf; padding-top: 15px; background: #282c34; border-radius: 5px; display: -webkit-box; font-family: Consolas, Monaco, Menlo, monospace; font-size: 12px; line-height: 26px;',
  tableWrap: 'margin: 10px 0; overflow-x: auto;',
  table: 'border-collapse: collapse; width: 100%; font-size: 14px; line-height: 1.6em; color: rgb(0, 0, 0);',
  th: 'border: 1px solid rgb(204, 204, 204); padding: 5px 10px; background-color: rgb(240, 240, 240); font-weight: bold;',
  td: 'border: 1px solid rgb(204, 204, 204); padding: 5px 10px;',
  refTitle: 'font-size: 18px; color: rgb(0, 0, 0); line-height: 1.5em; font-weight: bold; margin: 30px 0 10px;',
  refItem: 'font-size: 13px; color: rgb(89, 89, 89); line-height: 1.6em; margin: 4px 0; word-break: break-all;',
};

// atom-one-dark 配色，与样例中的 hljs 颜色一致。
const HLJS = {
  comment: 'color: #5c6370; font-style: italic;', quote: 'color: #5c6370; font-style: italic;',
  doctag: 'color: #c678dd;', keyword: 'color: #c678dd;', formula: 'color: #c678dd;',
  section: 'color: #e06c75;', name: 'color: #e06c75;', 'selector-tag': 'color: #e06c75;', deletion: 'color: #e06c75;', subst: 'color: #e06c75;',
  literal: 'color: #56b6c2;',
  string: 'color: #98c379;', regexp: 'color: #98c379;', addition: 'color: #98c379;', attribute: 'color: #98c379;', 'meta-string': 'color: #98c379;',
  built_in: 'color: #e6c07b;', 'title.class_': 'color: #e6c07b;', 'class': 'color: #e6c07b;',
  attr: 'color: #d19a66;', variable: 'color: #d19a66;', 'template-variable': 'color: #d19a66;', type: 'color: #d19a66;',
  'selector-class': 'color: #d19a66;', 'selector-attr': 'color: #d19a66;', 'selector-pseudo': 'color: #d19a66;', number: 'color: #d19a66;',
  symbol: 'color: #61aeef;', bullet: 'color: #61aeef;', link: 'color: #61aeef; text-decoration: underline;', meta: 'color: #61aeef;',
  'selector-id': 'color: #61aeef;', title: 'color: #61aeef;',
  emphasis: 'font-style: italic;', strong: 'font-weight: bold;',
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Marked leaves entities in URL destinations encoded. Decode once before URL
// resolution, then escape for the destination HTML context when serializing.
function decodeUrlEntities(value) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value;
}

// Inline token text is already HTML-escaped by Marked. Strip formatting from
// reference labels while preserving entities and escaped literal characters.
function referenceLabel(tokens = []) {
  return tokens.map((token) => {
    if (token.tokens) return referenceLabel(token.tokens);
    if (['text', 'escape', 'codespan', 'image'].includes(token.type)) return token.text || '';
    if (token.type === 'br') return ' ';
    if (token.type === 'html') return '';
    return token.raw ? esc(token.raw) : '';
  }).join('');
}

const warnings = [];
const footnotes = [];

function hljsStyle(classAttr) {
  // highlight.js 输出如 "hljs-title class_" 或 "hljs-meta-string"
  const parts = classAttr.split(/\s+/);
  const base = parts[0].replace(/^hljs-/, '');
  const full = [base, ...parts.slice(1)].join('.');
  return HLJS[full] || HLJS[base] || '';
}

const DOTS = ['#ff5f56', '#ffbd2e', '#27c93f'].map((c) => `<span style="${S.preDot} background-color: ${c};"></span>`).join('');

function renderCode(text, lang) {
  let html;
  const language = (lang || '').trim().split(/\s+/)[0].toLowerCase();
  if (language && hljs.getLanguage(language)) {
    html = hljs.highlight(text, { language, ignoreIllegals: true }).value;
  } else {
    html = esc(text);
  }
  html = html.replace(/<span class="([^"]+)">/g, (_, cls) => `<span style="line-height: 26px; ${hljsStyle(cls)}">`);
  // 公众号会吞掉 <pre> 里的空白和换行，只对文本节点把空格、换行换成 &nbsp; 和 <br>。
  html = html.split(/(<[^>]+>)/).map((part) => (part.startsWith('<') ? part
    : part.replace(/\t/g, '    ').replace(/ /g, '&nbsp;').replace(/\n/g, '<br>'))).join('');
  return `<pre style="${S.pre}"><span style="${S.preDots}">${DOTS}</span><code style="${S.code}">${html}<br></code></pre>`;
}

function isRemote(href) {
  return /^https?:\/\//i.test(href);
}

function renderImage(tok) {
  let href = decodeUrlEntities(tok.href);
  try {
    const resolved = new URL(href, pageUrl);
    if (resolved.hostname === 'raw.giteeusercontent.com' && !/^(?:https?:)?\/\//i.test(href)) {
      resolved.hostname = 'gitee.com';
      const cached = images[resolved.href];
      if (typeof cached === 'string' && /^data:image\/(?:png|jpeg|gif|webp|avif|bmp|x-icon|vnd\.microsoft\.icon);base64,[a-z0-9+/=]+$/i.test(cached)) {
        href = cached;
      } else {
        warnings.push('部分 Gitee 图片未能获取，请确认预览已加载图片，然后重新复制。');
      }
    }
    if (!href.startsWith('data:image/')) href = resolved.href;
    if (href.startsWith('data:image/')) { /* Image bytes travel with the copied HTML. */ }
    else if (!isRemote(href)) warnings.push('本地图片不能直接粘贴到公众号，请上传到图床或在公众号中替换。');
    else if (resolved.searchParams.has('signature')) warnings.push('图片链接含有临时签名，可能失效或无法被公众号访问，请更换为公开图片链接。');
  } catch (_) {
    warnings.push('图片地址无效，请在公众号中替换。');
  }
  const alt = tok.text || '';
  // Marked's image alt text is already escaped for HTML.
  const caption = alt ? `<figcaption style="${S.figcaption}">${alt}</figcaption>` : '';
  return `<figure style="${S.figure}"><img src="${esc(href)}" alt="${alt}" style="${S.img}">${caption}</figure>`;
}

function inline(tokens = []) {
  return tokens.map((t) => {
    switch (t.type) {
      case 'text':
        // Marked has already escaped these inline token values.
        return t.tokens ? inline(t.tokens) : t.text;
      case 'escape':
        return t.text;
      case 'strong':
        return `<strong style="${S.strong}">${inline(t.tokens)}</strong>`;
      case 'em':
        return `<em style="${S.em}">${inline(t.tokens)}</em>`;
      case 'del':
        return `<del style="${S.del}">${inline(t.tokens)}</del>`;
      case 'codespan':
        return `<code style="${S.codespan}">${t.text}</code>`;
      case 'br':
        return '<br>';
      case 'image':
        return renderImage(t);
      case 'link': {
        // 公众号正文不允许外链，按 mdnice 的做法改成脚注，文末列出“参考资料”。
        const label = inline(t.tokens);
        const href = decodeUrlEntities(t.href);
        if (t.href === t.text || !isRemote(href)) return `<span style="${S.link}">${label}</span>`;
        let idx = footnotes.findIndex((f) => f.href === href);
        if (idx < 0) idx = footnotes.push({ href, label: referenceLabel(t.tokens) }) - 1;
        return `<span style="${S.link}">${label}</span><sup style="${S.footRef}">[${idx + 1}]</sup>`;
      }
      case 'html':
        return t.raw;
      default:
        return t.raw ? esc(t.raw) : '';
    }
  }).join('');
}

function paragraph(tok) {
  const onlyImages = tok.tokens.every((t) => t.type === 'image' || (t.type === 'text' && !t.text.trim()) || t.type === 'br');
  if (onlyImages && tok.tokens.some((t) => t.type === 'image')) {
    return tok.tokens.filter((t) => t.type === 'image').map(renderImage).join('');
  }
  return `<p style="${S.p}">${inline(tok.tokens)}</p>`;
}

function listItem(item) {
  // 列表项内容包一层 section，与 mdnice 结构一致；嵌套列表等块级内容放在 section 之后。
  const inlineParts = [];
  const blockParts = [];
  for (const t of item.tokens) {
    if (t.type === 'text') inlineParts.push(t.tokens ? inline(t.tokens) : esc(t.text));
    else if (t.type === 'paragraph') inlineParts.push(inline(t.tokens));
    else if (t.type === 'space') continue;
    else blockParts.push(block([t]));
  }
  let prefix = '';
  if (item.task) prefix = item.checked ? '☑ ' : '☐ ';
  return `<li><section style="${S.liSection}">${prefix}${inlineParts.join('<br>')}</section>${blockParts.join('')}</li>`;
}

function table(tok) {
  const align = (i) => (tok.align[i] ? ` text-align: ${tok.align[i]};` : '');
  const head = tok.header.map((c, i) => `<th style="${S.th}${align(i)}">${inline(c.tokens)}</th>`).join('');
  const rows = tok.rows.map((r) => `<tr>${r.map((c, i) => `<td style="${S.td}${align(i)}">${inline(c.tokens)}</td>`).join('')}</tr>`).join('');
  return `<section style="${S.tableWrap}"><table style="${S.table}"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></section>`;
}

function block(tokens) {
  return tokens.map((t) => {
    switch (t.type) {
      case 'space':
        return '';
      case 'heading': {
        const [outer, content] = S.h[t.depth];
        return `<h${t.depth} style="${outer}"><span style="${content}">${inline(t.tokens)}</span></h${t.depth}>`;
      }
      case 'paragraph':
        return paragraph(t);
      case 'text':
        return `<p style="${S.p}">${t.tokens ? inline(t.tokens) : esc(t.text)}</p>`;
      case 'blockquote':
        return `<blockquote style="${S.blockquote}">${block(t.tokens)}</blockquote>`;
      case 'list': {
        const tag = t.ordered ? 'ol' : 'ul';
        const start = t.ordered && t.start !== '' && t.start !== 1 ? ` start="${t.start}"` : '';
        return `<${tag}${start} style="${S[tag]}">${t.items.map(listItem).join('')}</${tag}>`;
      }
      case 'code':
        return renderCode(t.text, t.lang);
      case 'hr':
        return `<hr style="${S.hr}">`;
      case 'table':
        return table(t);
      case 'html':
        return t.raw;
      default:
        return '';
    }
  }).join('\n');
}

function references() {
  if (!footnotes.length) return '';
  const items = footnotes.map((f, i) => `<p style="${S.refItem}">[${i + 1}] ${f.label}：<em style="font-style: italic;">${esc(f.href)}</em></p>`).join('');
  return `<h3 style="margin: 0; padding: 0;"><span style="${S.refTitle} display: block;">参考资料</span></h3><section>${items}</section>`;
}

function stripFrontMatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) return { body: src, title: '' };
  const title = (m[1].match(/^title:\s*["']?(.+?)["']?\s*$/m) || [])[1] || '';
  return { body: src.slice(m[0].length), title };
}


  const {body} = stripFrontMatter(source);
  const tokens = new marked.marked({gfm: true}).lexer(body);
  const content = block(tokens) + references();
  const html = `<section style="${S.root}">${content}</section>`;
  return {html, warnings: [...new Set(warnings)]};
}
