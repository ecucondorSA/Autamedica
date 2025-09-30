/**
 * @fileoverview SQL parsing adapter for CI/CD environments without database access
 *
 * This adapter parses SQL migration files, schema definitions, and other SQL
 * sources to extract database structure information. It's designed for use in
 * CI/CD pipelines where live database connections aren't available or desired.
 */

import { readFile, stat, readdir } from 'fs/promises';
import { join, extname, basename } from 'path';
import globby from 'globby';
import type {
  SQLParsingAdapter,
  SQLParsingResult,
  ParsedSQLStatement,
  ParsedSQLElement,
  SQLParsingError,
  SQLParsingConfig,
  AdapterInfo,
  DatabaseSchema,
  DatabaseTable,
  DatabaseColumn,
  DatabaseIndex,
  DatabaseConstraint,
  DatabaseFunction
} from '../types/index.js';

/**
 * SQL parsing adapter implementation
 *
 * Parses SQL files to extract schema information without requiring
 * a live database connection. Useful for CI/CD environments.
 */
export class SQLParsingAdapter implements SQLParsingAdapter {
  private config: SQLParsingConfig;

  constructor(config: SQLParsingConfig) {
    this.config = config;
  }

  /**
   * Parse multiple SQL files and return aggregated results
   */
  async parseFiles(filePaths: string[]): Promise<SQLParsingResult[]> {
    console.log(`🔍 Parsing ${filePaths.length} SQL files...`);
    const results: SQLParsingResult[] = [];

    for (const filePath of filePaths) {
      try {
        const result = await this.parseSingleFile(filePath);
        results.push(result);
      } catch (error) {
        console.error(`❌ Failed to parse ${filePath}:`, error);
        results.push({
          file_path: filePath,
          statements: [],
          errors: [{
            error_type: 'PARSE_ERROR',
            message: error instanceof Error ? error.message : String(error),
            line_number: 0
          }],
          parsed_at: new Date().toISOString()
        });
      }
    }

    console.log(`✅ Parsed ${results.length} files`);
    return results;
  }

  /**
   * Parse a single SQL file
   */
  async parseSingleFile(filePath: string): Promise<SQLParsingResult> {
    console.log(`📄 Parsing file: ${filePath}`);

    try {
      // Check file size limit
      const stats = await stat(filePath);
      const maxSizeBytes = this.config.max_file_size_mb * 1024 * 1024;
      if (stats.size > maxSizeBytes) {
        throw new Error(`File size ${stats.size} bytes exceeds limit of ${maxSizeBytes} bytes`);
      }

      const content = await readFile(filePath, 'utf-8');
      const statements = await this.parseSQL(content, filePath);

      return {
        file_path: filePath,
        statements,
        errors: [],
        parsed_at: new Date().toISOString()
      };
    } catch (error) {
      return {
        file_path: filePath,
        statements: [],
        errors: [{
          error_type: 'PARSE_ERROR',
          message: error instanceof Error ? error.message : String(error),
          line_number: 0
        }],
        parsed_at: new Date().toISOString()
      };
    }
  }

  /**
   * Validate SQL syntax (basic validation)
   */
  async validateSQL(sql: string): Promise<boolean> {
    try {
      await this.parseSQL(sql, 'inline');
      return true;
    } catch (error) {
      console.error('SQL validation failed:', error);
      return false;
    }
  }

  /**
   * Get adapter information
   */
  getParserInfo(): AdapterInfo {
    return {
      adapter_name: 'SQL Parsing Adapter',
      adapter_version: '1.0.0',
      supported_features: [
        'CREATE TABLE parsing',
        'ALTER TABLE parsing',
        'CREATE INDEX parsing',
        'CREATE FUNCTION parsing',
        'CREATE TRIGGER parsing',
        'Comment extraction',
        'Constraint detection',
        'Foreign key relationships',
        'Migration file parsing',
        'Schema evolution tracking'
      ],
      limitations: [
        'Limited SQL dialect support',
        'No semantic validation',
        'Complex queries not fully parsed',
        'Stored procedure logic not analyzed',
        'Performance depends on file size'
      ],
      configuration_schema: {
        sql_parsing: {
          source_directories: 'string[]',
          file_patterns: 'string[]',
          exclude_patterns: 'string[]',
          max_file_size_mb: 'number'
        }
      }
    };
  }

  /**
   * Main SQL parsing logic
   */
  private async parseSQL(content: string, filePath: string): Promise<ParsedSQLStatement[]> {
    const statements: ParsedSQLStatement[] = [];
    const lines = content.split('\n');

    // Remove comments and normalize content
    const cleanContent = this.cleanSQLContent(content);

    // Split into individual statements
    const sqlStatements = this.splitSQLStatements(cleanContent);

    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i].trim();
      if (!statement) continue;

      try {
        const parsed = await this.parseStatement(statement, filePath, i + 1);
        if (parsed) {
          statements.push(parsed);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to parse statement at line ${i + 1}:`, error);
      }
    }

    return statements;
  }

  /**
   * Clean SQL content by removing comments and normalizing whitespace
   */
  private cleanSQLContent(content: string): string {
    // Remove single-line comments (-- comment)
    content = content.replace(/--.*$/gm, '');

    // Remove multi-line comments (/* comment */)
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');

    // Normalize whitespace
    content = content.replace(/\s+/g, ' ').trim();

    return content;
  }

  /**
   * Split content into individual SQL statements
   */
  private splitSQLStatements(content: string): string[] {
    // Split on semicolon, but be careful about semicolons inside strings
    const statements: string[] = [];
    let current = '';
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const prevChar = content[i - 1];

      if ((char === '"' || char === "'") && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = '';
        }
      }

      if (char === ';' && !inString) {
        statements.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      statements.push(current.trim());
    }

    return statements.filter(s => s.length > 0);
  }

  /**
   * Parse an individual SQL statement
   */
  private async parseStatement(statement: string, filePath: string, lineNumber: number): Promise<ParsedSQLStatement | null> {
    const upperStatement = statement.toUpperCase().trim();

    if (upperStatement.startsWith('CREATE TABLE')) {
      return this.parseCreateTable(statement, filePath, lineNumber);
    } else if (upperStatement.startsWith('ALTER TABLE')) {
      return this.parseAlterTable(statement, filePath, lineNumber);
    } else if (upperStatement.startsWith('CREATE INDEX') || upperStatement.startsWith('CREATE UNIQUE INDEX')) {
      return this.parseCreateIndex(statement, filePath, lineNumber);
    } else if (upperStatement.startsWith('CREATE FUNCTION') || upperStatement.startsWith('CREATE OR REPLACE FUNCTION')) {
      return this.parseCreateFunction(statement, filePath, lineNumber);
    } else if (upperStatement.startsWith('CREATE TRIGGER') || upperStatement.startsWith('CREATE OR REPLACE TRIGGER')) {
      return this.parseCreateTrigger(statement, filePath, lineNumber);
    }

    return null;
  }

  /**
   * Parse CREATE TABLE statements
   */
  private parseCreateTable(statement: string, filePath: string, lineNumber: number): ParsedSQLStatement {
    const elements: ParsedSQLElement[] = [];

    // Extract table name
    const tableMatch = statement.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(?:(\w+)\.)?(\w+)\s*\(/i);
    const schemaName = tableMatch?.[1] || 'public';
    const tableName = tableMatch?.[2];

    if (!tableName) {
      throw new Error('Could not extract table name from CREATE TABLE statement');
    }

    // Extract column definitions
    const columnSection = this.extractParenthesesContent(statement);
    const columnDefinitions = this.parseColumnDefinitions(columnSection);

    for (const colDef of columnDefinitions) {
      elements.push({
        element_type: 'COLUMN',
        name: colDef.name,
        properties: {
          data_type: colDef.dataType,
          is_nullable: colDef.nullable,
          is_primary_key: colDef.primaryKey,
          default_value: colDef.defaultValue,
          constraints: colDef.constraints
        },
        sql_fragment: colDef.definition
      });
    }

    // Extract table-level constraints
    const constraints = this.parseTableConstraints(columnSection);
    for (const constraint of constraints) {
      elements.push({
        element_type: 'CONSTRAINT',
        name: constraint.name,
        properties: {
          constraint_type: constraint.type,
          columns: constraint.columns,
          referenced_table: constraint.referencedTable,
          referenced_columns: constraint.referencedColumns
        },
        sql_fragment: constraint.definition
      });
    }

    return {
      statement_type: 'CREATE_TABLE',
      table_name: tableName,
      schema_name: schemaName,
      raw_sql: statement,
      parsed_elements: elements,
      file_path: filePath,
      line_number: lineNumber
    };
  }

  /**
   * Parse ALTER TABLE statements
   */
  private parseAlterTable(statement: string, filePath: string, lineNumber: number): ParsedSQLStatement {
    const elements: ParsedSQLElement[] = [];

    // Extract table name
    const tableMatch = statement.match(/ALTER TABLE\s+(?:(\w+)\.)?(\w+)\s+(.+)/i);
    const schemaName = tableMatch?.[1] || 'public';
    const tableName = tableMatch?.[2];
    const alterClause = tableMatch?.[3];

    if (!tableName || !alterClause) {
      throw new Error('Could not extract table name or alter clause from ALTER TABLE statement');
    }

    // Parse different ALTER TABLE operations
    if (alterClause.match(/ADD\s+COLUMN/i)) {
      const columnMatch = alterClause.match(/ADD\s+COLUMN\s+(\w+)\s+(.+)/i);
      if (columnMatch) {
        elements.push({
          element_type: 'COLUMN',
          name: columnMatch[1],
          properties: {
            operation: 'ADD',
            definition: columnMatch[2]
          },
          sql_fragment: alterClause
        });
      }
    } else if (alterClause.match(/ADD\s+CONSTRAINT/i)) {
      const constraintMatch = alterClause.match(/ADD\s+CONSTRAINT\s+(\w+)\s+(.+)/i);
      if (constraintMatch) {
        elements.push({
          element_type: 'CONSTRAINT',
          name: constraintMatch[1],
          properties: {
            operation: 'ADD',
            definition: constraintMatch[2]
          },
          sql_fragment: alterClause
        });
      }
    }

    return {
      statement_type: 'ALTER_TABLE',
      table_name: tableName,
      schema_name: schemaName,
      raw_sql: statement,
      parsed_elements: elements,
      file_path: filePath,
      line_number: lineNumber
    };
  }

  /**
   * Parse CREATE INDEX statements
   */
  private parseCreateIndex(statement: string, filePath: string, lineNumber: number): ParsedSQLStatement {
    const elements: ParsedSQLElement[] = [];

    // Extract index information
    const indexMatch = statement.match(/CREATE\s+(UNIQUE\s+)?INDEX\s+(?:IF NOT EXISTS\s+)?(\w+)\s+ON\s+(?:(\w+)\.)?(\w+)\s*\(([^)]+)\)/i);
    const isUnique = !!indexMatch?.[1];
    const indexName = indexMatch?.[2];
    const schemaName = indexMatch?.[3] || 'public';
    const tableName = indexMatch?.[4];
    const columnList = indexMatch?.[5];

    if (!indexName || !tableName || !columnList) {
      throw new Error('Could not extract index information from CREATE INDEX statement');
    }

    const columns = columnList.split(',').map(col => col.trim());

    elements.push({
      element_type: 'INDEX',
      name: indexName,
      properties: {
        table_name: tableName,
        columns: columns,
        is_unique: isUnique,
        index_type: 'btree' // default assumption
      },
      sql_fragment: statement
    });

    return {
      statement_type: 'CREATE_INDEX',
      table_name: tableName,
      schema_name: schemaName,
      raw_sql: statement,
      parsed_elements: elements,
      file_path: filePath,
      line_number: lineNumber
    };
  }

  /**
   * Parse CREATE FUNCTION statements
   */
  private parseCreateFunction(statement: string, filePath: string, lineNumber: number): ParsedSQLStatement {
    const elements: ParsedSQLElement[] = [];

    // Extract function information
    const functionMatch = statement.match(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:(\w+)\.)?(\w+)\s*\(([^)]*)\)\s+RETURNS\s+([^{]+)/i);
    const schemaName = functionMatch?.[1] || 'public';
    const functionName = functionMatch?.[2];
    const parameters = functionMatch?.[3];
    const returnType = functionMatch?.[4]?.trim();

    if (!functionName) {
      throw new Error('Could not extract function name from CREATE FUNCTION statement');
    }

    elements.push({
      element_type: 'FUNCTION',
      name: functionName,
      properties: {
        parameters: parameters || '',
        return_type: returnType || 'void',
        language: this.extractFunctionLanguage(statement),
        security: this.extractFunctionSecurity(statement)
      },
      sql_fragment: statement
    });

    return {
      statement_type: 'CREATE_FUNCTION',
      schema_name: schemaName,
      raw_sql: statement,
      parsed_elements: elements,
      file_path: filePath,
      line_number: lineNumber
    };
  }

  /**
   * Parse CREATE TRIGGER statements
   */
  private parseCreateTrigger(statement: string, filePath: string, lineNumber: number): ParsedSQLStatement {
    const elements: ParsedSQLElement[] = [];

    // Extract trigger information
    const triggerMatch = statement.match(/CREATE\s+(?:OR\s+REPLACE\s+)?TRIGGER\s+(\w+)\s+(BEFORE|AFTER|INSTEAD\s+OF)\s+([^{]+)\s+ON\s+(?:(\w+)\.)?(\w+)/i);
    const triggerName = triggerMatch?.[1];
    const timing = triggerMatch?.[2];
    const events = triggerMatch?.[3];
    const schemaName = triggerMatch?.[4] || 'public';
    const tableName = triggerMatch?.[5];

    if (!triggerName || !tableName) {
      throw new Error('Could not extract trigger information from CREATE TRIGGER statement');
    }

    elements.push({
      element_type: 'TRIGGER',
      name: triggerName,
      properties: {
        table_name: tableName,
        timing: timing,
        events: events?.split(/\s+OR\s+/i) || [],
        function_name: this.extractTriggerFunction(statement)
      },
      sql_fragment: statement
    });

    return {
      statement_type: 'CREATE_TRIGGER',
      table_name: tableName,
      schema_name: schemaName,
      raw_sql: statement,
      parsed_elements: elements,
      file_path: filePath,
      line_number: lineNumber
    };
  }

  /**
   * Extract content between parentheses
   */
  private extractParenthesesContent(statement: string): string {
    const startIndex = statement.indexOf('(');
    const endIndex = statement.lastIndexOf(')');

    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
      return '';
    }

    return statement.substring(startIndex + 1, endIndex);
  }

  /**
   * Parse column definitions from CREATE TABLE
   */
  private parseColumnDefinitions(columnSection: string): Array<{
    name: string;
    dataType: string;
    nullable: boolean;
    primaryKey: boolean;
    defaultValue?: string;
    constraints: string[];
    definition: string;
  }> {
    const definitions: Array<{
      name: string;
      dataType: string;
      nullable: boolean;
      primaryKey: boolean;
      defaultValue?: string;
      constraints: string[];
      definition: string;
    }> = [];

    // Split by comma, but be careful about commas inside function calls
    const parts = this.splitByComma(columnSection);

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed || trimmed.toUpperCase().includes('CONSTRAINT')) {
        continue; // Skip table-level constraints
      }

      const tokens = trimmed.split(/\s+/);
      if (tokens.length < 2) continue;

      const name = tokens[0];
      const dataType = tokens[1];
      const restTokens = tokens.slice(2);

      const nullable = !restTokens.some(token => token.toUpperCase() === 'NOT' &&
                                       restTokens[restTokens.indexOf(token) + 1]?.toUpperCase() === 'NULL');
      const primaryKey = restTokens.some(token => token.toUpperCase() === 'PRIMARY') &&
                        restTokens.some(token => token.toUpperCase() === 'KEY');

      // Extract default value
      let defaultValue: string | undefined;
      const defaultIndex = restTokens.findIndex(token => token.toUpperCase() === 'DEFAULT');
      if (defaultIndex !== -1 && defaultIndex + 1 < restTokens.length) {
        defaultValue = restTokens[defaultIndex + 1];
      }

      definitions.push({
        name,
        dataType,
        nullable,
        primaryKey,
        defaultValue,
        constraints: restTokens,
        definition: trimmed
      });
    }

    return definitions;
  }

  /**
   * Parse table-level constraints
   */
  private parseTableConstraints(columnSection: string): Array<{
    name: string;
    type: string;
    columns: string[];
    referencedTable?: string;
    referencedColumns?: string[];
    definition: string;
  }> {
    const constraints: Array<{
      name: string;
      type: string;
      columns: string[];
      referencedTable?: string;
      referencedColumns?: string[];
      definition: string;
    }> = [];

    const parts = this.splitByComma(columnSection);

    for (const part of parts) {
      const trimmed = part.trim();
      const upperTrimmed = trimmed.toUpperCase();

      if (upperTrimmed.includes('CONSTRAINT')) {
        const constraintMatch = trimmed.match(/CONSTRAINT\s+(\w+)\s+(.+)/i);
        if (constraintMatch) {
          const name = constraintMatch[1];
          const definition = constraintMatch[2];

          let type = 'UNKNOWN';
          if (definition.toUpperCase().includes('PRIMARY KEY')) {
            type = 'PRIMARY KEY';
          } else if (definition.toUpperCase().includes('FOREIGN KEY')) {
            type = 'FOREIGN KEY';
          } else if (definition.toUpperCase().includes('UNIQUE')) {
            type = 'UNIQUE';
          } else if (definition.toUpperCase().includes('CHECK')) {
            type = 'CHECK';
          }

          constraints.push({
            name,
            type,
            columns: [], // Would need more sophisticated parsing
            definition: trimmed
          });
        }
      }
    }

    return constraints;
  }

  /**
   * Split string by comma, respecting parentheses
   */
  private splitByComma(input: string): string[] {
    const parts: string[] = [];
    let current = '';
    let parenthesesLevel = 0;

    for (const char of input) {
      if (char === '(') {
        parenthesesLevel++;
      } else if (char === ')') {
        parenthesesLevel--;
      } else if (char === ',' && parenthesesLevel === 0) {
        parts.push(current);
        current = '';
        continue;
      }
      current += char;
    }

    if (current) {
      parts.push(current);
    }

    return parts;
  }

  /**
   * Extract function language from CREATE FUNCTION
   */
  private extractFunctionLanguage(statement: string): string {
    const languageMatch = statement.match(/LANGUAGE\s+(\w+)/i);
    return languageMatch?.[1] || 'sql';
  }

  /**
   * Extract function security from CREATE FUNCTION
   */
  private extractFunctionSecurity(statement: string): string {
    if (statement.toUpperCase().includes('SECURITY DEFINER')) {
      return 'DEFINER';
    } else if (statement.toUpperCase().includes('SECURITY INVOKER')) {
      return 'INVOKER';
    }
    return 'INVOKER'; // default
  }

  /**
   * Extract trigger function from CREATE TRIGGER
   */
  private extractTriggerFunction(statement: string): string {
    const functionMatch = statement.match(/EXECUTE\s+(?:PROCEDURE\s+|FUNCTION\s+)?(\w+)/i);
    return functionMatch?.[1] || '';
  }
}

/**
 * Factory function to create SQL parsing adapter with file discovery
 */
export async function createSQLParsingAdapter(config: SQLParsingConfig): Promise<SQLParsingAdapter> {
  // Set defaults
  const configWithDefaults: SQLParsingConfig = {
    enabled: true,
    source_directories: ['supabase/migrations', 'supabase/sql', 'sql', 'migrations'],
    file_patterns: ['**/*.sql'],
    exclude_patterns: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
    parse_migrations: true,
    parse_seeds: true,
    parse_functions: true,
    max_file_size_mb: 10,
    ...config
  };

  return new SQLParsingAdapter(configWithDefaults);
}

/**
 * Discover SQL files in the configured directories
 */
export async function discoverSQLFiles(config: SQLParsingConfig): Promise<string[]> {
  console.log('🔍 Discovering SQL files...');

  const patterns: string[] = [];

  for (const dir of config.source_directories) {
    for (const pattern of config.file_patterns) {
      patterns.push(join(dir, pattern));
    }
  }

  try {
    const files = await globby(patterns, {
      ignore: config.exclude_patterns,
      onlyFiles: true,
      absolute: true
    });

    // Filter by file size if specified
    const validFiles: string[] = [];
    const maxSizeBytes = config.max_file_size_mb * 1024 * 1024;

    for (const file of files) {
      try {
        const stats = await stat(file);
        if (stats.size <= maxSizeBytes) {
          validFiles.push(file);
        } else {
          console.warn(`⚠️ Skipping ${file}: file size ${stats.size} bytes exceeds limit`);
        }
      } catch (error) {
        console.warn(`⚠️ Error checking ${file}:`, error);
      }
    }

    console.log(`✅ Discovered ${validFiles.length} SQL files`);
    return validFiles;
  } catch (error) {
    console.error('❌ Error discovering SQL files:', error);
    return [];
  }
}

/**
 * Convert parsed SQL results to database schema format
 */
export function sqlResultsToSchema(results: SQLParsingResult[]): DatabaseSchema {
  const tables: DatabaseTable[] = [];
  const functions: DatabaseFunction[] = [];
  const allStatements = results.flatMap(r => r.statements);

  // Group statements by table
  const tableStatements = allStatements.filter(s => s.statement_type === 'CREATE_TABLE');
  const alterStatements = allStatements.filter(s => s.statement_type === 'ALTER_TABLE');
  const indexStatements = allStatements.filter(s => s.statement_type === 'CREATE_INDEX');
  const functionStatements = allStatements.filter(s => s.statement_type === 'CREATE_FUNCTION');

  // Process CREATE TABLE statements
  for (const stmt of tableStatements) {
    if (!stmt.table_name) continue;

    const columns: DatabaseColumn[] = [];
    const indexes: DatabaseIndex[] = [];
    const constraints: DatabaseConstraint[] = [];

    // Extract columns
    for (const element of stmt.parsed_elements) {
      if (element.element_type === 'COLUMN') {
        columns.push({
          column_name: element.name,
          data_type: element.properties.data_type || 'unknown',
          is_nullable: element.properties.is_nullable !== false,
          is_primary_key: element.properties.is_primary_key === true,
          is_foreign_key: false, // TODO: detect from constraints
          column_default: element.properties.default_value
        });
      } else if (element.element_type === 'CONSTRAINT') {
        constraints.push({
          constraint_name: element.name,
          constraint_type: element.properties.constraint_type || 'UNKNOWN',
          columns: element.properties.columns || [],
          referenced_table: element.properties.referenced_table,
          referenced_columns: element.properties.referenced_columns
        });
      }
    }

    // Add indexes from CREATE INDEX statements
    const tableIndexes = indexStatements.filter(s => s.table_name === stmt.table_name);
    for (const indexStmt of tableIndexes) {
      for (const element of indexStmt.parsed_elements) {
        if (element.element_type === 'INDEX') {
          indexes.push({
            index_name: element.name,
            is_unique: element.properties.is_unique === true,
            is_primary: false,
            columns: element.properties.columns || [],
            index_type: element.properties.index_type || 'btree'
          });
        }
      }
    }

    tables.push({
      table_name: stmt.table_name,
      table_schema: stmt.schema_name || 'public',
      table_type: 'BASE TABLE',
      columns,
      indexes,
      constraints
    });
  }

  // Process functions
  for (const stmt of functionStatements) {
    for (const element of stmt.parsed_elements) {
      if (element.element_type === 'FUNCTION') {
        functions.push({
          function_name: element.name,
          function_schema: stmt.schema_name || 'public',
          return_type: element.properties.return_type || 'void',
          argument_types: [element.properties.parameters || ''],
          function_type: 'FUNCTION',
          is_security_definer: element.properties.security === 'DEFINER',
          language: element.properties.language || 'sql'
        });
      }
    }
  }

  return {
    schema_name: 'parsed',
    tables,
    functions,
    triggers: [], // TODO: implement trigger parsing
    extensions: [],
    introspected_at: new Date().toISOString()
  };
}