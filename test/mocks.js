'use strict';

module.exports = {
  arr: [
    ['John', 'brown', 36],
    ['Laura', 'red', 23],
    ['Boris', 'blonde', 28]
  ],
  wrongArr: [
    ['John', 'brown', 36],
    ['Laura', 23], // missing "hair" value
    ['Boris', 'blonde', 28]
  ],
  emptyArr: [
    ['John', 'brown', 36],
    ['Laura', undefined, 23], // empty "hair" value
    ['Boris', 'blonde', 28]
  ],
  arrObj: [
    { name: 'John', hair: 'brown', age: 36 },
    { name: 'Laura', hair: 'red', age: 23 },
    { name: 'Boris', hair: 'blonde', age: 28 }
  ],
  wrongArrObj: [
    { name: 'John', hair: 'brown', age: 36 },
    { name: 'Laura', age: 23 }, // missing "hair" value
    { name: 'Boris', hair: 'blonde', age: 28 }
  ],
  emptyArrObj: [
    { name: 'John', hair: 'brown', age: 36 },
    { name: 'Laura', hair: undefined, age: 23 }, // empty "hair" value
    { name: 'Boris', hair: 'blonde', age: 28 }
  ],
  obj: {
    John: {name: 'John', hair: 'brown', age: 36},
    Laura: {name: 'Laura', hair: 'red', age: 23},
    Boris: {name: 'Boris', hair: 'blonde', age: 28}
  },
  wrongObj: {
    John: {name: 'John', hair: 'brown', age: 36},
    Laura: {name: 'Laura', age: 23}, // missing "hair" value
    Boris: {name: 'Boris', hair: 'blonde', age: 28}
  },
  emptyObj: {
    John: {name: 'John', hair: 'brown', age: 36},
    Laura: {name: 'Laura', hair: undefined, age: 23},
    Boris: {name: 'Boris', hair: 'blonde', age: 28}
  },
  string: 'John,brown,36\nLaura,red,23\nBoris,blonde,28\n',
  altDelimiter: ';',
  invalidAltDelimiter: '%%',
  altDelimiterString: 'John;brown;36\nLaura;red;23\nBoris;blonde;28\n',
  wrongString: 'John,brown,36\nLaura,23\nBoris,blonde,28\n', // missing "hair" value
  emptyString: 'John,brown,36\nLaura,,23\nBoris,blonde,28\n', // empty "hair" value
  fullString: 'name,hair,age\nJohn,brown,36\nLaura,red,23\nBoris,blonde,28\n',
  altDelimiterFullString: 'name;hair;age\nJohn;brown;36\nLaura;red;23\nBoris;blonde;28\n',
  altFullString: 'name,age,hair\nJohn,36,brown\nLaura,23,red\nBoris,28,blonde\n',
  wrongFullString: 'name,hair,age\nJohn,brown,36\nLaura,23\nBoris,blonde,28\n', // missing "hair" value
  emptyFullString: 'name,hair,age\nJohn,brown,36\nLaura,,23\nBoris,blonde,28\n', // empty "hair" value
  dupFullString: 'name,hair,age\nJohn,blonde,36\nLaura,red,23\nBoris,blonde,28\n', // duplicate "hair" value
  header: 'name,hair,age',
  altHeader: 'name,age,hair',
  altDelimiterHeader: 'name;hair;age',
  invalidHeader: 123,
  wrongHeader: 'name,age,eyes', // unexisting "eyes" value
  emptyHeader: 'name,,age',
  objName: 'name'
};