require('dotenv').config()
const fs = require('fs')
const tmp = require('tmp')
const rpio = require('rpio')
const RaspiCam = require('raspicam')
const axios = require('axios')
const mkdirp = require('mkdirp')
const rmdir = require('rmdir')
const AdmZip = require('adm-zip')

const instance = axios.create({
  baseURL: process.env.LPR_URL,
  timeout: 1000,
  onUploadProgress: function(progressEvent) {
    var percentCompleted = Math.round(
      progressEvent.loaded * 100 / progressEvent.total
    )
  }
})
const cameraState = {
  running: false,
  lastDirPath: ''
}

function pollcb(pin) {
  var state = rpio.read(pin) ? 'pressed' : 'released'
  console.log(`button event on ${pin} currently ${state}`)
  console.log(process.env.PIC_INTERVAL, process.env.TOTAL_TIMELAPSE)
  if (state === 'pressed' && !cameraState.running) {
    makeDirectory()
      .then(function(dir) {
        const camera = new RaspiCam({
          mode: 'timelapse',
          output: `${dir}/image_%06d.jpg`,
          encoding: 'jpg',
          timelapse: parseInt(process.env.PIC_INTERVAL) * 1000,
          timeout: parseInt(process.env.TOTAL_TIMELAPSE) * 1000
        })
        watchCamera(camera)
        camera.start()
      })
      .catch(function(err) {
        console.log(err)
      })
  }
}
function makeDirectory() {
  return new Promise(function(resolve, reject) {
    const dateTaken = new Date()
    const dir = `./photos/${dateTaken.getUTCYear}/${dateTaken.getUTCMonth()}/${dateTaken.getUTCDate()}/${dateTaken.getUTCHours()}${dateTaken.getUTCMinutes()}${dateTaken.getUTCMilliseconds()}`
    cameraState.lastDirPath = dir
    mkdirp(dir, function(err) {
      if (err) reject(err)
      else resolve(dir)
    })
  })
}

function buildZip(file) {
  // prettier-ignore
  let tmpFile = tmp.fileSync({ mode: 0644, postfix: '.zip'})
  console.log("TEMP FILE CREATED: ", tmpFile.name)
}

function watchCamera(camera) {
  camera.on('start', function(err, timestamp) {
    cameraState.running = true
  })
  camera.on('read', function(err, timestamp, filename) {
    console.log('photo captured with filename: ' + filename)
  })
  camera.on('exit', function(timestamp) {
    cameraState.running = false
    buildZip(null)
    setTimeout(2000, function() {
      fs.rmdir(cameraState.lastDirPath, function(err, dirs, files) {
        console.log(dirs)
        console.log(files)
        console.log('all files are removed')
      })
    })
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
