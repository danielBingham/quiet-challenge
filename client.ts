const WebSocket = require('ws')

const client = new WebSocket('http://localhost:8000')

client.on('error', console.error)

client.on('open', function() {
    client.send(JSON.stringify({ status: 'open' }))
})

client.on('message', function(data) {
    console.log(data)
})
