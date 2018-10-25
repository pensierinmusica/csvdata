# CSVdata

[![Travis](https://img.shields.io/travis/pensierinmusica/csvdata.svg)](https://travis-ci.com/pensierinmusica/csvdata)
[![Coveralls](https://img.shields.io/coveralls/pensierinmusica/csvdata.svg)](https://coveralls.io/r/pensierinmusica/csvdata)
[![David](https://img.shields.io/david/pensierinmusica/csvdata.svg)](https://www.npmjs.com/package/csvdata)
[![npm](https://img.shields.io/npm/v/csvdata.svg)](https://www.npmjs.com/package/csvdata)

## Introduction

CSVdata is a [npm](http://npmjs.org) module for [NodeJS](http://nodejs.org/), that **loads, writes, and checks data operating with CSV files**. Based on [node-csv](http://github.com/wdavidw/node-csv), supports native JS promises and streams (requires Node >= v6.4.0). It has a simple API, it is well tested and built for high performance.

It includes some smart features to try preventing common errors that could compromise data integrity when dealing with CSV (e.g. mixing of values due to a missing entry).

## Install

`npm install csvdata`

(add "--save" if you want the module to be automatically added to your project's "package.json" dependencies)

`const csvdata = require(csvdata)`

## API

#### Load
`csvdata.load(filePath, [options])`

Reads data from "filePath" (the first line of the CSV file must contain headers).

Returns a promise, eventually fulfilled with an array where each item is an object that contains data from a row (automatically parses native JS data types).

The **"options"** argument is a configuration object  with the following default values.

```js
{
  delimiter: ',',
  encoding: 'utf8',
  log: true,
  objName: false,
  parse: true,
  stream: false
}
```

- `delimiter` (string): set the field delimiter (one character only).

- `encoding` (string): set the file encoding (must be [supported by Node.js](https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings)).

- `log` (boolean): if set to `false` disable logs.

- `objName` (string): instead of an array it returns an "index" object, where keys map to each entry in the column titled "objName", and values are objects that contain all data from the corresponding row (meant to be used when entries in the column "objName" are unique, and faster retrieval is convenient).

- `parse` (boolean): whether to automatically parse data to native JS types or not (e.g. it would convert the string '07.23' to the number '7.23').

- `stream` (boolean): if set to `true`, it returns a [readable stream](http://nodejs.org/api/stream.html#stream_class_stream_readable) that can be piped where needed.

```js
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

csvdata.load('./my-file.csv', {objName: 'name'})
// -> Returns a promise that will be fulfilled with:
// {
//   John: {name: 'John', hair: 'brown', age: 36},
//   Laura: {name: 'Laura', hair: 'red', age: 23},
//   Boris: {name: 'Boris', hair: 'blonde', age: 28}
// }
```

#### Write
`csvdata.write(filePath, data, [options])`

Returns a promise, eventually fulfilled when done writing data to "filePath" (be careful, as it overwrites existing files). Data can be provided as:

 - String (e.g. `'a,b,c\nd,e,f'`)
 - Array of arrays (e.g. `[['a','b','c'],['d','e','f']]`)
 - Array of objects (e.g. `[{amount: 100, name: 'John'}, {amount: 130, name: 'Paul'}]`)
 - Object containing objects (e.g. `{John: {amount: '100', name: 'John' }, Paul: {amount: '130', name: 'Paul'}}`).

The **"options"** argument is a configuration object  with the following default values.

```js
{
  append: false,
  delimiter: ',',
  empty: false,
  encoding: 'utf8',
  header: '',
  log: true
}
```

- `append` (boolean): whether to create a new file or append data to an existing one.

- `delimiter` (string): set the field delimiter (one character only).

- `empty` (boolean): if set to `true`, return an error when the dataset contains empty values (i.e. `undefined`, `null`, or `''`).

- `encoding` (string): set the [file encoding](https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings).

- `header` (string): if provided it's written on the first line. If data comes from an object (i.e. last two cases above), "header" **must** be provided to guarantee the correct order of comma separated values, and can be used to **select** which object properties are saved to CSV.

- `log` (boolean): if set to `false` disable logs.

```js
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
`csvdata.check(filePath, [options])`

Checks data integrity of the CSV file. It can look for missing, empty, and duplicate values within columns, or detect empty lines.

Returns a promise, eventually fulfilled with `true` if the check is ok, or `false` if there are any problems (before using this method, make sure the first line – i.e. the header – of your CSV file is correct).

The **"options"** argument is a configuration object  with the following default values.

```js
{
  delimiter: ',',
  duplicates: false,
  emptyLines: false,
  emptyValues: true,
  encoding: 'utf8',
  limit: false,
  log: true
}
```

- `delimiter` (string): set the field delimiter (one character only).

- `duplicates` (boolean): check for duplicate values within columns.

- `emptyLines` (boolean) check for empty lines.

- `emptyValues` (boolean) check for empty values. If set to `false` it considers empty values fine, but still complains for missing values.

- `encoding` (string): set the file encoding (must be [supported by Node.js](https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings)).

- `limit` (string): comma separated column headers, if provided limit the "duplicates" and "emptyValues" checks to a subset of columns (instead missing values and empty lines can only be checked for the whole file, due to the CSV format).

- `log` (boolean): if set to `false`, only the final result is returned. The process becomes faster and requires less memory (as it doesn't need to keep track of where the problems occur).

Note that checking for duplicate values requires to load the selected CSV content in memory, as the program needs to have a reference to previous values (this might be an issue if you're dealing with very large files, that exceed your available memory).

```js
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
