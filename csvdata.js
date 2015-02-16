#!/usr/bin/env node

'use strict';

var fs = require('fs');
var Q = require('q');
var csv = require('csv');
var colors = require('colors');

module.exports = {
  load: function (path, opts) {
    opts = opts || {stream: false};
    var parseOpts = {
      auto_parse: true,
      columns: true,
      objname: opts.objname || false,
      skip_empty_lines: true
    };
    console.log('\nReading data from ' + path + '\n');
    if (opts.stream) {
      return fs.createReadStream(path, {encoding: 'utf8'}).pipe(csv.parse(parseOpts));
    } else {
      return Q.nfcall(fs.readFile, path, {encoding: 'utf8'}).then(function (data) {
        if (data) {
          console.log('Parsing data...\n'.yellow);
          return Q.nfcall(csv.parse, data, parseOpts).then(function (data) {
            console.log('Data parsed\n'.green);
            return data;
          });
        } else {
          console.log('File appears to be empty!\n'.yellow);
        }
      });
    }
  },
  write: function (path, data, header) {
    return Q.promise(function (resolve, reject) {
      var ws = fs.createWriteStream(path, {encoding: 'utf8'});
      ws
        .on('finish', function () {
          resolve();
        })
        .on('error', function (err) {
          reject(err);
        });
      console.log(('\nWriting data to ' + path + '\n'));
      var hlen, i, len, entry, obj;
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
          for (i = 0, len = data.length; i < len; i++) {
            var arr = data[i];
            if (Array.isArray(arr)) {
              if (arr.length === hlen) {
                ws.write(arr.join(',') + '\n');
              } else {
                if (arr[0] !== '' || arr.length !== 1) {
                  throw new Error(('Number of values at row ' + i + ' different from first line of CSV\n').red +
                                  'First line length: ' + hlen + '\n' +
                                  'Row  (length ' + arr.length + '): ' + JSON.stringify(arr) + '\n');
                }
              }
            } else {
              throw new Error(('Wrong input in array at index ' + i + '\n').red +
                              'This item is not an array:\n' + JSON.stringify(arr) + '\n');
            }
          }
        } else if (typeof data[0] === 'object') {
          // It's an array of objects
          if (header) {
            for (i = 0, len = data.length; i < len; i++) {
              obj = data[i];
              if (typeof obj === 'object') {
                entry = [];
                for (var j = 0; j < hlen; j++) {
                  if (obj.hasOwnProperty(header[j])) {
                    entry.push(obj[header[j]]);
                  } else {
                    throw new Error('Object properties do not conform to the format specified in header\n'.red +
                                    'Header: ' + JSON.stringify(header) + '\n' +
                                    'Object: ' + JSON.stringify(obj) + '\n');
                  }
                }
                ws.write(entry.join(',') + '\n');
              } else {
                throw new Error(('Wrong input in array at index ' + i + '\n').red +
                                'This item is not an object:\n' + JSON.stringify(obj) + '\n');
              }
            }
          } else {
            throw new Error('When data comes from an object, the header argument must be provided\n'.red);
          }
        }
      } else if (typeof data === 'object') {
        // It's an object (containing objects?)
        if (header) {
          for (var key in data) {
            if (data.hasOwnProperty(key)) {
              entry = [];
              obj = data[key];
              for (i = 0; i < hlen; i++) {
                if (obj.hasOwnProperty(header[i])) {
                  entry.push(obj[header[i]]);
                } else {
                  throw new Error('Object properties do not conform to the format specified in header\n'.red +
                                  'Header: ' + JSON.stringify(header) + '\n' +
                                  'Object: ' + JSON.stringify(obj) + '\n');
                }
              }
              ws.write(entry.join(',') + '\n');
            }
          }
        } else {
          throw new Error('When data comes from an object, the header argument must be provided\n'.red);
        }
      } else {
        throw new Error('Wrong input!'.red + ' Data can be accepted only in these formats:\n' +
                        '- String\n' +
                        '- Array of arrays\n' +
                        '- Array of objects\n' +
                        '- Object containing objects\n' +
                        '(see documentation for further details)\n');
      }
      ws.end();
      console.log('Data written!\n'.green);
    });
  },
  check: function (path, opts) {
    opts = opts || {empty: true};
    var result = true;
    var hlen;
    var count = 1;
    console.log('\nReading data from ' + path + '\n');
    return Q.nfcall(fs.readFile, path, {encoding: 'utf8'}).then(function (data) {
      if (data) {
        var parseOpts = {
          skip_empty_lines: true
        };
        return Q.nfcall(csv.parse, data, parseOpts).then(function (data) {
          console.log('Checking data...\n'.yellow);
          hlen = data[0].length;
          return Q.promise(function (resolve, reject) {
            csv.transform(data, function (item) {
              if (item.length !== hlen) {
                console.error('- Wrong values on line ' + count);
                result = false;
              } else {
                if (opts.empty) {
                  item.forEach(function (value) {
                    if (!value) {
                      result = false;
                      console.error('- Empty values on line ' + count);
                    }
                  });
                }
              }
              count++;
            }, function (err) {
              if (err) {
                if (program.check) {
                  console.error(err);
                  console.log('\n');
                }
                reject(err);
              }
              else {
                if (result) {
                  console.log('\nFile looks ok!\n'.green);
                } else {
                  console.error('\nFile has problems!\n'.red);
                }
                resolve(result);
              }
            });
          });
        }, function (err) {
          if (program.check && err) {
            console.error(err);
            console.log('\n');
          }
        });
      } else {
        console.log('File appears to be empty!\n'.yellow);
      }
    }, function (err) {
      if (program.check && err) {
        console.error(err);
        console.log('\n');
      }
    });
  }
};

// Code for command line usage of the "check" method
if (process.argv[1].match(/csvdata/)) {

  var program = require('commander');

  program
    .usage('[options] <file ...>')
    .option('-c, --check [filepath]', 'Check data integrity for the CSV file indicated at [filepath]')
    .option('-e, --empty', 'Accept empty values')
    .parse(process.argv);

  if (program.check) {
    module.exports.check(program.check, {empty: !program.empty});
  }

}
