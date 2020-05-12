import IO from 'socket.io-client'
import { SOCKET_IO_URL } from './constants'

const io = IO(SOCKET_IO_URL)

export default io
