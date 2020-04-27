import { LogConfigUpdateAction, LogConfigState, LogConfigClearAction } from './types'

export const UPDATE_LOG_CONFIG = 'UPDATE_LOG_CONFIG'
export const CLEAR_LOG_CONFIG = 'CLEAR_LOG_CONFIG'

export const updateLogConfig = (config: Partial<LogConfigState>): LogConfigUpdateAction => ({
  type: UPDATE_LOG_CONFIG,
  payload: config,
})

export const resetLogConfig = (): LogConfigClearAction => ({
  type: CLEAR_LOG_CONFIG,
})
