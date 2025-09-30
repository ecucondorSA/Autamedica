/**
 * @fileoverview HIPAA compliance classifier for automatic PHI detection
 *
 * This module provides intelligent classification of database columns and tables
 * for HIPAA compliance, identifying Protected Health Information (PHI) and
 * determining appropriate security controls.
 */

import type {
  HIPAASensitivityLevel,
  HIPAADataCategory,
  HIPAAColumnAnnotation,
  HIPAAClassificationRule,
  HIPAAConfig,
  DatabaseColumn,
  DatabaseTable,
  DatabaseSchema,
  HIPAATableClassification,
  HIPAAAccessRequirement,
  HIPAARetentionPolicy,
  HIPAAAnonymizationMethod,
  ComplianceGap
} from '../types/index.js';

/**
 * HIPAA classification engine for automatic PHI detection
 */
export class HIPAAClassifier {
  private config: HIPAAConfig;
  private classificationRules: HIPAAClassificationRule[];

  constructor(config: HIPAAConfig) {
    this.config = config;
    this.classificationRules = this.initializeDefaultRules();
  }

  /**
   * Classify an entire database schema for HIPAA compliance
   */
  async classifySchema(schema: DatabaseSchema): Promise<{
    tables: (DatabaseTable & { hipaa_classification: HIPAATableClassification })[];
    compliance_gaps: ComplianceGap[];
    total_phi_columns: number;
  }> {
    console.log('🔐 Starting HIPAA classification of database schema...');

    const classifiedTables: (DatabaseTable & { hipaa_classification: HIPAATableClassification })[] = [];
    const allComplianceGaps: ComplianceGap[] = [];
    let totalPhiColumns = 0;

    for (const table of schema.tables) {
      console.log(`  📋 Classifying table: ${table.table_name}`);

      const { classification, annotatedColumns, gaps } = await this.classifyTable(table);

      classifiedTables.push({
        ...table,
        columns: annotatedColumns,
        hipaa_classification: classification
      });

      allComplianceGaps.push(...gaps);
      totalPhiColumns += annotatedColumns.filter(col => col.hipaa_annotation?.contains_phi).length;
    }

    console.log(`✅ HIPAA classification completed. Found ${totalPhiColumns} PHI columns across ${classifiedTables.length} tables`);

    return {
      tables: classifiedTables,
      compliance_gaps: allComplianceGaps,
      total_phi_columns: totalPhiColumns
    };
  }

  /**
   * Classify a single table for HIPAA compliance
   */
  async classifyTable(table: DatabaseTable): Promise<{
    classification: HIPAATableClassification;
    annotatedColumns: (DatabaseColumn & { hipaa_annotation?: HIPAAColumnAnnotation })[];
    gaps: ComplianceGap[];
  }> {
    const annotatedColumns: (DatabaseColumn & { hipaa_annotation?: HIPAAColumnAnnotation })[] = [];
    const gaps: ComplianceGap[] = [];
    let phiColumnCount = 0;
    let maxSensitivityLevel: HIPAASensitivityLevel = 'PUBLIC';

    // Classify each column
    for (const column of table.columns) {
      const annotation = await this.classifyColumn(column, table);

      annotatedColumns.push({
        ...column,
        hipaa_annotation: annotation
      });

      if (annotation.contains_phi) {
        phiColumnCount++;

        // Track highest sensitivity level
        if (this.getSensitivityWeight(annotation.sensitivity_level) > this.getSensitivityWeight(maxSensitivityLevel)) {
          maxSensitivityLevel = annotation.sensitivity_level;
        }
      }
    }

    // Determine table-level classification
    const classification: HIPAATableClassification = {
      overall_sensitivity: maxSensitivityLevel,
      contains_phi: phiColumnCount > 0,
      phi_column_count: phiColumnCount,
      access_control_level: this.determineAccessControlLevel(table, phiColumnCount),
      audit_requirements: this.determineAuditRequirements(maxSensitivityLevel),
      encryption_requirements: this.determineEncryptionRequirements(maxSensitivityLevel, phiColumnCount),
      retention_category: this.determineRetentionCategory(table, maxSensitivityLevel)
    };

    // Identify compliance gaps
    gaps.push(...this.identifyTableComplianceGaps(table, classification, annotatedColumns));

    return { classification, annotatedColumns, gaps };
  }

  /**
   * Classify a single column for HIPAA compliance
   */
  async classifyColumn(column: DatabaseColumn, table: DatabaseTable): Promise<HIPAAColumnAnnotation> {
    const matchedRules = this.findMatchingRules(column, table);

    // If no rules match, use default classification
    if (matchedRules.length === 0) {
      return this.createDefaultAnnotation(column, table);
    }

    // Use the highest confidence rule
    const bestRule = matchedRules.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );

    const annotation: HIPAAColumnAnnotation = {
      column_name: column.column_name,
      table_name: table.table_name,
      sensitivity_level: bestRule.sensitivity_level,
      contains_phi: this.isPhiSensitivityLevel(bestRule.sensitivity_level),
      data_categories: [...bestRule.data_categories],
      access_requirements: this.generateAccessRequirements(bestRule.sensitivity_level, bestRule.data_categories),
      retention_policy: this.generateRetentionPolicy(bestRule.sensitivity_level, bestRule.data_categories),
      encryption_required: this.isEncryptionRequired(bestRule.sensitivity_level),
      audit_required: this.isAuditRequired(bestRule.sensitivity_level),
      anonymization_method: this.suggestAnonymizationMethod(column, bestRule.data_categories),
      last_reviewed: new Date().toISOString(),
      reviewed_by: 'HIPAA_Classifier_v1.0',
      compliance_notes: this.generateComplianceNotes(bestRule, column)
    };

    return annotation;
  }

  /**
   * Initialize default HIPAA classification rules
   */
  private initializeDefaultRules(): HIPAAClassificationRule[] {
    return [
      // High-confidence PHI patterns
      {
        rule_name: 'Social Security Number',
        pattern_type: 'COLUMN_NAME',
        pattern: '.*(ssn|social_security|social_security_number).*',
        sensitivity_level: 'HIGHLY_SENSITIVE',
        data_categories: ['DEMOGRAPHIC'],
        confidence: 0.95,
        auto_apply: true
      },
      {
        rule_name: 'Medical Record Number',
        pattern_type: 'COLUMN_NAME',
        pattern: '(?i).*(medical_record|mrn|medical_record_number|patient_number).*',
        sensitivity_level: 'HIGHLY_SENSITIVE',
        data_categories: ['MEDICAL_RECORD'],
        confidence: 0.95,
        auto_apply: true
      },
      {
        rule_name: 'Date of Birth',
        pattern_type: 'COLUMN_NAME',
        pattern: '(?i).*(birth|dob|date_of_birth|birthdate).*',
        sensitivity_level: 'RESTRICTED',
        data_categories: ['DEMOGRAPHIC'],
        confidence: 0.90,
        auto_apply: true
      },
      {
        rule_name: 'Full Name',
        pattern_type: 'COLUMN_NAME',
        pattern: '(?i).*(full_name|first_name|last_name|patient_name|name).*',
        sensitivity_level: 'RESTRICTED',
        data_categories: ['DEMOGRAPHIC'],
        confidence: 0.85,
        auto_apply: true
      },
      {
        rule_name: 'Email Address',
        pattern_type: 'COLUMN_NAME',
        pattern: '(?i).*(email|email_address|contact_email).*',
        sensitivity_level: 'RESTRICTED',
        data_categories: ['CONTACT'],
        confidence: 0.90,
        auto_apply: true
      },
      {
        rule_name: 'Phone Number',
        pattern_type: 'COLUMN_NAME',
        pattern: '(?i).*(phone|telephone|mobile|cell|contact_number).*',
        sensitivity_level: 'RESTRICTED',
        data_categories: ['CONTACT'],
        confidence: 0.85,
        auto_apply: true
      },
      {
        rule_name: 'Address Fields',
        pattern_type: 'COLUMN_NAME',
        pattern: '(?i).*(address|street|city|state|zip|postal|country).*',
        sensitivity_level: 'RESTRICTED',
        data_categories: ['DEMOGRAPHIC'],
        confidence: 0.80,
        auto_apply: true
      },

      // Medical data patterns
      {
        rule_name: 'Diagnosis Codes',
        pattern_type: 'COLUMN_NAME',
        pattern: '(?i).*(diagnosis|icd|icd10|disease|condition).*',
        sensitivity_level: 'HIGHLY_SENSITIVE',
        data_categories: ['MEDICAL_RECORD'],
        confidence: 0.90,
        auto_apply: true
      },
      {
        rule_name: 'Medication Information',
        pattern_type: 'COLUMN_NAME',
        pattern: '(?i).*(medication|drug|prescription|dosage|medicine).*',
        sensitivity_level: 'HIGHLY_SENSITIVE',
        data_categories: ['MEDICAL_RECORD'],
        confidence: 0.90,
        auto_apply: true
      },
      {
        rule_name: 'Treatment Notes',
        pattern_type: 'COLUMN_NAME',
        pattern: '(?i).*(notes|treatment|therapy|clinical_notes|progress).*',
        sensitivity_level: 'HIGHLY_SENSITIVE',
        data_categories: ['MEDICAL_RECORD'],
        confidence: 0.85,
        auto_apply: true
      },

      // Financial data patterns
      {
        rule_name: 'Insurance Information',
        pattern_type: 'COLUMN_NAME',
        pattern: '(?i).*(insurance|policy|coverage|payer|insurance_number).*',
        sensitivity_level: 'RESTRICTED',
        data_categories: ['FINANCIAL'],
        confidence: 0.85,
        auto_apply: true
      },
      {
        rule_name: 'Payment Information',
        pattern_type: 'COLUMN_NAME',
        pattern: '(?i).*(payment|billing|charge|cost|amount|invoice).*',
        sensitivity_level: 'INTERNAL',
        data_categories: ['FINANCIAL'],
        confidence: 0.75,
        auto_apply: true
      },

      // Biometric and special categories
      {
        rule_name: 'Biometric Data',
        pattern_type: 'COLUMN_NAME',
        pattern: '(?i).*(fingerprint|retina|dna|biometric|face|iris).*',
        sensitivity_level: 'HIGHLY_SENSITIVE',
        data_categories: ['BIOMETRIC'],
        confidence: 0.95,
        auto_apply: true
      },
      {
        rule_name: 'Genetic Information',
        pattern_type: 'COLUMN_NAME',
        pattern: '(?i).*(genetic|gene|dna|chromosome|hereditary).*',
        sensitivity_level: 'GENETIC',
        data_categories: ['GENETIC'],
        confidence: 0.95,
        auto_apply: true
      },
      {
        rule_name: 'Mental Health',
        pattern_type: 'COLUMN_NAME',
        pattern: '(?i).*(psychiatric|mental|psychology|therapy|counseling|depression|anxiety).*',
        sensitivity_level: 'PSYCHIATRIC',
        data_categories: ['PSYCHIATRIC'],
        confidence: 0.90,
        auto_apply: true
      },
      {
        rule_name: 'Substance Abuse',
        pattern_type: 'COLUMN_NAME',
        pattern: '(?i).*(substance|addiction|rehab|alcohol|drug_use).*',
        sensitivity_level: 'PSYCHIATRIC',
        data_categories: ['SUBSTANCE_ABUSE'],
        confidence: 0.90,
        auto_apply: true
      },

      // Technical and system data
      {
        rule_name: 'IP Addresses',
        pattern_type: 'COLUMN_NAME',
        pattern: '(?i).*(ip_address|ip|client_ip|remote_addr).*',
        sensitivity_level: 'INTERNAL',
        data_categories: ['TECHNICAL'],
        confidence: 0.80,
        auto_apply: true
      },
      {
        rule_name: 'System IDs',
        pattern_type: 'COLUMN_NAME',
        pattern: '(?i).*(id|uuid|user_id|patient_id|doctor_id)$',
        sensitivity_level: 'INTERNAL',
        data_categories: ['ADMINISTRATIVE'],
        confidence: 0.70,
        auto_apply: true
      },

      // Table-level patterns
      {
        rule_name: 'Patient Tables',
        pattern_type: 'TABLE_NAME',
        pattern: '(?i).*(patient|cliente|persona).*',
        sensitivity_level: 'RESTRICTED',
        data_categories: ['DEMOGRAPHIC', 'MEDICAL_RECORD'],
        confidence: 0.85,
        auto_apply: true
      },
      {
        rule_name: 'Medical Record Tables',
        pattern_type: 'TABLE_NAME',
        pattern: '(?i).*(medical_record|historia|expediente|clinical).*',
        sensitivity_level: 'HIGHLY_SENSITIVE',
        data_categories: ['MEDICAL_RECORD'],
        confidence: 0.90,
        auto_apply: true
      },
      {
        rule_name: 'Audit Tables',
        pattern_type: 'TABLE_NAME',
        pattern: '(?i).*(audit|log|tracking).*',
        sensitivity_level: 'INTERNAL',
        data_categories: ['ADMINISTRATIVE'],
        confidence: 0.75,
        auto_apply: true
      }
    ];
  }

  /**
   * Find classification rules that match a column
   */
  private findMatchingRules(column: DatabaseColumn, table: DatabaseTable): HIPAAClassificationRule[] {
    const matchedRules: HIPAAClassificationRule[] = [];

    for (const rule of this.classificationRules) {
      let isMatch = false;

      switch (rule.pattern_type) {
        case 'COLUMN_NAME':
          isMatch = new RegExp(rule.pattern, 'i').test(column.column_name);
          break;
        case 'TABLE_NAME':
          isMatch = new RegExp(rule.pattern, 'i').test(table.table_name);
          break;
        case 'DATA_TYPE':
          isMatch = new RegExp(rule.pattern, 'i').test(column.data_type);
          break;
        case 'COMMENT':
          const comment = column.column_comment || table.table_comment || '';
          isMatch = new RegExp(rule.pattern, 'i').test(comment);
          break;
      }

      if (isMatch && rule.auto_apply) {
        matchedRules.push(rule);
      }
    }

    return matchedRules;
  }

  /**
   * Create default annotation for unmatched columns
   */
  private createDefaultAnnotation(column: DatabaseColumn, table: DatabaseTable): HIPAAColumnAnnotation {
    return {
      column_name: column.column_name,
      table_name: table.table_name,
      sensitivity_level: this.config.default_sensitivity || 'UNKNOWN',
      contains_phi: false,
      data_categories: ['ADMINISTRATIVE'],
      access_requirements: [],
      encryption_required: false,
      audit_required: false,
      last_reviewed: new Date().toISOString(),
      reviewed_by: 'HIPAA_Classifier_v1.0',
      compliance_notes: 'No matching classification rules found. Manual review recommended.'
    };
  }

  /**
   * Get numeric weight for sensitivity levels (for comparison)
   */
  private getSensitivityWeight(level: HIPAASensitivityLevel): number {
    const weights: Record<HIPAASensitivityLevel, number> = {
      'PUBLIC': 0,
      'INTERNAL': 1,
      'RESTRICTED': 2,
      'HIGHLY_SENSITIVE': 3,
      'PSYCHIATRIC': 4,
      'GENETIC': 5,
      'UNKNOWN': -1
    };
    return weights[level] || -1;
  }

  /**
   * Check if sensitivity level contains PHI
   */
  private isPhiSensitivityLevel(level: HIPAASensitivityLevel): boolean {
    return ['RESTRICTED', 'HIGHLY_SENSITIVE', 'PSYCHIATRIC', 'GENETIC'].includes(level);
  }

  /**
   * Generate access requirements based on sensitivity and data categories
   */
  private generateAccessRequirements(
    sensitivityLevel: HIPAASensitivityLevel,
    dataCategories: HIPAADataCategory[]
  ): HIPAAAccessRequirement[] {
    const requirements: HIPAAAccessRequirement[] = [];

    if (this.isPhiSensitivityLevel(sensitivityLevel)) {
      requirements.push({
        requirement_type: 'ROLE_BASED',
        description: 'Access restricted to authorized medical personnel',
        required_roles: this.getAuthorizedRoles(dataCategories),
        mfa_required: sensitivityLevel === 'HIGHLY_SENSITIVE' || sensitivityLevel === 'GENETIC' || sensitivityLevel === 'PSYCHIATRIC',
        audit_level: this.getAuditLevel(sensitivityLevel)
      });

      if (dataCategories.includes('PSYCHIATRIC') || dataCategories.includes('SUBSTANCE_ABUSE')) {
        requirements.push({
          requirement_type: 'PURPOSE_BASED',
          description: 'Access limited to treatment, payment, and healthcare operations',
          authorized_purposes: ['TREATMENT', 'PAYMENT', 'HEALTHCARE_OPERATIONS'],
          mfa_required: true,
          audit_level: 'COMPREHENSIVE'
        });
      }

      if (dataCategories.includes('GENETIC')) {
        requirements.push({
          requirement_type: 'PURPOSE_BASED',
          description: 'Genetic information access restricted per GINA requirements',
          authorized_purposes: ['TREATMENT', 'RESEARCH_WITH_CONSENT'],
          mfa_required: true,
          audit_level: 'COMPREHENSIVE'
        });
      }
    }

    return requirements;
  }

  /**
   * Generate retention policy based on sensitivity and data categories
   */
  private generateRetentionPolicy(
    sensitivityLevel: HIPAASensitivityLevel,
    dataCategories: HIPAADataCategory[]
  ): HIPAARetentionPolicy | undefined {
    if (!this.isPhiSensitivityLevel(sensitivityLevel)) {
      return undefined;
    }

    let retentionYears = 6; // Default HIPAA minimum

    // Adjust based on data categories
    if (dataCategories.includes('PSYCHIATRIC') || dataCategories.includes('SUBSTANCE_ABUSE')) {
      retentionYears = 10; // Mental health records often require longer retention
    }
    if (dataCategories.includes('GENETIC')) {
      retentionYears = 25; // Genetic information may have long-term relevance
    }
    if (dataCategories.includes('RESEARCH')) {
      retentionYears = 7; // Research data retention requirements
    }

    return {
      retention_period_years: retentionYears,
      deletion_method: sensitivityLevel === 'HIGHLY_SENSITIVE' ? 'SECURE_DELETE' : 'ANONYMIZE',
      legal_hold_exceptions: true,
      patient_access_rights: true,
      amendment_rights: !dataCategories.includes('GENETIC'), // Genetic data amendments are complex
      disclosure_accounting: true
    };
  }

  /**
   * Determine if encryption is required
   */
  private isEncryptionRequired(sensitivityLevel: HIPAASensitivityLevel): boolean {
    return ['HIGHLY_SENSITIVE', 'PSYCHIATRIC', 'GENETIC'].includes(sensitivityLevel);
  }

  /**
   * Determine if audit is required
   */
  private isAuditRequired(sensitivityLevel: HIPAASensitivityLevel): boolean {
    return this.isPhiSensitivityLevel(sensitivityLevel);
  }

  /**
   * Suggest anonymization method based on column and data categories
   */
  private suggestAnonymizationMethod(
    column: DatabaseColumn,
    dataCategories: HIPAADataCategory[]
  ): HIPAAAnonymizationMethod | undefined {
    if (dataCategories.includes('DEMOGRAPHIC')) {
      if (column.column_name.toLowerCase().includes('name')) {
        return 'PSEUDONYMIZATION';
      }
      if (column.column_name.toLowerCase().includes('date') || column.column_name.toLowerCase().includes('birth')) {
        return 'DATE_SHIFTING';
      }
      if (column.column_name.toLowerCase().includes('address') || column.column_name.toLowerCase().includes('zip')) {
        return 'GENERALIZATION';
      }
    }

    if (dataCategories.includes('FINANCIAL')) {
      return 'GENERALIZATION';
    }

    if (dataCategories.includes('MEDICAL_RECORD')) {
      return 'REDACTION';
    }

    if (dataCategories.includes('BIOMETRIC') || dataCategories.includes('GENETIC')) {
      return 'DELETION'; // Too sensitive for partial anonymization
    }

    return 'REDACTION'; // Safe default
  }

  /**
   * Generate compliance notes
   */
  private generateComplianceNotes(rule: HIPAAClassificationRule, column: DatabaseColumn): string {
    const notes = [`Classified using rule: ${rule.rule_name} (confidence: ${rule.confidence})`];

    if (rule.sensitivity_level === 'UNKNOWN') {
      notes.push('Manual review required to determine appropriate classification.');
    }

    if (rule.data_categories.includes('GENETIC')) {
      notes.push('Subject to Genetic Information Nondiscrimination Act (GINA) protections.');
    }

    if (rule.data_categories.includes('PSYCHIATRIC')) {
      notes.push('Subject to enhanced mental health privacy protections.');
    }

    if (column.is_primary_key) {
      notes.push('Primary key - consider impact on referential integrity when applying anonymization.');
    }

    if (column.is_foreign_key) {
      notes.push('Foreign key - coordinate anonymization with referenced table.');
    }

    return notes.join(' ');
  }

  /**
   * Get authorized roles for data categories
   */
  private getAuthorizedRoles(dataCategories: HIPAADataCategory[]): string[] {
    const roles = new Set<string>();

    if (dataCategories.includes('MEDICAL_RECORD') || dataCategories.includes('CLINICAL')) {
      roles.add('doctor');
      roles.add('nurse');
      roles.add('medical_assistant');
    }

    if (dataCategories.includes('FINANCIAL')) {
      roles.add('billing_specialist');
      roles.add('financial_counselor');
    }

    if (dataCategories.includes('ADMINISTRATIVE')) {
      roles.add('admin');
      roles.add('system_administrator');
    }

    if (dataCategories.includes('PSYCHIATRIC')) {
      roles.add('psychiatrist');
      roles.add('mental_health_counselor');
    }

    // Always include patient access to their own data
    roles.add('patient_self');

    return Array.from(roles);
  }

  /**
   * Get audit level based on sensitivity
   */
  private getAuditLevel(sensitivityLevel: HIPAASensitivityLevel): 'BASIC' | 'DETAILED' | 'COMPREHENSIVE' {
    switch (sensitivityLevel) {
      case 'GENETIC':
      case 'PSYCHIATRIC':
        return 'COMPREHENSIVE';
      case 'HIGHLY_SENSITIVE':
        return 'DETAILED';
      case 'RESTRICTED':
        return 'BASIC';
      default:
        return 'BASIC';
    }
  }

  /**
   * Determine table-level access control requirements
   */
  private determineAccessControlLevel(
    table: DatabaseTable,
    phiColumnCount: number
  ): 'PUBLIC' | 'AUTHENTICATED' | 'ROLE_BASED' | 'EXPLICIT_GRANT' {
    if (phiColumnCount === 0) {
      // Check if table name suggests it should still be protected
      const protectedTablePatterns = [
        'user', 'patient', 'doctor', 'employee', 'staff'
      ];

      if (protectedTablePatterns.some(pattern =>
        table.table_name.toLowerCase().includes(pattern))) {
        return 'AUTHENTICATED';
      }
      return 'PUBLIC';
    }

    if (phiColumnCount <= 2) {
      return 'ROLE_BASED';
    }

    return 'EXPLICIT_GRANT';
  }

  /**
   * Determine audit requirements based on sensitivity
   */
  private determineAuditRequirements(
    maxSensitivityLevel: HIPAASensitivityLevel
  ): 'NONE' | 'BASIC' | 'DETAILED' | 'COMPREHENSIVE' {
    switch (maxSensitivityLevel) {
      case 'GENETIC':
      case 'PSYCHIATRIC':
        return 'COMPREHENSIVE';
      case 'HIGHLY_SENSITIVE':
        return 'DETAILED';
      case 'RESTRICTED':
        return 'BASIC';
      default:
        return 'NONE';
    }
  }

  /**
   * Determine encryption requirements
   */
  private determineEncryptionRequirements(
    maxSensitivityLevel: HIPAASensitivityLevel,
    phiColumnCount: number
  ): 'NONE' | 'AT_REST' | 'IN_TRANSIT' | 'BOTH' {
    if (!this.isPhiSensitivityLevel(maxSensitivityLevel)) {
      return 'NONE';
    }

    if (['GENETIC', 'PSYCHIATRIC', 'HIGHLY_SENSITIVE'].includes(maxSensitivityLevel)) {
      return 'BOTH';
    }

    if (phiColumnCount >= 3) {
      return 'BOTH';
    }

    return 'AT_REST';
  }

  /**
   * Determine retention category
   */
  private determineRetentionCategory(
    table: DatabaseTable,
    maxSensitivityLevel: HIPAASensitivityLevel
  ): 'SHORT_TERM' | 'STANDARD' | 'LONG_TERM' | 'PERMANENT' {
    // Check table purpose from name
    if (table.table_name.toLowerCase().includes('audit') ||
        table.table_name.toLowerCase().includes('log')) {
      return 'LONG_TERM';
    }

    if (table.table_name.toLowerCase().includes('temp') ||
        table.table_name.toLowerCase().includes('cache')) {
      return 'SHORT_TERM';
    }

    switch (maxSensitivityLevel) {
      case 'GENETIC':
        return 'PERMANENT';
      case 'PSYCHIATRIC':
        return 'LONG_TERM';
      case 'HIGHLY_SENSITIVE':
      case 'RESTRICTED':
        return 'STANDARD';
      default:
        return 'SHORT_TERM';
    }
  }

  /**
   * Identify compliance gaps for a table
   */
  private identifyTableComplianceGaps(
    table: DatabaseTable,
    classification: HIPAATableClassification,
    annotatedColumns: (DatabaseColumn & { hipaa_annotation?: HIPAAColumnAnnotation })[]
  ): ComplianceGap[] {
    const gaps: ComplianceGap[] = [];

    // Check for missing encryption
    if (classification.contains_phi && classification.encryption_requirements === 'NONE') {
      gaps.push({
        gap_type: 'MISSING_ENCRYPTION',
        affected_tables: [table.table_name],
        affected_columns: annotatedColumns
          .filter(col => col.hipaa_annotation?.contains_phi)
          .map(col => col.column_name),
        severity: 'HIGH',
        recommendation: 'Implement encryption for columns containing PHI',
        regulatory_reference: '45 CFR 164.312(a)(2)(iv) - Encryption and Decryption'
      });
    }

    // Check for insufficient access control
    if (classification.contains_phi && classification.access_control_level === 'PUBLIC') {
      gaps.push({
        gap_type: 'INSUFFICIENT_ACCESS_CONTROL',
        affected_tables: [table.table_name],
        affected_columns: [],
        severity: 'CRITICAL',
        recommendation: 'Implement Row Level Security (RLS) and role-based access control for PHI data',
        regulatory_reference: '45 CFR 164.312(a)(1) - Access Control'
      });
    }

    // Check for missing audit
    if (classification.contains_phi && classification.audit_requirements === 'NONE') {
      gaps.push({
        gap_type: 'NO_AUDIT_TRAIL',
        affected_tables: [table.table_name],
        affected_columns: [],
        severity: 'MEDIUM',
        recommendation: 'Implement audit logging for all access to PHI data',
        regulatory_reference: '45 CFR 164.312(b) - Audit Controls'
      });
    }

    // Check for unclassified sensitive data
    const unclassifiedColumns = annotatedColumns.filter(col =>
      col.hipaa_annotation?.sensitivity_level === 'UNKNOWN' &&
      this.isPotentiallyPhiColumn(col)
    );

    if (unclassifiedColumns.length > 0) {
      gaps.push({
        gap_type: 'UNCLASSIFIED_PHI',
        affected_tables: [table.table_name],
        affected_columns: unclassifiedColumns.map(col => col.column_name),
        severity: 'MEDIUM',
        recommendation: 'Review and classify columns that may contain PHI',
        regulatory_reference: '45 CFR 164.514(b)(1) - De-identification Standard'
      });
    }

    return gaps;
  }

  /**
   * Check if a column is potentially PHI based on heuristics
   */
  private isPotentiallyPhiColumn(column: DatabaseColumn): boolean {
    const phiIndicators = [
      'name', 'address', 'date', 'phone', 'email', 'ssn', 'id',
      'medical', 'patient', 'diagnosis', 'treatment', 'medication'
    ];

    return phiIndicators.some(indicator =>
      column.column_name.toLowerCase().includes(indicator)
    );
  }
}

/**
 * Factory function to create HIPAA classifier with default configuration
 */
export function createHIPAAClassifier(config?: Partial<HIPAAConfig>): HIPAAClassifier {
  const defaultConfig: HIPAAConfig = {
    enabled: true,
    auto_classify: true,
    require_manual_review: false,
    classification_rules: [],
    default_sensitivity: 'UNKNOWN',
    audit_all_phi: true,
    encrypt_by_default: true,
    ...config
  };

  return new HIPAAClassifier(defaultConfig);
}

/**
 * Utility function to validate HIPAA annotation
 */
export function validateHIPAAAnnotation(annotation: HIPAAColumnAnnotation): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!annotation.column_name) {
    errors.push('Column name is required');
  }
  if (!annotation.table_name) {
    errors.push('Table name is required');
  }
  if (!annotation.sensitivity_level) {
    errors.push('Sensitivity level is required');
  }

  // Logical consistency checks
  if (annotation.contains_phi && annotation.sensitivity_level === 'PUBLIC') {
    errors.push('PHI cannot have PUBLIC sensitivity level');
  }

  if (!annotation.contains_phi && ['RESTRICTED', 'HIGHLY_SENSITIVE', 'PSYCHIATRIC', 'GENETIC'].includes(annotation.sensitivity_level)) {
    warnings.push('Non-PHI column has PHI sensitivity level');
  }

  if (annotation.encryption_required && !annotation.contains_phi) {
    warnings.push('Encryption required for non-PHI column');
  }

  if (annotation.contains_phi && !annotation.encryption_required &&
      ['HIGHLY_SENSITIVE', 'PSYCHIATRIC', 'GENETIC'].includes(annotation.sensitivity_level)) {
    warnings.push('High sensitivity PHI without encryption requirement');
  }

  // Date validation
  try {
    new Date(annotation.last_reviewed);
  } catch {
    errors.push('Invalid last_reviewed date format');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}