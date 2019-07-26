/* eslint-disable no-console */
const thinkgear = require('node-thinkgear-sockets')

const client = thinkgear.createClient({ enableRawOutput: true })

let connected = false

// bind receive data event
client.on('data', function(data){
  // if websocket server is running
  if (wss) {
    // broadcast this latest data packet to all connected clients
    wss.broadcast(JSON.stringify(data))
  }

  if (!connected) {
    console.log('[Neurosky] Connection established')
    connected = !connected
  }
})

// bind receive data event
client.on('blink_data', function(data){
  // if websocket server is running
  if (wss) {
    // broadcast this latest data packet to all connected clients
    wss.broadcast(JSON.stringify(data))
  }
})

client.on('error', function(error) {
  console.log('[Neurosky] Unable to connect: ', error.code)
  console.error(error)
})

// initiate connection
client.connect()
/** END connect to neurosky **/

/** BEGIN start our websocket server **/
// start websocket server to broadcast
const WebSocket = require('ws')
const wss = new WebSocket.Server({port: 8080})

// broadcast function (broadcasts message to all clients)
wss.broadcast = function(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  })
}

// bind each connection
wss.on('connection', function(ws) {
  ws.on('message', function(message) {
    console.log('[Websocket][CLIENT] %s', message)
  })
  console.log('[Websocket] Listening on port 8080')
})

module.exports = {
  client: client,
  wss: wss
}
