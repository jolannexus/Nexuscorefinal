import {
transactionQueue,
webhookQueue,
reconciliationQueue,
settlementQueue,
payoutQueue,
auditQueue,
} from '../lib/queueManager'

import { queueLagMetrics } from '../lib/metrics'
import { workerLogger } from '../lib/logger'

export const startQueueTelemetryWorker = () => {
// Reuse existing singleton queues
// DO NOT create new Queue() instances here
const queues = [
transactionQueue,
webhookQueue,
reconciliationQueue,
settlementQueue,
payoutQueue,
auditQueue,
]

const interval = setInterval(async () => {
for (const queue of queues) {
try {
const waiting = await queue.getWaitingCount()
const active = await queue.getActiveCount()
const failed = await queue.getFailedCount()

    queueLagMetrics
      .labels(queue.name)
      .set(waiting)

    if (waiting > 100) {
      workerLogger.warn(
        {
          queue: queue.name,
          waiting,
          active,
        },
        'High queue lag detected'
      )
    }

    if (failed > 0) {
      workerLogger.info(
        {
          queue: queue.name,
          failed,
        },
        'Jobs in dead letter state'
      )
    }
  } catch (err: any) {
    workerLogger.error(
      err,
      `Failed to collect queue telemetry for ${queue.name}`
    )
  }
}

}, 10000)

return {
close: async () => {
clearInterval(interval)

  // DO NOT close queues here
  // queueManager owns queue lifecycle
},

}
}