import { COLOR_CONFIG } from './constants'

export type LoggerInitOptions = Omit<LoggerInitParam, 'name'>

export type NetworkLogFilter = (method: string, url: string) => boolean

export type LogReportFormatter = (
  time: Date,
  level: LoggerLevel,
  loggerName: string,
  reqId: string,
  ...msgs: any[]
) => any

export interface Log4feConfig {
  url?: string
  interval?: number
  maxErrorReq?: number
  showDesc?: boolean
  outputToConsole?: boolean
  autoReport?: boolean
  autoLogError?: boolean
  autoLogRejection?: boolean
  autoLogNetwork?: boolean
  loggerInitOptions?: LoggerInitOptions
  networkLogFilter?: NetworkLogFilter
  reportFormatter?: LogReportFormatter
}

export type LoggerLevel = 'debug' | 'info' | 'warn' | 'error'

export type GetPrefixFunc = (
  dateStr: string,
  timeStr: string,
  loggerName: string,
  level: LoggerLevel
) => string

export type GetStyleCSSFunc = (colorEnum: ColorEnums) => string

export interface LoggerInitParam {
  name: string
  level?: LoggerLevel
  enabled?: boolean
  styled?: boolean
  styleCSS?: GetStyleCSSFunc | string
  prefix?: GetPrefixFunc | string
  logTime?: boolean
  sendToServer?: boolean
}

export type ColorEnums = keyof typeof COLOR_CONFIG

export interface _LogOptions {
  level: LoggerLevel
  time?: Date
  color?: ColorEnums
}
