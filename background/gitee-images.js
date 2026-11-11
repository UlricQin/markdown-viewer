// Resolve a Gitee image using the browser profile's existing Gitee session.
md.giteeImage = async (url, senderUrl) => {
  var source = new URL(senderUrl)
  var image = new URL(url)
  var sourceRepo = /^\/([^/]+)\/([^/]+)\/raw\/[^/]+\//.exec(source.pathname)
  var imageRepo = /^\/([^/]+)\/([^/]+)\/raw\/[^/]+\//.exec(image.pathname)
  if (source.protocol !== 'https:' || source.hostname !== 'raw.giteeusercontent.com' ||
      image.protocol !== 'https:' || image.hostname !== 'gitee.com' ||
      !sourceRepo || !imageRepo || sourceRepo[1] !== imageRepo[1] || sourceRepo[2] !== imageRepo[2]) {
    throw new Error('Unsupported Gitee image')
  }
  var permitted = await chrome.permissions.contains({origins: ['https://gitee.com/*', 'https://raw.giteeusercontent.com/*']})
  if (!permitted) throw new Error('Allow access to gitee.com and raw.giteeusercontent.com in extension settings')
  var response = await fetch(image.href, {credentials: 'include'})
  if (!response.ok) throw new Error('Gitee returned HTTP ' + response.status)
  var finalUrl = new URL(response.url)
  if (finalUrl.protocol !== 'https:' || !['gitee.com', 'raw.giteeusercontent.com'].includes(finalUrl.hostname)) {
    throw new Error('Unsupported Gitee image redirect')
  }
  var type = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
  if (!/^image\/(png|jpeg|gif|webp|avif|bmp|x-icon|vnd\.microsoft\.icon)$/.test(type)) {
    throw new Error('Gitee did not return a supported image')
  }
  var bytes = new Uint8Array(await response.arrayBuffer())
  var chunks = []
  for (var i = 0; i < bytes.length; i += 0x8000) {
    chunks.push(String.fromCharCode(...bytes.subarray(i, i + 0x8000)))
  }
  return 'data:' + type + ';base64,' + btoa(chunks.join(''))
}
