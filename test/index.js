let chai = require('chai');
let expect = chai.expect;
let pt = require("../index")

// Ref https://emn178.github.io/online-tools/keccak_256.html
describe("Test of hashing", function() {
  it('Should hash to the correct value', function () {
    let blank = '';
    let hello = 'hello';
    let text = 'This should be hashed';
    let unicode = '提供'
    expect(pt.hash(hello)).to.equal('0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8');
    expect(pt.hash(blank)).to.equal('0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470');
    expect(pt.hash(text)).to.equal('0x0b27a2d2b1fb2e6f528b6f1956751f73bcb96fc7e0293de446b531e97b3dfa68');
    expect(pt.hash(unicode)).to.equal('0x8c7468bb1a1508e93115a14e2d8ff31856392e1a1a88f568b0fbf418dd4f5eac');
  })
})
