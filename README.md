# CSVdata

## Introduction

CSVdata is a [npm](http://npmjs.org) module for [NodeJS](http://nodejs.org/), that loads and writes data operating with CSV files. Based on [node-csv](http://github.com/wdavidw/node-csv) and [q](http://github.com/kriskowal/q), supports promises and streams.

It includes some smart checks to try preventing common errors that could compromise data integrity of the generated CSV (e.g. mixing of values due to an empty entry).

## Install

`npm install csvdata`

(add "--save" if you want the module to be automatically added to your project's "package.json" dependencies)

`var csvdata = require(csvdata)`

## API

##### Load
`csvdata.load(path, [objname])`

Returns an array where each item is an object containing data from a row. If "objname" is provided instead it will return an "index" object, with keys based on entries from the column matching the provided string, and values containing in turn an object with data for that entry.

##### Write
`csvdata.write(path, data, [header])`

Writes data to a file, indicated in "path". Data can be provided as:

 - String (e.g. `'a,b,c\nd,e,f'`)
 - Array of arrays (e.g. `[['a','b','c'],['d','e','f']]`)
 - Array of objects (e.g. `[{amount: 100, name: 'John'}, {amount: 130, name: 'Paul'}]`)
 - Object containing objects (e.g. `{John: {amount: '100', name: 'John' }, Paul: {amount: '130', name: 'Paul'}}`).

If "header" is provided (must be a string), it's written on the first line. If data comes from an object (i.e. last two cases above), "header" **must** be provided to guarantee the correct order of comma separated values, and can be used to **select** which object properties are saved to CSV.

***

MIT License