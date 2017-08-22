#!/usr/bin/env node

'use strict';

const promisify = require('js-promisify');
const fs = require('fs');
const csv = require('csv');
const through = require('through');
const firstline = require('firstline');
const colors = require('colors');

exports.load = function load (path, usrOpts) {
  const opts = {
    log: true,
    objName: false,
    stream: false
  };
  Object.assign(opts, usrOpts);
  const parseOpts = opts._parseOpts || { // "_parseOpts" is a private option, used for the "check()" method
    auto_parse: opts.auto_parse != null ? opts.auto_parse : true,
    columns: opts.columns || true,
    delimiter: opts.delimiter,
    objname: opts.objName,
    quote: opts.quote,
    skip_empty_lines: true,
    relax: opts.relax,
    relax_column_count: opts.relax_column_count,
    trim: opts.trim
  };
  const log = opts.log;
  log && console.log(`\nReading data from ${path}\n`);
  if (opts.stream) {
    return fs.createReadStream(path, {encoding: 'utf8'}).pipe(csv.parse(parseOpts));
  } else {
    return promisify(fs.readFile, [path, {encoding: 'utf8'}])
      .then(function (data) {
        if (data) {
          log && console.log('Parsing data...\n'.yellow);
          return promisify(csv.parse, [data, parseOpts]).then(function (data) {
            log && console.log('Data parsed\n'.green);
            return data;
          });
        } else {
          log && console.log('File appears to be empty!\n'.yellow);
        }
      });
  }
};

exports.write = function write (path, data, usrOpts) {
  const opts = {
    delimiter: ',',
    empty: false,
    header: false,
    log: true
  };
  Object.assign(opts, usrOpts);
  const delimiter = opts.delimiter;
  const log = opts.log;
  let header = opts.header;
  let hlen;
  return new Promise(function (resolve, reject) {
    const ws = fs.createWriteStream(path, {encoding: 'utf8'});
    ws
      .on('finish', function () {
        resolve();
      })
      .on('error', function (err) {
        reject(err);
      });
    if (delimiter.length > 1) throw new Error('The delimiter can only be one character'.red);
    log && console.log((`\nWriting data to ${path}\n`));
    if (header) {
      if (typeof header === 'string') {
        ws.write(header + '\n');
        header = header.split(delimiter);
        hlen = header.length;
        header.forEach(function (item) {
          if (item.length === 0) throw new Error('Header column titles can not be empty'.red);
        });
      } else {
        throw new Error('The header argument must be a string'.red);
      }
    }
    if (typeof data === 'string' || Array.isArray(data)) {
      if (typeof data === 'string') {
        data = data.split('\n');
        for (let i = 0; i < data.length; i++) {
          data[i] = data[i].split(delimiter);
        }
      }
      // It's an array (of arrays or of objects?)
      if (Array.isArray(data[0])) {
        // It's an array of arrays
        hlen = hlen || data[0].length;
        for (let i = 0; i < data.length; i++) {
          let arr = data[i];
          if (Array.isArray(arr)) {
            if (arr.length === hlen) {
              if (opts.empty) {
                for (let i = 0; i < arr.length; i++) {
                  let value = arr[i];
                  if (value === undefined || value === null || value === '') {
                    throw new Error(('Empty value "' + header[i] + '" at line' + (i + 1) + ':\n').red +
                                    JSON.stringify(arr) + '\n');
                  }
                }
              }
              ws.write(arr.join(delimiter) + '\n');
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
          for (let i = 0; i < data.length; i++) {
            let obj = data[i];
            if (typeof obj === 'object') {
              let entry = [];
              for (let i = 0; i < header.length; i++) {
                let key = header[i];
                if (obj.hasOwnProperty(key)) {
                  let value = obj[key];
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
              ws.write(entry.join(delimiter) + '\n');
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
        for (let i = 0; i < objIndex.length; i++) {
          let obj = data[objIndex[i]];
          let entry = [];
          for (let i = 0; i < header.length; i++) {
            let key = header[i];
            if (obj.hasOwnProperty(key)) {
              let value = obj[key];
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
          ws.write(entry.join(delimiter) + '\n');
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
    log && console.log('Data written!\n'.green);
  });
};

exports.check = function check (path, usrOpts) {
  const opts = {
    delimiter: ',',
    duplicates: false,
    emptyLines: false,
    emptyValues: true,
    limit: false,
    log: true
  };
  Object.assign(opts, usrOpts);
  let limit;
  const log = opts.log;
  return firstline(path)
    .then(function (line) {
      let cols = line.split(opts.delimiter);
      if (cols.length === 1 && cols[0] === '') {
        log && console.log(`\nReading data from ${path}\n\nFile appears to be empty!\n`.yellow);
        return false;
      }
      cols.forEach(function (col) {
        if (col === '') {
          let err = 'The CSV header contains empty values\n'.red
          log && !module.parent && console.error(err);
          throw new Error(err);
        }
      });
      let hlen = cols.length;
      if (opts.limit) {
        limit = [];
        opts.limit.split(',').forEach(function (col) {
          let i = cols.indexOf(col);
          if (i === -1) {
            let err = (`The column value "${col}" does not correpond to CSV headers\n`).red +
              'Please provide valid column names (string format, comma separated)\n';
            log && !module.parent && console.error(err);
            throw new Error(err);
          }
          limit.push(i);
        });
      }
      return new Promise(function (resolve, reject) {
        var rs = exports.load(path, {
          stream: true,
          _parseOpts: {
            relax_column_count: true,
            delimiter: opts.delimiter
          }
        });
        let result = true;
        let count = 1;
        let missing = [];
        let emptyLines = opts.emptyLines === true ? [] : false;
        let emptyValues = opts.emptyValues === true ? [] : false;
        let duplicates;
        if (opts.duplicates === true) {
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
            for (let i = 0; i < hlen; i++) {
              duplicates[i] = [{},{}];
            }
          }
        }
        function checkEmptyValues (line, col, item) {
          if (line.length !== 1 && item === '') {
            result = false;
            log && emptyValues.push([count,col]);
          }
        }
        function checkDuplicates (col, item) {
          if (item !== '' && item !== undefined) {
            let memo = duplicates[col][0][item];
            if (memo === undefined) {
              duplicates[col][0][item] = count;
            } else {
              result = false;
              if (log) {
                let map = duplicates[col][1][item];
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
              for (let i = 0; i < limit.length; i++) {
                let col = limit[i];
                let item = line[col];
                emptyValues && checkEmptyValues(line, col, item);
                duplicates && checkDuplicates(col, item);
              }
            } else {
              for (let col = 0; col < hlen; col++) {
                let item = line[col];
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
              log && console.log('\nFile looks ok.\n'.green);
            } else {
              if (log) {
                missing && missing[0] !== undefined && console.log(`\nMissing value on line ${missing.join(', ')}\n`);
                emptyLines && emptyLines[0] !== undefined && console.log(`\nEmpty line on line ${emptyLines.join(', ')}\n`);
                if (emptyValues && emptyValues[0] !== undefined) {
                  console.log('\nEmpty value on line:');
                  for (let i = 0; i < emptyValues.length; i++) {
                    let item = emptyValues[i];
                    console.log(`${item[0]} (${cols[item[1]]})`);
                  }
                }
                if (duplicates) {
                  for (let col = 0; col < hlen; col++) {
                    if (duplicates[col]) {
                      let map = duplicates[col][1];
                      let mapKeys = Object.keys(map);
                      if (mapKeys.length !== 0) {
                        console.log(`\nDuplicate values for "${cols[col]}":`);
                        for (let i = 0; i < mapKeys.length; i++) {
                          let key = mapKeys[i];
                          console.log(`"${key}" on line: ${map[key].join(', ')}`);
                        }
                      }
                    }
                  }
                }
              }
              log && console.error('\nFile has problems!\n'.red);
            }
            resolve(result);
          })
          .on('error', function (err) {
            log && !module.parent && console.error(err);
            reject(err);
          });
      });
    });
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
    exports.check(program.check, options);
  } else {
    program.help();
  }

}
