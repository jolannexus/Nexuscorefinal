# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Project: NexusCore White Label Coin Reseller System
**Document Reference:** PRD-NEXUSCORE-2026-V2.0
**Status:** Approved / CTO & Architect Review
**Date:** May 27, 2026

---

### 1. Product Vision
NexusCore is a globally competitive, enterprise-grade B2B digital monetization infrastructure designed to power global recharge ecosystems, creator-economy marketplaces, gaming top-up structures, and multi-tenant reseller networks. It acts as the definitive platform for digital vouchers, in-game tokens, and software licenses, removing the friction of supplier orchestration, multi-tiered margin routing, currency and balance clearing, and white-labeled storefront layouts. The platform empowers agencies to launch their own white-label digital product storefronts in minutes, connecting directly to multiple game credit suppliers while building a downstream network of autonomous resellers.

---

### 2. User Roles
The platform operates on a strict, hierarchical structure with 4 primary personas:
1. **Supplier (Vendor/Provider):** External fulfillment networks (e.g., Digiflazz, VIP Reseller) that expose APIs to supply digital goods and process top-up requests in real time.
2. **Agency Admin (Tenant Owner):** The enterprise operator who owns the white-label instance. They manage the primary storefront domain, setup supplier API routing, customize branding, set global pricing markups, and recruit downstream resellers.
3. **Reseller (B2B Partner):** A business partner operating under an Agency. Resellers manage their own client networks, utilize custom sub-markups, manage prepaid wallet balances, and operate personalized sub-storefronts.
4. **End-Customer (Retail Consumer):** The final retail consumer executing purchases on an Agency or Reseller storefront via instant checkouts (QRIS, VA, E-Wallet).

---

### 3. Core Features
The system is built around several robust feature pillars designed for massive scale:
*   **Agency Website Creation:** Instant provisioning of fully functional, beautifully designed digital storefronts for agencies with CMS controls for banners and announcements.
*   **White-Labeling & Custom Domains:** Enterprise white-labeling allowing agencies and sub-resellers to map custom CNAME domains and inject individualized SSL certificates dynamically. 
*   **Multi-Supplier API Integration:** A smart-routing bridge that connects to multiple backend vendors simultaneously, normalizing diverse supplier APIs into a single internal catalog with latency monitoring.
*   **Dynamic Pricing & Markup Control:** Rule-based computation engine allowing distinct margin markups layered at the Agency level and Reseller level across specific game categories or global catalogs.
*   **Reseller Management & Multi-Level Support:** Administration dashboards to onboard, tier, and manage infinite hierarchies of resellers, each with distinct commission rates and credit limits.
*   **Virtual Wallet System:** A hyper-secure, double-entry ledger prepaid wallet allowing seamless B2B credit distributions, frozen escrows during pending checkouts, and instant balance top-ups.
*   **Transaction System & Automated Orchestration:** Real-time lifecycle processing pipeline for checkout handling, fraud prevention, payment gateway callbacks, and automated reconciliations.

---

### 4. Technical Architecture
The system uses an isolated multi-tenant architecture designed to maintain high performance and perfect data security boundaries.
*   **Host-Header Domain Resolution:** Dynamic hostname parsing at the middleware layer to resolve request tenant state in milliseconds.
*   **Service-Oriented Modules:** An Express/Node.js backend operating distinct domain modules (Fulfillment, Billing, Webhooks) layered gracefully over a monolithic database for transactional integrity.
*   **React + Tailwind Frontend:** The presentation layer utilizes Vite-powered React apps enforcing strict, responsive Tailwind UI principles for an investor-grade aesthetic.
*   **Data Isolation Strategy:** A single-database schema enforces strict Multi-Tenancy utilizing keys (`tenant_id`) enforced by software-level request filters and Postgres RLS to prevent tenant data leakage.

---

### 5. Database Schema
Core entities define the highly relational ecosystem, optimized for high read throughput and strict ACID settlement bounds.
*   **Tenants (Agencies) & Brandings:** Tracks custom domains, visual theme configurations, and API gateway keys.
*   **Users & Reseller Tiers:** Standardized authentication accounts encompassing hierarchical IDs linking Sub-Resellers to master Agencies, alongside their discount tiers.
*   **Unified Product Catalog:** Normalized records mapping internal NexusCore SKUs to multiple downstream supplier specific codes and base costs.
*   **Ledger & Wallets:** Strict Double-Entry tables structure storing `DEBIT`, `CREDIT`, `FROZEN`, and `RECONCILED` states with cryptographic reconciliation tokens.
*   **Transactions & Orders:** Lifecycle logs of incoming end-consumer purchase intents linked tightly to automated fulfillment responses.

---

### 6. API Architecture
Our RESTful programmatic structure provides standard and resilient external communication channels.
*   **Supplier API Contracts:** A unified strategy expects normalized payloads defining SKU code, target account IDs, and required credentials. Supplier adapters translate generic requests into specific vendor JSON/XML-RPC payloads.
*   **Endpoints:**
    *   `/api/v1/catalog`: Retrieve normalized product catalogs.
    *   `/api/v1/orders/place`: Standardized fulfillment requests.
    *   `/api/v1/webhooks/fulfillment`: Secure callback receivers from suppliers detailing success/failure states.
*   **API Versioning:** Enforced continuously through path prefixes (`/v1/`, `/v2/`).
*   **Authentication & Webhooks:** Supplier calls are signed using MD5/SHA-256 signatures ensuring payload immutability. Inter-tenant REST calls require RS256 JWT tokens.
*   **Rate Limiting & Error Management:** Global HTTP 429 logic blocks high-velocity attempts. Expected transient errors (503s) enter automated retry queues with exponential backoffs (base: 2s).

---

### 7. White Label System
*   **Dynamic Theme Resolution:** Database variables inject Tailwind CSS custom parameters (primary/secondary hex colors) into the React app immediately based on the HTTP Host origin.
*   **Delegation Scope:** Admins retain primary design control while allowing premium top-tier Resellers to sub-brand via basic logo modifications and localized naming structures.
*   **SSL Orchestration:** Nginx-layer SNI configuration automatically completes ACME (Let's Encrypt) challenges for agency domains seamlessly.

---

### 8. Pricing Engine
The engine guarantees margin safety by interpreting hierarchical arithmetic before ledger lock.
*   **Formula:** `Final Price = Supplier Base Cost * (1 + Agency %) * (1 - Reseller Discount %) + Fixed Fees`
*   **Redis Hot Invalidation:** Changes to base margin parameters force structured cache-bust broadcasts guaranteeing real-time global price propagation.

---

### 9. Security
Defensive matrix shielding transactional endpoints against advanced threat vectors.
*   **RBAC & Scopes:** Strict authentication claims dictate module access bounds ensuring resellers cannot query lateral reseller network states.
*   **Ledger Mutex & Locks:** High-velocity purchasing requests implement `SERIALIZABLE` isolation row-locks preventing double-spending anomalies.
*   **Data Encryption:** Sensitive supplier API tokens and payment gateway keys are enveloped using AES-256-GCM methodologies.
*   **OWASP Compliance:** Implementation features comprehensive defense mechanisms against injections, insecure direct object references, and broken authentication via JWT configurations.

---

### 10. Scaling Strategy
Preparing for global B2B volume growth:
*   **Stateless Node Services:** Express application runs perfectly stateless, enabling horizontal scaling via container orchestration.
*   **Caching Layers:** Redis accelerates catalog retrieval and unified pricing models.
*   **Read-Replicas:** Future Postgres scaling splits high-read storefront traffic against primary write nodes (ledger handling).
*   **Async Job Queues:** Fulfillment tasks utilizing asynchronous worker frameworks prevent single hanging supplier endpoints from blocking the application loop.

---

### 11. MVP Roadmap
A phased deployment ensuring reliable core stability before scaling width.
*   **Phase 1 - Core Top-up Flow (Weeks 1-4):** Base tenancy, 1 primary supplier adapter (Digiflazz), manual wallet credit allocations, and end-customer storefront components.
*   **Phase 2 - Reseller Tiers & Markups (Weeks 5-8):** Custom margin logic, pricing categorizations, dynamic whitelabel host parsing, basic reseller dashboards.
*   **Phase 3 - Multi-Routing & Orchestration (Weeks 9-12):** Adding secondary suppliers (VIP Reseller), implementing failover algorithms, real-time SSE error notifications for Admins, automated payment gateway top-ups using Xendit/Midtrans.

---

### 12. UI/UX Concept
The platform interface mandates a highly professional, investor-grade interaction aesthetic.
*   **No "Tech-Larping":** Adheres strictly to functional labels; no artificial metrics consoles or superfluous server readouts.
*   **High-Contrast Clarity:** Heavy reliance on modern slate dark modes with precise, generous margin paddings and distinct structural cards mimicking enterprise financial dashboards.
*   **Instant Interaction Guidelines:** Use of skeleton loaders and minimal micro-animations (`motion` layout components) to communicate process status instantly.

---

### 13. Monetization Strategy
NexusCore employs a deeply integrated defensive revenue model.
*   **SaaS Subscriptions:** Tiered monthly licensing fees billed to Agencies reflecting max feature availability and Reseller quotas.
*   **Volume Royalties:** Incremental percentage-based processing taxes collected upon every successful transaction dispatch handled dynamically in the clearing ledger.
*   **Domain & Custom Addons:** Specialized high-commission premiums for dedicated SSL provisioning and enterprise support channels.

---

### 14. Future Expansion
*   **Automated Dispute Handlers:** AI-powered conversational bots addressing fulfillment anomalies or pending refund evaluations.
*   **Internationalization (i18n):** Adding multicurrency ledgers allowing cross-border agency expansion bridging diverse local suppliers.
*   **Predictive Routing:** Machine learning matrices mapping supplier latencies geographically to further optimize automatic dispatch selection based on seasonal internet bottlenecks.
