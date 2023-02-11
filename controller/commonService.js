const { createClient } = require('redis')
const UploadExcel = require('../Entity/excel_to_db')
const Redis = require('redis')
const redis_port = process.env.REDIS_PORT || 6397
const client = Redis.createClient(redis_port)

const redisConnect = async () => {
  try {
    const client = createClient()
    await client.connect()
    return { status: 'success', response: client, message: null }
  } catch (err) {
    console.log(err)
    return {
      status: 'fail',
      response: null,
      message: err.message
    }
  }
}

module.exports = {
  redisConnect
}
