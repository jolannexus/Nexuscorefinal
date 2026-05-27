export type Permission = 
  | 'wallet.read'
  | 'wallet.write'
  | 'ledger.audit'
  | 'payout.approve'
  | 'refund.execute'
  | 'reseller.create'
  | 'supplier.manage'
  | 'tenant.settings.update';

export type RolePermissions = Record<string, Permission[]>;
