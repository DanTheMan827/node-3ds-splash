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

# API Reference
## Functions

<dl>
<dt><a href="#binToRGBA">binToRGBA(data)</a> ⇒ <code><a href="#Bitmap">Promise.&lt;Bitmap&gt;</a></code></dt>
<dd><p>Takes an object with a key named &quot;data&quot; and returns a promise for an object that contains RGBA data instead.</p>
</dd>
<dt><a href="#rgbaToPNG">rgbaToPNG(data)</a> ⇒ <code>pngjs.PNG</code></dt>
<dd><p>Takes a object with RGBA data and returns a pngjs object.</p>
</dd>
<dt><a href="#binToPNG">binToPNG(data)</a> ⇒ <code>Promise.&lt;PNG&gt;</code></dt>
<dd><p>Convenience function for binToRGBA and rgbaToPNG, returns a promise for the data.</p>
</dd>
<dt><a href="#rgbaToBin">rgbaToBin(data)</a> ⇒ <code><a href="#Bitmap">Promise.&lt;Bitmap&gt;</a></code></dt>
<dd><p>Takes a RGBA bitmap object and returns a promise for a BGR888 formatted bitmap.</p>
</dd>
<dt><a href="#generatePreviewRGBA">generatePreviewRGBA(rgbaArray)</a> ⇒ <code>Promise.&lt;PNG&gt;</code></dt>
<dd><p>Takes an array of two pngjs objects or the return values from binToRGBA and returns RGBA for a combined preview image.</p>
</dd>
<dt><a href="#generatePreviewPNG">generatePreviewPNG(data)</a> ⇒ <code>Promise.&lt;PNG&gt;</code></dt>
<dd><p>Convenience function for generatePreviewRGBA and rgbaToPNG.</p>
</dd>
<dt><a href="#getBinResolution">getBinResolution(binLength)</a> ⇒ <code><a href="#SizeObject">SizeObject</a></code></dt>
<dd><p>Returns the resolution based on the bin size provided</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Bitmap">Bitmap</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#SizeObject">SizeObject</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="binToRGBA"></a>

## binToRGBA(data) ⇒ [<code>Promise.&lt;Bitmap&gt;</code>](#Bitmap)
Takes an object with a key named "data" and returns a promise for an object that contains RGBA data instead.

**Kind**: global function  
**Returns**: [<code>Promise.&lt;Bitmap&gt;</code>](#Bitmap) - A promise containing the RGBA bitmap data  

| Param | Type | Description |
| --- | --- | --- |
| data | [<code>Bitmap</code>](#Bitmap) | The bin bitmap data |

<a name="rgbaToPNG"></a>

## rgbaToPNG(data) ⇒ <code>pngjs.PNG</code>
Takes a object with RGBA data and returns a pngjs object.

**Kind**: global function  
**Returns**: <code>pngjs.PNG</code> - A pngjs PNG object  

| Param | Type | Description |
| --- | --- | --- |
| data | [<code>Bitmap</code>](#Bitmap) | The RGBA bitmap |

<a name="binToPNG"></a>

## binToPNG(data) ⇒ <code>Promise.&lt;PNG&gt;</code>
Convenience function for binToRGBA and rgbaToPNG, returns a promise for the data.

**Kind**: global function  
**Returns**: <code>Promise.&lt;PNG&gt;</code> - A promise for a pngjs PNG object  

| Param | Type | Description |
| --- | --- | --- |
| data | [<code>Bitmap</code>](#Bitmap) | The bin bitmap data |

<a name="rgbaToBin"></a>

## rgbaToBin(data) ⇒ [<code>Promise.&lt;Bitmap&gt;</code>](#Bitmap)
Takes a RGBA bitmap object and returns a promise for a BGR888 formatted bitmap.

**Kind**: global function  
**Returns**: [<code>Promise.&lt;Bitmap&gt;</code>](#Bitmap) - A promise for a RGBA bitmap object  

| Param | Type | Description |
| --- | --- | --- |
| data | [<code>Bitmap</code>](#Bitmap) | The RGBA bitmap |

<a name="generatePreviewRGBA"></a>

## generatePreviewRGBA(rgbaArray) ⇒ <code>Promise.&lt;PNG&gt;</code>
Takes an array of two pngjs objects or the return values from binToRGBA and returns RGBA for a combined preview image.

**Kind**: global function  
**Returns**: <code>Promise.&lt;PNG&gt;</code> - A promise for a pngjs PNG object  

| Param | Type | Description |
| --- | --- | --- |
| rgbaArray | [<code>Array.&lt;Bitmap&gt;</code>](#Bitmap) | The top and bottom RGBA bitmap objects |

<a name="generatePreviewPNG"></a>

## generatePreviewPNG(data) ⇒ <code>Promise.&lt;PNG&gt;</code>
Convenience function for generatePreviewRGBA and rgbaToPNG.

**Kind**: global function  
**Returns**: <code>Promise.&lt;PNG&gt;</code> - A promise for a pngjs PNG object  

| Param | Type | Description |
| --- | --- | --- |
| data | [<code>Bitmap</code>](#Bitmap) | The RGBA bitmap |

<a name="getBinResolution"></a>

## getBinResolution(binLength) ⇒ [<code>SizeObject</code>](#SizeObject)
Returns the resolution based on the bin size provided

**Kind**: global function  
**Returns**: [<code>SizeObject</code>](#SizeObject) - The image resolution  

| Param | Type | Description |
| --- | --- | --- |
| binLength | <code>Integer</code> | The bin data length |

<a name="Bitmap"></a>

## Bitmap : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| data | <code>Buffer</code> | The bitmap Buffer |
| width | <code>Integer</code> | The image width |
| height | <code>Integer</code> | The image height |

<a name="SizeObject"></a>

## SizeObject : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| width | <code>Integer</code> | 
| height | <code>Integer</code> | 

