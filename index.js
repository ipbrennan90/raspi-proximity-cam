const rpio = require('rpio')
const RaspiCam = require('raspicam')
const camera = new RaspiCam({ mode: 'photo', ouput: './photos' })

function pollcb(pin) {
  var state = rpio.read(pin) ? 'pressed' : 'released'
  console.log(`button event on ${pin} currently ${state}`)
}

var init = function() {
  console.log('initializing')
  rpio.open(16, rpio.INPUT, rpio.PULL_DOWN)
  rpio.open(6, rpio.INPUT, rpio.PULL_DOWN)
  rpio.open(13, rpio.INPUT, rpio.PULL_DOWN)
  rpio.open(26, rpio.INPUT, rpio.PULL_DOWN)
  rpio.poll(16, pollcb)
  rpio.poll(6, pollcb)
  rpio.poll(13, pollcb)
  rpio.poll(26, pollcb)
}

init()
