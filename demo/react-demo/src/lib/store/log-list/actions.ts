import {
  ClearLogAction,
  FilterLogListAction,
  FilterListPayload,
  LogItem,
  CombineLogAction,
} from './types'

export const clearLogList = (): ClearLogAction => ({
  type: '@CLEAR_LOG_LIST',
})

export const filterLogList = (payload: FilterListPayload): FilterLogListAction => ({
  type: '@FILTER_LOG_LIST',
  payload,
})

export const combineLogList = (payload: LogItem[]): CombineLogAction => ({
  type: '@COMBINE_LOG_LIST',
  payload,
})
