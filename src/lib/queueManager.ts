import { Queue, QueueEvents } from 'bullmq'
import { getRedisClient, disconnectRedis } from './redis'
import { logger } from './logger'

export enum QueueName {
TRANSACTION_PROCESSING = 'transaction-processing',
WEBHOOK_DELIVERY = 'webhook-delivery',
RECONCILIATION = 'reconciliation',
SETTLEMENT = 'settlement',
PAYOUT = 'payout',
AUDIT = 'audit',
}

// Shared queue configuration
const QUEUE_CONFIG = {
connection: getRedisClient(),

defaultJobOptions: {
// Fintech-safe retry policy
attempts: 3,

backoff: {
  type: 'exponential',
  delay: 1000,
},

// Prevent hanging jobs forever
timeout: 30000,

// Keep audit trail temporarily
removeOnComplete: {
  age: 3600,
},

// Keep failed jobs for investigation
removeOnFail: false,

},
}

// Queue factory
export const createQueue = (name: QueueName) => {
return new Queue(name, QUEUE_CONFIG)
}

// Global singleton queues
export const transactionQueue =
createQueue(QueueName.TRANSACTION_PROCESSING)

export const webhookQueue =
createQueue(QueueName.WEBHOOK_DELIVERY)

export const reconciliationQueue =
createQueue(QueueName.RECONCILIATION)

export const settlementQueue =
createQueue(QueueName.SETTLEMENT)

export const payoutQueue =
createQueue(QueueName.PAYOUT)

export const auditQueue =
createQueue(QueueName.AUDIT)

// Queue list helper
const ALL_QUEUES = [
transactionQueue,
webhookQueue,
reconciliationQueue,
settlementQueue,
payoutQueue,
auditQueue,
]

// Monitoring
export const setupQueueMonitoring = (
name: QueueName
) => {
const events = new QueueEvents(name, {
connection: getRedisClient(),
})

events.on('failed', ({ jobId, failedReason }) => {
logger.error(
`Job ${jobId} failed in ${name}: ${failedReason}`
)
})

events.on('completed', ({ jobId }) => {
logger.info(
`Job ${jobId} completed in ${name}`
)
})

return events
}

// Graceful queue shutdown
export const shutdownQueues = async () => {
logger.info('Starting graceful queue shutdown...')

// Pause queues first
for (const queue of ALL_QUEUES) {
try {
await queue.pause()

  logger.info(
    `Queue paused: ${queue.name}`
  )
} catch (err) {
  logger.error(
    err,
    `Failed to pause queue: ${queue.name}`
  )
}

}

// Wait for active jobs
const timeout = 30000
const startedAt = Date.now()

while (Date.now() - startedAt < timeout) {
let activeJobs = 0

for (const queue of ALL_QUEUES) {
  try {
    activeJobs += await queue.getActiveCount()
  } catch (err) {
    logger.error(
      err,
      `Failed active count: ${queue.name}`
    )
  }
}

if (activeJobs === 0) {
  break
}

logger.info(
  `Waiting for ${activeJobs} active jobs to finish...`
)

await new Promise((resolve) =>
  setTimeout(resolve, 1000)
)

}

// Close queues
await Promise.allSettled(
ALL_QUEUES.map((queue) => queue.close())
)

// Disconnect Redis
await disconnectRedis()

logger.info('Queue shutdown complete')
}
// Keep failed jobs for investigation
removeOnFail: false,

},
}

// Queue factory
export const createQueue = (name: QueueName) => {
return new Queue(name, QUEUE_CONFIG)
}

// Global singleton queues
export const transactionQueue =
createQueue(QueueName.TRANSACTION_PROCESSING)

export const webhookQueue =
createQueue(QueueName.WEBHOOK_DELIVERY)

export const reconciliationQueue =
createQueue(QueueName.RECONCILIATION)

export const settlementQueue =
createQueue(QueueName.SETTLEMENT)

export const payoutQueue =
createQueue(QueueName.PAYOUT)

export const auditQueue =
createQueue(QueueName.AUDIT)

// Queue list helper
const ALL_QUEUES = [
transactionQueue,
webhookQueue,
reconciliationQueue,
settlementQueue,
payoutQueue,
auditQueue,
]

// Monitoring
export const setupQueueMonitoring = (
name: QueueName
) => {
const events = new QueueEvents(name, {
connection: getRedisClient(),
})

events.on('failed', ({ jobId, failedReason }) => {
logger.error(
"Job ${jobId} failed in ${name}: ${failedReason}"
)
})

events.on('completed', ({ jobId }) => {
logger.info(
"Job ${jobId} completed in ${name}"
)
})

return events
}

// Graceful queue shutdown
export const shutdownQueues = async () => {
logger.info('Starting graceful queue shutdown...')

// Pause queues first
for (const queue of ALL_QUEUES) {
try {
await queue.pause()

  logger.info(
    `Queue paused: ${queue.name}`
  )
} catch (err) {
  logger.error(
    err,
    `Failed to pause queue: ${queue.name}`
  )
}

}

// Wait for active jobs
const timeout = 30000
const startedAt = Date.now()

while (Date.now() - startedAt < timeout) {
let activeJobs = 0

for (const queue of ALL_QUEUES) {
  try {
    activeJobs += await queue.getActiveCount()
  } catch (err) {
    logger.error(
      err,
      `Failed active count: ${queue.name}`
    )
  }
}

if (activeJobs === 0) {
  break
}

logger.info(
  `Waiting for ${activeJobs} active jobs to finish...`
)

await new Promise((resolve) =>
  setTimeout(resolve, 1000)
)

}

// Close queues
await Promise.allSettled(
ALL_QUEUES.map((queue) => queue.close())
)

// Disconnect Redis
await disconnectRedis()

logger.info('Queue shutdown complete')
}