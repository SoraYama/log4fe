import Log4fe from 'log4fe'

import { LOG_HTTP_URL } from './constants'

const log4fe = Log4fe.getInstance({
  url: LOG_HTTP_URL,
})

export default log4fe
