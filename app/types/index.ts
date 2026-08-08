// User & Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'viewer';
  githubId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: User;
  expires: string;
  accessToken?: string;
}

// ZDHC Chemical Types
export interface ChemicalProduct {
  id: string;
  productName: string;
  productCode: string;
  manufacturer: string;
  manufacturerId?: string;
  zdhcCertified: boolean;
  zdhcLevel?: 'ZDHC Gateway' | 'ZDHC Approved' | 'ZDHC Audited';
  zdhcCertificateUrl?: string;
  zdhcCertificateExpiry?: Date;
  chemicalComposition: ChemicalComponent[];
  hazardousSubstances: HazardousSubstance[];
  certificateNumber?: string;
  certifyingBody?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
}

export interface ChemicalComponent {
  componentName: string;
  casNumber: string;
  percentage: number;
  hazardClassification?: string;
  environmentalImpact?: string;
}

export interface HazardousSubstance {
  substanceName: string;
  casNumber: string;
  zdhcRestricted: boolean;
  restrictionLevel?: 'Banned' | 'Limited' | 'Restricted';
  notes?: string;
}

// ZDHC Compliance Status
export interface ComplianceStatus {
  productId: string;
  complianceLevel: 'Full' | 'Partial' | 'NonCompliant';
  issues: ComplianceIssue[];
  lastChecked: Date;
  validUntil: Date;
}

export interface ComplianceIssue {
  issueId: string;
  issueType: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  resolution?: string;
}

// Inventory & Usage
export interface ChemicalInventory {
  id: string;
  productId: string;
  warehouseLocation: string;
  quantity: number;
  unit: 'kg' | 'liter' | 'ton' | 'other';
  batchNumber?: string;
  expiryDate?: Date;
  lastUpdated: Date;
  lastUpdatedBy: string;
}

export interface ChemicalUsage {
  id: string;
  productId: string;
  usageDate: Date;
  quantity: number;
  unit: string;
  department: string;
  application: string;
  notes?: string;
  recordedBy: string;
}

// Audit & Documentation
export interface AuditLog {
  id: string;
  entityType: 'product' | 'inventory' | 'usage' | 'compliance';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'view';
  userId: string;
  changes?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
}

export interface ZDHCReport {
  reportId: string;
  reportPeriod: {
    startDate: Date;
    endDate: Date;
  };
  totalProducts: number;
  certifiedProducts: number;
  compliancePercentage: number;
  issues: ComplianceIssue[];
  generatedBy: string;
  generatedAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
