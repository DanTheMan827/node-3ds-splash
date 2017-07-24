const PNG = require('pngjs').PNG

function binToRGBA (data) {
  return new Promise(function (resolve, reject) {
    if (!data.width || !data.height) {
      var size = getBinResolution(data.data.length)
      if (size === false) {
        reject(Error('Unable to determine resolution.'))
        return
      }
      data.width = size.width
      data.height = size.height
    }

    if ((data.width * data.height) * 3 !== data.data.length) {
      reject(Error('Incorrect data size for the resolution given.'))
    }
    var iData = Buffer.allocUnsafe((data.data.length / 3) * 4)

    for (var y = 0; y < data.height; y++) {
      for (var x = 0; x < data.width; x++) {
        var ty = x
        var tx = data.height - y - 1

        var i = ((ty * data.height) + tx) * 3
        var i2 = ((y * data.width) + x) * 4
        iData[i2] = data.data[i + 2]
        iData[i2 + 1] = data.data[i + 1]
        iData[i2 + 2] = data.data[i]
        iData[i2 + 3] = 255
      }
    }
    resolve({
      data: iData,
      width: data.width,
      height: data.height
    })
  })
}

function rgbaToPNG (data) {
  var png = new PNG({
    width: data.width,
    height: data.height
  })

  png.data = data.data

  return png
}

function binToPNG (data) {
  return binToRGBA(data).then(rgbaToPNG)
}

function rgbaToBin (data) {
  return new Promise(function (resolve, reject) {
    if (!data.data) {
      reject(Error('Invalid data.'))
      return
    }

    if (data.data.length === 0) {
      reject(Error('No data.'))
      return
    }

    if ((data.height * data.width) * 4 !== data.data.length) {
      reject(Error('Incorrect data size for the resolution given.'))
      return
    }

    var output = Buffer.allocUnsafe((data.data.length / 4) * 3)
    for (var y = 0; y < data.height; y++) {
      for (var x = 0; x < data.width; x++) {
        var ty = x
        var tx = data.height - y - 1
        var sourceIndex = ((y * data.width) + x) * 4
        var targetIndex = ((ty * data.height) + tx) * 3

        output[targetIndex] = data.data[sourceIndex + 2]
        output[targetIndex + 1] = data.data[sourceIndex + 1]
        output[targetIndex + 2] = data.data[sourceIndex]
      }
    }
    resolve({
      data: output,
      width: data.width,
      height: data.height
    })
  })
}

function generatePreviewRGBA (rgbaArray) {
  return new Promise(function (resolve, reject) {
    if (rgbaArray.length !== 2) {
      reject(Error('Invalid data.'))
      return
    }

    if (rgbaArray[0].data.length !== 384000) {
      reject(Error('Top screen splash buffer is an invalid size.'))
      return
    }

    if (rgbaArray[1].data.length !== 307200) {
      reject(Error('Bottom screen splash buffer is an invalid size.'))
      return
    }

    const xOff = 40
    const yOff = 240

    var output = Buffer.alloc(rgbaArray[0].data.length * 2)

    for (var i = 0; i < rgbaArray[0].data.length; i++) {
      output[i] = rgbaArray[0].data[i]
    }

    for (var y = 0; y < 240; y++) {
      for (var x = 0; x < 320; x++) {
        var tx = x + xOff
        var ty = y + yOff
        var sourceIndex = ((y * 320) + x) * 4
        var targetIndex = ((ty * 400) + tx) * 4

        output[targetIndex] = rgbaArray[1].data[sourceIndex]
        output[targetIndex + 1] = rgbaArray[1].data[sourceIndex + 1]
        output[targetIndex + 2] = rgbaArray[1].data[sourceIndex + 2]
        output[targetIndex + 3] = rgbaArray[1].data[sourceIndex + 3]
      }
    }
    resolve({
      data: output,
      width: 400,
      height: 480
    })
  })
}

function generatePreviewPNG (data) {
  return generatePreviewRGBA(data).then(rgbaToPNG)
}

function getBinResolution (size) {
  switch (size) {
    case 288000: return {width: 400, height: 240}
    case 230400: return {width: 320, height: 240}
  }
  return false
}

module.exports = exports = {
  binToRGBA: binToRGBA,
  binToPNG: binToPNG,
  rgbaToPNG: rgbaToPNG,
  rgbaToBin: rgbaToBin,
  generatePreviewRGBA: generatePreviewRGBA,
  generatePreviewPNG
}
