/* eslint-disable prefer-const */
// 是否https 等开头
export const isExternal = (path: string) => {
  return /^(https?:|mailto:|tel:)/.test(path)
}

export const isUrl = (src: string) => {
  try {
    const newUrl = new URL(src)
    return newUrl.protocol === 'http:' || newUrl.protocol === 'https:'
  } catch (err) {
    return false
  }
}

function toDataUrl(url: string): Promise<string | ArrayBuffer | null> {
  return new Promise(function (resolve) {
    const xhr = new XMLHttpRequest()
    xhr.onload = function () {
      const reader = new FileReader()
      reader.onloadend = function () {
        resolve(reader.result)
      }
      reader.readAsDataURL(xhr.response)
    }
    xhr.open('GET', url)
    xhr.responseType = 'blob'
    xhr.send()
  })
}

export async function src2blob(src: string) {
  let dataURL = src
  if (isUrl(src)) {
    dataURL = (await toDataUrl(src)) as string
  }
  if (!dataURL) return
  const arr = dataURL.split(',') as any[]
  let mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}
