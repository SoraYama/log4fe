import './polyfill'

import rewriteFetch from './rewriteFetch'
import { COLOR_CONFIG, LOG4FE_INIT_CONFIG } from './constants'
import {
  getPrefixedText,
  resolveUrl,
  checkIsIncognitoMode,
  getTimeString,
  getUUID,
  getQuery,
  doNothing,
} from './utils'
import Booster from './booster'
import Logger from './logger'
import { Log4feConfig, LoggerInitParam, LoggerLevel, LogReportFormatter } from './types'

class DevToolsBooster {
  [key: string]: Booster
}

class Log4fe {
  private static _instance: null | Log4fe = null

  public static getInstance(config: Log4feConfig = LOG4FE_INIT_CONFIG) {
    return Log4fe._instance || new Log4fe(config)
  }

  public readonly colors = COLOR_CONFIG

  public loggers = new Map<string, Logger>()

  public queue: any[] = []

  public reqId: string = ''

  public config: Log4feConfig = {}

  public reportFormatter: LogReportFormatter = (
    time: Date,
    level: LoggerLevel,
    loggerName: string,
    reqId: string = this.reqId,
    ...msgs: any[]
  ) => ({
    reqId,
    name: loggerName,
    time: time.getTime(),
    level,
    messages: msgs,
    url: location.href,
    agent: navigator.userAgent,
  })

  public list = () => {
    const relist = this.list
    const output = new DevToolsBooster()
    output.MAIN = new Booster(this.loggers.get('main')!, relist)
    this.loggers.forEach((lgr, key) => {
      if (key === 'main') {
        return
      }
      output[key] = new Booster(lgr, relist)
    })
    this._getConsoleMethod('table')(output)
  }

  private _xhrOpen = XMLHttpRequest.prototype.open

  private _xhrSend = XMLHttpRequest.prototype.send

  private _xhr: null | XMLHttpRequest = null

  private _errorReqCount = 0

  private _lastUnsendCount = 0

  private _timer: number = 0

  private _idFromServer: boolean = false

  private _getConsoleMethod(method: keyof Console) {
    if (console && typeof console[method] === 'function' && this.config.outputToConsole) {
      return console[method].bind(console)
    }
    return doNothing
  }

  constructor(params: Log4feConfig | string) {
    if (Log4fe._instance) {
      throw new Error(getPrefixedText('Log4fe is singleton'))
    }
    if (typeof params === 'undefined') {
      throw new Error(getPrefixedText('Init param must not be empty'))
    }
    if (typeof params === 'string') {
      this._parse({
        url: params,
      })
    } else if (typeof params === 'object') {
      if (typeof params.url !== 'string') {
        throw new Error(getPrefixedText('Url must be string'))
      }
      this._parse(params)
    } else {
      throw new Error(getPrefixedText('Bad init param format'))
    }
    this._init()
  }

  public getLogger(name?: string, options?: Omit<LoggerInitParam, 'name'>) {
    if (!name) {
      return this.loggers.get('main')!
    }
    const lgrInMap = this.loggers.get(name)
    if (!lgrInMap) {
      const logger = new Logger({ name, ...(options || {}) })
      this.loggers.set(name, logger)
      return logger
    }
    return lgrInMap
  }

  private get _defaultDesc() {
    const { autoLogError, autoLogNetwork, autoLogRejection } = this.config
    return `log4fe init ready
(${autoLogError ? '✔' : '✘'}) auto log page error
(${autoLogRejection ? '✔' : '✘'}) auto log unhandled rejection in promise
(${autoLogNetwork ? '✔' : '✘'}) auto log ajax request
unsent log count: ${this._lastUnsendCount}
current page request ID: ${this.reqId} ${this._idFromServer ? '(from server)' : '(auto generated)'}`
  }

  private _getReqId() {
    // for react-native
    if (window.document) {
      this.reqId = window.document.querySelector('[name="_reqId"]')
        ? window.document.querySelector<HTMLMetaElement>('[name="_reqId"]')!.content
        : window._reqId || (getQuery().reqId as string)
    }
    if (this.reqId) {
      this._idFromServer = true
    } else {
      this.reqId = getUUID()
      this._idFromServer = false
    }
  }

  private _parse(params: Log4feConfig) {
    const config = {
      ...LOG4FE_INIT_CONFIG,
      ...params,
    }

    this.config = config
  }

  private _init() {
    Log4fe._instance = this
    this._getReqId()
    this._initLogger()
    this._printDesc()
    this._exceptionHandler()
    this._loadFromStorage()
    this._handleAjaxAutoLogging()
    this._storageUnsendData()

    this._timer = setInterval(() => {
      this._send()
    }, this.config.interval)
  }

  private _initLogger() {
    this.loggers.set(
      'main',
      new Logger({
        name: 'main',
        ...this.config.loggerInitOptions,
        enabled: true,
      })
    )
  }

  private _loadFromStorage() {
    if (!checkIsIncognitoMode()) {
      const lastData = JSON.parse(window.localStorage.getItem('log4fe') || '[]')
      if (Array.isArray(lastData) && lastData.length) {
        this._lastUnsendCount = lastData.length
        this.queue = lastData
        this._send()
      }
      window.localStorage.removeItem('log4fe')
    }
  }

  private _handleAjaxAutoLogging() {
    if (this.config.autoLogNetwork) {
      const self = this
      const logger = this.getLogger('Ajax', { enabled: true })

      XMLHttpRequest.prototype.open = function open(...args: any) {
        this._log4feMethod = args[0]
        this._log4feUrl = resolveUrl(args[1])
        self._xhrOpen.apply(this, args)
      }

      XMLHttpRequest.prototype.send = function send(data) {
        const startTime = new Date()
        this.setRequestHeader('X-Request-Id', self.reqId)
        this.addEventListener('readystatechange', () => {
          if (!self.config.networkLogFilter!(this._log4feMethod, this._log4feUrl)) {
            return
          }
          try {
            this._log4fePostData = data
            self._getConsoleMethod('group')(
              '%cDetected ajax request: ',
              `color: ${COLOR_CONFIG.ajaxGroup};`
            )
            if (
              this.readyState !== XMLHttpRequest.DONE &&
              (this.status < 200 || this.status >= 400)
            ) {
              logger.warn(
                '[ajax]',
                `${this._log4feMethod.toUpperCase()} ${this._log4feUrl} status: ${this.status}`,
                'Request readyState != DONE'
              )
              self._getConsoleMethod('groupEnd')()
              return
            }
            logger.info(
              `[ajax] send request ${this._log4feMethod.toUpperCase()} ${this._log4feUrl}`
            )
            const endTime = new Date()
            const costTime = (endTime.getTime() - startTime.getTime()) / 1000
            const msgs = []
            if (this.status >= 200 && this.status < 400) {
              msgs.push('Request send successful.')
            } else {
              msgs.push('Request send failed!')
            }
            msgs.push(
              `duration: ${costTime}s url: ${
                this._log4feUrl
              } method: ${this._log4feMethod.toUpperCase()}`
            )
            if (this._log4feMethod.toLowerCase() === 'post') {
              msgs.push('request body:', data)
            }
            msgs.push(`Status code: ${this.status}`)
            if (this.status >= 200 && this.status < 400) {
              logger.info('[ajax]', ...msgs)
            } else {
              msgs.push(`Ready State: ${this.readyState}`)
              logger.error('[ajax]', ...msgs)
            }
            self._getConsoleMethod('groupEnd')()
          } catch (err) {
            const msgs = []
            msgs.push('Send request failed!')
            msgs.push(`url: ${this._log4feUrl} method: ${this._log4feMethod.toUpperCase()}`)
            if (this._log4feMethod.toLowerCase() === 'post') {
              msgs.push('request body: ', data)
            }
            msgs.push(`stauts code: ${this.status}`)
            msgs.push(`ERROR: ${err}`)
            logger.error('[ajax]', ...msgs)
          }
        })

        self._xhrSend.call(this, data)
      }
      rewriteFetch()
    }
  }

  private _storageUnsendData() {
    if (!window.onunload) {
      return
    }
    window.onunload = () => {
      // 处理未发送的数据
      if (this.queue.length) {
        if (
          navigator.sendBeacon &&
          navigator.sendBeacon(this.config.url!, JSON.stringify(this.queue))
        ) {
          this.queue = []
        } else if (!checkIsIncognitoMode()) {
          window.localStorage.setItem('log4fe', JSON.stringify(this.queue))
        } else {
          this._send()
        }
      }
    }
  }

  private _send() {
    if (!this.config.autoReport) {
      return
    }
    const logCount = this.queue.length
    if (!logCount) {
      return
    }
    if (this._xhr) {
      this._xhr.onreadystatechange = null
      this._xhr.abort()
    }

    const logger = this.getLogger()

    try {
      this._xhr = new XMLHttpRequest()
      this._xhrOpen.call(this._xhr, 'POST', this.config.url!, true)
      this._xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8')
      this._xhrSend.call(this._xhr, JSON.stringify(this.queue))
      this._xhr.onreadystatechange = () => {
        const xhr = this._xhr!
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status >= 200 && xhr.status < 400) {
            this.queue.splice(0, logCount)
            this._errorReqCount = 0
            if (this.config.loggerInitOptions?.styled) {
              this._getConsoleMethod('log')(
                `%c[${getTimeString(null)}] - ${logCount} log(s) sent successful`,
                `color: ${COLOR_CONFIG.sendSuccess}`
              )
            } else {
              this._getConsoleMethod('log')(`${logCount} log(s) sent successful`)
            }
          } else {
            logger.error(`Report log failed, url: ${this.config.url}, status: ${xhr.status}`)
            this._checkErrorReq()
          }
          this._xhr = null
        }
      }
    } catch (err) {
      logger.error(`Report log failed, url: ${this.config.url}, err: `, err || 'null')
      this._checkErrorReq()
      this._xhr = null
    }
  }

  private _exceptionHandler() {
    if (!window.onerror || !window.addEventListener) {
      return
    }

    const { autoLogError, autoLogRejection } = this.config

    if (!autoLogError) {
      return
    }
    window.onerror = (msg, url, line, col, error) => {
      this.getLogger().error('[OnError]', msg, `(line: ${line}, col: ${col})`, error?.stack)
    }

    window.addEventListener(
      'error',
      (event) => {
        const target = event.target || event.srcElement

        const isElementTarget = [HTMLScriptElement, HTMLLinkElement, HTMLImageElement].some(
          (ele) => target instanceof ele
        )
        if (!isElementTarget) {
          return false
        }
        const url = (target as HTMLScriptElement).src || (target as HTMLLinkElement).href
        this.getLogger().error('[GET resource error]', url)
      },
      true
    )

    if (!autoLogRejection) {
      return
    }
    window.addEventListener('unhandledrejection', (err) => {
      this.getLogger().error('[OnRejection]', err.reason)
    })
  }

  private _checkErrorReq() {
    this._errorReqCount++

    if (this._errorReqCount >= this.config.maxErrorReq!) {
      clearInterval(this._timer)
      this.getLogger().warn(
        `Fail to report too many times, please check if upload API ${this.config.url} work properly`
      )
    }
  }

  private _printDesc() {
    if (this.config.showDesc) {
      if (this.config.loggerInitOptions?.styled) {
        this._getConsoleMethod('log')(
          `%c${this._defaultDesc}`,
          `color: ${COLOR_CONFIG.desc}; line-height: 1.5;`
        )
      } else {
        this._getConsoleMethod('log')(this._defaultDesc)
      }
    }
  }
}

window.Log4fe = Log4fe

export default Log4fe
