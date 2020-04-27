import { LogLevel } from '../../../types'

export const FILTER_LOG_LIST = '@FILTER_LOG_LIST'
export const CLEAR_LOG_LIST = '@CLEAR_LOG_LIST'
export const COMBINE_LOG_LIST = '@COMBINE_LOG_LIST'

export interface LogItem {
  id: number
  reqId: string
  name: string
  time: number
  level: LogLevel
  messages: string[]
  url: string
  agent: string
}

export interface FilterListPayload {
  filterFunc: (item: LogItem, index: number) => boolean
}

export interface FilterLogListAction {
  type: typeof FILTER_LOG_LIST
  payload: FilterListPayload
}

export interface ClearLogAction {
  type: typeof CLEAR_LOG_LIST
}

export interface CombineLogAction {
  type: typeof COMBINE_LOG_LIST
  payload: LogItem[]
}

export type LogListState = LogItem[]

export type LogListActions = FilterLogListAction | ClearLogAction | CombineLogAction
