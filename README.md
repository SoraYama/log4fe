# Log4fe

A light & configurable logger for front-end

## features

- Auto log error when fetching static resource
- Auto log AJAX error
- Auto report logs
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
