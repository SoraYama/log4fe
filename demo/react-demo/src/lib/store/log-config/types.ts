import { Moment } from 'moment'

import { UPDATE_LOG_CONFIG, CLEAR_LOG_CONFIG } from './actions'
import { LogLevel } from '../../../types'

export interface LogConfigState {
  level: LogLevel[]
  name: string
  url: string
  time: [Moment, Moment] | null
  reqId: string
}

export interface LogConfigUpdateAction {
  type: typeof UPDATE_LOG_CONFIG
  payload: Partial<LogConfigState>
}

export interface LogConfigClearAction {
  type: typeof CLEAR_LOG_CONFIG
}

export type LogConfigActions = LogConfigClearAction | LogConfigUpdateAction
