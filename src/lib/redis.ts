// src/lib/redis.ts

import Redis from 'ioredis'
import { env } from './env'
import { logger } from './logger'

const globalForRedis = globalThis as unknown as {
redisClient?: Redis
}

export function getRedisClient(): Redis {
if (!globalForRedis.redisClient) {
const redisConfig: any = {
// Better production stability
maxRetriesPerRequest: null,
enableReadyCheck: false,
lazyConnect: true,
enableOfflineQueue: true,

  // Prevent hanging forever
  connectTimeout: 5000,
  commandTimeout: 10000,

  // Controlled reconnect strategy
  retryStrategy: (times: number) => {
    if (times > 10) {
      logger.error(
        { times },
        'Redis retry limit exceeded'
      )

      return null
    }

    const delay = Math.min(times * 200, 3000)

    logger.warn(
      { times, delay },
      'Redis reconnect attempt'
    )

    return delay
  },
}

// Create singleton Redis client
const client = new Redis(
  env.REDIS_URL!,
  redisConfig
)

// Redis events
client.on('error', (err) => {
  logger.error(err, 'Redis connection error')
})

client.on('reconnecting', () => {
  logger.warn('Redis reconnecting...')
})

client.on('connect', () => {
  logger.info('Redis connected successfully')
})

client.on('ready', () => {
  logger.info('Redis client ready')
})

client.on('close', () => {
  logger.warn('Redis connection closed')
})

// Save singleton globally
globalForRedis.redisClient = client

}

return globalForRedis.redisClient
}

// Graceful Redis shutdown
export async function disconnectRedis() {
if (globalForRedis.redisClient) {
try {
await globalForRedis.redisClient.quit()

  logger.info('Redis disconnected gracefully')
} catch (err) {
  logger.error(err, 'Redis graceful disconnect failed')
} finally {
  globalForRedis.redisClient = undefined
}

}
}

// Graceful process shutdown
process.on('SIGINT', async () => {
await disconnectRedis()
})

process.on('SIGTERM', async () => {
await disconnectRedis()
})