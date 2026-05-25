# NexusCore Enterprise Architecture Notes

## 1. Double Spending Protection (Ledger Integrity)
Untuk mencegah user melakukan transaksi dua kali saat saldo pas-pasan (Race Condition), NexusCore menggunakan **Atomic Transactions** di level Database:

```sql
BEGIN;
  -- 1. Lock user row precisely
  SELECT balance FROM user_wallets WHERE user_id = 'X' FOR UPDATE;
  
  -- 2. Check if balance is sufficient
  -- 3. Deduct balance
  UPDATE user_wallets SET balance = balance - 15000 WHERE user_id = 'X';
  
  -- 4. Create Audit Log
  INSERT INTO transactions (...) VALUES (...);
COMMIT;
```

## 2. Multi-Tenant Caching (Redis)
Setiap Agency (Tenant) memiliki konfigurasi branding yang berbeda. Kita meletakkan data ini di Redis dengan TTL agar tidak membebani PostgreSQL di setiap request:
- Key: `tenant_config:{subdomain}`
- Cache Hit: 0.8ms latency.

## 3. Webhook Security
Semua update status dari Supplier diverifikasi menggunakan **HMAC-SHA256 signature** untuk memastikan data benar-benar datang dari server Supplier, bukan attacker.
