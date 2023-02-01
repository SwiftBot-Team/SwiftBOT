const axios = require("axios")
const moment = require('moment')

const BASE_URL = 'https://registry.npmjs.org'
const BASE_URL_API = 'https://api.npmjs.org'

module.exports = async function search(text) {
  try {
    const startOfWeek = moment().subtract(1, 'weeks').startOf('isoWeek').format('YYYY-MM-DD');
    const endOfWeek = moment().subtract(1, 'weeks').endOf('isoWeek').format('YYYY-MM-DD');

    const { data: searchData } = await axios.get(`${BASE_URL}/-/v1/search?text=${text}&size=1`)
    const { data: downloadsData } = await axios.get(`${BASE_URL_API}/downloads/point/${startOfWeek}:${endOfWeek}/${text}`)

    if (downloadsData.error || searchData.total === 0) return null

    return {
      searchData: searchData.objects[0],
      downloadsData: downloadsData
    }
  } catch (err) {
    return null
  }
}