const axios = require ('axios')
async function DATA_STORE_M3(customertype) {
    const response = await axios.post(process.env.API_URL_12TRADING+process.env.END_POINT_STORE_M3,{
        customertype:"103"
    })
    // console.log(data.detail.available)
    return response.data
}

module.exports = {
    DATA_STORE_M3,
}