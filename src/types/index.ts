export type Role = 'SUPER_ADMIN' | 'PLATFORM_ADMIN' | 'AGENCY' | 'AGENCY_ADMIN' | 'AGENCY_SUPPLIER_ADMIN' | 'RESELLER' | 'RESELLER_MANAGER' | 'CUSTOMER';

export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
}

export interface Agency {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logoUrl?: string;
  theme: Theme;
  plan?: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  subscriptionStatus?: 'ACTIVE' | 'EXPIRED' | 'TRIAL';
  siteTitle?: string;
  primaryColor?: string;
}

export interface User {
  uid: string;
  email: string | null;
  role: Role;
  agencyId: string | null;
  displayName: string | null;
  createdAt: any;
}

export interface Permissions {
  canEditCatalog: boolean;
  canViewProfits: boolean;
  canManageDomains: boolean;
  canViewFraud: boolean;
  canUseTerminal: boolean;
  canManageSuppliers: boolean;
  canViewGrowth: boolean;
}

export interface ProductVariant {
  id: number;
  name: string;
  price: number;
  status: string;
}

export interface Product {
  id: string; 
  agencyId: string;
  supplierId: string;
  supplierName: string;
  appName: string; // platform e.g. Instagram, TikTok
  category: string; // service type e.g. Followers, Likes
  basePrice: number;
  status: 'ACTIVE' | 'DISABLED'; // Supplier side status
  productCode: string; // External ID from supplier
  thumbnail?: string;
  syncedAt: any;
  isEnabled: boolean; // Agency side control for resellers
  description?: string;
  min?: number;
  max?: number;
  rate?: number; // Internal unit rate
  name: string; // Display name
  sellingPrice?: number;
  marginType?: 'PERCENTAGE' | 'FIXED';
  marginValue?: number;
}

export interface Order {
  id: string;
  resellerId?: string;
  agencyId?: string;
  productId?: string;
  supplierId?: string;
  externalOrderId?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'ERROR' | 'SUCCESS' | 'FAILED';
  quantity?: number;
  totalCost?: number;
  targetAccount?: string;
  targetUrl?: string; // keeping for compat
  createdAt?: any;
  updatedAt?: any;
  sku?: string;
  price?: string | number;
  customerData?: string;
  profit?: number;
}

export interface Transaction {
  id: string;
  resellerId: string;
  walletId?: string;
  agencyId: string;
  type: 'DEBIT' | 'CREDIT' | 'TRANSFER' | 'FREEZE' | 'UNFREEZE' | 'CONFIRM_DEBIT' | 'PURCHASE' | 'DEPOSIT' | 'REFUND';
  amount: number;
  balanceBefore?: number;
  balanceAfter?: number;
  description: string;
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  paymentMethod?: string;
  orderId?: string;
  referenceId?: string;
  createdAt: any;
  updatedAt?: any;
  metadata?: Record<string, any>;
}

export interface SupplierConnection {
  id: string;
  agencyId: string;
  supplierName: string;
  apiKey: string;
  secretKey?: string;
  resellerId?: string;
  accessToken?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  lastSyncAt: any;
  createdAt: any;
  successRate?: number;
  avgResponseTime?: number;
}

export interface SupplierHealth {
  id: string;
  name: string;
  status: 'Healthy' | 'Stable' | 'Maintenance';
  latency: number;
  load: number;
}

export interface Wallet {
  id: string; // resellerId
  resellerId: string;
  agencyId: string;
  balance: number;
  frozenBalance: number;
  currency: string;
  updatedAt: any;
}

export interface Reseller {
  id: string;
  agencyId: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED';
  balance: number;
  pendingBalance: number;
  frozenBalance: number;
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    tagline?: string;
    storeName?: string;
  };
  createdAt: any;
  updatedAt?: any;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  targetRoles: Role[];
  createdAt: any;
  createdBy: string;
  expiresAt?: any;
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  content: string;
  createdAt: any;
}

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'REPLIED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: 'BILLING' | 'ORDER' | 'TECHNICAL' | 'GENERAL';
  lastMessageAt: any;
  createdAt: any;
  orderId?: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';
  value: number;
  minPurchase: number;
  maxDiscount?: number;
  expiryDate?: any;
  status: 'ACTIVE' | 'INACTIVE';
  usageLimit?: number;
  usageCount: number;
  createdAt: any;
}

// Types consolidated above
