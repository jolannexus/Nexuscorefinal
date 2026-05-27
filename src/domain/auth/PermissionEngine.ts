import { Role } from '../../types';
import { Permission, RolePermissions } from './PermissionTypes';

const ROLE_PERMISSIONS: RolePermissions = {
  SUPER_ADMIN: ['wallet.read', 'wallet.write', 'ledger.audit', 'payout.approve', 'refund.execute', 'reseller.create', 'supplier.manage', 'tenant.settings.update'],
  PLATFORM_ADMIN: ['wallet.read', 'ledger.audit', 'payout.approve', 'supplier.manage'],
  AGENCY: ['wallet.read', 'reseller.create'],
  AGENCY_ADMIN: ['wallet.read', 'wallet.write', 'reseller.create', 'supplier.manage', 'tenant.settings.update'],
  RESELLER: ['wallet.read'],
  RESELLER_MANAGER: ['wallet.read', 'wallet.write'],
  CUSTOMER: ['wallet.read'],
};

export class PermissionEngine {
  static hasPermission(role: Role, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  static getPermissionsForRole(role: Role): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }
}
