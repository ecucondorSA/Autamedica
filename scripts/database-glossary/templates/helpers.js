/**
 * @fileoverview Handlebars helper functions for database glossary templates
 *
 * This module provides custom Handlebars helpers for formatting and processing
 * database documentation with medical and HIPAA-specific context.
 */

import Handlebars from 'handlebars';

// Simple text transformation functions to replace change-case dependency
function pascalCase(str) {
  return str.replace(/\w+/g, word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).replace(/[^a-zA-Z0-9]/g, '');
}

function camelCase(str) {
  const pascal = pascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function kebabCase(str) {
  return str.replace(/\s+/g, '-')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');
}

function snakeCase(str) {
  return str.replace(/\s+/g, '_')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '');
}

function titleCase(str) {
  return str.replace(/\w\S*/g, word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
}

function paramCase(str) {
  return kebabCase(str);
}

/**
 * Register all custom Handlebars helpers
 */
export function registerHelpers() {
  // Conditional helpers
  Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('ifNotEquals', function(arg1, arg2, options) {
    return (arg1 !== arg2) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('ifGreaterThan', function(arg1, arg2, options) {
    return (arg1 > arg2) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('ifContains', function(array, value, options) {
    if (Array.isArray(array) && array.includes(value)) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  // Text formatting helpers
  Handlebars.registerHelper('pascalCase', function(str) {
    return pascalCase(str || '');
  });

  Handlebars.registerHelper('camelCase', function(str) {
    return camelCase(str || '');
  });

  Handlebars.registerHelper('kebabCase', function(str) {
    return kebabCase(str || '');
  });

  Handlebars.registerHelper('snakeCase', function(str) {
    return snakeCase(str || '');
  });

  Handlebars.registerHelper('titleCase', function(str) {
    return titleCase(str || '');
  });

  Handlebars.registerHelper('upperCase', function(str) {
    return (str || '').toUpperCase();
  });

  Handlebars.registerHelper('lowerCase', function(str) {
    return (str || '').toLowerCase();
  });

  // Date formatting helpers
  Handlebars.registerHelper('formatDate', function(dateString, format = 'es-ES') {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(format, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  });

  Handlebars.registerHelper('timeAgo', function(dateString) {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Hoy';
      if (diffDays === 1) return 'Ayer';
      if (diffDays < 7) return `Hace ${diffDays} días`;
      if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
      if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
      return `Hace ${Math.floor(diffDays / 365)} años`;
    } catch (error) {
      return dateString;
    }
  });

  // Medical domain helpers
  Handlebars.registerHelper('medicalDomainIcon', function(domain) {
    const icons = {
      'PATIENT_MANAGEMENT': '👤',
      'CLINICAL_DATA': '🩺',
      'APPOINTMENTS': '📅',
      'BILLING_FINANCIAL': '💰',
      'PROVIDER_MANAGEMENT': '👨‍⚕️',
      'FACILITY_OPERATIONS': '🏥',
      'TELEMEDICINE': '💻',
      'RESEARCH_ANALYTICS': '🔬',
      'SYSTEM_ADMINISTRATION': '⚙️',
      'COMPLIANCE_AUDIT': '📋',
      'EMERGENCY_CARE': '🚨',
      'PHARMACY': '💊',
      'LABORATORY': '🧪',
      'IMAGING': '📷',
      'UNKNOWN': '❓'
    };
    return icons[domain] || '📊';
  });

  Handlebars.registerHelper('medicalDomainName', function(domain) {
    const names = {
      'PATIENT_MANAGEMENT': 'Gestión de Pacientes',
      'CLINICAL_DATA': 'Datos Clínicos',
      'APPOINTMENTS': 'Sistema de Citas',
      'BILLING_FINANCIAL': 'Facturación y Finanzas',
      'PROVIDER_MANAGEMENT': 'Gestión de Profesionales',
      'FACILITY_OPERATIONS': 'Operaciones de Instalaciones',
      'TELEMEDICINE': 'Telemedicina',
      'RESEARCH_ANALYTICS': 'Investigación y Análisis',
      'SYSTEM_ADMINISTRATION': 'Administración del Sistema',
      'COMPLIANCE_AUDIT': 'Cumplimiento y Auditoría',
      'EMERGENCY_CARE': 'Atención de Emergencias',
      'PHARMACY': 'Farmacia',
      'LABORATORY': 'Laboratorio',
      'IMAGING': 'Imagenología',
      'UNKNOWN': 'No Clasificado'
    };
    return names[domain] || domain;
  });

  // HIPAA helpers
  Handlebars.registerHelper('hipaaLevelIcon', function(level) {
    const icons = {
      'PUBLIC': '🌐',
      'INTERNAL': '🏢',
      'RESTRICTED': '🔒',
      'HIGHLY_SENSITIVE': '⚠️',
      'PSYCHIATRIC': '🧠',
      'GENETIC': '🧬',
      'UNKNOWN': '❓'
    };
    return icons[level] || '🔒';
  });

  Handlebars.registerHelper('hipaaLevelColor', function(level) {
    const colors = {
      'PUBLIC': 'green',
      'INTERNAL': 'blue',
      'RESTRICTED': 'orange',
      'HIGHLY_SENSITIVE': 'red',
      'PSYCHIATRIC': 'purple',
      'GENETIC': 'darkred',
      'UNKNOWN': 'gray'
    };
    return colors[level] || 'gray';
  });

  Handlebars.registerHelper('hipaaLevelName', function(level) {
    const names = {
      'PUBLIC': 'Público',
      'INTERNAL': 'Interno',
      'RESTRICTED': 'Restringido',
      'HIGHLY_SENSITIVE': 'Altamente Sensible',
      'PSYCHIATRIC': 'Psiquiátrico',
      'GENETIC': 'Genético',
      'UNKNOWN': 'No Clasificado'
    };
    return names[level] || level;
  });

  // Data type helpers
  Handlebars.registerHelper('postgresTypeIcon', function(dataType) {
    const type = (dataType || '').toLowerCase();

    if (type.includes('varchar') || type.includes('text') || type.includes('char')) {
      return '📝';
    }
    if (type.includes('int') || type.includes('serial') || type.includes('bigint')) {
      return '🔢';
    }
    if (type.includes('decimal') || type.includes('numeric') || type.includes('float') || type.includes('double')) {
      return '💰';
    }
    if (type.includes('timestamp') || type.includes('date') || type.includes('time')) {
      return '📅';
    }
    if (type.includes('boolean') || type.includes('bool')) {
      return '✅';
    }
    if (type.includes('uuid')) {
      return '🔑';
    }
    if (type.includes('json') || type.includes('jsonb')) {
      return '📋';
    }
    if (type.includes('array')) {
      return '📚';
    }
    if (type.includes('bytea') || type.includes('blob')) {
      return '📁';
    }
    return '📊';
  });

  Handlebars.registerHelper('postgresTypeDescription', function(dataType) {
    const type = (dataType || '').toLowerCase();

    if (type.includes('varchar') || type.includes('text')) {
      return 'Texto variable';
    }
    if (type.includes('char')) {
      return 'Texto fijo';
    }
    if (type.includes('serial') || type.includes('bigserial')) {
      return 'Entero autoincremental';
    }
    if (type.includes('int') || type.includes('bigint')) {
      return 'Número entero';
    }
    if (type.includes('decimal') || type.includes('numeric')) {
      return 'Número decimal preciso';
    }
    if (type.includes('float') || type.includes('double')) {
      return 'Número decimal flotante';
    }
    if (type.includes('timestamp')) {
      return 'Fecha y hora';
    }
    if (type.includes('date')) {
      return 'Fecha';
    }
    if (type.includes('time')) {
      return 'Hora';
    }
    if (type.includes('boolean') || type.includes('bool')) {
      return 'Verdadero/Falso';
    }
    if (type.includes('uuid')) {
      return 'Identificador único';
    }
    if (type.includes('jsonb')) {
      return 'JSON binario';
    }
    if (type.includes('json')) {
      return 'JSON texto';
    }
    if (type.includes('array')) {
      return 'Lista de valores';
    }
    if (type.includes('bytea')) {
      return 'Datos binarios';
    }
    return dataType;
  });

  // Array and object helpers
  Handlebars.registerHelper('join', function(array, separator = ', ') {
    if (!Array.isArray(array)) return '';
    return array.join(separator);
  });

  Handlebars.registerHelper('length', function(array) {
    if (!Array.isArray(array)) return 0;
    return array.length;
  });

  Handlebars.registerHelper('first', function(array) {
    if (!Array.isArray(array) || array.length === 0) return null;
    return array[0];
  });

  Handlebars.registerHelper('last', function(array) {
    if (!Array.isArray(array) || array.length === 0) return null;
    return array[array.length - 1];
  });

  Handlebars.registerHelper('slice', function(array, start = 0, end) {
    if (!Array.isArray(array)) return [];
    return array.slice(start, end);
  });

  // Grouping helpers
  Handlebars.registerHelper('groupBy', function(array, key, options) {
    if (!Array.isArray(array)) return '';

    const groups = {};
    array.forEach(item => {
      const groupKey = item[key] || 'Otros';
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });

    let result = '';
    for (const [groupName, items] of Object.entries(groups)) {
      result += options.fn({
        group_name: groupName,
        items: items,
        item_count: items.length
      });
    }
    return result;
  });

  // Math helpers
  Handlebars.registerHelper('add', function(a, b) {
    return (a || 0) + (b || 0);
  });

  Handlebars.registerHelper('subtract', function(a, b) {
    return (a || 0) - (b || 0);
  });

  Handlebars.registerHelper('multiply', function(a, b) {
    return (a || 0) * (b || 0);
  });

  Handlebars.registerHelper('divide', function(a, b) {
    return b !== 0 ? (a || 0) / b : 0;
  });

  Handlebars.registerHelper('percentage', function(part, total) {
    if (!total || total === 0) return '0%';
    return `${Math.round((part / total) * 100)}%`;
  });

  // Security and compliance helpers
  Handlebars.registerHelper('securityIcon', function(level) {
    const icons = {
      'CRITICAL': '🚨',
      'HIGH': '❗',
      'MEDIUM': '⚠️',
      'LOW': 'ℹ️',
      'INFO': '💡'
    };
    return icons[level] || 'ℹ️';
  });

  Handlebars.registerHelper('complianceStatus', function(status) {
    const statuses = {
      'COMPLIANT': '✅ Cumple',
      'NON_COMPLIANT': '❌ No cumple',
      'PARTIAL': '⚠️ Parcial',
      'UNKNOWN': '❓ Sin revisar',
      'REVIEWING': '🔍 En revisión'
    };
    return statuses[status] || status;
  });

  // Markdown helpers
  Handlebars.registerHelper('markdownTable', function(headers, rows) {
    if (!Array.isArray(headers) || !Array.isArray(rows)) return '';

    let table = '| ' + headers.join(' | ') + ' |\n';
    table += '|' + headers.map(() => '---').join('|') + '|\n';

    rows.forEach(row => {
      table += '| ' + row.join(' | ') + ' |\n';
    });

    return table;
  });

  Handlebars.registerHelper('codeBlock', function(code, language = 'sql') {
    return `\`\`\`${language}\n${code}\n\`\`\``;
  });

  Handlebars.registerHelper('inlineCode', function(text) {
    return `\`${text}\``;
  });

  // Utility helpers
  Handlebars.registerHelper('default', function(value, defaultValue) {
    return value || defaultValue;
  });

  Handlebars.registerHelper('truncate', function(str, length = 100, suffix = '...') {
    if (!str || str.length <= length) return str;
    return str.substring(0, length) + suffix;
  });

  Handlebars.registerHelper('sanitize', function(str) {
    if (!str) return '';
    return str.replace(/[<>&"']/g, function(match) {
      const map = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#39;'
      };
      return map[match];
    });
  });

  Handlebars.registerHelper('pluralize', function(count, singular, plural) {
    if (!plural) plural = singular + 's';
    return count === 1 ? singular : plural;
  });

  // Custom block helpers
  Handlebars.registerHelper('section', function(title, options) {
    const content = options.fn(this);
    if (!content.trim()) return '';

    return `\n## ${title}\n\n${content}\n`;
  });

  Handlebars.registerHelper('subsection', function(title, options) {
    const content = options.fn(this);
    if (!content.trim()) return '';

    return `\n### ${title}\n\n${content}\n`;
  });

  Handlebars.registerHelper('alert', function(type, message) {
    const icons = {
      'info': 'ℹ️',
      'warning': '⚠️',
      'error': '❌',
      'success': '✅'
    };

    return `> ${icons[type] || 'ℹ️'} **${type.toUpperCase()}**: ${message}\n`;
  });

  console.log('✅ Handlebars helpers registered successfully');
}

/**
 * Get all available helper names (for debugging)
 */
export function getHelperNames() {
  return Object.keys(Handlebars.helpers);
}

/**
 * Validate template with context (for debugging)
 */
export function validateTemplate(templateSource, context) {
  try {
    const template = Handlebars.compile(templateSource);
    const result = template(context);
    return { valid: true, result };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      line: error.line,
      column: error.column
    };
  }
}