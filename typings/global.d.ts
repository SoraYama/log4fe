import Log4fe from '../src/log4fe'

declare global {
  interface Window {
    Log4fe: typeof Log4fe
    _reqId: string
  }

  interface XMLHttpRequest {
    _log4fePostData: any
    _log4feMethod: string
    _log4feUrl: string
  }

  interface Request {
    _bodyInit: any
  }
}
