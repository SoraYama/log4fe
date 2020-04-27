import { LogItem, LogListActions, LogListState } from './types'

const initialState: LogItem[] = []

const logListReducer = (state: LogItem[] = initialState, action: LogListActions): LogListState => {
  switch (action.type) {
    case '@CLEAR_LOG_LIST': {
      return []
    }
    case '@FILTER_LOG_LIST': {
      return state.filter(action.payload.filterFunc)
    }
    case '@COMBINE_LOG_LIST': {
      return [...state, ...action.payload]
    }
    default:
      return state
  }
}

export default logListReducer
