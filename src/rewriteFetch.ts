import { getGlobalObject } from './utils'

const self = getGlobalObject()

const support = {
  searchParams: 'URLSearchParams' in self,
  iterable: 'Symbol' in self && 'iterator' in Symbol,
  blob:
    'FileReader' in self &&
    'Blob' in self &&
    (function () {
      try {
        new Blob()
        return true
      } catch (e) {
        return false
      }
    })(),
  formData: 'FormData' in self,
  arrayBuffer: 'ArrayBuffer' in self,
}

function parseHeaders(rawHeaders: any) {
  const headers = new Headers()
  // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
  // https://tools.ietf.org/html/rfc7230#section-3.2
  const preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ')
  preProcessedHeaders.split(/\r?\n/).forEach(function (line: any) {
    const parts = line.split(':')
    const key = parts.shift().trim()
    if (key) {
      const value = parts.join(':').trim()
      headers.append(key, value)
    }
  })
  return headers
}

export default () => {
  globalThis.fetch = function (input, init) {
    return new Promise(function (resolve, reject) {
      const request = new Request(input, init)

      if (request.signal && request.signal.aborted) {
        return reject(new DOMException('Aborted', 'AbortError'))
      }

      const xhr = new XMLHttpRequest()

      function abortXhr() {
        xhr.abort()
      }

      xhr.onload = function () {
        const options: any = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || ''),
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
        const body = 'response' in xhr ? xhr.response : xhr['responseText']
        resolve(new Response(body, options))
      }

      xhr.onerror = function () {
        reject(TypeError('Network request failed'))
      }

      xhr.ontimeout = function () {
        reject(TypeError('Network request failed'))
      }

      xhr.onabort = function () {
        reject(new DOMException('Aborted', 'AbortError'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function (value, name) {
        xhr.setRequestHeader(name, value)
      })

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr)

        xhr.onreadystatechange = function () {
          // DONE (success or failure)
          if (xhr.readyState === 4) {
            request.signal.removeEventListener('abort', abortXhr)
          }
        }
      }

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
}
