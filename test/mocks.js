'use strict';

module.exports = {
  arr: [
    { name: 'John', hair: 'brown', age: 36 },
    { name: 'Laura', hair: 'red', age: 23 },
    { name: 'Boris', hair: 'blonde', age: 28 }
  ],
  wrongArr: [
    { name: 'John', hair: 'brown', age: 36 },
    { name: 'Laura', age: 23 }, // missing "hair" value
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
  string: 'John,brown,36\nLaura,red,23\nBoris,blonde,28\n',
  wrongString: 'John,brown,36\nLaura,23\nBoris,blonde,28\n',
  fullString: 'name,hair,age\nJohn,brown,36\nLaura,red,23\nBoris,blonde,28\n',
  altFullString: 'name,age,hair\nJohn,36,brown\nLaura,23,red\nBoris,28,blonde\n',
  invalidFullString: 'name,hair,age\nJohn,brown,36\nLaura,23\nBoris,blonde,28\n', // missing "hair" value
  altInvalidFullString: 'name,hair,age\nJohn,brown,36\nLaura,,23\nBoris,blonde,28\n', // empty "hair" value
  header: 'name,hair,age',
  altHeader: 'name,age,hair',
  invalidHeader: 123,
  wrongHeader: 'name,age,eyes', // unexisting "eyes" value
  objname: 'name'
};