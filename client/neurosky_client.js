// global vars to store current data points
const neurosky = {
  connectedNeurosky: false,
  attention: 0,
  meditation: 0,
  blink: 0,
  poorSignalLevel: 0,
}

if ("WebSocket" in window) {
  console.log('WebSocket is supported by your Browser.') // eslint-disable-line no-console

  const ws = new WebSocket('ws://127.0.0.1:8080')

  // when WebSocket connection is opened, do this stuff
  ws.onopen = function() {
    console.log('WebSocket connection is opened') // eslint-disable-line no-console
    ws.send('Browser connected')
    neurosky.connectedNeurosky = true
  }

  // whenever websocket server transmit a message, do this stuff
  ws.onmessage = function(evt) {
    // parse the data (sent as string) into a standard JSON object (much easier to use)
    const data = JSON.parse(evt.data)

    // handle "eSense" data
    if (data.eSense) {
      neurosky.attention = data.eSense.attention
      neurosky.meditation = data.eSense.meditation
    }

    // handle "blinkStrength" data
    if (data.blinkStrength) {
      neurosky.blink = data.blinkStrength
    }

    // handle "poorSignal" data
    if (data.poorSignalLevel != null) {
      neurosky.poorSignalLevel = parseInt(data.poorSignalLevel)
    }
  }

  // when websocket closes connection, do this stuff
  ws.onclose = function() {
    // websocket is closed.
    console.log('WebSocket connection is closed...') // eslint-disable-line no-console
  }
}

export default neurosky