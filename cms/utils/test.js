const { calPromotion,nameMonth } = require('./utility')

describe('test cal promotion function', () => {
    let tt = 2
    let buy = 2
    let free = 1
    test(`จำนวนซื้อทั้งหมด ${tt} ซื้อ ${buy} แถม ${free}`,async  () => {
        console.log(await nameMonth())
        const result = await calPromotion(tt, buy, free)
        expect(result).toBe(1)

    })
})


