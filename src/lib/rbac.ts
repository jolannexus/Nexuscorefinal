export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  SUPPORT = 'SUPPORT',
  USER = 'USER'
}

export enum Permission {
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_TRANSACTIONS = 'MANAGE_TRANSACTIONS',
  REFUND_TRANSACTION = 'REFUND_TRANSACTION',
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
}

const RolePermissions: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: [
    Permission.VIEW_DASHBOARD, Permission.MANAGE_USERS, Permission.MANAGE_TRANSACTIONS,
    Permission.REFUND_TRANSACTION, Permission.VIEW_AUDIT_LOGS, Permission.MANAGE_SETTINGS
  ],
  [Role.TENANT_ADMIN]: [
    Permission.VIEW_DASHBOARD, Permission.MANAGE_USERS, Permission.MANAGE_TRANSACTIONS,
    Permission.REFUND_TRANSACTION, Permission.VIEW_AUDIT_LOGS, Permission.MANAGE_SETTINGS
  ],
  [Role.SUPPORT]: [
    Permission.VIEW_DASHBOARD, Permission.MANAGE_TRANSACTIONS, Permission.VIEW_AUDIT_LOGS
  ],
  [Role.USER]: [
    Permission.VIEW_DASHBOARD // limited to their own resources
  ]
};

export class RBAC {
  static hasPermission(role: string, permission: Permission): boolean {
    const permissions = RolePermissions[role as Role];
    if (!permissions) return false;
    return permissions.includes(permission);
  }
}
