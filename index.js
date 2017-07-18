const rpio = require('rpio')
const RaspiCam = require('raspicam')
const axios = require('axios')
const instance = axios.create({
  baseURL: process.env.LPR_URL,
  timeout: 1000,
  onUploadProgress: function(progressEvent) {
    var percentCompleted = Math.round(
      progressEvent.loaded * 100 / progressEvent.total
    )
  }
})

function pollcb(pin) {
  var state = rpio.read(pin) ? 'pressed' : 'released'
  console.log(`button event on ${pin} currently ${state}`)
  if (state === 'pressed') {
    const dateTaken = new Date()
    const camera = new RaspiCam({
      mode: 'timelapse',
      output: `./photos/${dateTaken.month}/${dateTaken.date}/${dateTaken.Hours}${dateTaken.minutes}image_%06d.jpg`,
      encoding: 'jpg',
      timelapse: process.env.PIC_INTERVAL * 1000,
      timeout: process.env.TOTAL_TIMELAPSE * 1000
    })
    watchCamera(camera)
    camera.start()
  }
}

function watchCamera(camera) {
  camera.on('start', function(err, timestamp) {
    console.log('photo started at ' + timestamp)
  })
  camera.on('read', function(err, timestamp, filename) {
    console.log('photo captured with filename: ' + filename)
  })
  camera.on('exit', function(timestamp) {
    console.log('photo child process has exited at ' + timestamp)
  })
}

function uploadImage(image) {
  instance
    .post('/upload', image)
    .then(function(res) {
      console.log(res)
    })
    .catch(function(err) {
      console.log(err)
    })
}

var init = function() {
  console.log('initializing')
  rpio.open(16, rpio.INPUT, rpio.PULL_DOWN)
  rpio.poll(16, pollcb)
}

init()
