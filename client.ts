import WebSocket from 'ws'

const client = new WebSocket('http://localhost:8000')

client.on('error', console.error)

client.on('open', function() {
    console.log("Connection opened.")
    client.send(
        JSON.stringify(
            {
                type: 'open-channel',
                channelName: 'channel1'
            }
        )
    )

    client.send(
        JSON.stringify(
            {
                type: 'load-page',
                channelName: 'channel1',
                index: 1000 - 50
            }
        )
    )

    client.send(
        JSON.stringify(
            {
                type: 'send-chat',
                channelName: 'channel1',
                chat: {
                    timestamp: Date.now(),
                    message: '1001'
                }
            }
        )
    )
})

client.on('message', function(data) {
    console.log("Recieved Message: ")
    console.log(JSON.parse(data.toString()))
})

