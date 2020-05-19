# Log4fe

A light & configurable logger for front-end based on [lajax](https://github.com/eshengsky/lajax)

## features

- Auto log error when fetching static resource
- Auto log AJAX error
- Auto report logs to your own server
- Report & log by level
- Name & customize multi loggers
- Beauty your console

## install

```bash
npm i log4fe
```

## configure

You can directly pass the URL:

```js
import Log4fe from 'log4fe'

const log4fe = new Log4fe('<URL to report logs>')
```

or pass the config object:

```js
import Log4fe from 'log4fe'

const log4fe = new Log4fe({
  url: '<URL>',
  ...
})
```

### Log4fe Config

|        Name         | Required |                    Type                    | Description                                                                         |   Default    |
| :-----------------: | :------: | :----------------------------------------: | ----------------------------------------------------------------------------------- | :----------: |
|        `url`        |    ✅    |                  `string`                  | The url to report logs                                                              |     N/A      |
|     `interval`      |    ❌    |                  `number`                  | Interval for checking and reporting the log queue                                   |    `5000`    |
|    `maxErrorReq`    |    ❌    |                  `number`                  | Limit of reporting. When the limit exceeded, reporting function will no longer work |     `5`      |
|     `showDesc`      |    ❌    |                 `boolean`                  | Whether to show the init message in console                                         |    `true`    |
|    `autoReport`     |    ❌    |                 `boolean`                  | Whether the log message will be auto pushed to the queue                            |    `true`    |
|   `autoLogError`    |    ❌    |                 `boolean`                  | Whether log & report uncaught script error                                          |    `true`    |
| `autoLogRejection`  |    ❌    |                 `boolean`                  | Whether log & report uncaught promise rejection                                     |    `true`    |
|  `autoLogNetwork`   |    ❌    |                 `boolean`                  | Whether log & report AJAX request                                                   |    `true`    |
| `networkLogFilter`  |    ❌    | `(method: string, url: string) => boolean` | A filter function for logging what you want                                         | `() => true` |
|  `outputToConsole`  |    ❌    |                 `boolean`                  | Whether show logs in console                                                        |    `true`    |
| `loggerInitOptions` |    ❌    |            `LoggerInitOptions`             | The initial params for creating a new logger                                        |    `true`    |

### Single Logger Config

|      Name      | Required |            Type            | Description                                                                  | Default |
| :------------: | :------: | :------------------------: | ---------------------------------------------------------------------------- | :-----: |
|     `name`     |    ✅    |          `string`          | Logger name                                                                  | `main`  |
|   `enabled`    |    ❌    |         `boolean`          | Whether enabled when logger created, can be changed later in `console`       | `main`  |
|    `level`     |    ❌    |          `string`          | Logger level, ignore lower levels                                            | `info`  |
|    `styled`    |    ❌    |         `boolean`          | Whether to log with style in `console`                                       | `true`  |
|   `styleCSS`   |    ❌    | `string | GetStyleCSSFunc` | Whether to log with style in `console`                                       |    -    |
|    `prefix`    |    ❌    |  `string | GetPrefixFunc`  | **Only work when styled set to true** string before log message in `console` |    -    |
|   `logTime`    |    ❌    |         `boolean`          | Log time string before message in `console`                                  | `true`  |
| `sendToServer` |    ❌    |         `boolean`          | Whether to report on this logger                                             | `true`  |

```ts
// Type Annotation
type GetStyleCSSFunc = (colorEnum: ColorEnums) => string

type GetPrefixFunc = (
  dateStr: string,
  timeStr: string,
  loggerName: string,
  level: LoggerLevel
) => string

interface LoggerInitParam {
  name: string
  level?: LoggerLevel
  enabled?: boolean
  styled?: boolean
  styleCSS?: GetStyleCSSFunc | string
  prefix?: GetPrefixFunc | string
  logTime?: boolean
  sendToServer?: boolean
}

type LoggerInitOptions = Omit<LoggerInitParam, 'name'>
```

## Usage

```js
// log4fe.ts / js
import Log4fe from 'log4fe'

// Init
const log4fe = new Log4fe({
  url: '<YOUR CONFIGURED SERVER URL>',
  ... // Other config mentioned up above in `LoggerInitParam`
})

export default log4fe

// foo.ts / js
import log4fe from './log4fe.ts'

const logger = log4fe.getLogger('foo', {
  level: 'debug',
  ... // Other options mentioned up above in `LoggerInitOptions`
})

logger.debug('what you want to debug')
logger.info('what you want to log')
logger.warn('what you want to warn')
logger.error('DANGER!')
```

## Notice & Tricks

- **Do Not** support `Node.js` for there are plenty of better libs for logging in `Node.js` env

- **Do Not** `new` multi instance for `Log4fe` is singleton. You can get instance by using `Log4fe.getInstance()` instead

- `Log4fe` instance will manage every logger you created by `getLogger` by using a `Map`. Although you can set options by visit a specific logger like
  `log4fe.getLogger('app').styled = false`, the better practice may be passing a proper config object when invoke `getLogger('app', APP_OPTIONS)` first time

- Frequence & Log array size may be 2 aspects to set proper interval when sending logs

- You can customize almost details after having a glance at the interface in doc

- Support React Native env, but currently not support auto log error and other browser-related features

- The class `Log4fe` will be attatched to `globalThis` when instance init, for better experience when debug in `console`
  (Try type `Log4fe.getInstance().list()` in `chrome console`)

## Bugs & Contribute

Bugs & feature requirement can be feedback at [github](https://github.com/SoraYama/log4fe/issues)

Please be sure you finished reading the doc and the bug can be reproduced. Any detail about your bug is welcomed, such as Browser version, OS, output in `console`, etc.

### Contribute

The project is coded with [Typescript](https://www.typescriptlang.org/docs/home.html)

```sh
git clone git@github.com:SoraYama/log4fe.git

cd log4fe

yarn # npm i

# develop
yarn dev
```

Please make sure eslint works properly and feel free to submit PR :)

## License

MIT
