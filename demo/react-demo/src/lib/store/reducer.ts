import { combineReducers } from 'redux'

import logConfigReducer from './log-config/reducer'
import logListReducer from './log-list/reducer'

const rootReducer = combineReducers({
  logConfig: logConfigReducer,
  logList: logListReducer,
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer
