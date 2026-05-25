# PRODUCT REQUIREMENT DOCUMENT (PRD)

## Project: NexusCore Digital Monetization & White-Label Infrastructure Platform
**Document Reference:** PRD-NEXUSCORE-2026-V1.2  
**Status:** Approved / Investor & Architect Review  
**Date:** May 20, 2026  
**Author:** SaaS Architecture & Product Operations Group  

---

### 1. PRODUCT VISION & EXECUTIVE SUMMARY
NexusCore is a globally competitive, enterprise-grade B2B digital monetization infrastructure platform designed to power global recharge ecosystems, creator-economy marketplaces, gaming top-up structures, and multi-tenant reseller networks. It acts as the "Shopify + Stripe" for digital vouchers, in-game tokens, and software licenses, removing the friction of supplier orchestration, multi-tiered margin routing, currency and balance clearing, and white-labeled storefront layouts. 

The software enables **Agencies** (White-Label Tenants) to deploy self-hosted or managed monetization interfaces under custom domains, recruit **Resellers** (Downstream Partners), configure real-time automated supplier bridges, and clear transactions through an uncompromised virtual ledger system.

---

### 2. SYSTEM ARCHITECTURE & MULTI-TENANCY MODEL
NexusCore is built upon an isolated multi-tenant architecture designed to maintain high performance and perfect data security boundaries.

```
                  +-------------------------------------------------+
                  |              NEXUSCORE CORE INFRA               |
                  |  Multi-Tenant Routing Table & Host Resolution   |
                  +-------------------------------------------------+
                                           |
                  +------------------------+------------------------+
                  |                                                 |
+-----------------------------------+             +-----------------------------------+
|      TENANT: agency1.ltd          |             |      TENANT: agency2.net          |
|  - Branding Rules                 |             |  - Branding Rules                 |
|  - Custom Subdomain & Custom CNAME|             |  - Custom Subdomain & Custom CNAME|
|  - Tiered Resellers               |             |  - Tiered Resellers               |
+-----------------------------------+             +-----------------------------------+
```

1. **Host-Header Domain Resolution:** The platform utilizes dynamic hostname parsing at the middleware layer. When a web client initiates a request, the server parses the `Host` header (e.g., `agency1.nexuscore.com` or `custom-domain.com`), queries the tenant routing registry cached in memory, and dynamically serves the corresponding theme variables, product markups, and catalog views.
2. **Data Isolation Strategy:** Single-database multi-tenancy is enforced using tenants keys (`agency_id` / `tenant_id`) across all schemas. All Postgres relational queries are restricted via strict RLS (Row-Level Security) policies or software-level request filters, ensuring tenant-to-tenant data leaks are mathematically impossible.

---

### 3. USER ROLES, PERMISSIONS, & HIERARCHICAL BOUNDARIES
NexusCore supports a strict hierarchical business structure:

$$\mathbf{Supplier} \;\longrightarrow\; \mathbf{Agency\;Admin} \;\longrightarrow\; \mathbf{Reseller} \;\longrightarrow\; \mathbf{End\text{-}Customer}$$

```
+--------------------------------------------------------------------------+
|  1. SUPPLIER                                                             |
|  - Registers SKUs, exposes API endpoints, fires fulfillment webhooks.    |
+--------------------------------------------------------------------------+
                               |
                               v
+--------------------------------------------------------------------------+
|  2. AGENCY ADMIN (Tenant Owner)                                          |
|  - Custom domains, branding theme UI, global supplier failover rules,    |
|    downstream reseller credit allocations, billing plan subscriptions.   |
+--------------------------------------------------------------------------+
                               |
                               v
+--------------------------------------------------------------------------+
|  3. RESELLER (SaaS Client Representative)                                |
|  - Downstream retail sales, reseller-specific markup settings, client    |
|    sub-wallets management, downstream storefront layout configuration.   |
+--------------------------------------------------------------------------+
                               |
                               v
+--------------------------------------------------------------------------+
|  4. END-CUSTOMER (Consumer)                                              |
|  - Visualizes retail items, loads user profile credentials, issues       |
|    instant checkout requests via QRIS/VA, views fulfillment receipt.      |
+--------------------------------------------------------------------------+
```

#### Detailed Role Definitions

*   **Supplier (System-Integrated Providers):** External fulfillment networks (e.g., Digiflazz, VIP Reseller, UniPin) that publish dynamic catalogs and fulfill the ordered items. Within NexusCore, suppliers are treated as normalized adapters. They interact with our bridge using security hashes (MD5/SHA256 signature keys) to confirm transaction states and provide actual stock updates.
*   **Agency Admin (SaaS Tenant Owner):** Enterprise-grade operators. They own the branded instance and manage the entire ecosystem within their whitelabel boundary.
*   **Reseller (Partner & Middleman):** Business partners onboarded by the Agency Admin. Resellers maintain their own prepaid balances, create custom visual layouts for their sub-storefronts, manage individual end-customer profiles, and gain margins by utilizing customized sub-markups.
*   **End-Customer (Retail Consumer):** The final retail consumer who browses the reseller's or agency's public shop. They require simple, responsive, layout-perfect storefront interfaces to purchase items instantly with zero cognitive load.

#### Permissions & Access Control Matrix

| Capability / Resource | Super Admin (Platform) | Agency Admin (Tenant) | Reseller (Partner) | End-Customer |
| :--- | :---: | :---: | :---: | :---: |
| **System Health & Tenant Approval** | **WRITE** | NO ACCESS | NO ACCESS | NO ACCESS |
| **SaaS Billing & Plan Setting** | **WRITE** | **READ / WRITE** | NO ACCESS | NO ACCESS |
| **Custom Domain & Branding Config**| **READ** | **WRITE** | NO ACCESS | NO ACCESS |
| **Supplier Allocation / Bridges** | NO ACCESS | **WRITE** | NO ACCESS | NO ACCESS |
| **Base Pricing / Global Markups**   | NO ACCESS | **WRITE** | NO ACCESS | NO ACCESS |
| **Reseller Tier & Discount Groups** | NO ACCESS | **WRITE** | NO ACCESS | NO ACCESS |
| **Partner Store Grid Layout Override** | NO ACCESS | **WRITE** (Policies) | **WRITE** (Visuals) | NO ACCESS |
| **Wallet Credit Injections (Direct)**| NO ACCESS | **WRITE** (To Partner) | NO ACCESS | NO ACCESS |
| **Fulfillment Checkout Execution** | NO ACCESS | **WRITE** | **WRITE** | **WRITE** |
| **Audit Trails & Ledger Exports** | **READ** (Global) | **READ / WRITE** | **READ** (Self) | NO ACCESS |

---

### 4. MULTI-SUPPLIER API INTEGRATION INFRASTRUCTURE

#### API Mappings & Normalization
To insulate the platform from external supplier API schema changes, NexusCore introduces a unified, bidirectional normalization layer:

```
+--------------------------------------------------------------------------+
|                    UNIFIED INTERNAL FULFILLMENT ROUTER                   |
|  Normalizes payload properties: SKU, ExternalID, TargetCredentials, Auth  |
+--------------------------------------------------------------------------+
             |                                              |
             v                                              v
+-------------------------+                    +---------------------------+
|   DIGIFLAZZ ADAPTER     |                    |   VIP RESELLER ADAPTER    |
|   Format: JSON (Flat)   |                    |   Format: XML-RPC / JSON  |
|   Sign: MD5(username+   |                    |   Sign: SHA256(api_key+   |
|   key+ref_id)           |                    |   api_id)                 |
+-------------------------+                    +---------------------------+
```

Each vendor connector maps its raw request and response data to NexusCore's internal types:

```typescript
interface InternalFulfillmentRequest {
  internalOrderId: string;
  skuCode: string; // Unified cross-supplier catalog SKU
  targetId: string; // Customer Identification ID/Target Server
  zoneId?: string; // Optional Parameter (e.g., Target Cluster Zone)
}

interface InternalFulfillmentResponse {
  supplierOrderId: string;
  orderState: 'PENDING' | 'SUCCESS' | 'FAILED';
  supplierBaseCost: number;
  serialNumber?: string;
  completionTimestamp: Date;
  errorMessage?: string;
}
```

##### API Normalization Registry (Example Flow Mapping)

*   **Digiflazz API Mapping:**
    *   *Endpoint:* `POST {digiflazz_url}/transaction`
    *   *Request Key Conversion:* `buyer_sku_code` $\rightarrow$ `skuCode`, `customer_no` $\rightarrow$ `targetId`, `ref_id` $\rightarrow$ `internalOrderId`.
    *   *Fulfillment Sign Hash Code:* `MD5(username + apiKey + ref_id)`
    *   *Fulfillment State Mapping:* `rc === "00"` $\rightarrow$ `SUCCESS`; `rc === "03"` $\rightarrow$ `PENDING`; fallback $\rightarrow$ `FAILED`.
*   **VIP Reseller API Mapping:**
    *   *Endpoint:* `POST {vip_url}/order`
    *   *Request Key Conversion:* `service` $\rightarrow$ `skuCode`, `target` $\rightarrow$ `targetId`, `api_id` $\rightarrow$ `internalOrderId`.
    *   *Fulfillment Sign Hash Code:* `MD5(api_id + api_key + "sign")`
    *   *Fulfillment State Mapping:* `status === "success"` $\rightarrow$ `SUCCESS`; `status === "processing"` $\rightarrow$ `PENDING`; `status === "error"` $\rightarrow$ `FAILED`.

#### Health Monitoring, Latency Checks, Failover, & Queue Systems
1. **API Latency Logs:** The orchestrator utilizes non-blocking async execution timers to record the duration of each HTTP REST request to supplier endpoints. These latencies are calculated as a rolling average over the last 10 requests.
2. **Failover Execution Algorithm:**
   * If a product order fails or the primary supplier's rolling response latency exceeds **5000ms**, the engine searches for alternative active suppliers mapped to the identical Unified SKU.
   * If found, the engine automatically pivots the transaction to the secondary supplier routing route (Smart Least-Cost Routing rule).
3. **Retry Queue Controls:**
   * Failures classified as transient (e.g., `HTTP 429 Too Many Requests`, `HTTP 503 Service Unavailable`, or connection timeouts) are placed in an automated delayed-retry queue.
   * Retry schedule follows exponential backoff: $Interval = Base \times 2^{Attempt}$. Base interval = **2000ms**. Max attempts = **3**.
   * If any order is ultimately unfulfilled after max retries, the transaction triggers an atomic refund sequence inside the ledger.

---

### 5. DYNAMIC PRICING & MARKUP ENGINE
To guarantee margin accuracy across vast quantities of SKUs, NexusCore employs a high-performance hierarchical calculation formula.

#### Pricing formula
$$\text{Final Price} = \text{Supplier Base Price} \times \left(1 + \frac{\text{Agency Margin \%}}{100}\right) \times \left(1 - \frac{\text{Reseller Tier Discount \%}}{100}\right) + \text{SaaS Platform Processing Fee} + \text{Gateway Fixed Fee}$$

##### Specific Dynamic Calculation Example:
*   **Supplier Base Cost (Mobile Legends 86 Diamonds):** IDR 16,500
*   **Agency Base Markup Margin:** 15% (Base Retail Price increases to IDR 18,975)
*   **Reseller Membership Ranks (Downstream Pricing Profiles):**
    *   `REGULAR`: 0% discount adjustment (Final price: IDR 18,975)
    *   `SILVER`: 1.5% discount adjustment (Final Price: IDR 18,690)
    *   `GOLD`: 3.0% discount adjustment (Final Price: IDR 18,405)
    *   `PLATINUM`: 4.5% discount adjustment (Final Price: IDR 18,121)
*   **Fixed Operational Fee:** IDR 250 (Added instantly for security clearing logs)

#### Bulk Update Capabilities & Event Clearing Logs
*   **Bulk Margin Adjustments:** Agency admins can adjust pricing configurations globally or target individual categories (e.g., "All Steam Wallet Codes", "Mobile Legends"). Filters allow applying adjustments as relative percentage changes (e.g., increase ML category by 2.2%) or flat IDR overrides.
*   **Cache Clear & Redis Hot Invalidation:** Dynamic pricing policies are cached in Redis to maintain low query rates. Updates fire a structured cache-bust broadcast message: `CACHE_INVALIDATION::AGENCY_PRICING::{agencyId}`. This forces regional edge endpoints to query the updated database tables on the next checkout transaction.

---

### 6. VIRTUAL CREDIT WALLET & DOUBLE-ENTRY LEDGER SYSTEM
To ensure auditing integrity worthy of venture investors, NexusCore avoids standard local state manipulation and utilizes a strict double-entry ledger sequence.

```
       +-------------------------------------------------------------+
       |                  LEDGER TRANSACTION ENTRY                   |
       |  Must register complementary Debit (-) and Credit (+) logs  |
       +-------------------------------------------------------------+
                                      |
         +----------------------------+----------------------------+
         v                                                         v
  +--------------+                                          +--------------+
  |  DEBIT (-)   |                                          |  CREDIT (+)  |
  |  Sender      |                                          |  Receiver    |
  |  Account     |                                          |  Account     |
  +--------------+                                          +--------------+
```

#### Database Architecture & Ledger Entry Verification
Transactions require structured journal records. An agency, reseller, or client's central balance is simply the sum total of all their immutable, verified ledger records.

##### DB Schema Core Ledger Model:
```typescript
interface LedgerTransaction {
  id: string;
  timestamp: Date;
  tenantId: string;
  sourceUserId: string; // Account debited
  destinationUserId: string; // Account credited
  amount: number;
  transactionType: 'PURCHASE' | 'DEPOSIT_CREDIT' | 'FEE_DEDUCTION' | 'REFUND_INJECTION' | 'BAL_RECONCILIATION';
  status: 'PENDING' | 'RECONCILED' | 'FAILED_REVERTED';
  reconciliationToken: string; // Cryptographic validation check
}
```

#### Escrow Security Lifecycle states
For safety, checkout balance movements use a **Four-Stage Verification Flow**:

```
+--------------+        +--------------+        +------------------+        +---------------+
| 1. RECORDED  | -----> |  2. FROZEN   | -----> | 3. DISPATCH_CONF | -----> | 4. RECONCILED |
| Order created|        | Balance held |        | Supplier success |        | Final settlement
+--------------+        +--------------+        +------------------+        +---------------+
                               |
                               v
                       +----------------+
                       | FAILED_REVERT  |
                       | Balance refund |
                       +----------------+
```

1.  **Fund Preservation (FROZEN state):** The customer or partner initiates checkout. Balance checks confirm funds are active. The calculated cost amount is immediately placed in a `FROZEN` ledger state to prevent concurrent double-spending.
2.  **Order Pipeline Trigger:** The system dispatches the order to the supplier.
3.  **Completion Settlement (RECONCILED):** The supplier reports system success. The frozen balance ledger state is cleared, and an equivalent amount is officially recorded as debited from the customer's active wallet.
4.  **Instant Rollback & Reversion:** In the event of supplier failure or timeout, the engine deletes the `FROZEN` reserve log and restores the balance to the active wallet, adding a `REVERSAL_ROLLBACK` record to the audit logs.

#### Verification Mechanics & Security Lockouts
*   **Balance Override Interceptors:** Core transaction functions include database-level transaction isolation (`SERIALIZABLE` isolation or `SELECT FOR UPDATE` locks on user wallets).
*   **Velocity Rate Limits:** Any user account firing more than 5 distinct fulfillment requests per 10 seconds is locked from ledger updates for 5 minutes, mitigating automated balance drain attacks.
*   **Threshold Alerts:** Agencies receive automatic notifications when their system clearing balances fall to 15% of daily typical transaction levels.

---

### 7. TRANSACTION & FULFILLMENT LIFECYCLE ORCHESTRATION
NexusCore ensures order processing flows smoothly through strict states.

```
       +-----------------------------------------------------+
       |                  1. PAYMENT_RECEIVE                 |
       |  Order entry logged, funds lock inside escrow DB    |
       +-----------------------------------------------------+
                                  |
                                  v
       +-----------------------------------------------------+
       |                   2. BALANCE_HOLD                   |
       |  Checks reseller tier cost validations & balance    |
       +-----------------------------------------------------+
                                  |
                                  v
       +-----------------------------------------------------+
       |                   3. SUPPLIER_API                   |
       |  Dispatches payload to primary supplier adapter    |
       +-----------------------------------------------------+
                                  |
         +------------------------+------------------------+
         v                                                 v
+-------------------------------+                 +--------------------------------+
|  4A. DELIVERY_SUCCESS         |                 |  4B. SUPPLIER_FAILURE / ERR    |
|  Reconciles balance in ledger |                 |  Trigger auto-retry or rollback |
|  Sends fulfillment receipt    |                 |  balance release               |
+-------------------------------+                 +--------------------------------+
```

1.  **ORDER_SUBMITTED:** Input validators verify target ID format, matching SKU, and appropriate payment balance status.
2.  **CREDIT_ESCROW_LOCK:** The dynamic pricing markup calculates the final fee. Funds are checked and locked inside the user's ledger reserve.
3.  **DISPATCH_PENDING_SUPPLIER:** The core router selects the optimal active supplier connector route.
4.  **ORDER_RECONCILED / DELIVERED:** Transaction completes. The billing system applies transaction fee tracking logs, updates analytics metrics dashboards, and stores verified serial numbers (if provided).
5.  **FAILED_REVERSED:** If a transaction is aborted, funds are fully restored. Reversals log transaction histories, update the active retry-queues, and store exact reason payloads within the main dashboard database for easy administrative troubleshooting.

---

### 8. WHITE-LABEL & BRANDING SYSTEM SPECIFICATION

#### Infrastructure Setup & Domain Routing
1.  **Subdomain Provisioning:** Tenant setup automatically creates DNS entries (e.g., `agencyname.nexuscore.com`) in our wildcard router server.
2.  **Custom Domain Mapping Engine:**
    *   Agencies can configure a custom root domain or subdomain (e.g., `store.brandingname.io`).
    *   The platform provides instructions to point a CNAME DNS record to NexusCore's central proxy route: `domains.nexuscore.io`.
    *   Our dynamic reverse proxy container intercepts requests, monitors mapping tables, and executes **Let's Encrypt SSL Cert Handshakes on-the-fly** to secure HTTPS.
3.  **Host Middleware Resolution:** All visual layout configurations, catalog pricing rules, transaction gateways, and footer terms are routed dynamically using database config payloads keyed to the inbound domain: `SELECT * FROM tenant_brandings WHERE host_domain = $1;`.

#### Branding Assets Customization Panel
Agencies customize their platforms through a visual settings dashboard:

*   **Logo Upload Support:** Supports WebP, SVG, and high-fidelity PNG formats. Asset stores are mapped to secure private cloud storage CDN buckets.
*   **Dynamic Theme Variables Engine:**
    *   Admins use color wheels to customize Primary colors, Secondary accents, and background gradients. These parameters are injected in real-time as Tailwind theme variables.
    *   Pre-styled premium corporate slate themes, high-contrast layouts are available, keeping aesthetics clean and investor-grade.
*   **Identity Mapping Assets:** Injects dynamic headers, metadata SEO descriptions, terms of service, custom customer help channels, and localized custom currency parameters.

#### Brand Setting Delegation Rights
*   **Whitelabel Customization Restriction levels:**
    *   **Level 0 (No Customization):** Downstream reseller storefronts display the main Agency's theme, logo, terms of service, and company descriptions exactly.
    *   **Level 1 (Basic Delegation):** Resellers can display their personal logo and set a localized accent layout color, but central core checkout headers, support desk tickets, and payment processors remain styled to the master Agency domain.
    *   **Level 2 (Complete sub-whitelabel):** Resellers can configure an entirely distinct subdomain for downstream consumers, setting dedicated visual assets, payment gateways, and direct branding.

---

### 9. BILLING, SUBSCRIPTION & SAAS INVOICING INFRASTRUCTURE

#### SaaS Business Tiers & Features Matrix
NexusCore monetizes its platform with clear subscription pricing tiers combined with transactional processing fees:

| Subscription Tier | Monthly Charge | Max Resellers | Platform Volume Fee | Advanced Features Included |
| :--- | :---: | :---: | :---: | :--- |
| **Starter** | IDR 450,000 | 25 Partners | 0.5% | Shared Subdomain, Single Supplier route |
| **Pro** | IDR 1,500,000 | 250 Partners | 0.3% | Custom Domain Mapping, SSL, Fallback routing |
| **Enterprise** | IDR 6,000,000 | Unlimited | 0.1% | Custom Webhooks, Direct DB access, SLA support |

#### Monetization Strategy & Comprehensive Revenue Streams
As a digital monetization infrastructure, NexusCore employs a diversified, highly defensive multi-tiered monetizing engine:

1. **Tiered Monthly Software-as-a-Service (SaaS) Subscriptions:** Fixed monthly charges billed directly to Agency Admins based on operational quotas (Reseller headcount, active SKU counts, custom domains, failover configuration parameters).
2. **Platform Volume Fees (The "Take Rate" or Transaction Taxation):** Under pro and starter tiers, a dynamic processing tax is calculated per successful API checkout fulfillment loop. Billed automatically against the Agency balance or credit profiles during regional ledger settlement sweeps.
3. **Whitelabel Domain Handshake Addons:** Dedicated premium setup for custom SSL root domains and managed routing infrastructure. Billed as a flat annual infrastructure fee.
4. **Direct Supplier Adapter Brokerage Commissions:** Flat rate markup commissions agreed during contract negotiations with external suppliers directly integrated into our central routing hub.

#### Metered Usage Tracking & invoicing
1.  **Transaction Platform Tax Calculations:** For every order, the system calculates and logs the platform volume fee based on the active subscription tier. These fees are aggregated and billed to the Agency Admin's master account.
2.  **Billing Dashboard:** Admins can view up-to-date monthly recurring revenue calculations, metered usage breakdowns, pending invoices, and payment histories.
3.  **Automated Invoices:** On the 1st of every month, the platform aggregates the static subscription fee and metered platform fees into a formal, downloadable PDF invoice.
4.  **Automatic Deductions:** Invoices are billed against the Agency Admin's central wallet account or charged to their registered payment profile. Failed billing flows trigger a 7-day grace period, followed by dynamic visual warning banners, and potential temporary API access limitations.

---

### 10. ARCHITECTURAL SECURITY SYSTEM & COMPLIANCE SHIELD

NexusCore establishes a multi-tiered security defense covering infrastructure, APIs, database tables, and external compliance boundaries:

```
               +--------------------------------------------+
               |        TLS 1.3 / ENCRYPTED IN TRANSIT      |
               +--------------------------------------------+
                                      |
               +--------------------------------------------+
               |      WAF / OWASP SHIELD / VELOCITY ALERTS  |
               +--------------------------------------------+
                                      |
               +--------------------------------------------+
               |   RBAC ROLE SCAPE / JWT CLAIMS VALIDATORS  |
               +--------------------------------------------+
                                      |
               +--------------------------------------------+
               |    AES-256-GCM ENVELOPED AT-REST SECRETS   |
               +--------------------------------------------+
```

#### Multi-Tiered Data Encryption Model
1. **Encryption in Transit:** All network communication routes strictly enforce HTTPS via TLS 1.3 protocol suites. Standard TLS 1.2 is negotiated only for legacy supplier webhook compatibility interfaces under audited security keys. HSTS (HTTP Strict Transport Security) headers are systematically injected on public entryways.
2. **Encryption at Rest:** 
   * **Transactional Database Matrices:** Relational database services utilize AWS KMS / GCP KMS managed keys to enable complete underlying storage encryption via AES-256 algorithms.
   * **Outbound Secret Credentials Enveloping:** Third-party API private keys, MD5/SHA256 signature hashes, and partner webhook tokens are encrypted at application-level utilizing unique keys managed via envelope security methodologies.

#### Authentication & Authorization Architecture (Hierarchical RBAC)
1. **Stateless Identity Core:** Authentication relies on modern, cryptographically signed JSON Web Tokens (JWT) using the asymmetric RS256 algorithm. Private keys reside in secure hardware modules (HSM) during platform runtime.
2. **Secure Token Storage:** Browser clients store authentication tokens strictly within `HttpOnly`, `SameSite=Strict`, `Secure` web cookies, eliminating potential XSS token extraction vectors.
3. **Multi-Factor Shielding (MFA):** Agency Administrations and high-volume Resellers must authenticate using MFA configurations (TOTP / WebAuthn standard mechanisms) prior to manual ledger adjustments.
4. **Hierarchical Scope Routing:** Every API invocation translates JWT properties into isolated backend filters:
   * **Claims Profile Payload:** Each JWT carries structural keys expressing tenant boundaries (`tenant_id`), user designations (`role`), and operational execution scopes (`read:catalog`, `write:wallet`).
   * **RLS (Row-Level Security) Bindings:** Postgres database sessions dynamically evaluate user scoping variables. Unauthenticated cross-tenant data requests trigger instantaneous system lockouts.

#### OWASP Top 10 Mitigation Matrix
*   **A01: Broken Access Control:** Addressed by mapping explicit role guards across Express api frameworks and PostgreSQL RLS constraints.
*   **A03: Injection (SQL / NoSQL / Command):** All database engines leverage parameterized queries and strict Prisma compiler models. No raw string concats are tolerated.
*   **A05: Security Misconfiguration:** Dynamic Content Security Policies (CSP) are declared via central Helm variables. Unused server routes are structurally disabled.
*   **A08: Software and Data Integrity Failures:** API routing bodies enforce structural schema definitions mapped via robust schema validation libraries (e.g. Zod runtime validators).

#### Compliance Framework Directives
1. **GDPR (General Data Protection Regulation):**
   * **Right-To-Be-Forgotten Operations:** Deleting a user initiates a deep anonymization pipeline. Personal Identifiable Information (PII) elements (e.g., email hashes, customer cell credentials) are structurally scrambled in immutable transaction logs using single-hash SHA-256 mappings while ledger amounts remain intact to maintain system balance integrity.
   * **Portable Context exports:** Core accounts provide clean, encrypted JSON downloads carrying their profile states on-demand.
2. **PCI-DSS Compliance Isolation:** NexusCore routes credit card, vaulting, and automatic collection processing loops using Stripe and payment gateway elements. The core database avoids holding PAN numbers or raw CCV cards, keeping the system fully under Out-Of-Scope auditing protocols.

---

### 11. PLATFORM RESTFUL API ARCHITECTURE SPECIFICATION

NexusCore promotes platform integrations via highly reliable RESTful programmatic structures, mapping clean schemas across all multi-tenant boundaries.

#### Fundamental API Design Principles
1. **Semantic Versioning:** Version controls are strict and absolute, declared directly in standard request path sequences (`/api/v1/*`).
2. **Request / Response payload specifications:** Every outbound/inbound transmission strictly uses UTF-8 formatted JSON payloads.
3. **Consolidated Error Response structures:** Every error response maps to standardized formats with numeric validation error payloads:
```json
{
  "status": 400,
  "code": "INSUFFICIENT_BALANCE",
  "message": "The transaction cost exceeds current frozen wallet reserve thresholds.",
  "timestamp": "2026-05-20T11:22:33Z"
}
```

#### Core Operational Endpoints & Schema Protocols

##### 1. Supplier Integration Services
Manage dynamic catalog retrieval and coordinate webhook state updates.

*   **Catalog Sync Pipeline:**
    *   *Route:* `GET /api/v1/supplier/skus`
    *   *Authorization:* `X-Nexus-Supplier-Key` / System Bearer Signature.
    *   *Response Format:*
    ```json
    {
      "supplier_code": "DIGIFLAZZ",
      "skus": [
        { "sku_code": "ML-86-DM", "name": "Mobile Legends 86 Diamonds", "base_cost": 16500, "status": "ACTIVE" }
      ]
    }
    ```
*   **Fulfillment Webhook Receiver:**
    *   *Route:* `POST /api/v1/supplier/webhooks/fulfill`
    *   *Authorization:* Dynamic MD5 / SHA-256 validation (Inbound payload matching signature hashes).

##### 2. Agency Administration Operations
Allow Agency owners to adjust Whitelabel routing details, billing options, and downstream partner parameters.

*   **Whitelabel UI Tuning:**
    *   *Route:* `POST /api/v1/agency/branding`
    *   *Authorization:* Admin JWT Access Cookie.
    *   *Payload:* `{ "logo_url": "https://...", "theme": { "primary_color": "#1f2937", "secondary_color": "#3b82f6" } }`
*   **Reseller Assignations & Rates Management:**
    *   *Route:* `PUT /api/v1/agency/resellers/:id/tier`
    *   *Payload:* `{ "tier_rank": "GOLD", "allocated_credit_max": 5000000 }`

##### 3. Downstream Partner/Reseller Workflows
Allow Resellers to query balances, place downstream sub-markup percentages, and verify billing states.

*   **Sub-Markup Customization:**
    *   *Route:* `POST /api/v1/reseller/pricing/markup`
    *   *Payload:* `{ "category": "MOBILE_LEGENDS", "added_margin_percentage": 2.5 }`
*   **Balance Inquiries & Credits:**
    *   *Route:* `GET /api/v1/reseller/wallet/balance`

##### 4. Customer-Facing Checkout Gateways
Power public, lightning-fast store checkout routes with automated player character lookup.

*   **Verification Lookup:**
    *   *Route:* `POST /api/v1/storefront/player/validate`
    *   *Payload:* `{ "sku_code": "ML-86-DM", "target_player_id": "12345678", "target_zone_id": "1234" }`
*   **Fulfillment Checkout Trigger:**
    *   *Route:* `POST /api/v1/storefront/checkout`
    *   *Payload:* `{ "sku_code": "ML-86-DM", "target_id": "12345678", "zone_id": "1412", "payment_channel": "WALLET_BALANCE" }`

---

### 12. MVP SETUP & SYSTEM PREPARATION LIST
To ensure the platform runs smoothly, verify the following configuration tasks:

*   [x] Establish basic tenant host models to route layouts based on incoming subdomain configs.
*   [x] Verify core wallet functions handle concurrent calls safely using isolated DB locks.
*   [x] Audit all visual interfaces to ensure high-contrast corporate styles are applied.
*   [x] Verify all API integrations maps response codes to unified internal states cleanly.
*   [x] Deploy secure firebase and local database structures to secure user balances.
