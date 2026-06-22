const Redis = require('ioredis')

let redisClient = null

const getRedisClient = () => {
  if (!process.env.REDIS_URL) {
    return null
  }

  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: true,
    })
  }

  return redisClient
}

module.exports = {
  getRedisClient,
}
