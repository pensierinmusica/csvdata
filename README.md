# CSVdata

[![Travis](https://img.shields.io/travis/pensierinmusica/csvdata.svg)](https://travis-ci.org/pensierinmusica/csvdata)
[![David](https://img.shields.io/david/pensierinmusica/csvdata.svg)](https://www.npmjs.com/package/csvdata)
[![npm](https://img.shields.io/npm/v/csvdata.svg)](https://www.npmjs.com/package/csvdata)

## Introduction

CSVdata is a [npm](http://npmjs.org) module for [NodeJS](http://nodejs.org/), that **loads, writes, and checks data operating with CSV files**. Based on [node-csv](http://github.com/wdavidw/node-csv), supports native JS promises and streams (requires Node >= v4.0.0). It has a simple API, it is well tested and built for high performance.

It includes some smart features to try preventing common errors that could compromise data integrity when dealing with CSV (e.g. mixing of values due to a missing entry).

## Install

`npm install csvdata`

(add "--save" if you want the module to be automatically added to your project's "package.json" dependencies)

`var csvdata = require(csvdata)`

## API

#### Load
`csvdata.load(filepath, [options])`

Reads data from "filepath" (the first line of the CSV file must contain headers).

Returns a promise, eventually fulfilled with an array where each item is an object that contains data from a row (automatically parses native JS data types).

The **"options"** argument is a configuration object  with the following default values.

```javascript
{
  objName: false,
  stream: false
}
```

- If "objName" is provided instead (string), the promise will be fulfilled with an "index" object, where keys are based on entries from the column matching "objName", and values contain in turn an object with data from that row (meant to be used when entries in the column "objName" are unique, and faster retrieval is convenient).

- If stream is set to `true`, it returns a [readable stream](http://nodejs.org/api/stream.html#stream_class_stream_readable) that can be piped where needed.

```javascript
// Imagine the CSV file content is:
// name,hair,age
// John,brown,36
// Laura,red,23
// Boris,blonde,28
//

csvdata.load('./my-file.csv')
// -> Returns a promise that will be fulfilled with:
// [
//   {name: 'John', hair: 'brown', age: 36},
//   {name: 'Laura', hair: 'red', age: 23},
//   {name: 'Boris', hair: 'blonde', age: 28}
// ]

csvdata.load('./my-file.csv', {objname: 'name'})
// -> Returns a promise that will be fulfilled with:
{
//   John: {name: 'John', hair: 'brown', age: 36},
//   Laura: {name: 'Laura', hair: 'red', age: 23},
//   Boris: {name: 'Boris', hair: 'blonde', age: 28}
// }

```

#### Write
`csvdata.write(filepath, data, [options])`

Returns a promise, eventually fulfilled when done writing data to "filepath" (be careful, as it overwrites existing files). Data can be provided as:

 - String (e.g. `'a,b,c\nd,e,f'`)
 - Array of arrays (e.g. `[['a','b','c'],['d','e','f']]`)
 - Array of objects (e.g. `[{amount: 100, name: 'John'}, {amount: 130, name: 'Paul'}]`)
 - Object containing objects (e.g. `{John: {amount: '100', name: 'John' }, Paul: {amount: '130', name: 'Paul'}}`).

The **"options"** argument is a configuration object  with the following default values.

```javascript
{
  empty: false,
  header: false
}
```
- If "empty" is set to `true`, "write" will return an error if the dataset contains empty values (i.e. `undefined`, `null`, or `''`).

- If "header" is provided (must be a string), it's written on the first line. If data comes from an object (i.e. last two cases above), "header" **must** be provided to guarantee the correct order of comma separated values, and can be used to **select** which object properties are saved to CSV.

```javascript
var data = [
  {name: 'John', hair: 'brown', age: 36},
  {name: 'Laura', hair: 'red', age: 23},
  {name: 'Boris', hair: undefined, age: 28}
];

csvdata.write('./my-file.csv', data, {header: 'name,hair,age'})
// Generates "my-file.csv" with this content:
// name,hair,age
// John,brown,36
// Laura,red,23
// Boris,,28
//

csvdata.write('./my-file.csv', data, {header: 'age,hair,name'})
// Generates "my-file.csv" with this content:
// age,hair,name
// 36,brown,John
// 23,red,Laura
// 28,,Boris
//

csvdata.write('./my-file.csv', data, {empty: true, header: 'name,hair,age'})
// -> Rejects the promise with an error.
// Empty value "hair" in object:
// {"name":"Boris","age":28}
```

#### Check
`csvdata.check(filepath, [options])`

Checks data integrity of the CSV file. It can look for missing, empty, and duplicate values within columns, or detect empty lines.

Returns a promise, eventually fulfilled with `true` if the check is ok, or `false` if there are any problems (before using this method, make sure the first line – i.e. the header – of your CSV file is correct).

The **"options"** argument is a configuration object  with the following default values.

```javascript
{
  duplicates: false,
  emptyLines: false,
  emptyValues: true,
  limit: false
  log: true;
}
```

- If "duplicates" is set to `true`, it checks for duplicate values within columns.
- If "emptyLines" is set to `true`, it checks for empty lines.
- If "emptyValues" is set to `true` it checks for empty values, if set to `false` it considers empty values fine, but still complains for missing values.
- If "limit" is provided (must be a string, containing comma separated column headers), it limits the "duplicates" and "emptyValues" checks to a subset of columns (according to the nature of CSV format, missing values and empty lines can only be checked for the whole file instead).
- If "log" is set to `false`, only the final result is returned. The process becomes faster and requires less memory (as it doesn't need to keep track of where the problems occur).

Note that checking for duplicate values requires to load the selected CSV content in memory, as the program needs to have a reference to previous values (this might be an issue if you're dealing with very large files, that exceed your available memory).


```javascript
// Imagine the CSV file content is:
// name,hair,age
// John,brown,36
// Laura,red
// Boris,,36
// Laura,black,
//

csvdata.check('./my-file.csv')
// -> Returns a promise that will be fulfilled with "false".
// (also logs)
// - Missing value on line 3
// - Empty value on line:
// 4 (hair)
// 5 (age)

csvdata.check('./my-file.csv', {emptyValues: false})
// -> Returns a promise that will be fulfilled with "false".
// (also logs)
// - Missing value on line 3

csvdata.check('./my-file.csv', {duplicates: true})
// -> Returns a promise that will be fulfilled with "false".
// (also logs)
// - Missing value on line 3
// - Duplicate values for "name":
// "Laura" on line 3, 5

csvdata.check('./my-file.csv', {duplicates: true, limit: 'hair,age'})
// -> Returns a promise that will be fulfilled with "false".
// (also logs)
// - Missing value on line 3
// - Empty value on line:
// 4 (hair)
// 5 (age)

csvdata.check('./my-file.csv', {log: false})
// -> Returns a promise that will be fulfilled with "false".
// Not logging is faster if you need just the final result.
```
The "check" method can also be executed from the command line.

```sh
# You can run it either as
node csvdata.js -c <your_file_path.csv>

# Or make the file executable with
chmod +x csvdata.js

# And then run it as
./csvdata.js -c <your_file_path.csv>

# To see the other options, check command line help
node csvdata.js -h
```

***

MIT License