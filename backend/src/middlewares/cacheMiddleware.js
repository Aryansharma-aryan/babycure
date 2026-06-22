const { getRedisClient } = require('../config/redis')

const cache = (keyBuilder, ttlSeconds = 60) => async (req, res, next) => {
  const redis = getRedisClient()
  if (!redis) return next()

  const key = typeof keyBuilder === 'function' ? keyBuilder(req) : keyBuilder

  try {
    if (redis.status === 'wait') {
      await redis.connect()
    }

    const cached = await redis.get(key)
    if (cached) {
      return res.status(200).json(JSON.parse(cached))
    }

    const originalJson = res.json.bind(res)
    res.json = async (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        await redis.set(key, JSON.stringify(body), 'EX', ttlSeconds)
      }
      return originalJson(body)
    }
  } catch {
    return next()
  }

  return next()
}

module.exports = cache
