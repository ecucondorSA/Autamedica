/**
 * @fileoverview PostgreSQL to TypeScript type mapping utilities
 *
 * Maps PostgreSQL types to branded TypeScript types with medical domain intelligence.
 * Supports AutaMedica branded types like PatientId, DoctorId, ISODateTime, etc.
 */

import { pascalCase } from 'change-case';

/**
 * Map PostgreSQL types to TypeScript branded types
 */
export function mapPgToTs(table: string, col: string, pgType: string): string {
  const cleanType = pgType.toLowerCase().replace(/\(.*\)/, '').trim();

  // Handle UUID types with branded IDs
  if (cleanType === "uuid") {
    if (col === "id") {
      return `${pascalCase(table)}Id`; // patients.id → PatientId
    }
    if (/_id$/.test(col)) {
      const entityName = col.replace(/_id$/, "");
      return `${pascalCase(entityName)}Id`; // doctor_id → DoctorId, patient_id → PatientId
    }
    return "UUID";
  }

  // Handle timestamp types
  if (cleanType === "timestamptz" || cleanType === "timestamp") {
    return "ISODateTime";
  }

  if (cleanType === "date") {
    return "ISODate";
  }

  // Handle JSON types
  if (cleanType === "json" || cleanType === "jsonb") {
    // Try to infer more specific type based on column name
    if (col.includes('vital_signs') || col.includes('lab_results')) {
      return "MedicalDataJSON";
    }
    if (col.includes('address') || col.includes('location')) {
      return "AddressJSON";
    }
    return "JsonValue";
  }

  // Handle numeric types
  if (cleanType === "numeric" || cleanType === "decimal") {
    // Medical measurements often need string representation for precision
    if (col.includes('amount') || col.includes('cost') || col.includes('price')) {
      return "MoneyAmount"; // Branded type for financial precision
    }
    if (col.includes('weight') || col.includes('height') || col.includes('dosage')) {
      return "MedicalMeasurement"; // Branded type for medical measurements
    }
    return "number | string";
  }

  // Handle integer types
  if (cleanType.startsWith("int") || ["int2", "int4", "int8", "smallint", "bigint"].includes(cleanType)) {
    if (col.includes('age')) {
      return "AgeInYears"; // Branded type for age
    }
    if (col.includes('count') || col.includes('quantity')) {
      return "PositiveInteger"; // Branded type for counts
    }
    return "number";
  }

  // Handle boolean
  if (cleanType === "bool" || cleanType === "boolean") {
    return "boolean";
  }

  // Handle arrays
  if (cleanType.includes("[]")) {
    const baseType = cleanType.replace("[]", "");
    const mappedBaseType = mapPgToTs(table, col, baseType);
    return `${mappedBaseType}[]`;
  }

  // Handle text types
  if (["text", "varchar", "char", "character"].some(t => cleanType.includes(t))) {
    // Check for specific patterns that should be branded
    if (col.includes('email')) {
      return "EmailAddress";
    }
    if (col.includes('phone')) {
      return "PhoneNumber";
    }
    if (col.includes('ssn') || col.includes('social_security')) {
      return "SSN";
    }
    if (col.includes('license')) {
      return "LicenseNumber";
    }
    if (col.includes('npi')) {
      return "NPINumber";
    }
    if (col.includes('dea')) {
      return "DEANumber";
    }
    if (col.includes('insurance')) {
      return "InsuranceNumber";
    }
    if (col.includes('mrn') || col.includes('medical_record_number')) {
      return "MedicalRecordNumber";
    }
    if (col.includes('diagnosis') && (col.includes('code') || col.includes('icd'))) {
      return "ICD10Code";
    }
    if (col.includes('procedure') && col.includes('code')) {
      return "CPTCode";
    }
    if (col.includes('medication') || col.includes('drug')) {
      return "MedicationName";
    }

    // Length-based decisions for strings
    const lengthMatch = pgType.match(/\((\d+)\)/);
    if (lengthMatch) {
      const length = parseInt(lengthMatch[1]);
      if (length <= 50) {
        return "ShortString"; // Branded type for short strings
      }
      if (length > 1000) {
        return "LongText"; // Branded type for long text
      }
    }

    return "string";
  }

  // Handle INET type
  if (cleanType === "inet") {
    return "IPAddress";
  }

  // Handle CIDR type
  if (cleanType === "cidr") {
    return "CIDRAddress";
  }

  // Handle interval type
  if (cleanType === "interval") {
    return "TimeInterval";
  }

  // Handle point type (for geographic coordinates)
  if (cleanType === "point") {
    return "GeographicPoint";
  }

  // Handle money type
  if (cleanType === "money") {
    return "MoneyAmount";
  }

  // Handle binary data
  if (cleanType === "bytea") {
    if (col.includes('image') || col.includes('photo')) {
      return "ImageData";
    }
    if (col.includes('document') || col.includes('file')) {
      return "DocumentData";
    }
    return "BinaryData";
  }

  // Default fallback
  console.warn(`Unknown PostgreSQL type: ${pgType} for column ${table}.${col}`);
  return "unknown";
}

/**
 * Get import statements needed for the mapped types
 */
export function getRequiredImports(mappedTypes: string[]): string[] {
  const imports = new Set<string>();

  // Standard branded types that need imports
  const brandedTypeImports: Record<string, string> = {
    'PatientId': '@autamedica/types',
    'DoctorId': '@autamedica/types',
    'AppointmentId': '@autamedica/types',
    'CompanyId': '@autamedica/types',
    'UUID': '@autamedica/types',
    'ISODateTime': '@autamedica/types',
    'ISODate': '@autamedica/types',
    'EmailAddress': '@autamedica/types',
    'PhoneNumber': '@autamedica/types',
    'SSN': '@autamedica/types',
    'LicenseNumber': '@autamedica/types',
    'NPINumber': '@autamedica/types',
    'DEANumber': '@autamedica/types',
    'InsuranceNumber': '@autamedica/types',
    'MedicalRecordNumber': '@autamedica/types',
    'ICD10Code': '@autamedica/types',
    'CPTCode': '@autamedica/types',
    'MedicationName': '@autamedica/types',
    'MoneyAmount': '@autamedica/types',
    'MedicalMeasurement': '@autamedica/types',
    'AgeInYears': '@autamedica/types',
    'PositiveInteger': '@autamedica/types',
    'ShortString': '@autamedica/types',
    'LongText': '@autamedica/types',
    'JsonValue': '@autamedica/types',
    'MedicalDataJSON': '@autamedica/types',
    'AddressJSON': '@autamedica/types',
    'IPAddress': '@autamedica/types',
    'CIDRAddress': '@autamedica/types',
    'TimeInterval': '@autamedica/types',
    'GeographicPoint': '@autamedica/types',
    'ImageData': '@autamedica/types',
    'DocumentData': '@autamedica/types',
    'BinaryData': '@autamedica/types'
  };

  for (const type of mappedTypes) {
    // Handle array types
    const baseType = type.replace(/\[\]$/, '');

    if (brandedTypeImports[baseType]) {
      imports.add(brandedTypeImports[baseType]);
    }
  }

  return Array.from(imports);
}

/**
 * Generate TypeScript interface from PostgreSQL table
 */
export function generateTableInterface(
  tableName: string,
  columns: Array<{
    column_name: string;
    data_type: string;
    is_nullable: boolean;
    is_primary_key: boolean;
    column_comment?: string;
  }>
): string {
  const interfaceName = pascalCase(tableName);
  const requiredImports = getRequiredImports(
    columns.map(col => mapPgToTs(tableName, col.column_name, col.data_type))
  );

  let output = '';

  // Add imports
  if (requiredImports.length > 0) {
    const groupedImports = requiredImports.reduce((acc, importPath) => {
      if (!acc[importPath]) acc[importPath] = [];
      return acc;
    }, {} as Record<string, string[]>);

    for (const [importPath, types] of Object.entries(groupedImports)) {
      output += `import type { ${Array.from(new Set(columns.map(col => mapPgToTs(tableName, col.column_name, col.data_type)).filter(type =>
        getRequiredImports([type]).includes(importPath)
      ))).join(', ')} } from '${importPath}';\n`;
    }
    output += '\n';
  }

  // Add interface
  output += `/**\n * ${interfaceName} table interface\n`;
  if (columns.some(col => col.column_comment)) {
    output += ` * \n * Generated from PostgreSQL table: ${tableName}\n`;
  }
  output += ` */\n`;
  output += `export interface ${interfaceName} {\n`;

  for (const column of columns) {
    const tsType = mapPgToTs(tableName, column.column_name, column.data_type);
    const optional = column.is_nullable && !column.is_primary_key ? '?' : '';

    if (column.column_comment) {
      output += `  /** ${column.column_comment} */\n`;
    }

    output += `  ${column.column_name}${optional}: ${tsType};\n`;
  }

  output += '}\n\n';

  // Add Insert and Update types
  output += `export type ${interfaceName}Insert = Omit<${interfaceName}, 'id' | 'created_at' | 'updated_at'>;\n`;
  output += `export type ${interfaceName}Update = Partial<${interfaceName}Insert>;\n`;

  return output;
}

/**
 * Medical domain type mappings for enhanced classification
 */
export const MEDICAL_TYPE_MAPPINGS: Record<string, string> = {
  // Patient identifiers
  'patient_id': 'PatientId',
  'medical_record_number': 'MedicalRecordNumber',
  'mrn': 'MedicalRecordNumber',

  // Provider identifiers
  'doctor_id': 'DoctorId',
  'provider_id': 'ProviderId',
  'npi_number': 'NPINumber',
  'license_number': 'LicenseNumber',
  'dea_number': 'DEANumber',

  // Medical codes
  'diagnosis_code': 'ICD10Code',
  'icd10_code': 'ICD10Code',
  'procedure_code': 'CPTCode',
  'cpt_code': 'CPTCode',
  'drug_code': 'NDCCode',
  'ndc_code': 'NDCCode',

  // Contact information
  'email': 'EmailAddress',
  'email_address': 'EmailAddress',
  'phone': 'PhoneNumber',
  'phone_number': 'PhoneNumber',
  'mobile_phone': 'PhoneNumber',

  // Sensitive data
  'ssn': 'SSN',
  'social_security_number': 'SSN',
  'tax_id': 'TaxID',
  'ein': 'EmployerID',

  // Financial
  'insurance_number': 'InsuranceNumber',
  'policy_number': 'InsuranceNumber',
  'member_id': 'InsuranceNumber',
  'amount': 'MoneyAmount',
  'cost': 'MoneyAmount',
  'price': 'MoneyAmount',
  'copay': 'MoneyAmount',
  'deductible': 'MoneyAmount',

  // Medical measurements
  'height': 'HeightMeasurement',
  'weight': 'WeightMeasurement',
  'blood_pressure': 'BloodPressure',
  'temperature': 'Temperature',
  'heart_rate': 'HeartRate',
  'dosage': 'MedicationDosage',

  // Dates and times
  'date_of_birth': 'BirthDate',
  'dob': 'BirthDate',
  'birth_date': 'BirthDate',
  'appointment_date': 'AppointmentDate',
  'visit_date': 'VisitDate',
  'created_at': 'ISODateTime',
  'updated_at': 'ISODateTime'
};

/**
 * Check if a column contains PHI based on name and type
 */
export function isPHIColumn(columnName: string, dataType: string, tableName: string): boolean {
  const lowerName = columnName.toLowerCase();
  const lowerTable = tableName.toLowerCase();

  // Known PHI patterns
  const phiPatterns = [
    /^(first_name|last_name|full_name|patient_name)$/,
    /^.*_name$/,
    /^(email|email_address)$/,
    /^.*_email$/,
    /^(phone|phone_number|mobile|cell)$/,
    /^.*_phone$/,
    /^(ssn|social_security_number)$/,
    /^(address|street|city|state|zip|postal)$/,
    /^.*_address$/,
    /^(dob|date_of_birth|birth_date)$/,
    /^(mrn|medical_record_number)$/,
    /^.*_notes$/,
    /^.*_history$/,
    /^(diagnosis|medication|prescription)$/,
    /^.*_result$/
  ];

  // Check if column name matches PHI patterns
  const matchesPattern = phiPatterns.some(pattern => pattern.test(lowerName));

  // Check if table is patient-related
  const isPatientTable = ['patient', 'medical', 'clinical', 'prescription', 'lab'].some(
    keyword => lowerTable.includes(keyword)
  );

  return matchesPattern || (isPatientTable && ['text', 'varchar', 'char'].some(type =>
    dataType.toLowerCase().includes(type)
  ));
}

/**
 * Generate HIPAA sensitivity classification
 */
export function getHIPAASensitivity(columnName: string, dataType: string, tableName: string): string {
  const lowerName = columnName.toLowerCase();

  // Genetic information - highest sensitivity
  if (lowerName.includes('genetic') || lowerName.includes('dna') || lowerName.includes('gene')) {
    return 'GENETIC';
  }

  // Mental health information
  if (lowerName.includes('psychiatric') || lowerName.includes('mental') || lowerName.includes('therapy')) {
    return 'PSYCHIATRIC';
  }

  // Highly sensitive PHI
  if (['ssn', 'social_security_number', 'tax_id'].includes(lowerName) ||
      lowerName.includes('diagnosis') || lowerName.includes('medical_record')) {
    return 'HIGHLY_SENSITIVE';
  }

  // Standard PHI
  if (isPHIColumn(columnName, dataType, tableName)) {
    return 'RESTRICTED';
  }

  // Internal system data
  if (['id', 'created_at', 'updated_at', 'version'].includes(lowerName) ||
      lowerName.endsWith('_id')) {
    return 'INTERNAL';
  }

  // Public data
  return 'PUBLIC';
}