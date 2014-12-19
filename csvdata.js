'use strict';

var fs = require('fs');
var Q = require('q');
var csv = require('csv');
var colors = require('colors');

module.exports = {
  load: function (path, objname) {
    console.log('Reading data from '.yellow + path);
    return Q.nfcall(fs.readFile, path, {encoding: 'utf8'}).then(function (data) {
      if (data) {
        console.log('Parsing data...'.yellow);
        var parseOpts = {
          auto_parse: true,
          columns: true,
          objname: objname || false,
          skip_empty_lines: true
        }
        return Q.nfcall(csv.parse, data, parseOpts).then(function (data) {
          console.log('Data parsed'.green);
          return data
        })
      } else {
        console.log('File appears to be empty!'.yellow);
      }
    })
  },
  write: function (path, data, header) {
    var ws = fs.createWriteStream(path);
    console.log(('Writing data to ' + path).yellow);
    var hlen; // Used to compute number of CSV columns
    if (header) {
      if (typeof header === 'string') {
        ws.write(header + '\n');
        header = header.split(',');
        hlen = header.length;
      } else {
        throw new Error('The header argument must be a string'.red);
      }
    }
    if (typeof data === 'string' || Array.isArray(data)) {
      if (typeof data === 'string') {
        data = data.split('\n');
        data.forEach(function (item, index) {
          data[index] = item.split(',');
        });
      }
      // It's an array (of arrays or of objects?)
      if (Array.isArray(data[0])) {
        // It's an array of arrays
        hlen = hlen || data[0].length;
        for (var i = 0, len = data.length; i < len; i++) {
          var arr = data[i];
          if (Array.isArray(arr)) {
            if (arr.length === hlen) {
              ws.write(arr.join(',') + '\n');
            } else {
              throw new Error(('Number of values at row ' + i + ' different from first line of CSV\n').red +
                              'First line length: ' + hlen + '\n' +
                              'Row  (length ' + arr.length + '): ' + JSON.stringify(arr) + '\n');
              break;
            }
          } else {
            throw new Error(('Wrong input in array at index ' + i + '\n').red +
                            'This item is not an array:\n' + JSON.stringify(arr) + '\n');
            break;
          }
        }
      } else if (typeof data[0] === 'object') {
        // It's an array of objects
        if (header) {
          for (var i = 0, len = data.length; i < len; i++) {
            var obj = data[i];
            if (typeof obj === 'object') {
              var entry = [];
              for (var j = 0; j < hlen; j++) {
                if (obj.hasOwnProperty(header[j])) {
                  entry.push(obj[header[j]]);
                } else {
                  throw new Error('Object properties do not conform to the format specified in header\n'.red +
                                  'Header: ' + JSON.stringify(header) + '\n' +
                                  'Object: ' + JSON.stringify(obj) + '\n');
                  break;
                }
              }
              ws.write(entry.join(',') + '\n');
            } else {
              throw new Error(('Wrong input in array at index ' + i + '\n').red +
                              'This item is not an object:\n' + JSON.stringify(obj) + '\n');
              break;
            }
          }
        } else {
          throw new Error('When data comes from an object, the header argument must be provided\n'.red);
        }
      }
    } else if (typeof data === 'object') {
      // It's an object (containing objects?)
      if (header) {
        var flag = true;
        for (var key in data) {
          if (flag) {
            if (data.hasOwnProperty(key)) {
              var entry = [];
              var obj = data[key];
              for (var i = 0; i < hlen; i++) {
                if (obj.hasOwnProperty(header[i])) {
                  entry.push(obj[header[i]]);
                } else {
                  flag = false;
                  throw new Error('Object properties do not conform to the format specified in header\n'.red +
                                  'Header: ' + JSON.stringify(header) + '\n' +
                                  'Object: ' + JSON.stringify(obj) + '\n');
                  break;
                }
              }
              ws.write(entry.join(',') + '\n');
            }
          } else {
            break;
          }
        }
      } else {
        throw new Error('When data comes from an object, the header argument must be provided\n'.red);
      }
    } else {
      throw new Error('Wrong input!'.red + ' Data can be accepted only in these formats:\n\
                      - String\n\
                      - Array of arrays\n\
                      - Array of objects\n\
                      - Object containing objects\n\
                      (see documentation for further details)\n');
    }
    ws.end();
    console.log('Data written'.green);
  }
};
