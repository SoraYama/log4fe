import { LogConfigState, LogConfigActions } from './types'

const initialState: LogConfigState = {
  level: [],
  name: '',
  url: '',
  reqId: '',
  time: null,
}

const logConfigReducer = (
  state: LogConfigState = initialState,
  action: LogConfigActions
): LogConfigState => {
  switch (action.type) {
    case 'UPDATE_LOG_CONFIG':
      return {
        ...state,
        ...action.payload,
      }
    case 'CLEAR_LOG_CONFIG':
      return {
        ...initialState,
      }
    default:
      return state
  }
}

export default logConfigReducer
