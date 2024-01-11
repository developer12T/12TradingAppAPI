const { calPromotion } = require('./utility')


describe('test cal promotion function', () => {
    var tt = 2
    var buy = 2
    var free = 1
    test(`จำนวนซื้อทั้งหมด ${tt} ซื้อ ${buy} แถม ${free}`,async  () => {

        const result = await calPromotion(tt, buy, free)
        expect(result).toBe(1)

    })
})


