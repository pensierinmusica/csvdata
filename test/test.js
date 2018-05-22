'use strict';

const promisify = require('js-promisify');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const csvdata = require('../index.js');
const mocks = require('./mocks.js');

chai.should();
chai.use(chaiAsPromised);

describe('csvdata', () => {

  const dirPath = path.join(__dirname, 'tmp/');
  const filePath = dirPath + 'test.csv';
  const wrongFilePath = dirPath + 'no-test.csv';

  before(() => fs.mkdirSync(dirPath)); // Make "tmp" folder

  after(() => rimraf.sync(dirPath)); // Delete "tmp" folder

  describe('#load()', () => {

    beforeEach(() => promisify(fs.writeFile, [filePath, mocks.fullString])); // Make mock CSV file

    after(() => promisify(fs.unlink, [filePath])); // Delete mock CSV file

    it(
      'should reject if file does not exist',
      () => csvdata.load(wrongFilePath).should.be.rejected
    );

    it(
      'should return an array',
      () => csvdata.load(filePath).should.eventually.be.an('array')
    );

    it(
      'should return an object when {objName: "' + mocks.objName + '"}',
      () => csvdata.load(filePath, {objName: mocks.objName}).should.eventually.be.an('object')
    );

    it(
      'should correctly parse data',
      () => csvdata.load(filePath).should.eventually.eql(mocks.arrObj)
    );

    it(
      'should correctly parse data with a different delimiter',
      () => promisify(fs.writeFile, [filePath, mocks.altDelimiterFullString])
        .then(() => csvdata.load(filePath, {delimiter: mocks.altDelimiter}).should.eventually.eql(mocks.arrObj))
    );

    it(
      `should correctly parse data when {objName: "${mocks.objName}"}`,
      () => csvdata.load(filePath, {objName: mocks.objName}).should.eventually.eql(mocks.obj)
    );

    it(
      'should return a stream when {stream: true}',
      done => csvdata.load(filePath, {stream: true})
        .on('readable', () => done())
    );

  });

  describe('#write()', () => {

    afterEach(() => promisify(fs.unlink, [filePath])); // Delete generated CSV file

    describe('from string', () => {

      it(
        'should correctly write data to disk',
        () => csvdata.write(filePath, mocks.string, {header: mocks.header})
          .then(() => promisify(fs.readFile, [filePath, {encoding: 'utf8'}]).should.eventually.equal(mocks.fullString))
      );

      it(
        'should respect a custom delimiter when provided',
        () => csvdata.write(filePath, mocks.altDelimiterString, {header: mocks.altDelimiterHeader, delimiter: mocks.altDelimiter})
          .then(() => promisify(fs.readFile, [filePath, {encoding: 'utf8'}]).should.eventually.equal(mocks.altDelimiterFullString))
      );

      it(
        'should fulfill if it has empty values',
        () => csvdata.write(filePath, mocks.emptyString, {header: mocks.header}).should.be.fulfilled
      );

      it(
        'should reject if it has empty values when option "{empty: true}"',
        () => csvdata.write(filePath, mocks.emptyString, {empty: true, header: mocks.header}).should.be.rejected
      );

      it(
        'should reject if it is not consistent',
        () => csvdata.write(filePath, mocks.wrongStr, {header: mocks.header}).should.be.rejected
      );

    });

    describe('from array of arrays', () => {

      it(
        'should correctly write data to disk',
        () => csvdata.write(filePath, mocks.arr, {header: mocks.header})
          .then(() => promisify(fs.readFile, [filePath, {encoding: 'utf8'}]).should.eventually.equal(mocks.fullString))
      );

      it(
        'should respect a custom delimiter when provided',
        () => csvdata.write(filePath, mocks.arr, {header: mocks.altDelimiterHeader, delimiter: mocks.altDelimiter})
          .then(() => promisify(fs.readFile, [filePath, {encoding: 'utf8'}]).should.eventually.equal(mocks.altDelimiterFullString))
      );

      it(
        'should fulfill if array has empty values',
        () => csvdata.write(filePath, mocks.emptyArr, {header: mocks.header}).should.be.fulfilled
      );

      it(
        'should reject if array has empty values when option "{empty: true}"',
        () => csvdata.write(filePath, mocks.emptyArr, {empty: true, header: mocks.header}).should.be.rejected
      );

      it(
        'should reject if array is not consistent',
        () => csvdata.write(filePath, mocks.wrongArr, {header: mocks.header}).should.be.rejected
      );

    });

    describe('from array of objects', () => {

      it(
        'should correctly write data to disk',
        () => csvdata.write(filePath, mocks.arrObj, {header: mocks.header})
          .then(() => promisify(fs.readFile, [filePath, {encoding: 'utf8'}]).should.eventually.equal(mocks.fullString))
      );

      it(
        'should respect a custom delimiter when provided',
        () => csvdata.write(filePath, mocks.arrObj, {header: mocks.altDelimiterHeader, delimiter: mocks.altDelimiter})
          .then(() => promisify(fs.readFile, [filePath, {encoding: 'utf8'}]).should.eventually.equal(mocks.altDelimiterFullString))
      );

      it(
        'should fulfill if array has empty values',
        () => csvdata.write(filePath, mocks.emptyArrObj, {header: mocks.header}).should.be.fulfilled
      );

      it(
        'should reject if array has empty values when option "{empty: true}"',
        () => csvdata.write(filePath, mocks.emptyArrObj, {empty: true, header: mocks.header}).should.be.rejected
      );

      it(
        'should reject if array is not consistent',
        () => csvdata.write(filePath, mocks.wrongArrObj, {header: mocks.header}).should.be.rejected
      );

    });

    describe('from object of objects', () => {

      it(
        'should correctly write data to disk',
        () => csvdata.write(filePath, mocks.obj, {header: mocks.header})
          .then(() => promisify(fs.readFile, [filePath, {encoding: 'utf8'}]).should.eventually.equal(mocks.fullString))
      );

      it(
        'should respect a custom delimiter when provided',
        () => csvdata.write(filePath, mocks.obj, {header: mocks.altDelimiterHeader, delimiter: mocks.altDelimiter})
          .then(() => promisify(fs.readFile, [filePath, {encoding: 'utf8'}]).should.eventually.equal(mocks.altDelimiterFullString))
      );

      it(
        'should fulfill if object has empty values',
        () => csvdata.write(filePath, mocks.emptyObj, {header: mocks.header}).should.be.fulfilled
      );

      it(
        'should reject if object has empty values when option "{empty: true}"',
        () => csvdata.write(filePath, mocks.emptyObj, {empty: true, header: mocks.header}).should.be.rejected
      );

      it(
        'should reject if object is not consistent',
        () => csvdata.write(filePath, mocks.wrongObj, {header: mocks.header}).should.be.rejected
      );

    });

    describe('misc', () => {

      it(
        'should reject if delimiter is longer than one character',
        () => csvdata.write(filePath, mocks.obj, {delimiter: mocks.invalidAltDelimiter}).should.be.rejected
      );

      it(
        'should reject if header is not a string',
        () => csvdata.write(filePath, mocks.obj, {header: mocks.invalidHeader}).should.be.rejected
      );

      it(
        'should reject if data is not consistent with header',
        () => csvdata.write(filePath, mocks.obj, {header: mocks.wrongHeader}).should.be.rejected
      );

      it(
        'should respect the column order specified in header',
        () => csvdata.write(filePath, mocks.obj, {header: mocks.altHeader})
          .then(() => promisify(fs.readFile, [filePath, {encoding: 'utf8'}]).should.eventually.equal(mocks.altFullString))
      );

    });

  });

  describe('#check', () => {

    afterEach(() => promisify(fs.unlink, [filePath])); // Delete mock CSV file

    it(
      'should reject if file does not exist',
      () => promisify(fs.writeFile, [filePath, mocks.emptyHeader])
        .then(() => csvdata.check(wrongFilePath).should.be.rejected)
    );

    it(
      'should return "true" for consistent data',
      () => promisify(fs.writeFile, [filePath, mocks.fullString])
        .then(() => csvdata.check(filePath).should.eventually.equal(true))
    );

    it(
      'should respect a custom delimiter when provided',
      () => promisify(fs.writeFile, [filePath, mocks.fullString])
        .then(() => csvdata.check(filePath, {delimiter: mocks.altDelimiter}).should.eventually.equal(true))
    );

    it(
      'should return "false" when file is empty',
      () => promisify(fs.writeFile, [filePath, ''])
        .then(() => csvdata.check(filePath).should.eventually.equal(false))
    );

    it(
      'should reject if CSV header contains empty values',
      () => promisify(fs.writeFile, [filePath, mocks.emptyHeader])
        .then(() => csvdata.check(filePath).should.be.rejected)
    );

    it(
      'should fulfill if "opts.limit" provides correct values',
      () => promisify(fs.writeFile, [filePath, mocks.fullString])
        .then(() => csvdata.check(filePath, {limit: mocks.objName}).should.be.fulfilled)
    );

    it(
      'should reject if "opts.limit" provides wrong values',
      () => promisify(fs.writeFile, [filePath, mocks.fullString])
        .then(() => csvdata.check(filePath, {limit: mocks.wrongHeader}).should.be.rejected)
    );

    it(
      'should return "false" for data with missing values',
      () => promisify(fs.writeFile, [filePath, mocks.wrongFullString])
        .then(() => csvdata.check(filePath).should.eventually.equal(false))
    );

    it(
      'should return "false" for data with empty values',
      () => promisify(fs.writeFile, [filePath, mocks.emptyFullString])
        .then(() => csvdata.check(filePath).should.eventually.equal(false))
    );

    it(
      'should return "true" for data with empty values when option "{emptyValues: false}"',
      () => promisify(fs.writeFile, [filePath, mocks.emptyFullString])
        .then(() => csvdata.check(filePath, {emptyValues: false}).should.eventually.equal(true))
    );

    it(
      'should return "true" for data with duplicate values',
      () => promisify(fs.writeFile, [filePath, mocks.dupFullString])
        .then(() => csvdata.check(filePath).should.eventually.equal(true))
    );

    it(
      'should return "false" for data with duplicate values when option "{duplicates: true}"',
      () => promisify(fs.writeFile, [filePath, mocks.dupFullString])
        .then(() => csvdata.check(filePath, {duplicates: true}).should.eventually.equal(false))
    );

    it(
      'should return "true" for data with empty lines',
      () => promisify(fs.writeFile, [filePath, mocks.fullString + '\n'])
        .then(() => csvdata.check(filePath).should.eventually.equal(true))
    );

    it(
      'should return "false" for data with empty lines when option "{emptyLines: true}"',
      () => promisify(fs.writeFile, [filePath, mocks.fullString + '\n'])
        .then(() => csvdata.check(filePath, {emptyLines: true}).should.eventually.equal(false))
    );

    it(
      'should return "true" for data with empty values when option "{limit: mocks.objName}"',
      () => promisify(fs.writeFile, [filePath, mocks.emptyFullString])
        .then(() => csvdata.check(filePath, {limit: mocks.objName}).should.eventually.equal(true))
    );

    it(
      'should return "true" for data with duplicate values when option "{limit: mocks.objName}"',
      () => promisify(fs.writeFile, [filePath, mocks.dupFullString])
        .then(() => csvdata.check(filePath, {duplicates: true, limit: mocks.objName}).should.eventually.equal(true))
    );

  });

});
