const rpio = require('rpio')
const RaspiCam = require('raspicam')
const camera = new RaspiCam({
  mode: "timelapse", 
  output: "./photos/image_%06d.jpg",
  encoding: "jpg",
  timelapse: 1000,
  timeout: 5000
})

function pollcb(pin) {
  var state = rpio.read(pin) ? 'pressed' : 'released'
  console.log(`button event on ${pin} currently ${state}`)
  if (state === 'pressed') {
    camera.start()
  }
}

var init = function() {
  console.log('initializing')
  rpio.open(16, rpio.INPUT, rpio.PULL_DOWN)
  rpio.poll(16, pollcb)
  camera.on('start', function(err, timestamp) {
    console.log("photo started at " + timestamp)
  })
  camera.on('read', function(err, timestamp, filename) {
    console.log("photo captured with filename: " + filename)
  })
  camera.on('exit', function( timestamp ){
    console.log("photo child process has exited at " + timestamp )
  })
}

init()
