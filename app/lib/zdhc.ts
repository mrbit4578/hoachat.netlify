import { ChemicalProduct, HazardousSubstance, ComplianceStatus, ComplianceIssue } from '@/app/types';

// ZDHC Gateway Restricted Substances List (RSL)
// This is a simplified version - in production, sync with ZDHC official database
export const ZDHC_RESTRICTED_SUBSTANCES = [
  // Heavy Metals
  { cas: '7440-02-0', name: 'Nickel', level: 'Restricted' as const },
  { cas: '7440-36-0', name: 'Antimony', level: 'Banned' as const },
  { cas: '7440-38-2', name: 'Arsenic', level: 'Banned' as const },
  { cas: '7440-47-3', name: 'Chromium', level: 'Restricted' as const },
  { cas: '7487-94-7', name: 'Mercury', level: 'Banned' as const },
  { cas: '7440-66-6', name: 'Zinc', level: 'Restricted' as const },
  
  // Organic Chemicals
  { cas: '50-00-0', name: 'Formaldehyde', level: 'Restricted' as const },
  { cas: '95-13-6', name: 'Indene', level: 'Banned' as const },
  { cas: '6533-00-2', name: 'Naphthalene', level: 'Restricted' as const },
  
  // Halogenated Compounds
  { cas: '79-01-6', name: 'Trichloroethylene', level: 'Banned' as const },
  { cas: '67-66-3', name: 'Chloroform', level: 'Banned' as const },
];

// ZDHC Certification Levels
export const ZDHC_CERTIFICATION_LEVELS = [
  'ZDHC Gateway',
  'ZDHC Approved',
  'ZDHC Audited',
] as const;

/**
 * Check if a chemical is restricted under ZDHC
 */
export function isZDHCRestricted(casNumber: string): HazardousSubstance | null {
  const found = ZDHC_RESTRICTED_SUBSTANCES.find(s => s.cas === casNumber);
  if (found) {
    return {
      substanceName: found.name,
      casNumber: found.cas,
      zdhcRestricted: true,
      restrictionLevel: found.level,
    };
  }
  return null;
}

/**
 * Check if a chemical component violates ZDHC standards
 */
export function checkComponentCompliance(
  componentName: string,
  casNumber: string,
  percentage: number
): ComplianceIssue | null {
  const restricted = isZDHCRestricted(casNumber);
  
  if (!restricted) return null;
  
  if (restricted.restrictionLevel === 'Banned') {
    return {
      issueId: `comp-${casNumber}`,
      issueType: 'Banned Substance',
      description: `${componentName} (CAS: ${casNumber}) is banned under ZDHC`,
      severity: 'Critical',
    };
  }
  
  if (restricted.restrictionLevel === 'Restricted' && percentage > 0.1) {
    return {
      issueId: `comp-${casNumber}`,
      issueType: 'Restricted Substance Exceeds Limit',
      description: `${componentName} (CAS: ${casNumber}) at ${percentage}% exceeds ZDHC limit`,
      severity: percentage > 1 ? 'High' : 'Medium',
    };
  }
  
  return null;
}

/**
 * Validate entire chemical product for ZDHC compliance
 */
export function validateZDHCCompliance(product: ChemicalProduct): ComplianceStatus {
  const issues: ComplianceIssue[] = [];
  let complianceLevel: 'Full' | 'Partial' | 'NonCompliant' = 'Full';
  
  // Check each component
  product.chemicalComposition.forEach((component) => {
    const issue = checkComponentCompliance(
      component.componentName,
      component.casNumber,
      component.percentage
    );
    
    if (issue) {
      issues.push(issue);
      if (issue.severity === 'Critical') {
        complianceLevel = 'NonCompliant';
      } else if (complianceLevel !== 'NonCompliant') {
        complianceLevel = 'Partial';
      }
    }
  });
  
  // Check certificate expiry
  if (product.zdhcCertificateExpiry) {
    const now = new Date();
    const expiryDate = new Date(product.zdhcCertificateExpiry);
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      issues.push({
        issueId: `cert-expired`,
        issueType: 'Certificate Expired',
        description: `ZDHC certificate expired on ${expiryDate.toLocaleDateString()}`,
        severity: 'Critical',
      });
      complianceLevel = 'NonCompliant';
    } else if (daysUntilExpiry < 90) {
      issues.push({
        issueId: `cert-expiring`,
        issueType: 'Certificate Expiring Soon',
        description: `ZDHC certificate will expire in ${daysUntilExpiry} days`,
        severity: 'High',
      });
      if (complianceLevel === 'Full') {
        complianceLevel = 'Partial';
      }
    }
  }
  
  // Check if ZDHC certified
  if (!product.zdhcCertified && issues.length === 0) {
    issues.push({
      issueId: `not-certified`,
      issueType: 'Not ZDHC Certified',
      description: 'Product is not certified by ZDHC',
      severity: 'High',
    });
    complianceLevel = 'Partial';
  }
  
  const validUntil = product.zdhcCertificateExpiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  return {
    productId: product.id,
    complianceLevel,
    issues,
    lastChecked: new Date(),
    validUntil: new Date(validUntil),
  };
}

/**
 * Generate ZDHC compliance report
 */
export function generateZDHCReport(products: ChemicalProduct[]) {
  const complianceResults = products.map(p => validateZDHCCompliance(p));
  const certifiedCount = products.filter(p => p.zdhcCertified).length;
  const fullyCompliant = complianceResults.filter(r => r.complianceLevel === 'Full').length;
  
  const allIssues = complianceResults.flatMap(r => r.issues);
  const criticalIssues = allIssues.filter(i => i.severity === 'Critical');
  
  return {
    totalProducts: products.length,
    certifiedProducts: certifiedCount,
    fullyCompliantProducts: fullyCompliant,
    compliancePercentage: products.length > 0 ? (fullyCompliant / products.length) * 100 : 0,
    totalIssues: allIssues.length,
    criticalIssues: criticalIssues.length,
    issuesByType: groupIssuesByType(allIssues),
  };
}

/**
 * Group issues by type for reporting
 */
function groupIssuesByType(issues: ComplianceIssue[]) {
  const grouped: Record<string, number> = {};
  issues.forEach(issue => {
    grouped[issue.issueType] = (grouped[issue.issueType] || 0) + 1;
  });
  return grouped;
}

/**
 * Export compliance report as CSV
 */
export function generateCSVReport(products: ChemicalProduct[]): string {
  let csv = 'Product Name,Manufacturer,ZDHC Certified,Compliance Level,Issues,Expiry Date\n';
  
  products.forEach(product => {
    const compliance = validateZDHCCompliance(product);
    const expiryDate = product.zdhcCertificateExpiry ? new Date(product.zdhcCertificateExpiry).toLocaleDateString() : 'N/A';
    const issuesCount = compliance.issues.length;
    
    csv += `"${product.productName}","${product.manufacturer}","${product.zdhcCertified ? 'Yes' : 'No'}","${compliance.complianceLevel}","${issuesCount}","${expiryDate}"\n`;
  });
  
  return csv;
}
