// 一个有限状态机的练习.
// 判断是不是正常数字.
//
// 先确定状态转换图,
// state(0)
//       --(+, -)-->state(1)
//       --(number)-->state(2)
//       --(其他)-->state(6)
//
// state(1)
//       --(number)-->state(2)
//       --(其他)-->state(6)
//
// state(2)
//       --(number)-->state(2)
//       --(.)-->state(3)
//       --(其他)-->state(6)
//
// state(3)
//       --(number)-->state(3)
//       --(E)-->state(4)
//       --(其他)-->state(6)
//
// state(4)
//       --(+, -)-->state(5)
//       --(number)-->state(5)
//       --(其他)-->state(6)
//
// state(5)
//       --(number)-->state(5)
//       --(其他)-->state(6)
//
// state(6)
//       --(其他)-->state(6)
//
// 之后确定状态转换数组.
// 接下来就很容易了.

function transformWord (word) {
  if ('+' ===word ) return 00
  if ('-' ===word ) return 01
  if ('.' ===word ) return 02
  if ('E' ===word ) return 03
  if ('1234567890'.includes(word)) return 04
  return 05;
}

const stateTransform =
[
  [01, 01, 06, 06, 02, 06],
  [06, 06, 06, 06, 02, 06],
  [06, 06, 03, 06, 02, 06],
  [06, 06, 06, 04, 03, 06],
  [05, 05, 06, 06, 06, 06],
  [06, 06, 06, 06, 05, 06],
  [06, 06, 06, 06, 06, 06],
]

//state code
const allow_code = [2, 3, 5];
const allowCodeDict = {
  2: 'int',
  3: 'float',
  5: 'exp'
}

class ParseNumber {
  constructor (str) {
    this.str = str;
    this.position = 0;
    this.state = 0;
  }

  getNextWord () {
    this.position ++;
    return this.str[this.position - 1];
  }

  parse () {
    const word = this.getNextWord();
    if (!word) {
      return this.state;
    }
    this.state = stateTransform[this.state][transformWord(word)]
    return this.parse()
  }
}

const parseNumber = new ParseNumber('-11')
const result = parseNumber.parse()
if (allow_code.includes(result)) {
  console.log(`allow number: ${allowCodeDict[result]}`)
} else {
  console.log('not allow number')
}
