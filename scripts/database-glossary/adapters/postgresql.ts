/**
 * @fileoverview PostgreSQL introspection adapter for database schema analysis
 *
 * This adapter connects to a live PostgreSQL database and extracts comprehensive
 * schema information including tables, columns, indexes, constraints, functions,
 * triggers, and extensions. It's designed specifically for medical databases
 * with HIPAA compliance considerations.
 */

import { Pool, PoolClient, PoolConfig } from 'pg';
import type {
  DatabaseAdapter,
  DatabaseSchema,
  DatabaseTable,
  DatabaseColumn,
  DatabaseIndex,
  DatabaseConstraint,
  DatabaseFunction,
  DatabaseTrigger,
  DatabaseExtension,
  DatabaseConfig,
  IntrospectionConfig,
  AdapterInfo,
  DatabaseError
} from '../types/index.js';

/**
 * PostgreSQL introspection adapter implementation
 *
 * Connects to a live PostgreSQL database and extracts schema information
 * using information_schema and pg_catalog system tables.
 */
export class PostgreSQLAdapter implements DatabaseAdapter {
  private pool: Pool | null = null;
  private config: DatabaseConfig;
  private introspectionConfig: IntrospectionConfig;

  constructor(
    config: DatabaseConfig,
    introspectionConfig: IntrospectionConfig
  ) {
    this.config = config;
    this.introspectionConfig = introspectionConfig;
  }

  /**
   * Establish connection to PostgreSQL database
   */
  async connect(): Promise<void> {
    try {
      const poolConfig: PoolConfig = {
        connectionString: this.config.connection_string,
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password,
        ssl: this.config.ssl,
        connectionTimeoutMillis: this.config.connection_timeout_ms,
        query_timeout: this.config.query_timeout_ms,
        max: 10, // Maximum number of clients in pool
        idleTimeoutMillis: 30000,
        allowExitOnIdle: true
      };

      this.pool = new Pool(poolConfig);

      // Test the connection
      const client = await this.pool.connect();
      try {
        await client.query('SELECT 1');
        console.log('✅ PostgreSQL connection established successfully');
      } finally {
        client.release();
      }
    } catch (error) {
      throw new DatabaseError(
        `Failed to connect to PostgreSQL database: ${error instanceof Error ? error.message : String(error)}`,
        { config: this.sanitizeConfig(this.config) }
      );
    }
  }

  /**
   * Close database connection
   */
  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('✅ PostgreSQL connection closed');
    }
  }

  /**
   * Validate database connection
   */
  async validateConnection(): Promise<boolean> {
    if (!this.pool) {
      return false;
    }

    try {
      const client = await this.pool.connect();
      try {
        const result = await client.query('SELECT current_database(), current_user, version()');
        console.log(`📊 Connected to: ${result.rows[0].current_database} as ${result.rows[0].current_user}`);
        return true;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Database connection validation failed:', error);
      return false;
    }
  }

  /**
   * Get adapter information
   */
  getAdapterInfo(): AdapterInfo {
    return {
      adapter_name: 'PostgreSQL Introspection Adapter',
      adapter_version: '1.0.0',
      supported_features: [
        'Table introspection',
        'Column metadata extraction',
        'Index analysis',
        'Constraint detection',
        'Function introspection',
        'Trigger analysis',
        'Extension detection',
        'Foreign key relationships',
        'View support',
        'Materialized view support',
        'Comment extraction',
        'HIPAA-ready metadata'
      ],
      limitations: [
        'Requires live database connection',
        'Read-only operations only',
        'Limited to PostgreSQL 12+',
        'Performance depends on database size'
      ],
      configuration_schema: {
        database: {
          connection_string: 'string?',
          host: 'string?',
          port: 'number?',
          database: 'string?',
          username: 'string?',
          password: 'string?',
          ssl: 'boolean?'
        },
        introspection: {
          include_schemas: 'string[]',
          exclude_schemas: 'string[]',
          include_views: 'boolean',
          include_functions: 'boolean'
        }
      }
    };
  }

  /**
   * Main introspection method - extracts complete schema
   */
  async introspectSchema(): Promise<DatabaseSchema> {
    if (!this.pool) {
      throw new DatabaseError('Database connection not established. Call connect() first.');
    }

    console.log('🔍 Starting PostgreSQL schema introspection...');
    const startTime = Date.now();

    try {
      const client = await this.pool.connect();

      try {
        // Get database and schema information
        const schemaInfo = await this.getSchemaInfo(client);

        // Introspect all components
        const [tables, functions, triggers, extensions] = await Promise.all([
          this.introspectTables(client),
          this.introspectionConfig.include_functions ? this.introspectFunctions(client) : [],
          this.introspectionConfig.include_functions ? this.introspectTriggers(client) : [],
          this.introspectExtensions(client)
        ]);

        const schema: DatabaseSchema = {
          schema_name: schemaInfo.schema_name,
          tables,
          functions,
          triggers,
          extensions,
          introspected_at: new Date().toISOString()
        };

        const duration = Date.now() - startTime;
        console.log(`✅ Schema introspection completed in ${duration}ms`);
        console.log(`📊 Found: ${tables.length} tables, ${functions.length} functions, ${triggers.length} triggers, ${extensions.length} extensions`);

        return schema;
      } finally {
        client.release();
      }
    } catch (error) {
      throw new DatabaseError(
        `Schema introspection failed: ${error instanceof Error ? error.message : String(error)}`,
        { duration: Date.now() - startTime }
      );
    }
  }

  /**
   * Get basic schema information
   */
  private async getSchemaInfo(client: PoolClient): Promise<{ schema_name: string }> {
    const query = `
      SELECT
        current_schema() as schema_name,
        current_database() as database_name,
        current_user as connected_user
    `;

    const result = await client.query(query);
    return {
      schema_name: result.rows[0].schema_name || 'public'
    };
  }

  /**
   * Introspect all tables with their metadata
   */
  private async introspectTables(client: PoolClient): Promise<DatabaseTable[]> {
    console.log('📋 Introspecting tables...');

    // Build schema filter condition
    const schemaFilter = this.buildSchemaFilter();
    const tableFilter = this.buildTableFilter();

    const tablesQuery = `
      SELECT
        t.table_name,
        t.table_schema,
        t.table_type,
        obj_description(c.oid, 'pg_class') as table_comment
      FROM information_schema.tables t
      LEFT JOIN pg_class c ON c.relname = t.table_name
      LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.table_schema
      WHERE t.table_schema ${schemaFilter}
        ${tableFilter ? `AND t.table_name ${tableFilter}` : ''}
        ${this.introspectionConfig.include_views ? '' : "AND t.table_type = 'BASE TABLE'"}
      ORDER BY t.table_schema, t.table_name
    `;

    const tablesResult = await client.query(tablesQuery);
    const tables: DatabaseTable[] = [];

    for (const tableRow of tablesResult.rows) {
      console.log(`  📄 Processing table: ${tableRow.table_schema}.${tableRow.table_name}`);

      const [columns, indexes, constraints] = await Promise.all([
        this.introspectTableColumns(client, tableRow.table_schema, tableRow.table_name),
        this.introspectTableIndexes(client, tableRow.table_schema, tableRow.table_name),
        this.introspectTableConstraints(client, tableRow.table_schema, tableRow.table_name)
      ]);

      tables.push({
        table_name: tableRow.table_name,
        table_schema: tableRow.table_schema,
        table_type: tableRow.table_type,
        table_comment: tableRow.table_comment,
        columns,
        indexes,
        constraints
      });
    }

    console.log(`✅ Introspected ${tables.length} tables`);
    return tables;
  }

  /**
   * Introspect columns for a specific table
   */
  private async introspectTableColumns(client: PoolClient, schema: string, tableName: string): Promise<DatabaseColumn[]> {
    const columnsQuery = `
      SELECT
        c.column_name,
        c.data_type,
        c.is_nullable::boolean as is_nullable,
        c.column_default,
        c.character_maximum_length,
        c.numeric_precision,
        c.numeric_scale,
        CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
        CASE WHEN fk.column_name IS NOT NULL THEN true ELSE false END as is_foreign_key,
        fk.foreign_table_name as foreign_key_table,
        fk.foreign_column_name as foreign_key_column,
        col_description(pgc.oid, c.ordinal_position) as column_comment
      FROM information_schema.columns c
      LEFT JOIN pg_class pgc ON pgc.relname = c.table_name
      LEFT JOIN pg_namespace pgn ON pgn.oid = pgc.relnamespace AND pgn.nspname = c.table_schema
      -- Primary key detection
      LEFT JOIN (
        SELECT
          kcu.column_name,
          kcu.table_name,
          kcu.table_schema
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'PRIMARY KEY'
      ) pk ON pk.column_name = c.column_name
           AND pk.table_name = c.table_name
           AND pk.table_schema = c.table_schema
      -- Foreign key detection
      LEFT JOIN (
        SELECT
          kcu.column_name,
          kcu.table_name,
          kcu.table_schema,
          ccu.table_name as foreign_table_name,
          ccu.column_name as foreign_column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
      ) fk ON fk.column_name = c.column_name
           AND fk.table_name = c.table_name
           AND fk.table_schema = c.table_schema
      WHERE c.table_schema = $1 AND c.table_name = $2
      ORDER BY c.ordinal_position
    `;

    const result = await client.query(columnsQuery, [schema, tableName]);
    return result.rows.map(row => ({
      column_name: row.column_name,
      data_type: row.data_type,
      is_nullable: row.is_nullable,
      column_default: row.column_default,
      character_maximum_length: row.character_maximum_length,
      numeric_precision: row.numeric_precision,
      numeric_scale: row.numeric_scale,
      is_primary_key: row.is_primary_key,
      is_foreign_key: row.is_foreign_key,
      foreign_key_table: row.foreign_key_table,
      foreign_key_column: row.foreign_key_column,
      column_comment: row.column_comment
    }));
  }

  /**
   * Introspect indexes for a specific table
   */
  private async introspectTableIndexes(client: PoolClient, schema: string, tableName: string): Promise<DatabaseIndex[]> {
    if (!this.introspectionConfig.include_indexes) {
      return [];
    }

    const indexesQuery = `
      SELECT
        i.indexname as index_name,
        i.indexdef,
        idx.indisunique as is_unique,
        idx.indisprimary as is_primary,
        am.amname as index_type,
        pg_get_expr(idx.indpred, idx.indrelid) as condition,
        array_agg(a.attname ORDER BY a.attnum) as columns
      FROM pg_indexes i
      JOIN pg_class c ON c.relname = i.tablename
      JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = i.schemaname
      JOIN pg_index idx ON idx.indexrelid = (
        SELECT oid FROM pg_class WHERE relname = i.indexname AND relnamespace = n.oid
      )
      JOIN pg_am am ON am.oid = (
        SELECT relam FROM pg_class WHERE oid = idx.indexrelid
      )
      JOIN pg_attribute a ON a.attrelid = idx.indrelid AND a.attnum = ANY(idx.indkey)
      WHERE i.schemaname = $1 AND i.tablename = $2
      GROUP BY i.indexname, i.indexdef, idx.indisunique, idx.indisprimary, am.amname, idx.indpred, idx.indrelid
      ORDER BY i.indexname
    `;

    const result = await client.query(indexesQuery, [schema, tableName]);
    return result.rows.map(row => ({
      index_name: row.index_name,
      is_unique: row.is_unique,
      is_primary: row.is_primary,
      columns: row.columns,
      index_type: row.index_type,
      condition: row.condition
    }));
  }

  /**
   * Introspect constraints for a specific table
   */
  private async introspectTableConstraints(client: PoolClient, schema: string, tableName: string): Promise<DatabaseConstraint[]> {
    if (!this.introspectionConfig.include_constraints) {
      return [];
    }

    const constraintsQuery = `
      SELECT
        tc.constraint_name,
        tc.constraint_type,
        array_agg(DISTINCT kcu.column_name) as columns,
        ccu.table_name as referenced_table,
        array_agg(DISTINCT ccu.column_name) as referenced_columns,
        cc.check_clause
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
        AND tc.table_schema = ccu.table_schema
      LEFT JOIN information_schema.check_constraints cc
        ON tc.constraint_name = cc.constraint_name
        AND tc.table_schema = cc.constraint_schema
      WHERE tc.table_schema = $1 AND tc.table_name = $2
      GROUP BY tc.constraint_name, tc.constraint_type, ccu.table_name, cc.check_clause
      ORDER BY tc.constraint_name
    `;

    const result = await client.query(constraintsQuery, [schema, tableName]);
    return result.rows.map(row => ({
      constraint_name: row.constraint_name,
      constraint_type: row.constraint_type,
      columns: row.columns.filter(Boolean),
      referenced_table: row.referenced_table,
      referenced_columns: row.referenced_columns?.filter(Boolean),
      check_clause: row.check_clause
    }));
  }

  /**
   * Introspect database functions
   */
  private async introspectFunctions(client: PoolClient): Promise<DatabaseFunction[]> {
    console.log('⚙️ Introspecting functions...');

    const schemaFilter = this.buildSchemaFilter();

    const functionsQuery = `
      SELECT
        p.proname as function_name,
        n.nspname as function_schema,
        pg_catalog.pg_get_function_result(p.oid) as return_type,
        pg_catalog.pg_get_function_arguments(p.oid) as argument_types,
        CASE
          WHEN p.prokind = 'f' THEN 'FUNCTION'
          WHEN p.prokind = 'p' THEN 'PROCEDURE'
          WHEN p.prokind = 'a' THEN 'AGGREGATE'
          ELSE 'FUNCTION'
        END as function_type,
        p.prosecdef as is_security_definer,
        l.lanname as language,
        CASE WHEN l.lanname = 'plpgsql' OR l.lanname = 'sql'
             THEN p.prosrc
             ELSE NULL
        END as source_code,
        obj_description(p.oid, 'pg_proc') as function_comment
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      JOIN pg_language l ON l.oid = p.prolang
      WHERE n.nspname ${schemaFilter}
        AND p.prokind IN ('f', 'p', 'a')  -- functions, procedures, aggregates
        AND NOT p.proisbuiltin  -- exclude built-in functions
      ORDER BY n.nspname, p.proname
    `;

    const result = await client.query(functionsQuery);
    console.log(`✅ Introspected ${result.rows.length} functions`);

    return result.rows.map(row => ({
      function_name: row.function_name,
      function_schema: row.function_schema,
      return_type: row.return_type,
      argument_types: row.argument_types ? [row.argument_types] : [],
      function_type: row.function_type,
      is_security_definer: row.is_security_definer,
      language: row.language,
      source_code: row.source_code,
      function_comment: row.function_comment
    }));
  }

  /**
   * Introspect database triggers
   */
  private async introspectTriggers(client: PoolClient): Promise<DatabaseTrigger[]> {
    console.log('🔫 Introspecting triggers...');

    const schemaFilter = this.buildSchemaFilter();

    const triggersQuery = `
      SELECT
        t.trigger_name,
        t.event_object_table as table_name,
        array_agg(DISTINCT t.event_manipulation) as trigger_event,
        t.action_timing as trigger_timing,
        t.action_statement as trigger_function,
        t.action_condition as trigger_condition
      FROM information_schema.triggers t
      JOIN information_schema.tables tb ON tb.table_name = t.event_object_table
        AND tb.table_schema = t.trigger_schema
      WHERE t.trigger_schema ${schemaFilter}
      GROUP BY t.trigger_name, t.event_object_table, t.action_timing, t.action_statement, t.action_condition
      ORDER BY t.event_object_table, t.trigger_name
    `;

    const result = await client.query(triggersQuery);
    console.log(`✅ Introspected ${result.rows.length} triggers`);

    return result.rows.map(row => ({
      trigger_name: row.trigger_name,
      table_name: row.table_name,
      trigger_event: row.trigger_event,
      trigger_timing: row.trigger_timing,
      trigger_function: row.trigger_function,
      trigger_condition: row.trigger_condition
    }));
  }

  /**
   * Introspect database extensions
   */
  private async introspectExtensions(client: PoolClient): Promise<DatabaseExtension[]> {
    console.log('🧩 Introspecting extensions...');

    const extensionsQuery = `
      SELECT
        e.extname as extension_name,
        e.extversion as extension_version,
        n.nspname as extension_schema
      FROM pg_extension e
      JOIN pg_namespace n ON n.oid = e.extnamespace
      ORDER BY e.extname
    `;

    const result = await client.query(extensionsQuery);
    console.log(`✅ Found ${result.rows.length} extensions`);

    return result.rows.map(row => ({
      extension_name: row.extension_name,
      extension_version: row.extension_version,
      extension_schema: row.extension_schema
    }));
  }

  /**
   * Build schema filter SQL condition
   */
  private buildSchemaFilter(): string {
    const includeSchemas = this.introspectionConfig.include_schemas;
    const excludeSchemas = this.introspectionConfig.exclude_schemas;

    if (includeSchemas.length > 0) {
      const schemaList = includeSchemas.map(s => `'${s}'`).join(', ');
      return `IN (${schemaList})`;
    }

    if (excludeSchemas.length > 0) {
      const schemaList = excludeSchemas.map(s => `'${s}'`).join(', ');
      return `NOT IN (${schemaList})`;
    }

    // Default: exclude system schemas
    return `NOT IN ('information_schema', 'pg_catalog', 'pg_toast')`;
  }

  /**
   * Build table filter SQL condition
   */
  private buildTableFilter(): string | null {
    const includeTables = this.introspectionConfig.include_tables;
    const excludeTables = this.introspectionConfig.exclude_tables;

    if (includeTables.length > 0) {
      const tableList = includeTables.map(t => `'${t}'`).join(', ');
      return `IN (${tableList})`;
    }

    if (excludeTables.length > 0) {
      const tableList = excludeTables.map(t => `'${t}'`).join(', ');
      return `NOT IN (${tableList})`;
    }

    return null;
  }

  /**
   * Sanitize configuration for logging (remove sensitive data)
   */
  private sanitizeConfig(config: DatabaseConfig): Partial<DatabaseConfig> {
    return {
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.username,
      ssl: config.ssl,
      // Remove password and connection_string
    };
  }
}

/**
 * Factory function to create PostgreSQL adapter with validation
 */
export function createPostgreSQLAdapter(
  databaseConfig: DatabaseConfig,
  introspectionConfig: IntrospectionConfig
): PostgreSQLAdapter {
  // Validate required configuration
  if (!databaseConfig.connection_string && !databaseConfig.host) {
    throw new DatabaseError('Either connection_string or host must be provided');
  }

  if (!databaseConfig.database) {
    throw new DatabaseError('Database name is required');
  }

  // Set defaults
  const configWithDefaults: DatabaseConfig = {
    connection_timeout_ms: 10000,
    query_timeout_ms: 30000,
    ssl: false,
    ...databaseConfig
  };

  const introspectionWithDefaults: IntrospectionConfig = {
    enabled: true,
    include_schemas: [],
    exclude_schemas: ['information_schema', 'pg_catalog', 'pg_toast'],
    include_tables: [],
    exclude_tables: [],
    include_views: true,
    include_materialized_views: true,
    include_functions: true,
    include_triggers: true,
    include_indexes: true,
    include_constraints: true,
    max_sample_rows: 100,
    ...introspectionConfig
  };

  return new PostgreSQLAdapter(configWithDefaults, introspectionWithDefaults);
}