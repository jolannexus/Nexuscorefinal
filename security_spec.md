# Security Specification - Vortex SaaS

## 1. Data Invariants

*   **Multi-Tenancy**: All resources (Wallets, Products, Orders, Transactions, Resellers, Settings, Domains) MUST belong to an `agencyId`.
*   **Isolation**: No user can read or write data belonging to another `agencyId` unless they are a `SUPER_ADMIN`.
*   **Role Hierarchy**:
    *   `SUPER_ADMIN`: Access to all agencies and global users.
    *   `AGENCY`: Access to all data within their assigned `agencyId`.
    *   `RESELLER`: Access to their own profile, wallet, orders, and transactions within their `agencyId`.
*   **Financial Integrity**: Wallets can only be updated via transactions (implemented via batch/atomicity if possible, or strict rules).
*   **Immutability**: `createdAt`, `ownerId`, `agencyId`, and `walletId` fields must not change after creation.

## 2. The Dirty Dozen (Vulnerability Payloads)

| # | Attack Type | Payload Description | Expected Result |
|---|-------------|---------------------|-----------------|
| 1 | Identity Spoofing | User A tries to create an Order with `resellerId` of User B. | DENIED |
| 2 | Tenant Escape | Agency Admin A tries to read `agencies/agencyB/settings/config`. | DENIED |
| 3 | Role Escalation | Reseller tries to update their own `role` to `AGENCY`. | DENIED |
| 4 | State Skip | Reseller tries to create an Order with status `COMPLETED`. | DENIED |
| 5 | Balance Injection | Reseller tries to update their `Wallet.balance` directly without a transaction. | DENIED |
| 6 | Resource Poisoning | Attacker tries to create a Product with a 1MB description string. | DENIED |
| 7 | Orphaned Write | User tries to create a Wallet for a non-existent `agencyId`. | DENIED |
| 8 | Shadow Field | User tries to add `isPremium: true` to a Product schema. | DENIED |
| 9 | Cross-Agency Transaction | Agency A tries to create a Transaction for a Wallet in Agency B. | DENIED |
| 10 | Unverified Access | User with `email_verified: false` tries to place an Order. | DENIED |
| 11 | ID Poisoning | User tries to use `../../global_config` as a `settingId`. | DENIED |
| 12 | Terminal Lock Break | User tries to update an Order that is already in `CANCELLED` status. | DENIED |

## 3. Test Runner (Draft)

(Tests would be implemented in `firestore.rules.test.ts` during development)
