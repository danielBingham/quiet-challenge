import { Dispatcher } from '../../lib/Dispatcher'
import { ChannelMeta } from '../../model/Channel'
import { Backend } from '../../model/Backend'
import { ChatGenerator } from '../../lib/ChatGenerator'

describe('Dispatcher', function() {


    describe('connect()', function() {
        it('Should handle a new socket connection', function() {
            const backend = new Backend()
            const dispatcher = new Dispatcher(backend)

            const socket = {
                send: jest.fn()
            }

            const expectedMessageJSON = { 
                type: 'connection-open',
                channelsMeta: {
                    'general': new ChannelMeta({ totalChats: 0 })
                }
            }

            const client = dispatcher.connect(socket)

            expect(client.socket.send.mock.calls[0][0]).toEqual(JSON.stringify(expectedMessageJSON))
            expect(client.id).toEqual(0)
            expect(backend.clients['general'].length).toEqual(1)
        })
    })

    describe('handleMessage()', function() {

        it('should handle ChannelOpenMessage', function() {
            const generator = new ChatGenerator()

            const backend = new Backend()
            backend.createChannel('channel1', generator.generateSimpleMessages(1000))

            const dispatcher = new Dispatcher(backend)

            const socket = {
                send: jest.fn()
            }

            const client = dispatcher.connect(socket)
            const sentMessage = {
                type: 'open-channel',
                channelName: 'channel1'
            }

            dispatcher.handleMessage(client, JSON.stringify(sentMessage))

            const expectedMessage = { 
                type: 'channel-open',
                channelName: 'channel1',
                index: 1000 - 25,
                chats: backend.channels['channel1'].chats.slice(1000-25, 1000)
            }

            const recievedMessage = JSON.parse(client.socket.send.mock.calls[1][0])
            expect(recievedMessage).toEqual(expectedMessage)

            expect(backend.clients['general'].length).toEqual(0)
            expect(backend.clients['channel1'].length).toEqual(1)
        })

        it('should handle ChannelOpenMessage with a lot of messages', function() {
            const generator = new ChatGenerator()

            const backend = new Backend()
            backend.createChannel('channel1', generator.generateSimpleMessages(1000000))

            const dispatcher = new Dispatcher(backend)

            const socket = {
                send: jest.fn()
            }

            const client = dispatcher.connect(socket)
            const sentMessage = {
                type: 'open-channel',
                channelName: 'channel1'
            }

            dispatcher.handleMessage(client, JSON.stringify(sentMessage))

            const expectedMessage = { 
                type: 'channel-open',
                channelName: 'channel1',
                index: 1000000 - 25,
                chats: backend.channels['channel1'].chats.slice(1000000-25, 1000000)
            }

            const recievedMessage = JSON.parse(client.socket.send.mock.calls[1][0])
            expect(recievedMessage).toEqual(expectedMessage)

            expect(backend.clients['general'].length).toEqual(0)
            expect(backend.clients['channel1'].length).toEqual(1)
        })

        it('should handle LoadPage', function() {
            const generator = new ChatGenerator()

            const backend = new Backend()
            backend.createChannel('channel1', generator.generateSimpleMessages(1000))

            const dispatcher = new Dispatcher(backend)

            const socket = {
                send: jest.fn()
            }

            const client = dispatcher.connect(socket)

            // Open channel1
            const openChannelMessage = {
                type: 'open-channel',
                channelName: 'channel1'
            }
            dispatcher.handleMessage(client, JSON.stringify(openChannelMessage))

            const sentMessage = {
                type: 'load-page',
                channelName: 'channel1',
                index: 1000 - 50
            }

            dispatcher.handleMessage(client, JSON.stringify(sentMessage))

            const expectedMessage = { 
                type: 'page-loaded',
                index: 1000 - 75,
                chats: backend.channels['channel1'].chats.slice(1000 -75, 1000-50)
            }

            const recievedMessage = JSON.parse(client.socket.send.mock.calls[2][0])
            expect(recievedMessage).toEqual(expectedMessage)

            expect(backend.clients['general'].length).toEqual(0)
            expect(backend.clients['channel1'].length).toEqual(1)
        })

        it('should handle LoadPage with a lot of messages', function() {
            const generator = new ChatGenerator()

            const backend = new Backend()
            backend.createChannel('channel1', generator.generateSimpleMessages(1000000))

            const dispatcher = new Dispatcher(backend)

            const socket = {
                send: jest.fn()
            }

            const client = dispatcher.connect(socket)

            // Open channel1
            const openChannelMessage = {
                type: 'open-channel',
                channelName: 'channel1'
            }
            dispatcher.handleMessage(client, JSON.stringify(openChannelMessage))

            const sentMessage = {
                type: 'load-page',
                channelName: 'channel1',
                index: 1000000 - 50
            }

            dispatcher.handleMessage(client, JSON.stringify(sentMessage))

            const expectedMessage = { 
                type: 'page-loaded',
                index: 1000000 - 75,
                chats: backend.channels['channel1'].chats.slice(1000000 -75, 1000000-50)
            }

            const recievedMessage = JSON.parse(client.socket.send.mock.calls[2][0])
            expect(recievedMessage).toEqual(expectedMessage)

            expect(backend.clients['general'].length).toEqual(0)
            expect(backend.clients['channel1'].length).toEqual(1)
        })

        it('should handle messageSend and recieve', function() {
            const generator = new ChatGenerator()

            const backend = new Backend()
            backend.createChannel('channel1', generator.generateSimpleMessages(1000))
            backend.createChannel('channel2', generator.generateSimpleMessages(1000))

            const dispatcher = new Dispatcher(backend)

            // Create client1 and client2 in channel1 
            const socket1 = {
                send: jest.fn()
            }
            const client1 = dispatcher.connect(socket1)
            const socket2 = {
                send: jest.fn()
            }
            const client2 = dispatcher.connect(socket2)

            const openChannelMessage1 = {
                type: 'open-channel',
                channelName: 'channel1'
            }
            dispatcher.handleMessage(client1, JSON.stringify(openChannelMessage1))
            dispatcher.handleMessage(client2, JSON.stringify(openChannelMessage1))

            // Create client3 in channel2 
            const socket3 = {
                send: jest.fn()
            }
            const client3 = dispatcher.connect(socket3)

            const openChannelMessage2 = {
                type: 'open-channel',
                channelName: 'channel2'
            }
            dispatcher.handleMessage(client3, JSON.stringify(openChannelMessage2))

            const sentMessage = {
                type: 'send-chat',
                channelName: 'channel1',
                chat: {
                    timestamp: 1001,
                    message: '1001'
                }
            }

            dispatcher.handleMessage(client1, JSON.stringify(sentMessage))

            const expectedMessage = { 
                type: 'recieve-chat',
                channelName: 'channel1',
                chat: {
                    timestamp: 1001,
                    message: '1001'
                }
            }

            const recievedMessage = JSON.parse(client2.socket.send.mock.calls[2][0])
            expect(recievedMessage).toEqual(expectedMessage)

            expect(client1.socket.send.mock.calls.length).toEqual(2)
            expect(client2.socket.send.mock.calls.length).toEqual(3)
            expect(client3.socket.send.mock.calls.length).toEqual(2)


        })

        it('should handle messageSend and recieve old messages', function() {
            const generator = new ChatGenerator()

            const backend = new Backend()
            backend.createChannel('channel1', generator.generateSimpleMessages(1000000))
            backend.createChannel('channel2', generator.generateSimpleMessages(1000000))

            const dispatcher = new Dispatcher(backend)

            // Create client1 and client2 in channel1 
            const socket1 = {
                send: jest.fn()
            }
            const client1 = dispatcher.connect(socket1)
            const socket2 = {
                send: jest.fn()
            }
            const client2 = dispatcher.connect(socket2)

            const openChannelMessage1 = {
                type: 'open-channel',
                channelName: 'channel1'
            }
            dispatcher.handleMessage(client1, JSON.stringify(openChannelMessage1))
            dispatcher.handleMessage(client2, JSON.stringify(openChannelMessage1))

            // Create client3 in channel2 
            const socket3 = {
                send: jest.fn()
            }
            const client3 = dispatcher.connect(socket3)

            const openChannelMessage2 = {
                type: 'open-channel',
                channelName: 'channel2'
            }
            dispatcher.handleMessage(client3, JSON.stringify(openChannelMessage2))

            const sentMessage = {
                type: 'send-chat',
                channelName: 'channel1',
                chat: {
                    timestamp: 1001,
                    message: '1001'
                }
            }

            dispatcher.handleMessage(client1, JSON.stringify(sentMessage))

            expect(client1.socket.send.mock.calls.length).toEqual(2)
            expect(client2.socket.send.mock.calls.length).toEqual(2)
            expect(client3.socket.send.mock.calls.length).toEqual(2)
        })

        it('should handle messageSend and recieve old messages', function() {
            const generator = new ChatGenerator()

            const backend = new Backend()
            backend.createChannel('channel1', generator.generateSimpleMessages(1000000))
            backend.createChannel('channel2', generator.generateSimpleMessages(1000000))

            const dispatcher = new Dispatcher(backend)

            // Create client1 and client2 in channel1 
            const socket1 = {
                send: jest.fn()
            }
            const client1 = dispatcher.connect(socket1)
            const socket2 = {
                send: jest.fn()
            }
            const client2 = dispatcher.connect(socket2)

            const openChannelMessage1 = {
                type: 'open-channel',
                channelName: 'channel1'
            }
            dispatcher.handleMessage(client1, JSON.stringify(openChannelMessage1))
            dispatcher.handleMessage(client2, JSON.stringify(openChannelMessage1))

            const loadPageMessage1 = {
                type: 'load-page',
                channelName: 'channel1',
                index: 1000 
            }
            dispatcher.handleMessage(client2, JSON.stringify(loadPageMessage1))

            // Create client3 in channel2 
            const socket3 = {
                send: jest.fn()
            }
            const client3 = dispatcher.connect(socket3)

            const openChannelMessage2 = {
                type: 'open-channel',
                channelName: 'channel2'
            }
            dispatcher.handleMessage(client3, JSON.stringify(openChannelMessage2))

            const sentMessage = {
                type: 'send-chat',
                channelName: 'channel1',
                chat: {
                    timestamp: 1001,
                    message: '1001'
                }
            }

            dispatcher.handleMessage(client1, JSON.stringify(sentMessage))

            const expectedMessage = { 
                type: 'recieve-chat',
                channelName: 'channel1',
                chat: {
                    timestamp: 1001,
                    message: '1001'
                }
            }

            const recievedMessage = JSON.parse(client2.socket.send.mock.calls[3][0])
            expect(recievedMessage).toEqual(expectedMessage)

            expect(client1.socket.send.mock.calls.length).toEqual(2)
            expect(client2.socket.send.mock.calls.length).toEqual(4)
            expect(client3.socket.send.mock.calls.length).toEqual(2)
        })


    })
})
