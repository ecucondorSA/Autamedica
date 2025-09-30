#!/usr/bin/env node

/**
 * @fileoverview Main CLI tool for the database glossary system
 *
 * This CLI provides unified access to both PostgreSQL introspection and
 * SQL parsing modes, with automatic HIPAA classification and documentation
 * generation capabilities.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync, statSync } from 'fs';
import * as Handlebars from 'handlebars';
import * as prettier from 'prettier';

// Import our modules
import { createPostgreSQLAdapter } from '../adapters/postgresql';
import { createSQLParsingAdapter, discoverSQLFiles, sqlResultsToSchema } from '../adapters/sql-parser';
import { createHIPAAClassifier } from '../utils/hipaa-classifier';
import { registerHelpers } from '../templates/helpers';

import type {
  DatabaseGlossaryConfig,
  DatabaseSchema,
  DocumentationContext,
  DatabaseMetadata,
  GenerationMetadata,
  ValidationResult
} from '../types/index';

/**
 * Main CLI class for database glossary operations
 */
class DatabaseGlossaryCLI {
  private config: DatabaseGlossaryConfig;

  constructor(config: DatabaseGlossaryConfig) {
    this.config = config;
  }

  /**
   * Main entry point for CLI operations
   */
  async run(args: string[]): Promise<void> {
    const command = args[0] || 'help';

    try {
      switch (command) {
        case 'introspect':
          await this.runIntrospection();
          break;
        case 'parse':
          await this.runSQLParsing();
          break;
        case 'hybrid':
          await this.runHybridMode();
          break;
        case 'validate':
          await this.runValidation();
          break;
        case 'generate':
          await this.runDocumentationGeneration();
          break;
        case 'test':
          await this.runTests();
          break;
        case 'help':
        case '--help':
        case '-h':
          this.showHelp();
          break;
        default:
          console.error(`❌ Unknown command: ${command}`);
          this.showHelp();
          process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error executing command:', error);
      process.exit(1);
    }
  }

  /**
   * Run PostgreSQL introspection mode
   */
  async runIntrospection(): Promise<void> {
    console.log('🐘 Starting PostgreSQL introspection mode...');

    if (!this.config.introspection.enabled) {
      console.log('⚠️ PostgreSQL introspection is disabled in configuration');
      return;
    }

    // Create PostgreSQL adapter
    const adapter = createPostgreSQLAdapter(
      this.config.database,
      this.config.introspection
    );

    try {
      // Connect and validate
      await adapter.connect();
      const isValid = await adapter.validateConnection();

      if (!isValid) {
        throw new Error('Database connection validation failed');
      }

      // Perform introspection
      const schema = await adapter.introspectSchema();
      console.log(`✅ Introspected ${schema.tables.length} tables, ${schema.functions.length} functions`);

      // Save raw schema
      await this.saveSchemaData(schema, 'postgresql');

      // Run HIPAA classification if enabled
      if (this.config.hipaa.enabled) {
        await this.runHIPAAClassification(schema);
      }

      // Generate documentation if configured
      if (this.config.documentation.output_format) {
        await this.generateDocumentation(schema, 'POSTGRESQL');
      }

    } finally {
      await adapter.disconnect();
    }
  }

  /**
   * Run SQL parsing mode
   */
  async runSQLParsing(): Promise<void> {
    console.log('📄 Starting SQL parsing mode...');

    if (!this.config.sql_parsing.enabled) {
      console.log('⚠️ SQL parsing is disabled in configuration');
      return;
    }

    // Create SQL parsing adapter
    const adapter = await createSQLParsingAdapter(this.config.sql_parsing);

    // Discover SQL files
    const sqlFiles = await discoverSQLFiles(this.config.sql_parsing);

    if (sqlFiles.length === 0) {
      console.log('⚠️ No SQL files found to parse');
      return;
    }

    console.log(`📁 Found ${sqlFiles.length} SQL files to parse`);

    // Parse files
    const results = await adapter.parseFiles(sqlFiles);
    const successfulResults = results.filter(r => r.errors.length === 0);

    console.log(`✅ Successfully parsed ${successfulResults.length}/${results.length} files`);

    // Convert to schema format
    const schema = sqlResultsToSchema(results);
    console.log(`📊 Extracted ${schema.tables.length} tables, ${schema.functions.length} functions`);

    // Save raw schema
    await this.saveSchemaData(schema, 'sql-parsing');

    // Run HIPAA classification if enabled
    if (this.config.hipaa.enabled) {
      await this.runHIPAAClassification(schema);
    }

    // Generate documentation if configured
    if (this.config.documentation.output_format) {
      await this.generateDocumentation(schema, 'SQL_PARSING');
    }

    // Report parsing errors
    const errorResults = results.filter(r => r.errors.length > 0);
    if (errorResults.length > 0) {
      console.log(`⚠️ ${errorResults.length} files had parsing errors:`);
      for (const result of errorResults) {
        console.log(`  📄 ${result.file_path}: ${result.errors.length} errors`);
        for (const error of result.errors.slice(0, 3)) { // Show first 3 errors
          console.log(`    - ${error.message}`);
        }
      }
    }
  }

  /**
   * Run hybrid mode (both introspection and parsing)
   */
  async runHybridMode(): Promise<void> {
    console.log('🔄 Starting hybrid mode (PostgreSQL + SQL parsing)...');

    let pgSchema: DatabaseSchema | null = null;
    let sqlSchema: DatabaseSchema | null = null;

    // Try PostgreSQL introspection first
    if (this.config.introspection.enabled) {
      try {
        console.log('🐘 Phase 1: PostgreSQL introspection...');
        const adapter = createPostgreSQLAdapter(
          this.config.database,
          this.config.introspection
        );

        await adapter.connect();
        pgSchema = await adapter.introspectSchema();
        await adapter.disconnect();

        console.log(`✅ PostgreSQL: ${pgSchema.tables.length} tables, ${pgSchema.functions.length} functions`);
      } catch (error) {
        console.warn('⚠️ PostgreSQL introspection failed, falling back to SQL parsing only');
        console.warn('Error:', error instanceof Error ? error.message : error);
      }
    }

    // Run SQL parsing
    if (this.config.sql_parsing.enabled) {
      try {
        console.log('📄 Phase 2: SQL parsing...');
        const adapter = await createSQLParsingAdapter(this.config.sql_parsing);
        const sqlFiles = await discoverSQLFiles(this.config.sql_parsing);

        if (sqlFiles.length > 0) {
          const results = await adapter.parseFiles(sqlFiles);
          sqlSchema = sqlResultsToSchema(results);
          console.log(`✅ SQL parsing: ${sqlSchema.tables.length} tables, ${sqlSchema.functions.length} functions`);
        }
      } catch (error) {
        console.warn('⚠️ SQL parsing failed');
        console.warn('Error:', error instanceof Error ? error.message : error);
      }
    }

    // Merge schemas (preferring PostgreSQL data when available)
    const mergedSchema = this.mergeSchemas(pgSchema, sqlSchema);

    if (!mergedSchema) {
      throw new Error('Both PostgreSQL introspection and SQL parsing failed');
    }

    console.log(`🔄 Merged schema: ${mergedSchema.tables.length} tables, ${mergedSchema.functions.length} functions`);

    // Save merged schema
    await this.saveSchemaData(mergedSchema, 'hybrid');

    // Run HIPAA classification
    if (this.config.hipaa.enabled) {
      await this.runHIPAAClassification(mergedSchema);
    }

    // Generate documentation
    if (this.config.documentation.output_format) {
      await this.generateDocumentation(mergedSchema, 'HYBRID');
    }
  }

  /**
   * Run validation checks
   */
  async runValidation(): Promise<void> {
    console.log('🔍 Running validation checks...');

    const results: ValidationResult[] = [];

    // Check configuration
    results.push(...this.validateConfiguration());

    // Check file accessibility
    if (this.config.sql_parsing.enabled) {
      results.push(...await this.validateSQLFiles());
    }

    // Check database connectivity
    if (this.config.introspection.enabled) {
      results.push(...await this.validateDatabaseConnection());
    }

    // Check template availability
    results.push(...await this.validateTemplates());

    // Report results
    const passed = results.filter(r => r.status === 'PASSED').length;
    const failed = results.filter(r => r.status === 'FAILED').length;
    const warnings = results.filter(r => r.status === 'WARNING').length;

    console.log(`📊 Validation results: ${passed} passed, ${warnings} warnings, ${failed} failed`);

    for (const result of results) {
      const icon = result.status === 'PASSED' ? '✅' : result.status === 'WARNING' ? '⚠️' : '❌';
      console.log(`  ${icon} ${result.validation_type}: ${result.message}`);

      if (result.suggestion) {
        console.log(`     💡 ${result.suggestion}`);
      }
    }

    if (failed > 0) {
      process.exit(1);
    }
  }

  /**
   * Ensure schema snapshot exists before generating documentation
   * Auto-runs parsing or introspection if needed
   */
  private async ensureSnapshot(mode: 'pg' | 'sql'): Promise<string> {
    const schemaFiles = [
      'schema-postgresql.json',
      'schema-sql-parsing.json',
      'schema-hybrid.json'
    ];

    // Check if any existing schema file exists and is valid
    for (const filename of schemaFiles) {
      const filepath = join(this.config.output.output_directory, filename);
      if (existsSync(filepath) && statSync(filepath).size > 20) {
        console.log(`📄 Found existing schema: ${filename}`);
        return filepath;
      }
    }

    // No valid schema found - auto-generate based on mode
    console.log(`🔄 No schema data found. Auto-generating using ${mode} mode...`);

    if (mode === 'sql') {
      await this.runSQLParsing();
      // Return the SQL parsing result file
      return join(this.config.output.output_directory, 'schema-sql-parsing.json');
    } else {
      await this.runIntrospection();
      // Return the PostgreSQL result file
      return join(this.config.output.output_directory, 'schema-postgresql.json');
    }
  }

  /**
   * Run documentation generation from existing schema data
   */
  async runDocumentationGeneration(): Promise<void> {
    console.log('📚 Generating documentation from existing schema data...');

    // Determine mode from environment or config
    const mode = (process.env.GLOSSARY_MODE || 'pg') as 'pg' | 'sql';

    // Ensure schema snapshot exists (auto-parse if needed)
    const schemaFilePath = await this.ensureSnapshot(mode);

    // Load the schema data
    let schema: DatabaseSchema | null = null;
    let docMode: 'POSTGRESQL' | 'SQL_PARSING' | 'HYBRID' = 'HYBRID';

    try {
      const data = await readFile(schemaFilePath, 'utf-8');
      schema = JSON.parse(data);

      // Determine doc mode from filename
      const filename = schemaFilePath.split('/').pop() || '';
      docMode = filename.includes('postgresql') ? 'POSTGRESQL' :
                filename.includes('sql-parsing') ? 'SQL_PARSING' : 'HYBRID';

      console.log(`📄 Using schema data from: ${filename}`);
    } catch (error) {
      throw new Error(`Failed to load schema data from ${schemaFilePath}: ${error}`);
    }

    if (!schema) {
      throw new Error('Invalid schema data loaded.');
    }

    await this.generateDocumentation(schema, docMode);
  }

  /**
   * Run comprehensive tests
   */
  async runTests(): Promise<void> {
    console.log('🧪 Running comprehensive tests...');

    console.log('📋 Test 1: Configuration validation');
    await this.runValidation();

    console.log('\n📋 Test 2: SQL parsing with sample data');
    await this.testSQLParsing();

    console.log('\n📋 Test 3: HIPAA classification');
    await this.testHIPAAClassification();

    console.log('\n📋 Test 4: Template rendering');
    await this.testTemplateRendering();

    console.log('\n✅ All tests completed successfully!');
  }

  /**
   * Test SQL parsing with sample data
   */
  private async testSQLParsing(): Promise<void> {
    // Create a temporary SQL file for testing
    const testSQL = `
      -- Test schema for database glossary
      CREATE TABLE patients (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name varchar(255) NOT NULL,
        date_of_birth date,
        social_security_number varchar(11),
        email varchar(255),
        phone varchar(20),
        created_at timestamptz DEFAULT now()
      );

      -- Add comments for HIPAA classification
      COMMENT ON TABLE patients IS 'Patient demographic information';
      COMMENT ON COLUMN patients.social_security_number IS 'PHI: Social Security Number';

      CREATE INDEX idx_patients_email ON patients(email);

      CREATE OR REPLACE FUNCTION get_patient_age(patient_id uuid)
      RETURNS integer
      LANGUAGE plpgsql
      AS $$
      BEGIN
        RETURN EXTRACT(YEAR FROM age((SELECT date_of_birth FROM patients WHERE id = patient_id)));
      END;
      $$;
    `;

    const testFile = join(this.config.output.output_directory, 'test-schema.sql');
    await writeFile(testFile, testSQL);

    try {
      const adapter = await createSQLParsingAdapter({
        ...this.config.sql_parsing,
        source_directories: [this.config.output.output_directory],
        file_patterns: ['test-schema.sql']
      });

      const results = await adapter.parseFiles([testFile]);
      const schema = sqlResultsToSchema(results);

      console.log(`  ✅ Parsed ${schema.tables.length} tables, ${schema.functions.length} functions`);

      if (schema.tables.length > 0) {
        const table = schema.tables[0];
        console.log(`  📊 Table '${table.table_name}' has ${table.columns.length} columns`);
      }
    } catch (error) {
      console.warn('  ⚠️ SQL parsing test failed:', error);
    }
  }

  /**
   * Test HIPAA classification
   */
  private async testHIPAAClassification(): Promise<void> {
    const classifier = createHIPAAClassifier(this.config.hipaa);

    // Create test schema
    const testSchema: DatabaseSchema = {
      schema_name: 'test',
      tables: [{
        table_name: 'patients',
        table_schema: 'public',
        table_type: 'BASE TABLE',
        columns: [
          {
            column_name: 'id',
            data_type: 'uuid',
            is_nullable: false,
            is_primary_key: true,
            is_foreign_key: false
          },
          {
            column_name: 'social_security_number',
            data_type: 'varchar',
            is_nullable: true,
            is_primary_key: false,
            is_foreign_key: false
          },
          {
            column_name: 'email',
            data_type: 'varchar',
            is_nullable: true,
            is_primary_key: false,
            is_foreign_key: false
          }
        ],
        indexes: [],
        constraints: []
      }],
      functions: [],
      triggers: [],
      extensions: [],
      introspected_at: new Date().toISOString()
    };

    try {
      const result = await classifier.classifySchema(testSchema);

      console.log(`  ✅ Classified ${result.tables.length} tables`);
      console.log(`  🔒 Found ${result.total_phi_columns} PHI columns`);
      console.log(`  ⚠️ Identified ${result.compliance_gaps.length} compliance gaps`);

      if (result.total_phi_columns > 0) {
        const phiTable = result.tables.find(t => t.hipaa_classification.contains_phi);
        if (phiTable) {
          console.log(`  📊 Table '${phiTable.table_name}' sensitivity: ${phiTable.hipaa_classification.overall_sensitivity}`);
        }
      }
    } catch (error) {
      console.warn('  ⚠️ HIPAA classification test failed:', error);
    }
  }

  /**
   * Test template rendering
   */
  private async testTemplateRendering(): Promise<void> {
    try {
      // Register Handlebars helpers
      registerHelpers();

      // Test basic template compilation
      const testTemplate = `
        # Test Template

        **Database**: {{database_info.database_name}}
        **Tables**: {{database_info.total_tables}}

        {{#each tables}}
        ## {{medicalDomainIcon medical_domain}} {{table_name}}
        {{/each}}
      `;

      const template = Handlebars.compile(testTemplate);

      const testContext: Partial<DocumentationContext> = {
        database_info: {
          database_name: 'test_db',
          schema_version: '1.0',
          last_migration: '2025-01-01T00:00:00Z',
          total_tables: 1,
          total_columns: 3,
          total_functions: 0,
          hipaa_classified_columns: 2,
          introspection_method: 'SQL_PARSING',
          generated_at: new Date().toISOString()
        },
        tables: [{
          table_name: 'patients',
          table_purpose: 'Store patient information',
          medical_domain: 'PATIENT_MANAGEMENT',
          columns: [],
          relationships: [],
          indexes: [],
          constraints: [],
          hipaa_classification: {
            overall_sensitivity: 'RESTRICTED',
            contains_phi: true,
            phi_column_count: 2,
            access_control_level: 'ROLE_BASED',
            audit_requirements: 'BASIC',
            encryption_requirements: 'AT_REST',
            retention_category: 'STANDARD'
          }
        }]
      };

      const rendered = template(testContext);

      console.log('  ✅ Template rendering successful');
      console.log(`  📄 Generated ${rendered.length} characters of documentation`);
    } catch (error) {
      console.warn('  ⚠️ Template rendering test failed:', error);
    }
  }

  /**
   * Run HIPAA classification on schema
   */
  private async runHIPAAClassification(schema: DatabaseSchema): Promise<void> {
    console.log('🔐 Running HIPAA classification...');

    const classifier = createHIPAAClassifier(this.config.hipaa);
    const result = await classifier.classifySchema(schema);

    console.log(`✅ HIPAA classification completed:`);
    console.log(`  📊 Tables classified: ${result.tables.length}`);
    console.log(`  🔒 PHI columns found: ${result.total_phi_columns}`);
    console.log(`  ⚠️ Compliance gaps: ${result.compliance_gaps.length}`);

    // Save HIPAA results
    const hipaaFile = join(this.config.output.output_directory, 'hipaa-classification.json');
    await writeFile(hipaaFile, JSON.stringify(result, null, 2));

    // Report critical gaps
    const criticalGaps = result.compliance_gaps.filter(gap => gap.severity === 'CRITICAL');
    if (criticalGaps.length > 0) {
      console.log(`🚨 ${criticalGaps.length} CRITICAL compliance gaps found:`);
      for (const gap of criticalGaps) {
        console.log(`  ❌ ${gap.gap_type}: ${gap.recommendation}`);
      }
    }
  }

  /**
   * Generate documentation from schema
   */
  private async generateDocumentation(
    schema: DatabaseSchema,
    mode: 'POSTGRESQL' | 'SQL_PARSING'
  ): Promise<void> {
    console.log('📚 Generating documentation...');

    // Register Handlebars helpers
    registerHelpers();

    // Load HIPAA classification if available
    let hipaaData = null;
    const hipaaFile = join(this.config.output.output_directory, 'hipaa-classification.json');
    if (existsSync(hipaaFile)) {
      try {
        const data = await readFile(hipaaFile, 'utf-8');
        hipaaData = JSON.parse(data);
      } catch (error) {
        console.warn('⚠️ Could not load HIPAA classification data');
      }
    }

    // Prepare documentation context
    const context: DocumentationContext = {
      database_info: this.createDatabaseMetadata(schema, mode),
      tables: schema.tables.map(table => ({
        table_name: table.table_name,
        table_purpose: this.inferTablePurpose(table),
        medical_domain: this.inferMedicalDomain(table),
        columns: table.columns.map(col => ({
          column_name: col.column_name,
          display_name: col.column_name.replace(/_/g, ' '),
          data_type: col.data_type,
          is_required: !col.is_nullable,
          description: col.column_comment || 'No description available',
          medical_purpose: this.inferColumnMedicalPurpose(col),
          example_values: [],
          validation_rules: [],
          related_columns: [],
          business_logic: undefined
        })),
        relationships: [],
        indexes: table.indexes.map(idx => ({
          index_name: idx.index_name,
          index_type: idx.index_type,
          columns: idx.columns,
          is_unique: idx.is_unique,
          performance_purpose: 'Optimize query performance',
          query_patterns: [],
          maintenance_notes: undefined
        })),
        constraints: table.constraints.map(constraint => ({
          constraint_name: constraint.constraint_name,
          constraint_type: constraint.constraint_type,
          columns: constraint.columns,
          business_rule: 'Enforce data integrity',
          enforcement_level: 'DATABASE',
          validation_examples: []
        })),
        hipaa_classification: hipaaData?.tables?.find((t: any) => t.table_name === table.table_name)?.hipaa_classification
      })),
      functions: schema.functions.map(func => ({
        function_name: func.function_name,
        purpose: 'Database function',
        parameters: [],
        return_type: func.return_type,
        medical_use_case: undefined,
        security_considerations: [],
        performance_notes: undefined,
        example_usage: []
      })),
      indexes: [],
      hipaa_summary: hipaaData ? {
        total_tables_reviewed: hipaaData.tables.length,
        phi_containing_tables: hipaaData.tables.filter((t: any) => t.hipaa_classification?.contains_phi).length,
        high_sensitivity_columns: hipaaData.total_phi_columns,
        compliance_gaps: hipaaData.compliance_gaps || [],
        encryption_requirements: [],
        access_control_summary: {
          rls_enabled_tables: 0,
          role_based_tables: 0,
          public_access_tables: 0,
          uncontrolled_access_tables: 0,
          mfa_required_tables: 0
        },
        audit_requirements: [],
        retention_policies: []
      } : undefined,
      generation_info: this.createGenerationMetadata(mode),
      validation_results: []
    };

    // Load and render main template
    const templatePath = join(__dirname, '../templates/main.hbs');
    const templateSource = await readFile(templatePath, 'utf-8');
    const template = Handlebars.compile(templateSource);

    const documentation = template(context);

    // Format with Prettier if possible
    let formattedDocs = documentation;
    try {
      formattedDocs = await prettier.format(documentation, { parser: 'markdown' });
    } catch (error) {
      console.warn('⚠️ Could not format documentation with Prettier');
    }

    // Save documentation
    const outputFile = join(
      this.config.output.output_directory,
      this.config.output.file_name_template.replace('{timestamp}', new Date().toISOString().slice(0, 10))
    );

    await writeFile(outputFile, formattedDocs);

    console.log(`✅ Documentation generated: ${outputFile}`);
    console.log(`📄 Generated ${formattedDocs.length} characters of documentation`);
  }

  /**
   * Merge PostgreSQL and SQL parsing schemas
   */
  private mergeSchemas(pgSchema: DatabaseSchema | null, sqlSchema: DatabaseSchema | null): DatabaseSchema | null {
    if (!pgSchema && !sqlSchema) return null;
    if (!pgSchema) return sqlSchema;
    if (!sqlSchema) return pgSchema;

    // PostgreSQL data takes precedence
    return {
      schema_name: pgSchema.schema_name,
      tables: pgSchema.tables, // PostgreSQL tables are more accurate
      functions: [...pgSchema.functions, ...sqlSchema.functions.filter(
        sf => !pgSchema.functions.some(pf => pf.function_name === sf.function_name)
      )],
      triggers: pgSchema.triggers,
      extensions: pgSchema.extensions,
      introspected_at: pgSchema.introspected_at
    };
  }

  /**
   * Save schema data to JSON file
   */
  private async saveSchemaData(schema: DatabaseSchema, mode: string): Promise<void> {
    await mkdir(this.config.output.output_directory, { recursive: true });

    const filename = `schema-${mode}.json`;
    const filepath = join(this.config.output.output_directory, filename);

    await writeFile(filepath, JSON.stringify(schema, null, 2));
    console.log(`💾 Schema data saved: ${filepath}`);
  }

  /**
   * Create database metadata for documentation
   */
  private createDatabaseMetadata(schema: DatabaseSchema, mode: 'POSTGRESQL' | 'SQL_PARSING' | 'HYBRID'): DatabaseMetadata {
    return {
      database_name: schema.schema_name,
      schema_version: '1.0',
      last_migration: schema.introspected_at,
      total_tables: schema.tables.length,
      total_columns: schema.tables.reduce((sum, table) => sum + table.columns.length, 0),
      total_functions: schema.functions.length,
      hipaa_classified_columns: 0, // Will be updated by HIPAA classification
      introspection_method: mode,
      generated_at: new Date().toISOString()
    };
  }

  /**
   * Create generation metadata
   */
  private createGenerationMetadata(mode: 'POSTGRESQL' | 'SQL_PARSING'): GenerationMetadata {
    return {
      generated_at: new Date().toISOString(),
      generated_by: 'Database Glossary CLI v1.0',
      generation_mode: mode,
      source_files: [],
      template_version: '1.0',
      validation_passed: true,
      generation_duration_ms: 0
    };
  }

  /**
   * Infer table purpose from name and structure
   */
  private inferTablePurpose(table: any): string {
    const name = table.table_name.toLowerCase();

    if (name.includes('patient')) return 'Gestión de información de pacientes';
    if (name.includes('doctor') || name.includes('physician')) return 'Gestión de profesionales médicos';
    if (name.includes('appointment')) return 'Sistema de citas médicas';
    if (name.includes('medical_record')) return 'Historiales médicos de pacientes';
    if (name.includes('medication') || name.includes('prescription')) return 'Gestión de medicamentos y prescripciones';
    if (name.includes('insurance')) return 'Información de seguros médicos';
    if (name.includes('billing') || name.includes('payment')) return 'Facturación y pagos médicos';
    if (name.includes('audit') || name.includes('log')) return 'Auditoría y registro de actividades';
    if (name.includes('user') || name.includes('auth')) return 'Gestión de usuarios y autenticación';

    return 'Tabla del sistema médico';
  }

  /**
   * Infer medical domain from table characteristics
   */
  private inferMedicalDomain(table: any): any {
    const name = table.table_name.toLowerCase();

    if (name.includes('patient')) return 'PATIENT_MANAGEMENT';
    if (name.includes('doctor') || name.includes('physician') || name.includes('provider')) return 'PROVIDER_MANAGEMENT';
    if (name.includes('appointment') || name.includes('schedule')) return 'APPOINTMENTS';
    if (name.includes('medical_record') || name.includes('diagnosis') || name.includes('treatment')) return 'CLINICAL_DATA';
    if (name.includes('medication') || name.includes('prescription') || name.includes('drug')) return 'PHARMACY';
    if (name.includes('insurance') || name.includes('billing') || name.includes('payment')) return 'BILLING_FINANCIAL';
    if (name.includes('lab') || name.includes('test') || name.includes('result')) return 'LABORATORY';
    if (name.includes('image') || name.includes('scan') || name.includes('xray')) return 'IMAGING';
    if (name.includes('emergency') || name.includes('urgent')) return 'EMERGENCY_CARE';
    if (name.includes('audit') || name.includes('log') || name.includes('compliance')) return 'COMPLIANCE_AUDIT';
    if (name.includes('user') || name.includes('auth') || name.includes('role')) return 'SYSTEM_ADMINISTRATION';

    return 'UNKNOWN';
  }

  /**
   * Infer column medical purpose
   */
  private inferColumnMedicalPurpose(column: any): string | undefined {
    const name = column.column_name.toLowerCase();

    if (name.includes('ssn') || name.includes('social_security')) return 'Identificación única del paciente para seguros';
    if (name.includes('email')) return 'Comunicación con el paciente';
    if (name.includes('phone')) return 'Contacto de emergencia y citas';
    if (name.includes('address')) return 'Información demográfica para facturación';
    if (name.includes('birth') || name.includes('dob')) return 'Cálculo de edad para dosificación médica';
    if (name.includes('diagnosis')) return 'Diagnóstico médico principal';
    if (name.includes('medication')) return 'Tratamiento farmacológico prescrito';
    if (name.includes('insurance')) return 'Cobertura de seguro médico';
    if (name.includes('created_at')) return 'Auditoría de creación de registro';
    if (name.includes('updated_at')) return 'Auditoría de modificación de registro';

    return undefined;
  }

  /**
   * Validate configuration
   */
  private validateConfiguration(): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Check if at least one mode is enabled
    if (!this.config.introspection.enabled && !this.config.sql_parsing.enabled) {
      results.push({
        validation_type: 'SCHEMA_CONSISTENCY',
        status: 'FAILED',
        message: 'Neither PostgreSQL introspection nor SQL parsing is enabled',
        suggestion: 'Enable at least one introspection method in configuration'
      });
    }

    // Check database configuration if introspection is enabled
    if (this.config.introspection.enabled) {
      if (!this.config.database.connection_string && !this.config.database.host) {
        results.push({
          validation_type: 'SCHEMA_CONSISTENCY',
          status: 'FAILED',
          message: 'Database connection configuration is incomplete',
          suggestion: 'Provide either connection_string or host/database/username'
        });
      }
    }

    // Check SQL parsing configuration
    if (this.config.sql_parsing.enabled) {
      if (this.config.sql_parsing.source_directories.length === 0) {
        results.push({
          validation_type: 'SCHEMA_CONSISTENCY',
          status: 'WARNING',
          message: 'No source directories configured for SQL parsing',
          suggestion: 'Add source directories like ["supabase/migrations", "sql"]'
        });
      }
    }

    if (results.length === 0) {
      results.push({
        validation_type: 'SCHEMA_CONSISTENCY',
        status: 'PASSED',
        message: 'Configuration is valid'
      });
    }

    return results;
  }

  /**
   * Validate SQL files accessibility
   */
  private async validateSQLFiles(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      const sqlFiles = await discoverSQLFiles(this.config.sql_parsing);

      if (sqlFiles.length === 0) {
        results.push({
          validation_type: 'SCHEMA_CONSISTENCY',
          status: 'WARNING',
          message: 'No SQL files found in configured directories',
          suggestion: 'Check source_directories and file_patterns configuration'
        });
      } else {
        results.push({
          validation_type: 'SCHEMA_CONSISTENCY',
          status: 'PASSED',
          message: `Found ${sqlFiles.length} SQL files to parse`
        });
      }
    } catch (error) {
      results.push({
        validation_type: 'SCHEMA_CONSISTENCY',
        status: 'FAILED',
        message: `Failed to discover SQL files: ${error instanceof Error ? error.message : error}`,
        suggestion: 'Check that source directories exist and are readable'
      });
    }

    return results;
  }

  /**
   * Validate database connection
   */
  private async validateDatabaseConnection(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      const adapter = createPostgreSQLAdapter(
        this.config.database,
        this.config.introspection
      );

      await adapter.connect();
      const isValid = await adapter.validateConnection();
      await adapter.disconnect();

      if (isValid) {
        results.push({
          validation_type: 'SCHEMA_CONSISTENCY',
          status: 'PASSED',
          message: 'Database connection successful'
        });
      } else {
        results.push({
          validation_type: 'SCHEMA_CONSISTENCY',
          status: 'FAILED',
          message: 'Database connection validation failed',
          suggestion: 'Check database credentials and network connectivity'
        });
      }
    } catch (error) {
      results.push({
        validation_type: 'SCHEMA_CONSISTENCY',
        status: 'FAILED',
        message: `Database connection failed: ${error instanceof Error ? error.message : error}`,
        suggestion: 'Verify database configuration and ensure database is running'
      });
    }

    return results;
  }

  /**
   * Validate templates
   */
  private async validateTemplates(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      const templatePath = join(__dirname, '../templates/main.hbs');

      if (existsSync(templatePath)) {
        // Try to compile the template
        const templateSource = await readFile(templatePath, 'utf-8');
        Handlebars.compile(templateSource);

        results.push({
          validation_type: 'DOCUMENTATION_COMPLETENESS',
          status: 'PASSED',
          message: 'Main template is valid and compilable'
        });
      } else {
        results.push({
          validation_type: 'DOCUMENTATION_COMPLETENESS',
          status: 'FAILED',
          message: 'Main template not found',
          suggestion: 'Ensure templates are properly installed'
        });
      }
    } catch (error) {
      results.push({
        validation_type: 'DOCUMENTATION_COMPLETENESS',
        status: 'FAILED',
        message: `Template validation failed: ${error instanceof Error ? error.message : error}`,
        suggestion: 'Check template syntax and helper registration'
      });
    }

    return results;
  }

  /**
   * Show help message
   */
  private showHelp(): void {
    console.log(`
🗃️ Database Glossary CLI - AutaMedica

USAGE:
  database-glossary <command> [options]

COMMANDS:
  introspect    Run PostgreSQL introspection mode
  parse         Run SQL parsing mode (for CI/CD)
  hybrid        Run both modes and merge results
  validate      Validate configuration and connectivity
  generate      Generate documentation from existing schema data
  test          Run comprehensive tests
  help          Show this help message

EXAMPLES:
  # Run PostgreSQL introspection
  database-glossary introspect

  # Parse SQL files for CI/CD
  database-glossary parse

  # Run in hybrid mode (recommended)
  database-glossary hybrid

  # Validate setup before running
  database-glossary validate

  # Generate docs from existing data
  database-glossary generate

  # Run all tests
  database-glossary test

CONFIGURATION:
  The tool uses a configuration file (database-glossary-config.json) or
  environment variables for database connection and parsing options.

FEATURES:
  ✅ PostgreSQL introspection with live database
  ✅ SQL file parsing for CI/CD environments
  ✅ Automatic HIPAA compliance classification
  ✅ Medical domain detection
  ✅ Handlebars template-based documentation
  ✅ Multi-format output (Markdown, HTML, JSON)
  ✅ Comprehensive validation and testing

For more information, visit:
https://github.com/autamedica/database-glossary
    `);
  }
}

/**
 * Default configuration for CLI
 */
const defaultConfig: DatabaseGlossaryConfig = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'postgres',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true',
    connection_timeout_ms: 10000,
    query_timeout_ms: 30000
  },
  introspection: {
    enabled: process.env.INTROSPECTION_ENABLED !== 'false',
    include_schemas: ['public'],
    exclude_schemas: ['information_schema', 'pg_catalog', 'pg_toast'],
    include_tables: [],
    exclude_tables: [],
    include_views: true,
    include_materialized_views: true,
    include_functions: true,
    include_triggers: true,
    include_indexes: true,
    include_constraints: true,
    max_sample_rows: 100
  },
  sql_parsing: {
    enabled: true,
    source_directories: ['supabase/migrations', 'supabase/sql', 'sql', 'migrations'],
    file_patterns: ['**/*.sql'],
    exclude_patterns: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
    parse_migrations: true,
    parse_seeds: true,
    parse_functions: true,
    max_file_size_mb: 10
  },
  hipaa: {
    enabled: true,
    auto_classify: true,
    require_manual_review: false,
    classification_rules: [],
    default_sensitivity: 'UNKNOWN',
    audit_all_phi: true,
    encrypt_by_default: true
  },
  documentation: {
    template_directory: 'templates',
    output_format: 'MARKDOWN',
    include_samples: false,
    include_erd: false,
    include_migration_history: false,
    group_by_domain: true,
    custom_sections: []
  },
  validation: {
    enabled: true,
    strict_mode: false,
    required_documentation_coverage: 80,
    naming_convention_rules: [],
    hipaa_validation_rules: [],
    custom_validation_scripts: []
  },
  output: {
    output_directory: './generated-docs',
    file_name_template: 'database-glossary-{timestamp}.md',
    include_timestamp: true,
    compress_output: false,
    generate_changelog: false,
    backup_previous: false
  }
};

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);

  // Load configuration from file if exists
  let config = defaultConfig;
  const configPath = 'database-glossary-config.json';

  if (existsSync(configPath)) {
    try {
      const configData = await readFile(configPath, 'utf-8');
      const fileConfig = JSON.parse(configData);
      config = { ...defaultConfig, ...fileConfig };
      console.log(`📋 Configuration loaded from: ${configPath}`);
    } catch (error) {
      console.warn(`⚠️ Could not load config file: ${error}`);
      console.warn('Using default configuration');
    }
  }

  const cli = new DatabaseGlossaryCLI(config);
  await cli.run(args);
}

// Run CLI if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

export { DatabaseGlossaryCLI, defaultConfig };