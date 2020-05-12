import { LOG_LEVELS, COLOR_CONFIG } from './constants'
import { getTimeString, getDateString, getPrefixedText, styledSupport } from './utils'
import { LoggerLevel, LoggerInitParam, GetPrefixFunc, GetStyleCSSFunc, _LogOptions } from './types'
import Log4fe from './log4fe'

class Logger {
  public level: LoggerLevel

  private enabled: boolean

  private name: string

  private styled: boolean

  private logTime: boolean

  private sendToServer: boolean

  private styleCSS?: GetStyleCSSFunc | string

  private getPrefix?: GetPrefixFunc | string

  private log4feInstance: Log4fe

  constructor({
    name,
    enabled = false,
    level = 'info',
    styled = true,
    logTime = true,
    sendToServer = true,
    prefix,
    styleCSS,
  }: LoggerInitParam) {
    if (!name || name.length <= 0 || typeof name !== 'string') {
      throw new Error(getPrefixedText('Logger name invalid'))
    }
    this.name = name
    this.level = level
    this.enabled = enabled
    this.styled = styled && styledSupport
    this.logTime = logTime
    this.styleCSS = styleCSS
    this.getPrefix = prefix
    this.sendToServer = sendToServer
    this.log4feInstance = Log4fe.getInstance()
  }

  public setLevel(level: LoggerLevel) {
    this.level = level
  }

  public get isEnabled() {
    return this.enabled
  }

  public enable = () => {
    this.enabled = true
  }

  public disable = () => {
    this.enabled = false
  }

  public debug(...args: any[]) {
    this._log(args, { level: 'debug' })
  }

  public info(...args: any[]) {
    this._log(args, { level: 'info' })
  }

  public warn(...args: any[]) {
    this._log(args, { level: 'warn' })
  }

  public error(...args: any[]) {
    this._log(args, { level: 'error' })
  }

  public _log(msgs: any[], options: _LogOptions) {
    const now = new Date()
    const { level, time = now, color = level } = options
    if (LOG_LEVELS.indexOf(this.level) > LOG_LEVELS.indexOf(level) || !this.enabled) {
      return
    }
    const dateStr = getDateString(time)
    const timeStr = getTimeString(time)
    const dateTimeStr = this.logTime ? `[${dateStr} ${timeStr}] - ` : ''
    const formatted = this.log4feInstance.reportFormatter(
      now,
      level,
      this.name,
      this.log4feInstance.reqId,
      ...msgs
    )

    if (this.sendToServer) {
      this.log4feInstance.queue.push(formatted)
    }

    if (!this.log4feInstance.config.outputToConsole) {
      return
    }

    const prefix = this.getPrefix
      ? typeof this.getPrefix === 'string'
        ? this.getPrefix
        : this.getPrefix(dateStr, timeStr, this.name, this.level)
      : `${dateTimeStr}<${this.name.toUpperCase()}> `
    if (this.styled) {
      console[level](
        `%c${prefix}`,
        this.styleCSS
          ? typeof this.styleCSS === 'string'
            ? this.styleCSS
            : this.styleCSS(color)
          : `color: ${COLOR_CONFIG[color]};`,
        ...msgs
      )
    } else {
      console[level](...msgs)
    }
  }
}

export default Logger
