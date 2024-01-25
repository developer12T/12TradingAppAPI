async function errResponse(res) {
    return res.status(200).json({ status: 204, message: 'No Data' })
}

module.exports = {
    errResponse,
}