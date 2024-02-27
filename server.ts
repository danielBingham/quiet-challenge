import { WebSocketServer } from 'ws'

import { Dispatcher } from './lib/Dispatcher'

import { ChatGenerator } from './lib/ChatGenerator'
import { Backend } from './model/Backend'

const port = process.argv[2] ? parseInt(process.argv[2]) : 8000

const server = new WebSocketServer({ port: port, clientTracking: true })

const generator = new ChatGenerator()

/**
 * Create a backend and initialize it with messages.
 */
const backend = new Backend()
backend.createChannel('channel1', generator.generateChatMessages(1000))
backend.createChannel('channel2', generator.generateChatMessages(2000))
backend.createChannel('channel3', generator.generateChatMessages(4000))

const dispatcher = new Dispatcher(backend)

/**
 * Wire up the server socket.
 */
server.on('connection', function(socket) {
    console.log("New connection...")

    const client = dispatcher.connect(socket)

    socket.on('error', console.error)

    socket.on('message', function(raw) {
        dispatcher.handleMessage(client, raw.toString())
    })
})

server.on('listening', function() {
    console.log(`Server listening on ${port}...`)     
})


