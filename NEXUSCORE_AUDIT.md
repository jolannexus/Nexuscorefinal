# NexusCore: Enterprise White-Label Top-Up & Digital Commerce SaaS Platform
## Production Hardening, Systems Integration Audit, and Architectural Blueprint

This document represents a comprehensive systems architectural audit and evolution blueprint for **NexusCore**, a high-velocity multi-tenant SaaS platform styled as "Shopify for digital top-ups and fulfillment orchestration." 

---

## 1. Executive Summary & Context Verification

NexusCore functions at the convergence of three complex domains: **SaaS multi-tenancy**, **financial ledger accounting**, and **highly unstable external API integration (suppliers)**. 

### 1.1 Evaluated System Core Components
*   **API Runtime Engine:** Single-node Express Server (`server.ts`) proxying requests, detecting tenant headers, and routing traffic.
*   **Database Paradigm:** Google Cloud Firestore (leveraging nested paths `/agencies/{agencyId}/[orders|wallets|transactions|settings]`).
*   **Fulfillment Orchestration:** BullMQ with a Redis-backed connection (`/src/services/queue/queueService.ts`), operating a local in-memory queue fallback if Redis connection terminates.
*   **Accounting Ledger System:** Multi-document transaction write cycles with database-level transactions (`/src/services/billing/ledgerService.ts`).
*   **Access Management:** Contextual Fire-rules and RBAC middleware (`/src/middleware/auth.ts`, `/firestore.rules`).

---

## 2. Identified Weaknesses & Scaling Bottlenecks

A deep-dive audit of the current source structure reveals critical architectural gaps that represent operational vulnerabilities when running under enterprise scale ($10^5+$ daily transactions).

### 2.1 Multi-Tenant Isolation: Shard Collisions & Cross-Leak Risks
*   **Vulnerability:** The tenant context identification logic in `server.ts` maps incoming domains or slugs using manual `getDocs()` operations with firestore queries on every request.
*   **Impact:** Under heavy traffic, this causes excessive read latency and API query starvation. A database-level disruption in the global lookup tables halts routing for all custom domains.
*   **Technical Debt:** Lacks persistent edge caching (e.g., Redis `GET tenant:{domain}`) for tenant identity.

### 2.2 Billing Ledger Integrity: Missing Idempotency Key Guarding
*   **Vulnerability:** `LedgerService.executeLedgerEntry` utilizes Firestore transactional snapshots to increment and decrement balances. However, if a network socket fails *after* a debit operation succeeds but *before* the caller receives acknowledgment, the client will retry the API request.
*   **Impact:** Direct double-debiting of reseller balances due to the lack of an atomic **idempotency key lookup phase**.
*   **Technical Debt:** Transactions do not verify if an explicit `idempotencyKey` reference has already been executed in an isolated log collection beforehand.

### 2.3 Supplier Orchestration & Telemetry Failover Bottlenecks
*   **Vulnerability:** The `ProviderSelector` uses ephemeral on-memory metrics to calculate latency and failure rate telemetry. Under container scale-out (multiple Cloud Run instances with round-robin load balancers), the telemetry state is siloed inside single containers.
*   **Impact:** A degraded supplier adapter on container Alpha is seen as healthy on container Beta, causing split-brain routing and unnecessary customer order errors.
*   **Technical Debt:** Lacks distributed coordination of telemetry data using a central atomic caching store.

### 2.4 Unsecured Webhook Verification & Order State Changes
*   **Vulnerability:** Webhook callbacks from external suppliers (e.g., Digiflazz) dynamically alter ledger and order statuses. Currently, the webhook listener route `/api/webhooks/digiflazz` has a placeholder signature checks mechanism.
*   **Impact:** Malicious actors can forge completed order webhooks to trigger automatic delivery or ledger releases without real payment occurring.
*   **Technical Debt:** Missing validation of body checksums and replay-attack nonce verification.

### 2.5 Queue Connection Resiliency & BullMQ Failovers
*   **Vulnerability:** In `QueueService.ts`, if Redis experiences transient network partitions, the queue switches instantly to an "in-memory fallback" mode.
*   **Impact:** Since the in-memory fallback uses standard Promise loops, container scale-down or sudden crashes will permanently destroy unfulfilled orders in transit.
*   **Technical Debt:** In-memory queue fallback is fine for development overlays, but behaves as an anti-pattern in high-density production architectures.

---

## 3. Targeted Refactoring & System Blueprints

### 3.1 Enterprise Tenant Cache Pipeline
To shield Firestore from tenant-lookup query exhaustion, we establish an Enterprise Tenant Cache layer on top of our identification middleware.

```typescript
// Architecture Design for Edge Tenant Lookup Middleware
import Redis from 'ioredis';
import { db } from './src/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function resolveTenantContext(host: string, slug: string | null) {
  const cacheKey = `tenant:resolve:${host}`;
  
  // 1. Attempt Edge Cache Fetch
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. Database Fallback lookup
  let agencyDoc = null;
  let q = query(collection(db, "agencies"), where("domain", "==", host), limit(1));
  let snap = await getDocs(q);

  if (!snap.empty) {
    agencyDoc = snap.docs[0];
  } else if (slug) {
    const slugQuery = query(collection(db, "agencies"), where("slug", "==", slug), limit(1));
    const slugSnap = await getDocs(slugQuery);
    if (!slugSnap.empty) {
      agencyDoc = slugSnap.docs[0];
    }
  }

  if (agencyDoc) {
    const data = { id: agencyDoc.id, ...agencyDoc.data() };
    // Cache for 10 minutes to reduce high-frequency reads
    await redis.set(cacheKey, JSON.stringify(data), 'EX', 600);
    return data;
  }

  return null;
}
```

---

### 3.2 Impeccable Double-Entry Billing Ledger with Complete Idempotency Protection
To eliminate balance draining and multi-execution races, `LedgerService` must implement a pre-execution idempotency check step.

```typescript
// Proposed Enterprise Refactoring of src/services/billing/ledgerService.ts
import { 
  collection, 
  doc, 
  getDoc,
  setDoc,
  runTransaction, 
  serverTimestamp, 
  increment,
  Transaction as FirestoreTransaction 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

export class EnterpriseLedgerService {
  /**
   * Executes a safe ledger entry with absolute idempotency checks.
   */
  static async executeLedgerEntry(params: {
    resellerId: string;
    agencyId: string;
    amount: number;
    type: 'DEBIT' | 'CREDIT' | 'TRANSFER' | 'FREEZE' | 'UNFREEZE' | 'CONFIRM_DEBIT' | 'PURCHASE' | 'DEPOSIT' | 'REFUND';
    description: string;
    idempotencyKey: string; // MANDATORY: unique transaction token generated by client
    orderId?: string;
    metadata?: Record<string, any>;
  }) {
    const idempotencyRef = doc(db, 'agencies', params.agencyId, 'deduplications', params.idempotencyKey);
    const walletRef = doc(db, 'agencies', params.agencyId, 'wallets', params.resellerId);
    const logRef = doc(collection(db, 'agencies', params.agencyId, 'transactions'));

    return await runTransaction(db, async (transaction) => {
      // 1. Enforce Idempotency First
      const idemSnap = await transaction.get(idempotencyRef);
      if (idemSnap.exists()) {
        throw new Error(`TRANSACTION_CONFLICT: Key ${params.idempotencyKey} has already been settled.`);
      }

      // 2. Load and Lock Wallet balance
      const walletSnap = await transaction.get(walletRef);
      if (!walletSnap.exists()) {
        throw new Error('WALLET_NOT_FOUND: Ledger target requires initialized active billing account.');
      }

      const wallet = walletSnap.data();
      const currentBalance = wallet.balance || 0;
      const currentFrozen = wallet.frozenBalance || 0;

      let balanceUpdate = {};
      let balanceAfter = currentBalance;

      // Safe State Transition Machine
      switch (params.type) {
        case 'DEBIT':
        case 'PURCHASE':
          if (currentBalance < params.amount) {
            throw new Error(`INSUFFICIENT_FUNDS: Required IDR ${params.amount}, Current: IDR ${currentBalance}`);
          }
          balanceUpdate = { balance: increment(-params.amount) };
          balanceAfter = currentBalance - params.amount;
          break;

        case 'FREEZE':
          if (currentBalance < params.amount) {
            throw new Error('INSUFFICIENT_FUNDS_FOR_FREEZE');
          }
          balanceUpdate = { 
            balance: increment(-params.amount),
            frozenBalance: increment(params.amount)
          };
          balanceAfter = currentBalance - params.amount;
          break;

        case 'UNFREEZE':
          if (currentFrozen < params.amount) {
            throw new Error('INSUFFICIENT_FROZEN_FUNDS');
          }
          balanceUpdate = { 
            balance: increment(params.amount),
            frozenBalance: increment(-params.amount)
          };
          balanceAfter = currentBalance + params.amount;
          break;

        case 'CONFIRM_DEBIT':
          if (currentFrozen < params.amount) {
            throw new Error('INSUFFICIENT_FROZEN_FUNDS_DEBIT');
          }
          balanceUpdate = { frozenBalance: increment(-params.amount) };
          balanceAfter = currentBalance;
          break;

        case 'CREDIT':
        case 'DEPOSIT':
        case 'REFUND':
          balanceUpdate = { balance: increment(params.amount) };
          balanceAfter = currentBalance + params.amount;
          break;
      }

      // 3. Persist State Changes atomically
      transaction.update(walletRef, {
        ...balanceUpdate,
        updatedAt: serverTimestamp()
      });

      // 4. Record Deduplication Key
      transaction.set(idempotencyRef, {
        resellerId: params.resellerId,
        amount: params.amount,
        type: params.type,
        settledAt: serverTimestamp()
      });

      // 5. Build Audit Log
      transaction.set(logRef, {
        resellerId: params.resellerId,
        agencyId: params.agencyId,
        type: params.type,
        amount: params.amount,
        balanceBefore: currentBalance,
        balanceAfter: balanceAfter,
        description: params.description,
        orderId: params.orderId || null,
        idemKey: params.idempotencyKey,
        createdAt: serverTimestamp()
      });

      return { balanceAfter, txId: logRef.id };
    });
  }
}
```

---

## 4. Supplier Orchestration & Smart Routing Engine

The engine must intelligently evaluate supplier connection metrics to choose the cheapest, overall healthiest option.

```
       [ Client Order ]
              |
     [ Verify Balance ]
              |
      [ Smart Routing ] ---> (Evaluates Latency, Cost, Success Rate)
              |
    +---------+---------+
    |                   |
[Supplier A]       [Supplier B] (Failover)
    |                   |
    +---------+---------+
              |
    [ Webhook Reconciliation ] (Idempotent deduplication log)
```

### 4.1 Scoring Algorithm formulation
We run a normalized smart selection scoring strategy ($S$). When an order executes, selection calculates:

$$Score = (W_{cost} \times N_{cost}) + (W_{latency} \times N_{latency}) + (W_{success} \times N_{success})$$

Where $W$ are weight metrics configurable by the Agency, and $N$ are normalized scores between $0.0$ and $1.0$.

---

## 5. Firebase Security Rules Hardening Matrix
Below is our audited security rule configuration matrix ensuring multi-tenant isolation:

| Document Path | Create Restriction | Read Restriction | Update Restriction |
| :--- | :--- | :--- | :--- |
| `/users/{id}` | Self create with valid schema | Self get (Only owner) | Restricted keys (`['displayName']` only) |
| `/agencies/{id}` | Authenticated user | Public metadata mapping | Owned instance only |
| `/agencies/{id}/wallets/{uid}` | Agency role only | Owner Reseller OR Agency Admin | Write restricted to Agency Admin |
| `/agencies/{id}/orders/{id}` | Any customer of active agency | Belongs to agency OR reseller matching ID | Agency Admin can change state keys |
| `/agencies/{id}/settings/{id}` | SuperAdmin or Agency Admin | SuperAdmin or Agency Admin | No write except SuperAdmin / Agency |

---

## 6. Enterprise Scale Deployment & Cloud Topology

To support 10M monthly product requests across thousands of white-label instances, NexusCore will utilize the following multi-region infrastructure blueprint on Google Cloud Platform:

```
                           [ Cloudflare Anycast CDN ] 
                                       |
                           [ Cloud Load Balancer (HTTPS) ]
                                       |
                       +---------------+---------------+
                       |                               |
              [ Cloud Run (US-East) ]        [ Cloud Run (Asia-East) ]
              (Auto-scaling Express JS)     (Auto-scaling Express JS)
                       |                               |
                       +---------------+---------------+
                                       |
              +------------------------+------------------------+
              |                                                 |
     [ Cloud Memorystore ]                             [ Cloud Firestore ]
      (Distributed Redis)                           (Tenant-isolated collections)
```

### 6.1 Database Scaling: Collection Group Sharding Strategy
When a single tenant approaches Firestore's 10,000 writes/second limitation, we activate **Active Database Sharding**:
1. Global accounts remain on the primary multi-tenant database.
2. Enterprise tenants ($Top\ 5\%$) are soft-routed to secondary Firestore database shards (e.g., `databases/tenant-[id]`) via tenant connection metadata mapping within the Edge Cache Layer.

---

## 7. Integrated Monitoring & Observability Stack

Production readiness dictates deep logging and alerting to meet a strict **99.95% API SLA**.

*   **Log Ingestion:** JSON structured output flowing directly to **Google Cloud Logging (Winston logger Integration)**.
*   **Performance Telemetry:** **OpenTelemetry** hooks integrated into Express middleware to map endpoint-specific request latencies and db transaction duration.
*   **Supplier SLA Alerts:** Dynamic Prometheus/Grafana graphs configured with alerting triggers running Slack integrations for:
    *   Supplier failure rate rise $> 10\%$ in rolling 5 mins window.
    *   Fulfillment queue depth build $> 100$ unallocated pending jobs.
    *   Unacknowledged webhooks pending for $> 15$ mins.

---

## 8. Prioritized Implementation Roadmap

### Phase 1: Accounting Integrity (Immediate Target)
*   **Action:** Transition from regular increments to the idempotent transaction framework. Add unique index database rules for deduplication tokens tracking logs.
*   **Goal:** $0\%$ debit mismatch SLA.

### Phase 2: Orchestration Failover Hardening
*   **Action:** Transition Telemetry state management from container memory to Distributed Region Redis. Add multi-variant backup fallback supplier configurations.
*   **Goal:** Automatically bypass degraded suppliers within 300ms without manual administrator action.

### Phase 3: Developer API Provisioning
*   **Action:** Standardize custom public integration schemas (`/api/v1/*` routes) authenticated with SHA-256 API secrets.
*   **Goal:** Provide secure reseller-facing programmable topups.
