const PNG = require('pngjs').PNG

/**
 * @typedef Bitmap
 * @type {Object}
 * @property {Buffer} data The bitmap Buffer
 * @property {Integer} width The image width
 * @property {Integer} height The image height
 */
/**
 * Takes an object with a key named "data" and returns a promise for an object that contains RGBA data instead.
 * @param  {Bitmap} data The bin bitmap data
 * @return {Promise<Bitmap>} A promise containing the RGBA bitmap data
 */
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

/**
 * Takes a object with RGBA data and returns a pngjs object.
 * @param  {Bitmap} data The RGBA bitmap
 * @return {pngjs.PNG} A pngjs PNG object
 */
function rgbaToPNG (data) {
  var png = new PNG({
    width: data.width,
    height: data.height
  })

  png.data = data.data

  return png
}

/**
 * Convenience function for binToRGBA and rgbaToPNG, returns a promise for the data.
 * @param  {Bitmap} data The bin bitmap data
 * @return {Promise<PNG>} A promise for a pngjs PNG object
 */
function binToPNG (data) {
  return binToRGBA(data).then(rgbaToPNG)
}

/**
 * Takes a RGBA bitmap object and returns a promise for a BGR888 formatted bitmap.
 * @param  {Bitmap} data The RGBA bitmap
 * @return {Promise<Bitmap>} A promise for a RGBA bitmap object
 */
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

/**
 * Takes an array of two pngjs objects or the return values from binToRGBA and returns RGBA for a combined preview image.
 * @param  {Array<Bitmap>} rgbaArray The top and bottom RGBA bitmap objects
 * @return {Promise<PNG>} A promise for a pngjs PNG object
 */
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

/**
 * Convenience function for generatePreviewRGBA and rgbaToPNG.
 * @param  {Bitmap} data The RGBA bitmap
 * @return {Promise<PNG>} A promise for a pngjs PNG object
 */
function generatePreviewPNG (data) {
  return generatePreviewRGBA(data).then(rgbaToPNG)
}

/**
 * @typedef SizeObject
 * @type {Object}
 * @property {Integer} width
 * @property {Integer} height
 */

/**
 * Returns the resolution based on the bin size provided
 * @param  {Integer} binLength The bin data length
 * @return {SizeObject} The image resolution
 */
function getBinResolution (binLength) {
  switch (binLength) {
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
