const { calPromotion } = require('./utility')


describe('test cal promotion function', () => {
    var tt = 10
    var buy = 3
    var free = 2
    test(`จำนวนซื้อทั้งหมด ${tt} ซื้อ ${buy} แถม ${free} `, () => {
        expect(calPromotion(tt,buy, free)).toBe(6)
    });
});
