'use strict';

var promisify = require('js-promisify');
var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
var should = require('chai').should();
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');

var csvdata = require('../csvdata.js');
var mocks = require('./mocks.js');

chai.use(chaiAsPromised);

describe('csvdata', function () {

  var dirPath = path.join(__dirname, 'tmp/');
  var filePath = dirPath + 'test.csv';
  var wrongFilePath = dirPath + 'no-test.csv';

  before(function () {
    // Make "tmp" folder
    fs.mkdirSync(dirPath);
  });

  after(function () {
    // Delete "tmp" folder
    rimraf.sync(dirPath);
  });

  describe('#load()', function () {

    beforeEach(function () {
      // Make mock CSV file
      return promisify(fs.writeFile, [filePath, mocks.fullString]);
    });

    after(function () {
      // Delete mock CSV file
      return promisify(fs.unlink, [filePath]);
    });

    it('should reject if file does not exist', function () {
      return csvdata.load(wrongFilePath).should.be.rejected;
    });

    it('should return an array', function () {
      return csvdata.load(filePath).should.eventually.be.an('array');
    });

    it('should return an object when {objName: "' + mocks.objName + '"}', function () {
      return csvdata.load(filePath, {objName: mocks.objName}).should.eventually.be.an('object');
    });

    it('should correctly parse data', function () {
      return csvdata.load(filePath).should.eventually.eql(mocks.arrObj);
    });

    it('should correctly parse data with a different delimiter', function () {
      return promisify(fs.writeFile, [filePath, mocks.altDelimiterFullString])
        .then(function () {
          return csvdata.load(filePath, {delimiter: mocks.altDelimiter}).should.eventually.eql(mocks.arrObj);
        });
    });

    it(`should correctly parse data when {objName: "${mocks.objName}"}`, function () {
      return csvdata.load(filePath, {objName: mocks.objName}).should.eventually.eql(mocks.obj);
    });

    it('should return a stream when {stream: true}', function (done) {
      csvdata.load(filePath, {stream: true}).on('readable', function () {
        done();
      });
    });

  });

  describe('#write()', function () {

    afterEach(function () {
      // Delete generated CSV file
      return promisify(fs.unlink, [filePath]);
    });

    describe('from string', function () {

      it('should correctly write data to disk', function () {
        return csvdata.write(filePath, mocks.string, {header: mocks.header})
          .then(function () {
            return promisify(fs.readFile, [filePath, {encoding: 'utf8'}]).should.eventually.equal(mocks.fullString);
          });
      });

      it('should respect a custom delimiter when provided', function () {
        return csvdata.write(filePath, mocks.altDelimiterString, {header: mocks.altDelimiterHeader, delimiter: mocks.altDelimiter})
          .then(function () {
            return promisify(fs.readFile, [filePath, {encoding: 'utf8'}]).should.eventually.equal(mocks.altDelimiterFullString);
          });
      });

      it('should fulfill if it has empty values', function () {
        return csvdata.write(filePath, mocks.emptyString, {header: mocks.header}).should.be.fulfilled;
      });

      it('should reject if it has empty values when option "{empty: true}"', function () {
        return csvdata.write(filePath, mocks.emptyString, {empty: true, header: mocks.header}).should.be.rejected;
      });

      it('should reject if it is not consistent', function () {
        return csvdata.write(filePath, mocks.wrongStr, {header: mocks.header}).should.be.rejected;
      });

    });

    describe('from array of arrays', function () {

      it('should correctly write data to disk', function () {
        return csvdata.write(filePath, mocks.arr, {header: mocks.header})
          .then(function () {
            return promisify(fs.readFile, [filePath, {encoding: 'utf8'}]).should.eventually.equal(mocks.fullString);
          });
      });

      it('should respect a custom delimiter when provided', function () {
        return csvdata.write(filePath, mocks.arr, {header: mocks.altDelimiterHeader, delimiter: mocks.altDelimiter})
          .then(function () {
            return promisify(fs.readFile, [filePath, {encoding: 'utf8'}]).should.eventually.equal(mocks.altDelimiterFullString);
          });
      });

      it('should fulfill if array has empty values', function () {
        return csvdata.write(filePath, mocks.emptyArr, {header: mocks.header}).should.be.fulfilled;
      });

      it('should reject if array has empty values when option "{empty: true}"', function () {
        return csvdata.write(filePath, mocks.emptyArr, {empty: true, header: mocks.header}).should.be.rejected;
      });

      it('should reject if array is not consistent', function () {
        return csvdata.write(filePath, mocks.wrongArr, {header: mocks.header}).should.be.rejected;
      });

    });

    describe('from array of objects', function () {

      it('should correctly write data to disk', function () {
        return csvdata.write(filePath, mocks.arrObj, {header: mocks.header})
          .then(function () {
            return promisify(fs.readFile, [filePath, {encoding: 'utf8'}]).should.eventually.equal(mocks.fullString);
          });
      });

      it('should respect a custom delimiter when provided', function () {
        return csvdata.write(filePath, mocks.arrObj, {header: mocks.altDelimiterHeader, delimiter: mocks.altDelimiter})
          .then(function () {
            return promisify(fs.readFile, [filePath, {encoding: 'utf8'}]).should.eventually.equal(mocks.altDelimiterFullString);
          });
      });

      it('should fulfill if array has empty values', function () {
        return csvdata.write(filePath, mocks.emptyArrObj, {header: mocks.header}).should.be.fulfilled;
      });

      it('should reject if array has empty values when option "{empty: true}"', function () {
        return csvdata.write(filePath, mocks.emptyArrObj, {empty: true, header: mocks.header}).should.be.rejected;
      });

      it('should reject if array is not consistent', function () {
        return csvdata.write(filePath, mocks.wrongArrObj, {header: mocks.header}).should.be.rejected;
      });

    });

    describe('from object of objects', function () {

      it('should correctly write data to disk', function () {
        return csvdata.write(filePath, mocks.obj, {header: mocks.header})
          .then(function () {
            return promisify(fs.readFile, [filePath, {encoding: 'utf8'}]).should.eventually.equal(mocks.fullString);
          });
      });

      it('should respect a custom delimiter when provided', function () {
        return csvdata.write(filePath, mocks.obj, {header: mocks.altDelimiterHeader, delimiter: mocks.altDelimiter})
          .then(function () {
            return promisify(fs.readFile, [filePath, {encoding: 'utf8'}]).should.eventually.equal(mocks.altDelimiterFullString);
          });
      });

      it('should fulfill if object has empty values', function () {
        return csvdata.write(filePath, mocks.emptyObj, {header: mocks.header}).should.be.fulfilled;
      });

      it('should reject if object has empty values when option "{empty: true}"', function () {
        return csvdata.write(filePath, mocks.emptyObj, {empty: true, header: mocks.header}).should.be.rejected;
      });

      it('should reject if object is not consistent', function () {
        return csvdata.write(filePath, mocks.wrongObj, {header: mocks.header}).should.be.rejected;
      });

    });

    describe('misc', function () {

      it('should reject if delimiter is longer than one character', function () {
        return csvdata.write(filePath, mocks.obj, {delimiter: mocks.invalidAltDelimiter}).should.be.rejected;
      });

      it('should reject if header is not a string', function () {
        return csvdata.write(filePath, mocks.obj, {header: mocks.invalidHeader}).should.be.rejected;
      });

      it('should reject if data is not consistent with header', function () {
        return csvdata.write(filePath, mocks.obj, {header: mocks.wrongHeader}).should.be.rejected;
      });

      it('should respect the column order specified in header', function () {
        return csvdata.write(filePath, mocks.obj, {header: mocks.altHeader})
          .then(function () {
            return promisify(fs.readFile, [filePath, {encoding: 'utf8'}]).should.eventually.equal(mocks.altFullString);
          });
      });

    });

  });

  describe('#check', function () {

    afterEach(function () {
      // Delete mock CSV file
      return promisify(fs.unlink, [filePath]);
    });

    it('should reject if file does not exist', function () {
      return promisify(fs.writeFile, [filePath, mocks.emptyHeader])
        .then(function () {
          return csvdata.check(wrongFilePath).should.be.rejected;
        });
    });

    it('should return "true" for consistent data', function () {
      return promisify(fs.writeFile, [filePath, mocks.fullString])
        .then(function () {
          return csvdata.check(filePath).should.eventually.equal(true);
        });
    });

    it('should respect a custom delimiter when provided', function () {
      return promisify(fs.writeFile, [filePath, mocks.fullString])
        .then(function () {
          return csvdata.check(filePath, {delimiter: mocks.altDelimiter}).should.eventually.equal(true);
        });
    });

    it('should return "false" when file is empty', function () {
      return promisify(fs.writeFile, [filePath, ''])
        .then(function () {
          return csvdata.check(filePath).should.eventually.equal(false);
        });
    });

    it('should reject if CSV header contains empty values', function () {
      return promisify(fs.writeFile, [filePath, mocks.emptyHeader])
        .then(function () {
          return csvdata.check(filePath).should.be.rejected;
        });
    });

    it('should fulfill if "opts.limit" provides correct values', function () {
      return promisify(fs.writeFile, [filePath, mocks.fullString])
        .then(function () {
          return csvdata.check(filePath, {limit: mocks.objName}).should.be.fulfilled;
        });
    });

    it('should reject if "opts.limit" provides wrong values', function () {
      return promisify(fs.writeFile, [filePath, mocks.fullString])
        .then(function () {
          return csvdata.check(filePath, {limit: mocks.wrongHeader}).should.be.rejected;
        });
    });

    it('should return "false" for data with missing values', function () {
      return promisify(fs.writeFile, [filePath, mocks.wrongFullString])
        .then(function () {
          return csvdata.check(filePath).should.eventually.equal(false);
        });
    });

    it('should return "false" for data with empty values', function () {
      return promisify(fs.writeFile, [filePath, mocks.emptyFullString])
        .then(function () {
          return csvdata.check(filePath).should.eventually.equal(false);
        });
    });

    it('should return "true" for data with empty values when option "{emptyValues: false}"', function () {
      return promisify(fs.writeFile, [filePath, mocks.emptyFullString])
        .then(function () {
          return csvdata.check(filePath, {emptyValues: false}).should.eventually.equal(true);
        });
    });

    it('should return "true" for data with duplicate values', function () {
      return promisify(fs.writeFile, [filePath, mocks.dupFullString])
        .then(function () {
          return csvdata.check(filePath).should.eventually.equal(true);
        });
    });

    it('should return "false" for data with duplicate values when option "{duplicates: true}"', function () {
      return promisify(fs.writeFile, [filePath, mocks.dupFullString])
        .then(function () {
          return csvdata.check(filePath, {duplicates: true}).should.eventually.equal(false);
        });
    });

    it('should return "true" for data with empty lines', function () {
      return promisify(fs.writeFile, [filePath, mocks.fullString + '\n'])
        .then(function () {
          return csvdata.check(filePath).should.eventually.equal(true);
        });
    });

    it('should return "false" for data with empty lines when option "{emptyLines: true}"', function () {
      return promisify(fs.writeFile, [filePath, mocks.fullString + '\n'])
        .then(function () {
          return csvdata.check(filePath, {emptyLines: true}).should.eventually.equal(false);
        });
    });

    it('should return "true" for data with empty values when option "{limit: mocks.objName}"', function () {
      return promisify(fs.writeFile, [filePath, mocks.emptyFullString])
        .then(function () {
          return csvdata.check(filePath, {limit: mocks.objName}).should.eventually.equal(true);
        });
    });

    it('should return "true" for data with duplicate values when option "{limit: mocks.objName}"', function () {
      return promisify(fs.writeFile, [filePath, mocks.dupFullString])
        .then(function () {
          return csvdata.check(filePath, {duplicates: true, limit: mocks.objName}).should.eventually.equal(true);
        });
    });

  });

});
