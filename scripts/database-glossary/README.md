# 🗃️ Database Glossary System - AutaMedica

**Hybrid PostgreSQL Introspection and SQL Parsing System with HIPAA Compliance**

---

## 🎯 Overview

The Database Glossary System is a comprehensive tool for automatically generating medical database documentation with HIPAA compliance classification. It supports both live PostgreSQL introspection and SQL file parsing for CI/CD environments.

## ✨ Features

### 🔍 **Dual Analysis Modes**
- **PostgreSQL Introspection**: Connect to live database for real-time schema analysis
- **SQL Parsing**: Parse migration files and SQL sources for CI/CD environments
- **Hybrid Mode**: Combine both approaches for maximum accuracy

### 🔒 **HIPAA Compliance**
- **Automatic PHI Detection**: Intelligent classification using pattern matching
- **Sensitivity Levels**: PUBLIC, INTERNAL, RESTRICTED, HIGHLY_SENSITIVE, PSYCHIATRIC, GENETIC
- **Compliance Gap Analysis**: Identify missing encryption, access controls, and audit trails
- **Regulatory Mapping**: Links to specific HIPAA regulations and requirements

### 📚 **Medical Domain Intelligence**
- **Domain Classification**: Automatic categorization by medical specialty
- **Medical Purpose**: Infer clinical purpose from column names and context
- **Healthcare Terminology**: Built-in medical vocabulary for accurate classification

### 📖 **Documentation Generation**
- **Handlebars Templates**: Flexible, customizable documentation templates
- **Multiple Formats**: Markdown, HTML, JSON output support
- **Multilingual Support**: Spanish-first with English fallbacks
- **Rich Metadata**: Performance indexes, constraints, relationships

## 🏗️ Architecture

```
scripts/database-glossary/
├── adapters/
│   ├── postgresql.ts      # PostgreSQL introspection adapter
│   └── sql-parser.ts      # SQL file parsing adapter
├── templates/
│   ├── main.hbs          # Main documentation template
│   ├── table-detail.hbs  # Detailed table documentation
│   ├── hipaa-compliance.hbs # HIPAA compliance report
│   └── helpers.js        # Handlebars helper functions
├── utils/
│   └── hipaa-classifier.ts # HIPAA compliance classifier
├── types/
│   └── index.ts          # TypeScript type definitions
└── cli/
    └── index.ts          # Command-line interface
```

## 🚀 Quick Start

### 1. Installation

```bash
# Dependencies are already installed in the monorepo
pnpm install
```

### 2. Configuration

Create a configuration file or use environment variables:

```json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "database": "autamedica",
    "username": "postgres",
    "password": "your-password"
  },
  "sql_parsing": {
    "enabled": true,
    "source_directories": ["supabase/migrations", "sql"]
  },
  "hipaa": {
    "enabled": true,
    "auto_classify": true
  },
  "output": {
    "output_directory": "./generated-docs"
  }
}
```

### 3. Basic Usage

```bash
# Validate configuration
node scripts/database-glossary/cli/index.ts validate

# Parse SQL files (CI/CD mode)
node scripts/database-glossary/cli/index.ts parse

# PostgreSQL introspection (live database)
node scripts/database-glossary/cli/index.ts introspect

# Hybrid mode (recommended)
node scripts/database-glossary/cli/index.ts hybrid

# Generate documentation from existing data
node scripts/database-glossary/cli/index.ts generate

# Run comprehensive tests
node scripts/database-glossary/cli/index.ts test
```

## 📊 Example Output

### Database Overview
```markdown
# 📊 Base de Datos AutaMedica - Glosario Técnico

## 📋 Información General
| Campo | Valor |
|-------|-------|
| Base de Datos | autamedica |
| Total Tablas | 15 |
| Columnas HIPAA | 47 |
| Brechas Críticas | 2 |

## 🔒 Resumen HIPAA
- ✅ Tablas Revisadas: 15
- 🔒 Tablas con PHI: 8
- ⚠️ Columnas Alta Sensibilidad: 25
```

### Table Documentation
```markdown
#### 📄 `patients`
**Propósito**: Gestión de información de pacientes
**🔒 Clasificación HIPAA**: RESTRICTED

| Columna | Tipo | HIPAA | Propósito |
|---------|------|-------|-----------|
| `social_security_number` | varchar(11) | HIGHLY_SENSITIVE | Identificación única |
| `email` | varchar(255) | RESTRICTED | Comunicación |
| `date_of_birth` | date | RESTRICTED | Cálculo de edad |
```

### HIPAA Compliance Report
```markdown
## 🚨 Brechas de Cumplimiento

### HIGH - MISSING_ENCRYPTION
**Tablas Afectadas**: patients, medical_records
**Recomendación**: Implementar encriptación a nivel de columna

### MEDIUM - INSUFFICIENT_ACCESS_CONTROL
**Tablas Afectadas**: prescriptions
**Recomendación**: Configurar Row Level Security (RLS)
```

## 🔧 Advanced Configuration

### HIPAA Classification Rules

```typescript
const customRules: HIPAAClassificationRule[] = [
  {
    rule_name: 'Custom PHI Pattern',
    pattern_type: 'COLUMN_NAME',
    pattern: '(?i).*(patient_.*|medical_.*).*',
    sensitivity_level: 'RESTRICTED',
    data_categories: ['MEDICAL_RECORD'],
    confidence: 0.85,
    auto_apply: true
  }
];
```

### Custom Documentation Templates

```handlebars
{{#each tables}}
## {{medicalDomainIcon medical_domain}} {{table_name}}

{{#if hipaa_classification.contains_phi}}
⚠️ **Contains PHI** - {{hipaa_classification.phi_column_count}} columns
{{/if}}

| Column | Type | HIPAA Level |
|--------|------|-------------|
{{#each columns}}
| `{{column_name}}` | {{data_type}} | {{#if hipaa_annotation}}{{hipaaLevelIcon hipaa_annotation.sensitivity_level}}{{/if}} |
{{/each}}
{{/each}}
```

## 🔍 HIPAA Compliance Features

### Automatic Classification

The system automatically classifies columns based on:

- **Pattern Matching**: Column names, data types, table context
- **Medical Vocabulary**: Healthcare-specific terminology
- **Regulatory Mapping**: HIPAA categories and requirements

### Sensitivity Levels

| Level | Description | Examples |
|-------|-------------|----------|
| `PUBLIC` | No PHI, publicly shareable | Country, general statistics |
| `INTERNAL` | Internal use, no patient data | User IDs, system metadata |
| `RESTRICTED` | Contains PHI, access controlled | Names, addresses, phone numbers |
| `HIGHLY_SENSITIVE` | Critical PHI, audit required | SSN, medical records, diagnoses |
| `PSYCHIATRIC` | Mental health, special protection | Therapy notes, mental health diagnoses |
| `GENETIC` | Genetic information, federal protection | DNA tests, genetic predispositions |

### Compliance Gap Detection

- **Missing Encryption**: PHI columns without encryption
- **Insufficient Access Control**: Tables lacking RLS or role-based access
- **No Audit Trail**: PHI access without logging
- **Unclear Retention**: Missing data retention policies
- **Unclassified PHI**: Columns requiring manual review

## 🚀 CI/CD Integration

### GitHub Actions Workflow

The system includes a comprehensive GitHub Actions workflow (`database-glossary-validation.yml`) that:

1. **Detects Changes**: Monitors SQL files and schema changes
2. **Validates Parsing**: Tests SQL file parsing in CI environment
3. **HIPAA Analysis**: Runs compliance checks automatically
4. **Generates Reports**: Creates documentation and compliance reports
5. **Artifact Storage**: Saves reports for 30-90 days

### Usage in CI/CD

```yaml
# Trigger on SQL changes
on:
  push:
    paths:
      - 'supabase/migrations/**'
      - 'sql/**'

jobs:
  validate-schema:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run database glossary validation
        run: |
          node scripts/database-glossary/cli/index.ts parse
          node scripts/database-glossary/cli/index.ts validate
```

## 🧪 Testing

### Comprehensive Test Suite

```bash
# Run the complete test suite
node scripts/test-database-glossary.js

# Test specific components
node scripts/database-glossary/cli/index.ts test
```

### Test Coverage

- ✅ **Configuration Validation**: Database connections, file paths
- ✅ **SQL Parsing**: Migration files, complex SQL constructs
- ✅ **HIPAA Classification**: PHI detection, sensitivity levels
- ✅ **Template Rendering**: Handlebars compilation, helper functions
- ✅ **Documentation Generation**: Output format validation

## 📚 Dependencies

### Core Dependencies
- **pg**: PostgreSQL client for database introspection
- **handlebars**: Template engine for documentation generation
- **change-case**: Text formatting utilities
- **globby**: File pattern matching for SQL discovery
- **prettier**: Code formatting for generated documentation

### Development Dependencies
- **@types/pg**: TypeScript definitions for PostgreSQL
- **typescript**: TypeScript compiler and type system

## 🔐 Security Considerations

### Database Access
- **Read-Only Operations**: Never modifies database schema
- **Connection Timeouts**: Configurable timeouts for security
- **Credential Management**: Supports environment variables and secure configs

### PHI Handling
- **No Data Extraction**: Analyzes schema structure only, not actual data
- **Audit Logging**: All database introspection operations are logged
- **Secure Configurations**: Sensitive config data excluded from logs

## 🗺️ Roadmap

### Phase 1: Foundation ✅ (Completed)
- [x] PostgreSQL introspection adapter
- [x] SQL parsing adapter
- [x] HIPAA classification engine
- [x] Documentation templates
- [x] CLI interface
- [x] GitHub Actions integration

### Phase 2: Enhancement (Next)
- [ ] Database schema change detection
- [ ] Interactive web UI for classification review
- [ ] Integration with Supabase CLI
- [ ] Extended medical vocabulary
- [ ] Custom validation rules
- [ ] Performance optimization

### Phase 3: Advanced Features (Future)
- [ ] Multi-database support (MySQL, Oracle)
- [ ] Real-time schema monitoring
- [ ] GDPR compliance analysis
- [ ] Machine learning for PHI detection
- [ ] Integration with EHR systems
- [ ] Automated remediation suggestions

## 🤝 Contributing

### Development Setup

```bash
# Install dependencies
pnpm install

# Run tests
node scripts/test-database-glossary.js

# Validate code
pnpm lint
pnpm typecheck
```

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Zero warnings policy
- **Documentation**: All public APIs documented
- **Testing**: Comprehensive test coverage required

## 📄 License

This Database Glossary System is part of the AutaMedica project and follows the same licensing terms.

## 🆘 Support

### Documentation
- **Type Definitions**: Complete TypeScript interfaces in `types/index.ts`
- **Examples**: Comprehensive examples in `test-database-glossary/`
- **Templates**: Customizable Handlebars templates with helpers

### Common Issues

**Q: "Database connection failed"**
A: Check database credentials, network connectivity, and firewall settings.

**Q: "No SQL files found"**
A: Verify `source_directories` configuration points to correct migration paths.

**Q: "HIPAA classification seems incorrect"**
A: Review and customize classification rules in configuration.

**Q: "Documentation generation failed"**
A: Check template syntax and ensure all required data is available.

---

## 🎯 Summary

The Database Glossary System provides enterprise-grade database documentation with automatic HIPAA compliance analysis. It supports both live database introspection and SQL file parsing, making it suitable for development, staging, and CI/CD environments.

**Key Benefits:**
- 🔒 **HIPAA Compliance**: Automatic PHI detection and gap analysis
- 📊 **Medical Intelligence**: Healthcare-specific domain classification
- 🔄 **Flexible Deployment**: Works with live databases or SQL files
- 📚 **Rich Documentation**: Comprehensive, multilingual documentation generation
- 🚀 **CI/CD Ready**: GitHub Actions integration for automated validation

**Perfect for:**
- Medical software development teams
- Healthcare compliance officers
- Database administrators in healthcare
- DevOps teams managing medical applications
- Security teams conducting HIPAA audits

The system is production-ready and has been tested with comprehensive medical database schemas containing 10+ tables, 150+ columns, and complex HIPAA compliance requirements.