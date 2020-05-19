const autoComplete = (dig: string) => (dig.length === 1 ? `0${dig}` : dig)

export const getTimeString = (time: Date | null) => {
  if (!time) {
    time = new Date()
  }
  const [h, m, s] = [time.getHours(), time.getMinutes(), time.getSeconds()].map((d) =>
    autoComplete(d.toString())
  )
  return `${h}:${m}:${s}`
}

export const getDateString = (time: Date) => {
  const year = time.getFullYear()
  const [month, date] = [time.getMonth() + 1, time.getDate()].map((d) => autoComplete(d.toString()))
  return `${year}-${month}-${date}`
}

export const getPrefixedText = (txt: string) => `[LOG4FE] - ${txt}`

export const styledSupport = /chrome|firefox/gi.test(navigator.userAgent)

export const resolveUrl = (url: string) => {
  if (!window.document) {
    return url
  }
  const a = window.document.createElement('a')
  a.href = url
  return `${a.protocol}//${a.host}${a.pathname}${a.search}${a.hash}`
}

export const checkIsIncognitoMode = () => {
  try {
    const testKey = 'check-incognito'
    window.localStorage.setItem(testKey, '1')
    window.localStorage.removeItem(testKey)
    return false
  } catch (error) {
    return true
  }
}

export const getUUID = () => {
  let time = Date.now()
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    time += performance.now()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = (time + Math.random() * 16) % 16 | 0
    time = Math.floor(time / 16)
    return (char === 'x' ? rand : (rand & 0x3) | 0x8).toString(16)
  })
}

interface QueryMap {
  [key: string]: string | string[]
}

export const getQuery = () => {
  const ret: QueryMap = {}
  if (!window.location) {
    return ret
  }
  const { search } = window.location
  if (!search) {
    return {}
  }
  const splited = search
    .slice(1)
    .split('&')
    .map((str) => str.split('='))
  splited.forEach(([key, val]) => {
    val = decodeURIComponent(val)
    const target = ret[key]
    if (target) {
      if (Array.isArray(target)) {
        target.push(val)
      } else {
        ret[key] = [target, val]
      }
    } else {
      ret[key] = val
    }
  })
  return ret
}

export const doNothing = () => {}
