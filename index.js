const rpio = require('rpio')
const RaspiCam = require('raspicam')
const camera = new RaspiCam({ mode: 'photo', ouput: './photos' })

function pollcb(pin) {
  var state = rpio.read(pin) ? 'pressed' : 'released'
  console.log(`button event on ${pin} currently ${state}`)
  camera.start()
}

var init = function() {
  console.log('initializing')
  rpio.open(17, rpio.INPUT, rpio.PULL_DOWN)
}

init()
