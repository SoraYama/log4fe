import Koa from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import http from 'http'
import IO from 'socket.io'
import cors from 'koa2-cors'

const app = new Koa()
const router = new Router()
const httpServer = http.createServer(app.callback())
const io = IO(httpServer, {
  handlePreflightRequest: (req, res) => {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': req.headers.origin,
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'X-Request-Id',
      'Access-Control-Allow-Credentials': true,
    })
    res.end()
  },
})

let id = 0
app.use(bodyParser())
app.use(
  cors({
    origin: (ctx) => ctx.request.headers.origin,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
)

router.post('/log', async (ctx) => {
  // console.log(ctx.request.body)
  const { body } = ctx.request
  console.log(body)
  if (Array.isArray(body)) {
    io.emit(
      'log',
      body.map((i: any) => ({ ...i, id: id++ }))
    )
  }
  ctx.response.body = ''
})

app.use(router.routes())

const PORT = 8088

httpServer.listen(PORT, '0.0.0.0')

console.info(`Server is running on port ${PORT}`)
