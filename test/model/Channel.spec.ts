import { Channel } from '../../model/Channel'
import { Chat } from '../../model/Chat'
import { ChatGenerator } from '../../lib/ChatGenerator'

describe('Channel', function() {

    describe('addChat()', function() {

        it('should add a chat with the most recent timestamp to the end', function() {
            const generator = new ChatGenerator()

            const channel = new Channel('channel1', generator.generateSimpleMessages(100))
            channel.addChat(new Chat({
                timestamp: 101,
                message: '101'
            }))

            const expectedChats = generator.generateSimpleMessages(100)
            expectedChats.push(new Chat({
                timestamp: 101,
                message: '101'
            }))

            expect(channel.chats).toEqual(expectedChats)
        })

        it('should sort an older chat into the array based on timestamp', function() {
            const generator = new ChatGenerator()

            const channel = new Channel('channel1', generator.generateSimpleMessages(100))

            const orig = [ ...channel.chats ]


            channel.addChat(new Chat({
                timestamp: 50,
                message: '50'
            }))

            const expectedChats = [ 
                ...orig.slice(0, 50), 
                new Chat({
                    timestamp: 50,
                    message: '50'
                }), 
                ...orig.slice(50, 100) 
            ] 

            expect(channel.chats).toEqual(expectedChats)
        })
    })
})
