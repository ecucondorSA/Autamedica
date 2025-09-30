/**
 * @fileoverview Core types and interfaces for the database glossary system
 *
 * This module defines the foundational types used across the hybrid
 * PostgreSQL introspection and SQL parsing system for auto-generating
 * medical database documentation with HIPAA compliance annotations.
 */

// ==========================================
// Database Introspection Types
// ==========================================

/**
 * PostgreSQL column information from introspection
 */
export interface DatabaseColumn {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
  column_default?: string;
  character_maximum_length?: number;
  numeric_precision?: number;
  numeric_scale?: number;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  foreign_key_table?: string;
  foreign_key_column?: string;
  column_comment?: string;
}

/**
 * PostgreSQL table information from introspection
 */
export interface DatabaseTable {
  table_name: string;
  table_schema: string;
  table_type: 'BASE TABLE' | 'VIEW' | 'MATERIALIZED VIEW';
  table_comment?: string;
  columns: DatabaseColumn[];
  indexes: DatabaseIndex[];
  constraints: DatabaseConstraint[];
}

/**
 * PostgreSQL index information
 */
export interface DatabaseIndex {
  index_name: string;
  is_unique: boolean;
  is_primary: boolean;
  columns: string[];
  index_type: string;
  condition?: string;
}

/**
 * PostgreSQL constraint information
 */
export interface DatabaseConstraint {
  constraint_name: string;
  constraint_type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK' | 'EXCLUDE';
  columns: string[];
  referenced_table?: string;
  referenced_columns?: string[];
  check_clause?: string;
}

/**
 * Complete database schema from introspection
 */
export interface DatabaseSchema {
  schema_name: string;
  tables: DatabaseTable[];
  functions: DatabaseFunction[];
  triggers: DatabaseTrigger[];
  extensions: DatabaseExtension[];
  introspected_at: string; // ISO timestamp
}

/**
 * PostgreSQL function information
 */
export interface DatabaseFunction {
  function_name: string;
  function_schema: string;
  return_type: string;
  argument_types: string[];
  function_type: 'FUNCTION' | 'PROCEDURE' | 'AGGREGATE';
  is_security_definer: boolean;
  language: string;
  source_code?: string;
  function_comment?: string;
}

/**
 * PostgreSQL trigger information
 */
export interface DatabaseTrigger {
  trigger_name: string;
  table_name: string;
  trigger_event: string[];
  trigger_timing: 'BEFORE' | 'AFTER' | 'INSTEAD OF';
  trigger_function: string;
  trigger_condition?: string;
}

/**
 * PostgreSQL extension information
 */
export interface DatabaseExtension {
  extension_name: string;
  extension_version: string;
  extension_schema: string;
}

// ==========================================
// SQL Parsing Types
// ==========================================

/**
 * Parsed SQL statement information
 */
export interface ParsedSQLStatement {
  statement_type: 'CREATE_TABLE' | 'ALTER_TABLE' | 'CREATE_INDEX' | 'CREATE_FUNCTION' | 'CREATE_TRIGGER';
  table_name?: string;
  schema_name?: string;
  raw_sql: string;
  parsed_elements: ParsedSQLElement[];
  file_path: string;
  line_number: number;
}

/**
 * Individual elements parsed from SQL
 */
export interface ParsedSQLElement {
  element_type: 'COLUMN' | 'CONSTRAINT' | 'INDEX' | 'TRIGGER' | 'FUNCTION';
  name: string;
  properties: Record<string, any>;
  sql_fragment: string;
}

/**
 * SQL file parsing result
 */
export interface SQLParsingResult {
  file_path: string;
  statements: ParsedSQLStatement[];
  errors: SQLParsingError[];
  parsed_at: string;
}

/**
 * SQL parsing error information
 */
export interface SQLParsingError {
  error_type: 'SYNTAX_ERROR' | 'UNSUPPORTED_STATEMENT' | 'PARSE_ERROR';
  message: string;
  line_number?: number;
  column_number?: number;
  sql_fragment?: string;
}

// ==========================================
// HIPAA Compliance Types
// ==========================================

/**
 * HIPAA sensitivity levels for medical data
 */
export type HIPAASensitivityLevel =
  | 'PUBLIC'           // No PHI - publicly shareable
  | 'INTERNAL'         // Internal use - no patient data
  | 'RESTRICTED'       // Contains PHI - access controlled
  | 'HIGHLY_SENSITIVE' // Highly sensitive PHI - audit logged
  | 'PSYCHIATRIC'      // Mental health - special protection
  | 'GENETIC'          // Genetic information - federal protection
  | 'UNKNOWN';         // Needs manual review

/**
 * HIPAA column annotation with compliance metadata
 */
export interface HIPAAColumnAnnotation {
  column_name: string;
  table_name: string;
  sensitivity_level: HIPAASensitivityLevel;
  contains_phi: boolean;
  data_categories: HIPAADataCategory[];
  access_requirements: HIPAAAccessRequirement[];
  retention_policy?: HIPAARetentionPolicy;
  encryption_required: boolean;
  audit_required: boolean;
  anonymization_method?: HIPAAAnonymizationMethod;
  last_reviewed: string; // ISO timestamp
  reviewed_by: string;
  compliance_notes?: string;
}

/**
 * HIPAA data categories for classification
 */
export type HIPAADataCategory =
  | 'DEMOGRAPHIC'      // Name, address, DOB, SSN
  | 'MEDICAL_RECORD'   // Diagnoses, treatments, medications
  | 'FINANCIAL'        // Insurance, billing, payments
  | 'BIOMETRIC'        // Fingerprints, retinal scans, DNA
  | 'PHOTOGRAPHIC'     // Photos, videos, images
  | 'CONTACT'          // Phone, email, emergency contacts
  | 'EMPLOYMENT'       // Employer, occupation, work address
  | 'EDUCATIONAL'      // School records, educational history
  | 'TECHNICAL'        // IP addresses, device IDs, audit logs
  | 'GENETIC'          // Genetic test results, family history
  | 'PSYCHIATRIC'      // Mental health records, therapy notes
  | 'SUBSTANCE_ABUSE'  // Drug/alcohol treatment records
  | 'RESEARCH'         // Clinical trial data, research records
  | 'ADMINISTRATIVE';  // System metadata, operational data

/**
 * HIPAA access requirements
 */
export interface HIPAAAccessRequirement {
  requirement_type: 'ROLE_BASED' | 'PURPOSE_BASED' | 'LOCATION_BASED' | 'TIME_BASED';
  description: string;
  required_roles?: string[];
  authorized_purposes?: string[];
  location_restrictions?: string[];
  time_restrictions?: string;
  mfa_required: boolean;
  audit_level: 'BASIC' | 'DETAILED' | 'COMPREHENSIVE';
}

/**
 * HIPAA data retention policy
 */
export interface HIPAARetentionPolicy {
  retention_period_years: number;
  deletion_method: 'SECURE_DELETE' | 'ANONYMIZE' | 'ARCHIVE' | 'MANUAL_REVIEW';
  legal_hold_exceptions: boolean;
  patient_access_rights: boolean;
  amendment_rights: boolean;
  disclosure_accounting: boolean;
}

/**
 * HIPAA anonymization methods
 */
export type HIPAAAnonymizationMethod =
  | 'REDACTION'        // Remove or blackout data
  | 'GENERALIZATION'   // Replace with ranges or categories
  | 'PSEUDONYMIZATION' // Replace with consistent fake identifiers
  | 'NOISE_ADDITION'   // Add statistical noise to numerical data
  | 'DATE_SHIFTING'    // Shift dates by random intervals
  | 'AGGREGATION'      // Combine into summary statistics
  | 'SYNTHETIC'        // Replace with synthetic but realistic data
  | 'DELETION';        // Complete removal

// ==========================================
// Documentation Generation Types
// ==========================================

/**
 * Template context for Handlebars rendering
 */
export interface DocumentationContext {
  database_info: DatabaseMetadata;
  tables: TableDocumentation[];
  functions: FunctionDocumentation[];
  indexes: IndexDocumentation[];
  hipaa_summary: HIPAASummary;
  generation_info: GenerationMetadata;
  validation_results: ValidationResult[];
}

/**
 * Database metadata for documentation
 */
export interface DatabaseMetadata {
  database_name: string;
  schema_version: string;
  last_migration: string;
  total_tables: number;
  total_columns: number;
  total_functions: number;
  hipaa_classified_columns: number;
  introspection_method: 'POSTGRESQL' | 'SQL_PARSING';
  generated_at: string;
}

/**
 * Table documentation with medical context
 */
export interface TableDocumentation {
  table_name: string;
  table_purpose: string;
  medical_domain: MedicalDomain;
  columns: ColumnDocumentation[];
  relationships: TableRelationship[];
  indexes: IndexDocumentation[];
  constraints: ConstraintDocumentation[];
  hipaa_classification: HIPAATableClassification;
  sample_queries?: string[];
  migration_history?: MigrationRecord[];
}

/**
 * Medical domain classification for tables
 */
export type MedicalDomain =
  | 'PATIENT_MANAGEMENT'   // Patient demographics, profiles
  | 'CLINICAL_DATA'        // Diagnoses, treatments, medications
  | 'APPOINTMENTS'         // Scheduling, calendar management
  | 'BILLING_FINANCIAL'    // Insurance, payments, billing
  | 'PROVIDER_MANAGEMENT'  // Doctor profiles, specialties
  | 'FACILITY_OPERATIONS'  // Hospitals, clinics, locations
  | 'TELEMEDICINE'         // Video calls, remote consultations
  | 'RESEARCH_ANALYTICS'   // Clinical trials, population health
  | 'SYSTEM_ADMINISTRATION' // Users, roles, audit logs
  | 'COMPLIANCE_AUDIT'     // HIPAA, regulatory compliance
  | 'EMERGENCY_CARE'       // ER, urgent care, triage
  | 'PHARMACY'             // Medication management, prescriptions
  | 'LABORATORY'           // Lab results, specimen tracking
  | 'IMAGING'              // Radiology, DICOM, medical imaging
  | 'UNKNOWN';             // Needs manual classification

/**
 * Column documentation with medical annotations
 */
export interface ColumnDocumentation {
  column_name: string;
  display_name: string;
  data_type: string;
  is_required: boolean;
  description: string;
  medical_purpose?: string;
  example_values?: string[];
  validation_rules?: string[];
  hipaa_annotation?: HIPAAColumnAnnotation;
  related_columns?: string[];
  business_logic?: string;
}

/**
 * Table relationship information
 */
export interface TableRelationship {
  relationship_type: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_MANY';
  related_table: string;
  foreign_key_columns: string[];
  relationship_purpose: string;
  cardinality_notes?: string;
}

/**
 * Index documentation for performance
 */
export interface IndexDocumentation {
  index_name: string;
  index_type: string;
  columns: string[];
  is_unique: boolean;
  performance_purpose: string;
  query_patterns?: string[];
  maintenance_notes?: string;
}

/**
 * Constraint documentation
 */
export interface ConstraintDocumentation {
  constraint_name: string;
  constraint_type: string;
  columns: string[];
  business_rule: string;
  enforcement_level: 'DATABASE' | 'APPLICATION' | 'BOTH';
  validation_examples?: string[];
}

/**
 * HIPAA table classification summary
 */
export interface HIPAATableClassification {
  overall_sensitivity: HIPAASensitivityLevel;
  contains_phi: boolean;
  phi_column_count: number;
  access_control_level: 'PUBLIC' | 'AUTHENTICATED' | 'ROLE_BASED' | 'EXPLICIT_GRANT';
  audit_requirements: 'NONE' | 'BASIC' | 'DETAILED' | 'COMPREHENSIVE';
  encryption_requirements: 'NONE' | 'AT_REST' | 'IN_TRANSIT' | 'BOTH';
  retention_category: 'SHORT_TERM' | 'STANDARD' | 'LONG_TERM' | 'PERMANENT';
}

/**
 * Function documentation
 */
export interface FunctionDocumentation {
  function_name: string;
  purpose: string;
  parameters: FunctionParameter[];
  return_type: string;
  medical_use_case?: string;
  security_considerations?: string[];
  performance_notes?: string;
  example_usage?: string[];
}

/**
 * Function parameter documentation
 */
export interface FunctionParameter {
  parameter_name: string;
  parameter_type: string;
  is_required: boolean;
  description: string;
  example_value?: string;
}

/**
 * HIPAA compliance summary for documentation
 */
export interface HIPAASummary {
  total_tables_reviewed: number;
  phi_containing_tables: number;
  high_sensitivity_columns: number;
  compliance_gaps: ComplianceGap[];
  encryption_requirements: EncryptionRequirement[];
  access_control_summary: AccessControlSummary;
  audit_requirements: AuditRequirement[];
  retention_policies: RetentionPolicySummary[];
}

/**
 * Compliance gap identification
 */
export interface ComplianceGap {
  gap_type: 'MISSING_ENCRYPTION' | 'INSUFFICIENT_ACCESS_CONTROL' | 'NO_AUDIT_TRAIL' | 'UNCLEAR_RETENTION' | 'UNCLASSIFIED_PHI';
  affected_tables: string[];
  affected_columns: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: string;
  regulatory_reference?: string;
}

/**
 * Encryption requirement summary
 */
export interface EncryptionRequirement {
  table_name: string;
  columns: string[];
  encryption_type: 'COLUMN_LEVEL' | 'ROW_LEVEL' | 'TABLE_LEVEL' | 'DISK_LEVEL';
  key_management: 'DATABASE' | 'APPLICATION' | 'HSM' | 'CLOUD_KMS';
  compliance_driver: string;
}

/**
 * Access control summary
 */
export interface AccessControlSummary {
  rls_enabled_tables: number;
  role_based_tables: number;
  public_access_tables: number;
  uncontrolled_access_tables: number;
  mfa_required_tables: number;
}

/**
 * Audit requirement summary
 */
export interface AuditRequirement {
  table_name: string;
  audit_level: 'BASIC' | 'DETAILED' | 'COMPREHENSIVE';
  events_to_audit: string[];
  retention_period: string;
  compliance_basis: string;
}

/**
 * Retention policy summary
 */
export interface RetentionPolicySummary {
  policy_name: string;
  affected_tables: string[];
  retention_period: string;
  deletion_method: string;
  legal_holds: boolean;
}

/**
 * Generation metadata
 */
export interface GenerationMetadata {
  generated_at: string;
  generated_by: string;
  generation_mode: 'POSTGRESQL' | 'SQL_PARSING' | 'HYBRID';
  source_files: string[];
  template_version: string;
  validation_passed: boolean;
  generation_duration_ms: number;
}

/**
 * Migration record for change tracking
 */
export interface MigrationRecord {
  migration_name: string;
  applied_at: string;
  changes: string[];
  rollback_available: boolean;
}

/**
 * Validation result for quality assurance
 */
export interface ValidationResult {
  validation_type: 'SCHEMA_CONSISTENCY' | 'HIPAA_COMPLIANCE' | 'NAMING_CONVENTIONS' | 'DOCUMENTATION_COMPLETENESS';
  status: 'PASSED' | 'FAILED' | 'WARNING';
  message: string;
  affected_objects?: string[];
  suggestion?: string;
}

// ==========================================
// Configuration Types
// ==========================================

/**
 * Main configuration for the database glossary system
 */
export interface DatabaseGlossaryConfig {
  database: DatabaseConfig;
  introspection: IntrospectionConfig;
  sql_parsing: SQLParsingConfig;
  hipaa: HIPAAConfig;
  documentation: DocumentationConfig;
  validation: ValidationConfig;
  output: OutputConfig;
}

/**
 * Database connection configuration
 */
export interface DatabaseConfig {
  connection_string?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  schema?: string;
  connection_timeout_ms: number;
  query_timeout_ms: number;
}

/**
 * Introspection configuration
 */
export interface IntrospectionConfig {
  enabled: boolean;
  include_schemas: string[];
  exclude_schemas: string[];
  include_tables: string[];
  exclude_tables: string[];
  include_views: boolean;
  include_materialized_views: boolean;
  include_functions: boolean;
  include_triggers: boolean;
  include_indexes: boolean;
  include_constraints: boolean;
  max_sample_rows: number;
}

/**
 * SQL parsing configuration
 */
export interface SQLParsingConfig {
  enabled: boolean;
  source_directories: string[];
  file_patterns: string[];
  exclude_patterns: string[];
  parse_migrations: boolean;
  parse_seeds: boolean;
  parse_functions: boolean;
  max_file_size_mb: number;
}

/**
 * HIPAA compliance configuration
 */
export interface HIPAAConfig {
  enabled: boolean;
  auto_classify: boolean;
  require_manual_review: boolean;
  classification_rules: HIPAAClassificationRule[];
  default_sensitivity: HIPAASensitivityLevel;
  audit_all_phi: boolean;
  encrypt_by_default: boolean;
}

/**
 * HIPAA classification rule
 */
export interface HIPAAClassificationRule {
  rule_name: string;
  pattern_type: 'COLUMN_NAME' | 'TABLE_NAME' | 'DATA_TYPE' | 'COMMENT';
  pattern: string;
  sensitivity_level: HIPAASensitivityLevel;
  data_categories: HIPAADataCategory[];
  confidence: number; // 0-1
  auto_apply: boolean;
}

/**
 * Documentation generation configuration
 */
export interface DocumentationConfig {
  template_directory: string;
  output_format: 'MARKDOWN' | 'HTML' | 'PDF' | 'JSON';
  include_samples: boolean;
  include_erd: boolean;
  include_migration_history: boolean;
  group_by_domain: boolean;
  custom_sections: string[];
}

/**
 * Validation configuration
 */
export interface ValidationConfig {
  enabled: boolean;
  strict_mode: boolean;
  required_documentation_coverage: number; // 0-100%
  naming_convention_rules: NamingConventionRule[];
  hipaa_validation_rules: HIPAAValidationRule[];
  custom_validation_scripts: string[];
}

/**
 * Naming convention rule
 */
export interface NamingConventionRule {
  rule_name: string;
  object_type: 'TABLE' | 'COLUMN' | 'INDEX' | 'CONSTRAINT' | 'FUNCTION';
  pattern: string;
  description: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
}

/**
 * HIPAA validation rule
 */
export interface HIPAAValidationRule {
  rule_name: string;
  rule_type: 'ENCRYPTION' | 'ACCESS_CONTROL' | 'AUDIT' | 'RETENTION' | 'CLASSIFICATION';
  description: string;
  check_function: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  remediation_guide: string;
}

/**
 * Output configuration
 */
export interface OutputConfig {
  output_directory: string;
  file_name_template: string;
  include_timestamp: boolean;
  compress_output: boolean;
  generate_changelog: boolean;
  backup_previous: boolean;
}

// ==========================================
// Adapter Interface Types
// ==========================================

/**
 * Common interface for database adapters
 */
export interface DatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  introspectSchema(): Promise<DatabaseSchema>;
  validateConnection(): Promise<boolean>;
  getAdapterInfo(): AdapterInfo;
}

/**
 * Common interface for SQL parsing adapters
 */
export interface SQLParsingAdapter {
  parseFiles(file_paths: string[]): Promise<SQLParsingResult[]>;
  parseSingleFile(file_path: string): Promise<SQLParsingResult>;
  validateSQL(sql: string): Promise<boolean>;
  getParserInfo(): AdapterInfo;
}

/**
 * Adapter information
 */
export interface AdapterInfo {
  adapter_name: string;
  adapter_version: string;
  supported_features: string[];
  limitations: string[];
  configuration_schema: object;
}

// ==========================================
// Error Types
// ==========================================

/**
 * Base error for database glossary operations
 */
export class DatabaseGlossaryError extends Error {
  constructor(
    message: string,
    public readonly error_code: string,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'DatabaseGlossaryError';
  }
}

/**
 * Database connection or query errors
 */
export class DatabaseError extends DatabaseGlossaryError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'DATABASE_ERROR', context);
    this.name = 'DatabaseError';
  }
}

/**
 * SQL parsing errors
 */
export class SQLParsingError extends DatabaseGlossaryError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'SQL_PARSING_ERROR', context);
    this.name = 'SQLParsingError';
  }
}

/**
 * HIPAA compliance errors
 */
export class HIPAAComplianceError extends DatabaseGlossaryError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'HIPAA_COMPLIANCE_ERROR', context);
    this.name = 'HIPAAComplianceError';
  }
}

/**
 * Documentation generation errors
 */
export class DocumentationError extends DatabaseGlossaryError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'DOCUMENTATION_ERROR', context);
    this.name = 'DocumentationError';
  }
}

/**
 * Configuration validation errors
 */
export class ConfigurationError extends DatabaseGlossaryError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'CONFIGURATION_ERROR', context);
    this.name = 'ConfigurationError';
  }
}