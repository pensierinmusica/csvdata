#!/usr/bin/env node

'use strict';

var promisify = require('js-promisify');
var fs = require('fs');
var csv = require('csv');
var through = require('through');
var firstline = require('firstline');
var colors = require('colors');

// Helper to apply user-defined options
function setOpts (standard, user) {
  if (typeof user === 'object') {
    for (var key in user) {
      user[key] !== undefined && (standard[key] = user[key]);
    }
  }
}

module.exports = {
  load: function (path, options) {
    var opts, parseOpts;
    opts = {
      objName: false,
      stream: false,
    };
    setOpts(opts, options);
    parseOpts = opts._parseOpts || { // "_parseOpts" is a private option, used for the "check()" method
      auto_parse: true,
      columns: true,
      objname: opts.objName,
      skip_empty_lines: true
    };
    console.log('\nReading data from ' + path + '\n');
    if (opts.stream) {
      return fs.createReadStream(path, {encoding: 'utf8'}).pipe(csv.parse(parseOpts));
    } else {
      return promisify(fs.readFile, [path, {encoding: 'utf8'}])
        .then(function (data) {
          if (data) {
            console.log('Parsing data...\n'.yellow);
            return promisify(csv.parse, [data, parseOpts]).then(function (data) {
              console.log('Data parsed\n'.green);
              return data;
            });
          } else {
            console.log('File appears to be empty!\n'.yellow);
          }
        });
    }
  },
  write: function (path, data, options) {
    var opts, header, hlen, i, j, arr, value, entry, obj, key;
    opts = {
      empty: false,
      header: false,
      delimiter: ','
    };
    setOpts(opts, options);
    header = opts.header;
    return new Promise(function (resolve, reject) {
      var ws = fs.createWriteStream(path, {encoding: 'utf8'});
      ws
        .on('finish', function () {
          resolve();
        })
        .on('error', function (err) {
          reject(err);
        });
      console.log(('\nWriting data to ' + path + '\n'));
      if (header) {
        if (typeof header === 'string') {
          header = header.split(',');
          hlen = header.length;
          header.every(function (item) {
            if (item.length === 0) {
              throw new Error('Header column titles can not be empty');
            }
          });
          ws.write(header + '\n');
        } else if (Object.prototype.toString.call( header ) === '[object Array]') {
          hlen = header.length;
          header.every(function (item) {
            if (item.length === 0) {
              throw new Error('Header column titles can not be empty');
            }
          });
          ws.write(header.join(opts.delimiter) + '\n');
        } else {
          throw new Error('The header argument must be a string'.red);
        }
      }
      if (typeof data === 'string' || Array.isArray(data)) {
        if (typeof data === 'string') {
          data = data.split('\n');
          for (i = 0; i < data.length; i++) {
            data[i] = data[i].split(',');
          }
        }
        // It's an array (of arrays or of objects?)
        if (Array.isArray(data[0])) {
          // It's an array of arrays
          hlen = hlen || data[0].length;
          for (i = 0; i < data.length; i++) {
            arr = data[i];
            if (Array.isArray(arr)) {
              if (arr.length === hlen) {
                if (opts.empty) {
                  for (j = 0; j < arr.length; j++) {
                    value = arr[j];
                    if (value === undefined || value === null || value === '') {
                      throw new Error(('Empty value "' + header[j] + '" at line' + (j + 1) + ':\n').red +
                                      JSON.stringify(arr) + '\n');
                    }
                  }
                }
                ws.write(arr.join(opts.delimiter) + '\n');
              } else {
                if (arr[0] !== '' || arr.length !== 1) {
                  throw new Error(('Number of values different from first line of CSV\n').red +
                                  'First line length: ' + hlen + '\n' +
                                  'Entry  (length ' + arr.length + '): ' + JSON.stringify(arr) + '\n');
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
            for (i = 0; i < data.length; i++) {
              obj = data[i];
              if (typeof obj === 'object') {
                entry = [];
                for (j = 0; j < header.length; j++) {
                  key = header[j];
                  if (obj.hasOwnProperty(key)) {
                    value = obj[key];
                    if (opts.empty) {
                      if (value === undefined || value === null || value === '') {
                        throw new Error(('Empty value "' + key + '"" in object:\n').red +
                                        JSON.stringify(obj) + '\n');
                      }
                    }
                    entry.push(value);
                  } else {
                    throw new Error('Object properties do not conform to the format specified in header\n'.red +
                                    'Header: ' + JSON.stringify(header) + '\n' +
                                    'Object: ' + JSON.stringify(obj) + '\n');
                  }
                }
                ws.write(entry.join(opts.delimiter) + '\n');
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
          var objIndex = Object.keys(data);
          for (i = 0; i < objIndex.length; i++) {
            obj = data[objIndex[i]];
            entry = [];
            for (j = 0; j < header.length; j++) {
              key = header[j];
              if (obj.hasOwnProperty(key)) {
                value = obj[key];
                if (opts.empty) {
                  if (value === undefined || value === null || value === '') {
                    throw new Error(('Empty value "' + key + '"" in object:\n').red +
                                    JSON.stringify(obj) + '\n');
                  }
                }
                entry.push(value);
              } else {
                throw new Error('Object properties do not conform to the format specified in header\n'.red +
                                'Header: ' + JSON.stringify(header) + '\n' +
                                'Object: ' + JSON.stringify(obj) + '\n');
              }
            }
            ws.write(entry.join(opts.delimiter) + '\n');
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
  check: function (path, options) {
    var opts, cols, err, hlen, limit, i, result, count, missing, emptyLines, emptyValues, duplicates, log, col, item, memo, map, mapKeys, key;
    opts = {
      duplicates: false,
      emptyLines: false,
      emptyValues: true,
      limit: false,
      log: true
    };
    setOpts(opts, options);
    return firstline(path)
      .then(function (line) {
        cols = line.split(',');
        if (cols.length === 1 && cols[0] === '') {
          console.log('\nReading data from ' + path +
                      '\n\nFile appears to be empty!\n'.yellow);
          return false;
        }
        cols.forEach(function (col) {
          if (col === '') {
            err = 'The CSV header contains empty values\n'.red
            !module.parent && console.error(err);
            throw new Error(err);
          }
        });
        hlen = cols.length;
        if (opts.limit) {
          limit = [];
          opts.limit.split(',').forEach(function (col) {
            i = cols.indexOf(col);
            if (i === -1) {
              err = ('The column value "' + col + '" does not correpond to CSV headers\n').red +
                    'Please provide valid column names (string format, comma separated)\n';
              !module.parent && console.error(err);
              throw new Error(err);
            }
            limit.push(i);
          });
        }
        return new Promise(function (resolve, reject) {
          var rs = module.exports.load(path, {stream: true, _parseOpts: {}});
          result = true;
          count = 1;
          missing = [];
          opts.emptyLines && (emptyLines = []);
          opts.emptyValues && (emptyValues = []);
          if (opts.duplicates) {
            // Duplicate checking is done through an array that for each column
            // contains an array with two objects: "memo" and "map".
            // "memo" is to check if the value already exists, and
            // "map" is where duplicates coordinates are actually stored.
            duplicates = [];
            if (limit) {
              limit.forEach(function (col) {
                duplicates[col] = [{},{}];
              });
            } else {
              for (i = 0; i < hlen; i++) {
                duplicates[i] = [{},{}];
              }
            }
          }
          log = opts.log;
          function checkEmptyValues (line, col, item) {
            if (line.length !== 1 && item === '') {
              result = false;
              log && emptyValues.push([count,col]);
            }
          }
          function checkDuplicates (col, item) {
            if (item !== '' && item !== undefined) {
              memo = duplicates[col][0][item];
              if (memo === undefined) {
                duplicates[col][0][item] = count;
              } else {
                result = false;
                if (log) {
                  map = duplicates[col][1][item];
                  map ? map.push(count) : (duplicates[col][1][item] = [memo, count]);
                }
              }
            }
          }
          function check (line) {
            // Check missing values and empty lines
            if (line.length !== hlen) {
              if (line.length === 1 && line[0] === '') {
                if (emptyLines) {
                  result = false;
                  log && emptyLines.push(count);
                }
              } else {
                result = false;
                log && missing.push(count);
              }
            }
            // Check empty or duplicate values
            if (emptyValues || duplicates) {
              if (limit) {
                for (i = 0; i < limit.length; i++) {
                  col = limit[i];
                  item = line[col];
                  emptyValues && checkEmptyValues(line, col, item);
                  duplicates && checkDuplicates(col, item);
                }
              } else {
                for (col = 0; col < hlen; col++) {
                  item = line[col];
                  emptyValues && checkEmptyValues(line, col, item);
                  duplicates && checkDuplicates(col, item);
                }
              }
            }
            count++;
          }
          rs
            .pipe(through(check))
            .on('end', function () {
              if (result) {
                console.log('\nFile looks ok.\n'.green);
              } else {
                if (log) {
                  missing && missing[0] !== undefined && console.log('\nMissing value on line ' + missing.join(', ') + '\n');
                  emptyLines && emptyLines[0] !== undefined && console.log('\nEmpty line on line ' + emptyLines.join(', ') + '\n');
                  if (emptyValues && emptyValues[0] !== undefined) {
                    console.log('\nEmpty value on line:');
                    for (i = 0; i < emptyValues.length; i++) {
                      item = emptyValues[i];
                      console.log(item[0] + ' (' + cols[item[1]] + ')');
                    }
                  }
                  if (duplicates) {
                    for (col = 0; col < hlen; col++) {
                      if (duplicates[col]) {
                        map = duplicates[col][1];
                        mapKeys = Object.keys(map);
                        if (mapKeys.length !== 0) {
                          console.log('\nDuplicate values for "' + cols[col] + '":');
                          for (i = 0; i < mapKeys.length; i++) {
                            key = mapKeys[i];
                            console.log('"' + key + '" on line: ' + map[key].join(', '));
                          }
                        }
                      }
                    }
                  }
                }
                console.error('\nFile has problems!\n'.red);
              }
              resolve(result);
            })
            .on('error', function (err) {
              !module.parent && console.error(err);
              reject(err);
            });
        });
      });
  },
};

// Code for command line usage of the "check" method
if (!module.parent) {

  var program = require('commander');

  program
    .usage('[options] <file ...>')
    .option('-c, --check <filepath>', 'Check data integrity for the CSV file indicated at <filepath> (must be provided)')
    .option('-d, --duplicates', 'Check for duplicate values within columns')
    .option('-e, --empty-values', 'Accept empty values')
    .option('-l, --limit <comma separated column names>', 'Limit CSV checking to specific column(s)')
    .option('-s, --log', 'Avoid logging and speed up')
    .option('-x, --empty-lines', 'Check for empty lines')
    .parse(process.argv);

  if (typeof program.check === 'string' && program.check[0] !== '-' && program.check.length !== 0) {
    var options = {
      duplicates: program.duplicates,
      emptyValues: !program.emptyValues,
      emptyLines: program.emptyLines,
      limit: program.limit,
      log: !program.log
    };
    module.exports.check(program.check, options);
  } else {
    program.help();
  }

}
