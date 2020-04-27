import Logger from './logger'
import { LoggerLevel } from './types'

export default class Booster {
  public enabled: boolean

  public level: LoggerLevel

  constructor(lgr: Logger, relistFunc: () => void) {
    this.enabled = lgr.isEnabled
    this.level = lgr.level
    if (this.enabled) {
      Reflect.defineProperty(this, 'ClickToDisable -->', {
        get: () => {
          lgr.disable()
          relistFunc()
          return 'Disabled'
        },
      })
    } else {
      Reflect.defineProperty(this, 'ClickToEnable -->', {
        get: () => {
          lgr.enable()
          relistFunc()
          return 'Enabled'
        },
      })
    }
  }
}
