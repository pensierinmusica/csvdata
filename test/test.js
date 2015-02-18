'use strict';

var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
var should = require('chai').should();
var fs = require('fs');
var FS = require("q-io/fs");
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

    before(function () {
      // Make mock CSV file
      return FS.write(filePath, mocks.fullString);
    });

    after(function () {
      // Delete mock CSV file
      return FS.remove(filePath);
    });

    it('should reject the promise when file is not present', function () {
      return csvdata.load(wrongFilePath).should.be.rejected;
    });

    it('should fulfill the promise when file is present', function () {
      return csvdata.load(filePath).should.be.fulfilled;
    });

    it('should return an array', function () {
      return csvdata.load(filePath).should.eventually.be.an('array');
    });

    it('should return an object when {objname: "' + mocks.objname + '"}', function () {
      return csvdata.load(filePath, {objname: mocks.objname}).should.eventually.be.an('object');
    });

    it('should correctly parse data', function () {
      return csvdata.load(filePath).should.eventually.eql(mocks.arr);
    });

    it('should correctly parse data when {objname: "' + mocks.objname + '"}', function () {
      return csvdata.load(filePath, {objname: mocks.objname}).should.eventually.eql(mocks.obj);
    });

  });

  describe('#write()', function () {

    afterEach(function () {
      // Delete generated CSV file
      return FS.remove(filePath);
    });

    it('should correctly write data from string to disk', function () {
      return csvdata.write(filePath, mocks.string, mocks.header)
      .then(function () {
        return FS.read(filePath).should.eventually.equal(mocks.fullString);
      });
    });

    it('should correctly write data from array to disk', function () {
      return csvdata.write(filePath, mocks.arr, mocks.header)
      .then(function () {
        return FS.read(filePath).should.eventually.equal(mocks.fullString);
      });
    });

    it('should correctly write data from object to disk', function () {
      return csvdata.write(filePath, mocks.obj, mocks.header)
      .then(function () {
        return FS.read(filePath).should.eventually.equal(mocks.fullString);
      });
    });

    it('should reject if string is not consistent', function () {
      return csvdata.write(filePath, mocks.wrongStr, mocks.header).should.be.rejected;
    });

    it('should reject if array is not consistent', function () {
      return csvdata.write(filePath, mocks.wrongArr, mocks.header).should.be.rejected;
    });

    it('should reject if object is not consistent', function () {
      return csvdata.write(filePath, mocks.wrongObj, mocks.header).should.be.rejected;
    });

    it('should reject if header is not a string', function () {
      return csvdata.write(filePath, mocks.obj, mocks.invalidHeader).should.be.rejected;
    });

    it('should reject if data is not consistent with header', function () {
      return csvdata.write(filePath, mocks.obj, mocks.wrongHeader).should.be.rejected;
    });

    it('should respect the column order specified in header', function () {
      return csvdata.write(filePath, mocks.obj, mocks.altHeader)
      .then(function () {
        return FS.read(filePath).should.eventually.equal(mocks.altFullString);
      });
    });

  });

  describe('#check', function () {

    afterEach(function () {
      // Delete mock CSV file
      return FS.remove(filePath);
    });

    it('should return "true" for consistent data', function () {
      return FS.write(filePath, mocks.fullString)
      .then(function () {
        return csvdata.check(filePath).should.eventually.equal(true);
      })
    });

    it('should return "false" for unconsistent data', function () {
      return FS.write(filePath, mocks.invalidFullString)
      .then(function () {
        return csvdata.check(filePath).should.eventually.equal(false);
      })
    });

    it('should return "false" for data with empty values', function () {
      return FS.write(filePath, mocks.altInvalidFullString)
      .then(function () {
        return csvdata.check(filePath).should.eventually.equal(false);
      })
    });

    it('should return "true" for data with empty values if option "{empty: false}"', function () {
      return FS.write(filePath, mocks.altInvalidFullString)
      .then(function () {
        return csvdata.check(filePath, {empty: false}).should.eventually.equal(true);
      })
    });

  });

});
