// Signed raw.giteeusercontent.com URLs authorize one file, not its siblings.
// Ask Gitee's raw endpoint to redirect each relative image to its own URL.
function giteeImageUrl (src, pageUrl) {
  try {
    var page = new URL(pageUrl)
    if (page.hostname !== 'raw.giteeusercontent.com' ||
        !/^\/[^/]+\/[^/]+\/raw\/[^/]+\//.test(page.pathname) ||
        !src || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(src)) return null
    var image = new URL(src, page)
    if (image.origin !== page.origin || !/^\/[^/]+\/[^/]+\/raw\/[^/]+\//.test(image.pathname)) return null
    image.hostname = 'gitee.com'
    return image.href
  }
  catch (_) {
    return null
  }
}

function fixGiteeImages (html, pageUrl) {
  if (new URL(pageUrl).hostname !== 'raw.giteeusercontent.com') return html
  var template = document.createElement('template')
  template.innerHTML = html
  template.content.querySelectorAll('img[src]').forEach((img) => {
    var url = giteeImageUrl(img.getAttribute('src'), pageUrl)
    if (url) {
      img.setAttribute('data-gitee-image', url)
      img.removeAttribute('src')
    }
  })
  return template.innerHTML
}

// The cache holds only images fetched for this page and never leaves the browser
// except as part of a copy initiated by the user.
var giteeImageData = Object.create(null)
var giteeImageLoads = []

function loadGiteeImages () {
  document.querySelectorAll('#_html img[data-gitee-image]').forEach((img) => {
    var url = img.getAttribute('data-gitee-image')
    img.removeAttribute('data-gitee-image')
    if (giteeImageData[url]) {
      img.src = giteeImageData[url]
      return
    }
    var pending = new Promise((resolve) => {
      chrome.runtime.sendMessage({message: 'gitee.image', url}, (res) => {
        if (chrome.runtime.lastError || !res || res.error) {
          img.title = (res && res.error) || 'Unable to load Gitee image'
          img.referrerPolicy = 'no-referrer'
          img.src = url
        }
        else {
          giteeImageData[url] = res.src
          img.src = res.src
        }
        resolve()
      })
    })
    giteeImageLoads.push(pending)
  })
}
