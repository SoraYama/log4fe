import { Log4feConfig } from './types'

export const LOG_LEVELS = ['debug', 'info', 'warn', 'error']

export const COLOR_CONFIG = {
  debug: 'hotPink',
  info: 'dodgerBlue',
  warn: 'orange',
  error: 'red',
  ajaxGroup: 'indigo',
  sendSuccess: 'green',
  desc: 'hotPink',
}

export const LOG4FE_INIT_CONFIG: Log4feConfig = {
  interval: 5000,
  maxErrorReq: 5,
  showDesc: true,
  autoReport: true,
  autoLogError: true,
  autoLogRejection: true,
  autoLogNetwork: true,
  outputToConsole: true,
  networkLogFilter: () => true,
  loggerInitOptions: {
    level: 'info',
    enabled: false,
    styled: true,
    logTime: true,
    sendToServer: true,
  },
}
