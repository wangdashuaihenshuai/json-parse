const NUMBERS = '0123456789';
const [JSON, STRING, OBJECT, ATOM, NUMBER] = [0, 100, 200, 300, 400];
const ERROR_STRING = {
  [JSON]: 'parse json error',
  [STRING]: 'parse string error.',
  [OBJECT]: 'parse object error',
  [ATOM]: 'parse atom error',
  [NUMBER]: 'parse number error'
}

function parse(str) {
  const len = str.length;
  let index = 0;
  let char = str[index];

  class JsonError extends Error{
    constructor(name = JSON, message) {
      if (!message) message = ERROR_STRING[name];
      const start = index - 10 < 0 ? 0 : index - 10;
      const end = index + 10 > len ? index + 10 : len;
      let pointStr = ''
      for(let i = 0; i < (index - start); i++) {
        pointStr = pointStr + ' ';
      }
      pointStr = pointStr + '^';
      super(`\t${message}\nstr: \t${str.slice(start, end)}\n\t${pointStr}\nindex: \t${index}`);
      this.name = name;
    }
  }

  const skipSpace = function() {
    if (str[index] !== ' ') return;
    index ++;
    char = str[index];
  }

  const next = function(_char) {
    if (_char && char !== _char) throw new JsonError(0, `expect ${_char} not ${char}`);
    char = str[++index];
    if (index > len) throw new JsonError(0, 'out index of string.');
    return char;
  }

  const isNumber = function(char) {
    return NUMBERS.indexOf(char) >= 0;
  }

  const isEnd = function() {
    return index === len;
  }

  const nextIs = function(chars) {
    for(let c of chars) {
      next(c);
    }
  }

  const parseAtom = function(str) {
    return function(ret) {
      return function () {
        nextIs(str.split(''));
        return ret;
      }
    }
  }
  const parseTrue = parseAtom('true')(true);
  const parseFalse = parseAtom('false')(false);
  const parseNull = parseAtom('null')(null);

  const parseStr = function () {
    next();
    let str = '';
    while(char !== '"' && !isEnd()) {
      str = str + char;
      next();
    }
    if (str === '' || char !== '"') {
      throw new JsonError(STRING);
    }
    next();
    return str;
  }

  const parseObject = function () {
    const obj = {}
    next();
    skipSpace();
    if (char === '}') {
      next();
      return obj;
    }
    while(char !== '}') {
      const key = parseStr();
      skipSpace();
      next(':');
      skipSpace();
      const value = parseValue();
      obj[key] = value;
      skipSpace();
      if (char === ',') {
        next();
        skipSpace();
      }
    }
    next();
    return obj;
  }

  const parseArray = function () {
    const array = [];
    next();
    skipSpace();
    if (char === ']') {
      next();
      return array;
    }
    while(char !== ']') {
      const value = parseValue();
      array.push(value);
      skipSpace();
      if (char === ',') {
        next();
        skipSpace();
      }
    }
    next();
    return array;
  }

  // 只是简单实现,所以就只支持浮点数(0.1, 12.1, 12.0),整数(1, 2, 3);
  const parseInt = function () {
    let int = '';
    while(isNumber(char) && !isEnd()) {
      int = int + char;
      next();
    }
    return int;
  }
  const parseNumber = function () {
    let number = char;
    next();
    number = number + parseInt();
    if (char === '.') {
      number = number + char;
      next();
      number = number + parseInt();
    }
    return Number(number);
  }

  const parseValue = function () {
    switch (char) {
      case '{':
        return parseObject();

      case '[':
        return parseArray();

      case '"':
        return parseStr();
      case 'n':
        return parseNull();

      case 't':
        return parseTrue();

      case 'f':
        return parseFalse();

      case '-':
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        return parseNumber();

      default: throw new JsonError('type error');
    }
  }
  skipSpace();
  const value = parseValue();
  skipSpace();
  if(!isEnd()) throw new JsonError();
  return value;
}

const assert = require('assert');

function test() {
  const equal = function (data) {
    return assert.equal(parse(data.input), data.output);
  }

  const deepEqual = function(data) {
    return assert.deepEqual(parse(data.input), data.output);
  }

  const throwError = function (name) {
    return function (data) {
      return assert.throws(() => {
        return parse(data.input);
      }, function (error) {
        if (name) {
          return error.name === name && error instanceof Error;
        }
        return error instanceof Error;
      });
    }
  }

  const datas = [
    {input: 'true', output: true, message: 'test parse true'},
    {input: 'true ', output: true, message: 'test parse true'},
    {input: 'truea', output: true, message: 'test parse true', judge: throwError(JSON)},
    {input: 'false', output: false, message: 'test parse false'},
    {input: 'null', output: null, message: 'test parse null'},
    {input: '"', output: null, message: 'test parse str', judge: throwError(STRING)},
    {input: '""', output: null, message: 'test parse str', judge: throwError(STRING)},
    {input: '"haha', output: null, message: 'test parse str', judge: throwError(STRING)},
    {input: '"haha"', output: "haha", message: 'test parse str'},
    {input: '{}', output: {}, message: 'test parse str', judge: deepEqual},
    {input: '{"haha": "heihei"}', output: {haha: "heihei"}, message: 'test parse object', judge: deepEqual},
    {input: '{"haha": "heihei", "kaka": "kaka"}', output: {haha: "heihei", kaka: "kaka"}, message: 'test parse object', judge: deepEqual},
    {input: '[{}, "haha"]', output: [{}, "haha"], message: 'test parse array', judge: deepEqual},
    {input: '111', output: 111, message: 'test parse int'},
    {input: '111.11', output: 111.11, message: 'test parse float'},
    {input: '-111.11 ', output: -111.11, message: 'test parse float'},
    {input: '[{"a": "b", "c": 1}, "haha", 111]', output: [{"a": "b", "c": 1}, "haha", 111], message: 'test parse array', judge: deepEqual},
  ];
  for(let data of datas) {
      data.judge ? data.judge(data) : equal(data);
  }
  console.log('test successful!');
}

test();
