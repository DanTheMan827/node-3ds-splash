# 3ds-splash
3ds-splash is a promise based module that can either take PNG images and encode them to the 3DS bin image format or take the bin image and decode it to PNG.

## Usage
The PNG data returned is not raw PNG data but rather pngjs objects.

### Single Bin to Pngjs Object
```javascript
var splash = require("3ds-splash");

splash.binToPng({
  data: binBuffer
})
  .then(function(png){
    // The pngjs object is stored in the png variable
    // You can pipe the stream however you like, this is how you would save it to a file.

    png.pack()
      .pipe(fs.createWriteStream('./newfile.png'))
      .on('finish', function() {
        console.log('Written!');
      });
  })
  .catch(function(err){
    // Something went wrong, log it.
    console.log(err.stack);
  });
```

### Top and Bottom Bin to a Combined Png Preview
```javascript
var splash = require("3ds-splash");

Promise.all([
  splash.binToRGBA({
    data: topBinBuffer
  }),
  splash.binToRGBA({
    data: bottomBinBuffer
  })
])
  .then(splash.generatePreviewPNG)
  .then(function(png){
    // The pngjs object is stored in the png variable
    // You can pipe the stream however you like, this is how you would save it to a file.
    
    png.pack()
      .pipe(fs.createWriteStream('./newfile.png'))
      .on('finish', function() {
        console.log('Written!');
      });
  })
  .catch(function(err){
    // Something went wrong, log it.
    console.log(err.stack);
  });
```

### Png to Bin
```javascript
var fs = require("fs"),
    PNG = require("pngjs").PNG,
    splash = require("3ds-splash");

fs.createReadStream('./top.png')
  .pipe(new PNG())
  .on('parsed', function() {
    splash.rgbaToBin(this).then(function(binData){
      // binData.data is a buffer, here's how to save it.
      fs.writeFileSync("./splash.bin", binData.data);
    });
  });
```

## Functions

### binToRGBA
Takes an object with a key named "data" and returns a promise for an object that contains RGBA data instead.

### rgbaToPNG
Takes a object with RGBA data and returns a pngjs object.

### binToPng
Convenience function for binToRGBA and rgbaToPNG, returns a promise for the data.

### rgbaToBin
Takes a pngjs object and returns a promise for an object with BGR (homebrew bin) formatted data in the "data" key.

### generatePreviewRGBA
Takes an array of two pngjs objects or the return values from binToRGBA and returns RGBA for a combined preview image.

### generatePreviewPNG
Convenience function for generatePreviewRGBA and rgbaToPNG.