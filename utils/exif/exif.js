(function () {
  var Blob = Blob || function () { }
  var debug = false;

  var root = this;
  // pretty

  var EXIF = function (obj) {
    if (obj instanceof EXIF) return obj;
    if (!(this instanceof EXIF)) return new EXIF(obj);
    this.EXIFwrapped = obj;
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = EXIF;
    }
    exports.EXIF = EXIF;
  } else {
    root.EXIF = EXIF;
  }

  var ExifTags = EXIF.Tags = {

  };

  var TiffTags = EXIF.TiffTags = {
    
    0x0132: "DateTime",
    
  };

  var GPSTags = EXIF.GPSTags = {
    
  };

  
  var IFD1Tags = EXIF.IFD1Tags = {
    
  };

  var StringValues = EXIF.StringValues = {
    ExposureProgram: {
      0: "Not defined",
      1: "Manual",
      2: "Normal program",
      3: "Aperture priority",
      4: "Shutter priority",
      5: "Creative program",
      6: "Action program",
      7: "Portrait mode",
      8: "Landscape mode"
    },
    MeteringMode: {
      0: "Unknown",
      1: "Average",
      2: "CenterWeightedAverage",
      3: "Spot",
      4: "MultiSpot",
      5: "Pattern",
      6: "Partial",
      255: "Other"
    },
    LightSource: {
      0: "Unknown",
      1: "Daylight",
      2: "Fluorescent",
      3: "Tungsten (incandescent light)",
      4: "Flash",
      9: "Fine weather",
      10: "Cloudy weather",
      11: "Shade",
      12: "Daylight fluorescent (D 5700 - 7100K)",
      13: "Day white fluorescent (N 4600 - 5400K)",
      14: "Cool white fluorescent (W 3900 - 4500K)",
      15: "White fluorescent (WW 3200 - 3700K)",
      17: "Standard light A",
      18: "Standard light B",
      19: "Standard light C",
      20: "D55",
      21: "D65",
      22: "D75",
      23: "D50",
      24: "ISO studio tungsten",
      255: "Other"
    },
    Flash: {
      0x0000: "Flash did not fire",
      0x0001: "Flash fired",
      0x0005: "Strobe return light not detected",
      0x0007: "Strobe return light detected",
      0x0009: "Flash fired, compulsory flash mode",
      0x000D: "Flash fired, compulsory flash mode, return light not detected",
      0x000F: "Flash fired, compulsory flash mode, return light detected",
      0x0010: "Flash did not fire, compulsory flash mode",
      0x0018: "Flash did not fire, auto mode",
      0x0019: "Flash fired, auto mode",
      0x001D: "Flash fired, auto mode, return light not detected",
      0x001F: "Flash fired, auto mode, return light detected",
      0x0020: "No flash function",
      0x0041: "Flash fired, red-eye reduction mode",
      0x0045: "Flash fired, red-eye reduction mode, return light not detected",
      0x0047: "Flash fired, red-eye reduction mode, return light detected",
      0x0049: "Flash fired, compulsory flash mode, red-eye reduction mode",
      0x004D: "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
      0x004F: "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
      0x0059: "Flash fired, auto mode, red-eye reduction mode",
      0x005D: "Flash fired, auto mode, return light not detected, red-eye reduction mode",
      0x005F: "Flash fired, auto mode, return light detected, red-eye reduction mode"
    },
    SensingMethod: {
      1: "Not defined",
      2: "One-chip color area sensor",
      3: "Two-chip color area sensor",
      4: "Three-chip color area sensor",
      5: "Color sequential area sensor",
      7: "Trilinear sensor",
      8: "Color sequential linear sensor"
    },
    SceneCaptureType: {
      0: "Standard",
      1: "Landscape",
      2: "Portrait",
      3: "Night scene"
    },
    SceneType: {
      1: "Directly photographed"
    },
    CustomRendered: {
      0: "Normal process",
      1: "Custom process"
    },
    WhiteBalance: {
      0: "Auto white balance",
      1: "Manual white balance"
    },
    GainControl: {
      0: "None",
      1: "Low gain up",
      2: "High gain up",
      3: "Low gain down",
      4: "High gain down"
    },
    Contrast: {
      0: "Normal",
      1: "Soft",
      2: "Hard"
    },
    Saturation: {
      0: "Normal",
      1: "Low saturation",
      2: "High saturation"
    },
    Sharpness: {
      0: "Normal",
      1: "Soft",
      2: "Hard"
    },
    SubjectDistanceRange: {
      0: "Unknown",
      1: "Macro",
      2: "Close view",
      3: "Distant view"
    },
    FileSource: {
      3: "DSC"
    },

    Components: {
      0: "",
      1: "Y",
      2: "Cb",
      3: "Cr",
      4: "R",
      5: "G",
      6: "B"
    }
  };

  function addEvent(element, event, handler) {
    if (element.addEventListener) {
      element.addEventListener(event, handler, false);
    } else if (element.attachEvent) {
      element.attachEvent("on" + event, handler);
    }
  }

  function imageHasData(img) {
    return !!(img.exifdata);
  }


  function base64ToArrayBuffer(base64, contentType) {
    contentType = contentType || base64.match(/^data\:([^\;]+)\;base64,/mi)[1] || ''; // e.g. 'data:image/jpeg;base64,...' => 'image/jpeg'
    base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
    var binary = atob(base64);
    var len = binary.length;
    var buffer = new ArrayBuffer(len);
    var view = new Uint8Array(buffer);
    for (var i = 0; i < len; i++) {
      view[i] = binary.charCodeAt(i);
    }
    return buffer;
  }

  function objectURLToBlob(url, callback) {
    var http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.responseType = "blob";
    http.onload = function (e) {
      if (this.status == 200 || this.status === 0) {
        callback(this.response);
      }
    };
    http.send();
  }

  function getImageData(img, callback) {
    function handleBinaryFile(binFile) {
      var data = findEXIFinJPEG(binFile);
      img.exifdata = data || {};
      var iptcdata = findIPTCinJPEG(binFile);
      img.iptcdata = iptcdata || {};
      if (EXIF.isXmpEnabled) {
        var xmpdata = findXMPinJPEG(binFile);
        img.xmpdata = xmpdata || {};
      }
      if (callback) {
        callback.call(img);
      }
    }

    if (img.src) {
      if (/^data\:/i.test(img.src)) { // Data URI
        var arrayBuffer = base64ToArrayBuffer(img.src);
        handleBinaryFile(arrayBuffer);

      } else if (/^blob\:/i.test(img.src)) { // Object URL
        var fileReader = new FileReader();
        fileReader.onload = function (e) {
          handleBinaryFile(e.target.result);
        };
        objectURLToBlob(img.src, function (blob) {
          fileReader.readAsArrayBuffer(blob);
        });
      } else {
        var http = new XMLHttpRequest();
        http.onload = function () {
          if (this.status == 200 || this.status === 0) {
            handleBinaryFile(http.response);
          } else {
            throw "Could not load image";
          }
          http = null;
        };
        http.open("GET", img.src, true);
        http.responseType = "arraybuffer";
        http.send(null);
      }
    } else if (img instanceof ArrayBuffer) {
      handleBinaryFile(img)
    } else if (self.FileReader && (img instanceof self.Blob || img instanceof self.File)) {
      var fileReader = new FileReader();
      fileReader.onload = function (e) {
        if (debug) console.log("Got file of length " + e.target.result.byteLength);
        handleBinaryFile(e.target.result);
      };

      fileReader.readAsArrayBuffer(img);
    }
  }

  function findEXIFinJPEG(file) {
    var dataView = new DataView(file);

    if (debug) console.log("Got file of length " + file.byteLength);
    if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
      if (debug) console.log("Not a valid JPEG");
      return false; // not a valid jpeg
    }

    var offset = 2,
      length = file.byteLength,
      marker;

    while (offset < length) {
      if (dataView.getUint8(offset) != 0xFF) {
        if (debug) console.log("Not a valid marker at offset " + offset + ", found: " + dataView.getUint8(offset));
        return false; // not a valid marker, something is wrong
      }

      marker = dataView.getUint8(offset + 1);
      if (debug) console.log(marker);

      // we could implement handling for other markers here,
      // but we're only looking for 0xFFE1 for EXIF data

      if (marker == 225) {
        if (debug) console.log("Found 0xFFE1 marker");

        return readEXIFData(dataView, offset + 4, dataView.getUint16(offset + 2) - 2);

        // offset += 2 + file.getShortAt(offset+2, true);

      } else {
        offset += 2 + dataView.getUint16(offset + 2);
      }

    }

  }

  function findIPTCinJPEG(file) {
    var dataView = new DataView(file);

    if (debug) console.log("Got file of length " + file.byteLength);
    if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
      if (debug) console.log("Not a valid JPEG");
      return false; // not a valid jpeg
    }

    var offset = 2,
      length = file.byteLength;


    var isFieldSegmentStart = function (dataView, offset) {
      return (
        dataView.getUint8(offset) === 0x38 &&
        dataView.getUint8(offset + 1) === 0x42 &&
        dataView.getUint8(offset + 2) === 0x49 &&
        dataView.getUint8(offset + 3) === 0x4D &&
        dataView.getUint8(offset + 4) === 0x04 &&
        dataView.getUint8(offset + 5) === 0x04
      );
    };

    while (offset < length) {

      if (isFieldSegmentStart(dataView, offset)) {

        // Get the length of the name header (which is padded to an even number of bytes)
        var nameHeaderLength = dataView.getUint8(offset + 7);
        if (nameHeaderLength % 2 !== 0) nameHeaderLength += 1;
        // Check for pre photoshop 6 format
        if (nameHeaderLength === 0) {
          // Always 4
          nameHeaderLength = 4;
        }

        var startOffset = offset + 8 + nameHeaderLength;
        var sectionLength = dataView.getUint16(offset + 6 + nameHeaderLength);

        return readIPTCData(file, startOffset, sectionLength);

        break;

      }


      // Not the marker, continue searching
      offset++;

    }

  }
  var IptcFieldMap = {
    0x78: 'caption',
    0x6E: 'credit',
    0x19: 'keywords',
    0x37: 'dateCreated',
    0x50: 'byline',
    0x55: 'bylineTitle',
    0x7A: 'captionWriter',
    0x69: 'headline',
    0x74: 'copyright',
    0x0F: 'category'
  };
  function readIPTCData(file, startOffset, sectionLength) {
    var dataView = new DataView(file);
    var data = {};
    var fieldValue, fieldName, dataSize, segmentType, segmentSize;
    var segmentStartPos = startOffset;
    while (segmentStartPos < startOffset + sectionLength) {
      if (dataView.getUint8(segmentStartPos) === 0x1C && dataView.getUint8(segmentStartPos + 1) === 0x02) {
        segmentType = dataView.getUint8(segmentStartPos + 2);
        if (segmentType in IptcFieldMap) {
          dataSize = dataView.getInt16(segmentStartPos + 3);
          segmentSize = dataSize + 5;
          fieldName = IptcFieldMap[segmentType];
          fieldValue = getStringFromDB(dataView, segmentStartPos + 5, dataSize);
          // Check if we already stored a value with this name
          if (data.hasOwnProperty(fieldName)) {
            // Value already stored with this name, create multivalue field
            if (data[fieldName] instanceof Array) {
              data[fieldName].push(fieldValue);
            }
            else {
              data[fieldName] = [data[fieldName], fieldValue];
            }
          }
          else {
            data[fieldName] = fieldValue;
          }
        }

      }
      segmentStartPos++;
    }
    return data;
  }



  function readTags(file, tiffStart, dirStart, strings, bigEnd) {
    var entries = file.getUint16(dirStart, !bigEnd),
      tags = {},
      entryOffset, tag,
      i;

    for (i = 0; i < entries; i++) {
      entryOffset = dirStart + i * 12 + 2;
      tag = strings[file.getUint16(entryOffset, !bigEnd)];
      if (!tag && debug) console.log("Unknown tag: " + file.getUint16(entryOffset, !bigEnd));
      tags[tag] = readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
    }
    return tags;
  }


  function readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd) {
    var type = file.getUint16(entryOffset + 2, !bigEnd),
      numValues = file.getUint32(entryOffset + 4, !bigEnd),
      valueOffset = file.getUint32(entryOffset + 8, !bigEnd) + tiffStart,
      offset,
      vals, val, n,
      numerator, denominator;

    switch (type) {
      case 1: // byte, 8-bit unsigned int
      case 7: // undefined, 8-bit byte, value depending on field
        if (numValues == 1) {
          return file.getUint8(entryOffset + 8, !bigEnd);
        } else {
          offset = numValues > 4 ? valueOffset : (entryOffset + 8);
          vals = [];
          for (n = 0; n < numValues; n++) {
            vals[n] = file.getUint8(offset + n);
          }
          return vals;
        }

      case 2: // ascii, 8-bit byte
        offset = numValues > 4 ? valueOffset : (entryOffset + 8);
        return getStringFromDB(file, offset, numValues - 1);

      case 3: // short, 16 bit int
        if (numValues == 1) {
          return file.getUint16(entryOffset + 8, !bigEnd);
        } else {
          offset = numValues > 2 ? valueOffset : (entryOffset + 8);
          vals = [];
          for (n = 0; n < numValues; n++) {
            vals[n] = file.getUint16(offset + 2 * n, !bigEnd);
          }
          return vals;
        }

      case 4: // long, 32 bit int
        if (numValues == 1) {
          return file.getUint32(entryOffset + 8, !bigEnd);
        } else {
          vals = [];
          for (n = 0; n < numValues; n++) {
            vals[n] = file.getUint32(valueOffset + 4 * n, !bigEnd);
          }
          return vals;
        }

      case 5:    // rational = two long values, first is numerator, second is denominator
        if (numValues == 1) {
          numerator = file.getUint32(valueOffset, !bigEnd);
          denominator = file.getUint32(valueOffset + 4, !bigEnd);
          val = new Number(numerator / denominator);
          val.numerator = numerator;
          val.denominator = denominator;
          return val;
        } else {
          vals = [];
          for (n = 0; n < numValues; n++) {
            numerator = file.getUint32(valueOffset + 8 * n, !bigEnd);
            denominator = file.getUint32(valueOffset + 4 + 8 * n, !bigEnd);
            vals[n] = new Number(numerator / denominator);
            vals[n].numerator = numerator;
            vals[n].denominator = denominator;
          }
          return vals;
        }

      case 9: // slong, 32 bit signed int
        if (numValues == 1) {
          return file.getInt32(entryOffset + 8, !bigEnd);
        } else {
          vals = [];
          for (n = 0; n < numValues; n++) {
            vals[n] = file.getInt32(valueOffset + 4 * n, !bigEnd);
          }
          return vals;
        }

      case 10: // signed rational, two slongs, first is numerator, second is denominator
        if (numValues == 1) {
          return file.getInt32(valueOffset, !bigEnd) / file.getInt32(valueOffset + 4, !bigEnd);
        } else {
          vals = [];
          for (n = 0; n < numValues; n++) {
            vals[n] = file.getInt32(valueOffset + 8 * n, !bigEnd) / file.getInt32(valueOffset + 4 + 8 * n, !bigEnd);
          }
          return vals;
        }
    }
  }

  /**
  * Given an IFD (Image File Directory) start offset
  * returns an offset to next IFD or 0 if it's the last IFD.
  */
  function getNextIFDOffset(dataView, dirStart, bigEnd) {
    //the first 2bytes means the number of directory entries contains in this IFD
    var entries = dataView.getUint16(dirStart, !bigEnd);

    // After last directory entry, there is a 4bytes of data,
    // it means an offset to next IFD.
    // If its value is '0x00000000', it means this is the last IFD and there is no linked IFD.

    return dataView.getUint32(dirStart + 2 + entries * 12, !bigEnd); // each entry is 12 bytes long
  }

  function readThumbnailImage(dataView, tiffStart, firstIFDOffset, bigEnd) {
    // get the IFD1 offset
    var IFD1OffsetPointer = getNextIFDOffset(dataView, tiffStart + firstIFDOffset, bigEnd);

    if (!IFD1OffsetPointer) {
      // console.log('******** IFD1Offset is empty, image thumb not found ********');
      return {};
    }
    else if (IFD1OffsetPointer > dataView.byteLength) { // this should not happen
      // console.log('******** IFD1Offset is outside the bounds of the DataView ********');
      return {};
    }
    // console.log('*******  thumbnail IFD offset (IFD1) is: %s', IFD1OffsetPointer);

    var thumbTags = readTags(dataView, tiffStart, tiffStart + IFD1OffsetPointer, IFD1Tags, bigEnd)

    // EXIF 2.3 specification for JPEG format thumbnail

    // If the value of Compression(0x0103) Tag in IFD1 is '6', thumbnail image format is JPEG.
    // Most of Exif image uses JPEG format for thumbnail. In that case, you can get offset of thumbnail
    // by JpegIFOffset(0x0201) Tag in IFD1, size of thumbnail by JpegIFByteCount(0x0202) Tag.
    // Data format is ordinary JPEG format, starts from 0xFFD8 and ends by 0xFFD9. It seems that
    // JPEG format and 160x120pixels of size are recommended thumbnail format for Exif2.1 or later.

    if (thumbTags['Compression']) {
      // console.log('Thumbnail image found!');

      switch (thumbTags['Compression']) {
        case 6:
          // console.log('Thumbnail image format is JPEG');
          if (thumbTags.JpegIFOffset && thumbTags.JpegIFByteCount) {
            // extract the thumbnail
            var tOffset = tiffStart + thumbTags.JpegIFOffset;
            var tLength = thumbTags.JpegIFByteCount;
            thumbTags['blob'] = new Blob([new Uint8Array(dataView.buffer, tOffset, tLength)], {
              type: 'image/jpeg'
            });
          }
          break;

        case 1:
          console.log("Thumbnail image format is TIFF, which is not implemented.");
          break;
        default:
          console.log("Unknown thumbnail image format '%s'", thumbTags['Compression']);
      }
    }
    else if (thumbTags['PhotometricInterpretation'] == 2) {
      console.log("Thumbnail image format is RGB, which is not implemented.");
    }
    return thumbTags;
  }

  function getStringFromDB(buffer, start, length) {
    var outstr = "";
    for (var n = start; n < start + length; n++) {
      outstr += String.fromCharCode(buffer.getUint8(n));
    }
    return outstr;
  }

  function readEXIFData(file, start) {
    if (getStringFromDB(file, start, 4) != "Exif") {
      if (debug) console.log("Not valid EXIF data! " + getStringFromDB(file, start, 4));
      return false;
    }

    var bigEnd,
      tags, tag,
      exifData, gpsData,
      tiffOffset = start + 6;

    // test for TIFF validity and endianness
    if (file.getUint16(tiffOffset) == 0x4949) {
      bigEnd = false;
    } else if (file.getUint16(tiffOffset) == 0x4D4D) {
      bigEnd = true;
    } else {
      if (debug) console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
      return false;
    }

    if (file.getUint16(tiffOffset + 2, !bigEnd) != 0x002A) {
      if (debug) console.log("Not valid TIFF data! (no 0x002A)");
      return false;
    }

    var firstIFDOffset = file.getUint32(tiffOffset + 4, !bigEnd);

    if (firstIFDOffset < 0x00000008) {
      if (debug) console.log("Not valid TIFF data! (First offset less than 8)", file.getUint32(tiffOffset + 4, !bigEnd));
      return false;
    }

    tags = readTags(file, tiffOffset, tiffOffset + firstIFDOffset, TiffTags, bigEnd);

    if (tags.ExifIFDPointer) {
      exifData = readTags(file, tiffOffset, tiffOffset + tags.ExifIFDPointer, ExifTags, bigEnd);
      for (tag in exifData) {
        switch (tag) {
          case "LightSource":
          case "Flash":
          case "MeteringMode":
          case "ExposureProgram":
          case "SensingMethod":
          case "SceneCaptureType":
          case "SceneType":
          case "CustomRendered":
          case "WhiteBalance":
          case "GainControl":
          case "Contrast":
          case "Saturation":
          case "Sharpness":
          case "SubjectDistanceRange":
          case "FileSource":
            exifData[tag] = StringValues[tag][exifData[tag]];
            break;

          case "ExifVersion":
          case "FlashpixVersion":
            exifData[tag] = String.fromCharCode(exifData[tag][0], exifData[tag][1], exifData[tag][2], exifData[tag][3]);
            break;

          case "ComponentsConfiguration":
            exifData[tag] =
              StringValues.Components[exifData[tag][0]] +
              StringValues.Components[exifData[tag][1]] +
              StringValues.Components[exifData[tag][2]] +
              StringValues.Components[exifData[tag][3]];
            break;
        }
        tags[tag] = exifData[tag];
      }
    }

    if (tags.GPSInfoIFDPointer) {
      gpsData = readTags(file, tiffOffset, tiffOffset + tags.GPSInfoIFDPointer, GPSTags, bigEnd);
      for (tag in gpsData) {
        switch (tag) {
          case "GPSVersionID":
            gpsData[tag] = gpsData[tag][0] +
              "." + gpsData[tag][1] +
              "." + gpsData[tag][2] +
              "." + gpsData[tag][3];
            break;
        }
        tags[tag] = gpsData[tag];
      }
    }

    // extract thumbnail
    tags['thumbnail'] = readThumbnailImage(file, tiffOffset, firstIFDOffset, bigEnd);

    return tags;
  }

  function findXMPinJPEG(file) {

    if (!('DOMParser' in self)) {
      // console.warn('XML parsing not supported without DOMParser');
      return;
    }
    var dataView = new DataView(file);

    if (debug) console.log("Got file of length " + file.byteLength);
    if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
      if (debug) console.log("Not a valid JPEG");
      return false; // not a valid jpeg
    }

    var offset = 2,
      length = file.byteLength,
      dom = new DOMParser();

    while (offset < (length - 4)) {
      if (getStringFromDB(dataView, offset, 4) == "http") {
        var startOffset = offset - 1;
        var sectionLength = dataView.getUint16(offset - 2) - 1;
        var xmpString = getStringFromDB(dataView, startOffset, sectionLength)
        var xmpEndIndex = xmpString.indexOf('xmpmeta>') + 8;
        xmpString = xmpString.substring(xmpString.indexOf('<x:xmpmeta'), xmpEndIndex);

        var indexOfXmp = xmpString.indexOf('x:xmpmeta') + 10
        //Many custom written programs embed xmp/xml without any namespace. Following are some of them.
        //Without these namespaces, XML is thought to be invalid by parsers
        xmpString = xmpString.slice(0, indexOfXmp)
          + 'xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/" '
          + 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
          + 'xmlns:tiff="http://ns.adobe.com/tiff/1.0/" '
          + 'xmlns:plus="http://schemas.android.com/apk/lib/com.google.android.gms.plus" '
          + 'xmlns:ext="http://www.gettyimages.com/xsltExtension/1.0" '
          + 'xmlns:exif="http://ns.adobe.com/exif/1.0/" '
          + 'xmlns:stEvt="http://ns.adobe.com/xap/1.0/sType/ResourceEvent#" '
          + 'xmlns:stRef="http://ns.adobe.com/xap/1.0/sType/ResourceRef#" '
          + 'xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/" '
          + 'xmlns:xapGImg="http://ns.adobe.com/xap/1.0/g/img/" '
          + 'xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" '
          + xmpString.slice(indexOfXmp)

        var domDocument = dom.parseFromString(xmpString, 'text/xml');
        return xml2Object(domDocument);
      } else {
        offset++;
      }
    }
  }

  function xml2json(xml) {
    var json = {};

    if (xml.nodeType == 1) { // element node
      if (xml.attributes.length > 0) {
        json['@attributes'] = {};
        for (var j = 0; j < xml.attributes.length; j++) {
          var attribute = xml.attributes.item(j);
          json['@attributes'][attribute.nodeName] = attribute.nodeValue;
        }
      }
    } else if (xml.nodeType == 3) { // text node
      return xml.nodeValue;
    }

    // deal with children
    if (xml.hasChildNodes()) {
      for (var i = 0; i < xml.childNodes.length; i++) {
        var child = xml.childNodes.item(i);
        var nodeName = child.nodeName;
        if (json[nodeName] == null) {
          json[nodeName] = xml2json(child);
        } else {
          if (json[nodeName].push == null) {
            var old = json[nodeName];
            json[nodeName] = [];
            json[nodeName].push(old);
          }
          json[nodeName].push(xml2json(child));
        }
      }
    }

    return json;
  }

  function xml2Object(xml) {
    try {
      var obj = {};
      if (xml.children.length > 0) {
        for (var i = 0; i < xml.children.length; i++) {
          var item = xml.children.item(i);
          var attributes = item.attributes;
          for (var idx in attributes) {
            var itemAtt = attributes[idx];
            var dataKey = itemAtt.nodeName;
            var dataValue = itemAtt.nodeValue;

            if (dataKey !== undefined) {
              obj[dataKey] = dataValue;
            }
          }
          var nodeName = item.nodeName;

          if (typeof (obj[nodeName]) == "undefined") {
            obj[nodeName] = xml2json(item);
          } else {
            if (typeof (obj[nodeName].push) == "undefined") {
              var old = obj[nodeName];

              obj[nodeName] = [];
              obj[nodeName].push(old);
            }
            obj[nodeName].push(xml2json(item));
          }
        }
      } else {
        obj = xml.textContent;
      }
      return obj;
    } catch (e) {
      console.log(e.message);
    }
  }

  EXIF.enableXmp = function () {
    EXIF.isXmpEnabled = true;
  }

  EXIF.disableXmp = function () {
    EXIF.isXmpEnabled = false;
  }

  EXIF.getData = function (img, callback) {
    // if (((self.Image && img instanceof self.Image)
    //     || (self.HTMLImageElement && img instanceof self.HTMLImageElement))
    //     && !img.complete)
    //     return false;

    if (!imageHasData(img)) {
      getImageData(img, callback);
    } else {
      if (callback) {
        callback.call(img);
      }
    }
    return true;
  }

  EXIF.getTag = function (img, tag) {
    if (!imageHasData(img)) return;
    return img.exifdata[tag];
  }

  EXIF.getIptcTag = function (img, tag) {
    if (!imageHasData(img)) return;
    return img.iptcdata[tag];
  }

  EXIF.getAllTags = function (img) {
    if (!imageHasData(img)) return {};
    var a,
      data = img.exifdata,
      tags = {};
    for (a in data) {
      if (data.hasOwnProperty(a)) {
        tags[a] = data[a];
      }
    }
    return tags;
  }

  EXIF.getAllIptcTags = function (img) {
    if (!imageHasData(img)) return {};
    var a,
      data = img.iptcdata,
      tags = {};
    for (a in data) {
      if (data.hasOwnProperty(a)) {
        tags[a] = data[a];
      }
    }
    return tags;
  }

  EXIF.pretty = function (img) {
    if (!imageHasData(img)) return "";
    var a,
      data = img.exifdata,
      strPretty = "";
    for (a in data) {
      if (data.hasOwnProperty(a)) {
        if (typeof data[a] == "object") {
          if (data[a] instanceof Number) {
            strPretty += a + " : " + data[a] + " [" + data[a].numerator + "/" + data[a].denominator + "]\r\n";
          } else {
            strPretty += a + " : [" + data[a].length + " values]\r\n";
          }
        } else {
          strPretty += a + " : " + data[a] + "\r\n";
        }
      }
    }
    return strPretty;
  }

  EXIF.readFromBinaryFile = function (file) {
    return findEXIFinJPEG(file);
  }

  if (typeof define === 'function' && define.amd) {
    define('exif-js', [], function () {
      return EXIF;
    });
  }
}.call(this));

