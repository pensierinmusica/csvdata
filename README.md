# CSVdata

[![Travis](https://img.shields.io/travis/pensierinmusica/csvdata.svg)](https://travis-ci.org/pensierinmusica/csvdata)
[![David](https://img.shields.io/david/pensierinmusica/csvdata.svg)](https://www.npmjs.com/package/csvdata)
[![npm](https://img.shields.io/npm/v/csvdata.svg)](https://www.npmjs.com/package/csvdata)

## Introduction

CSVdata is a [npm](http://npmjs.org) module for [NodeJS](http://nodejs.org/), that loads and writes data operating with CSV files. Based on [node-csv](http://github.com/wdavidw/node-csv) and [q](http://github.com/kriskowal/q), supports promises and streams.

It includes some smart checks to try preventing common errors that could compromise data integrity operating with CSV (e.g. mixing of values due to an empty entry).

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
  objname: false;
  stream: false;
}
```

If "objname" is provided instead (string), the promise will be fulfilled with an "index" object, where keys are based on entries from the column matching "objname", and values contain in turn an object with data from that row (meant to be used when entries in the column "objname" are unique, and faster retrieval is convenient).

If stream is set to `true`, it returns a [readable stream](http://nodejs.org/api/stream.html#stream_class_stream_readable) that can be piped where needed.

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
`csvdata.write(filepath, data, [header])`

Returns a promise, eventually fulfilled when done writing data to "filepath" (be careful, as it overwrites existing files). Data can be provided as:

 - String (e.g. `'a,b,c\nd,e,f'`)
 - Array of arrays (e.g. `[['a','b','c'],['d','e','f']]`)
 - Array of objects (e.g. `[{amount: 100, name: 'John'}, {amount: 130, name: 'Paul'}]`)
 - Object containing objects (e.g. `{John: {amount: '100', name: 'John' }, Paul: {amount: '130', name: 'Paul'}}`).

If "header" is provided (must be a string), it's written on the first line. If data comes from an object (i.e. last two cases above), "header" **must** be provided to guarantee the correct order of comma separated values, and can be used to **select** which object properties are saved to CSV.

```javascript
var data = [
  {name: 'John', hair: 'brown', age: 36},
  {name: 'Laura', hair: 'red', age: 23},
  {name: 'Boris', hair: 'blonde', age: 28}
];

csvdata.write('./my-file.csv', data, 'name,hair,age')
// Generates "my-file.csv" with this content:
// name,hair,age
// John,brown,36
// Laura,red,23
// Boris,blonde,28
//

csvdata.write('./my-file.csv', data, 'age,name,hair')
// Generates "my-file.csv" with this content:
// age,name,hair
// 36,John,brown
// 23,Laura,red
// 28,Boris,blonde
//
```

#### Check
`csvdata.check(filepath, [options])`

Checks data integrity for the CSV file indicated in "filepath". Returns a promise, eventually fulfilled with `true` if file is ok, or `false` if there are any problems. Specifically, it checks that every property defined in the header of the CSV file has a corresponding value for each row, and logs missing values if found (before using this method, make sure the first line of your CSV file is correct).

The configuration object "options" has the default value: `{empty: true}`. If "empty" is set to `false` the "check" method considers empty values fine, but still complains for missing values.

```javascript
// Imagine the CSV file content is:
// name,hair,age
// John,brown,36
// Laura,red
// Boris,,28
//

csvdata.check('./my-file.csv')
// -> Returns a promise that will be fulfilled with "false".
// (also logs)
// - Wrong values on line 3
// - Empty values on line 4

csvdata.check('./my-file.csv', {empty: true})
// -> Returns a promise that will be fulfilled with "false".
// (also logs)
// - Wrong values on line 3
```
The "check" method can also be executed from the command line.

```sh
# You can run it either as
node csvdata.js -c <your_file_path.csv>

# Or make the file executable with
chmod +x csvdata.js

# And then run it as
./csvdata.js -c <your_file_path.csv>

# (to accept empty values add the flag "-e").

# For command line help
node csvdata.js -h
```

***

MIT License