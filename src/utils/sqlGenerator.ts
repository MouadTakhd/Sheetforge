export type DbDialect = 'mysql' | 'postgres' | 'sqlite';

export interface SqlGeneratorOptions {
  dialect: DbDialect;
  tableName: string;
  columns: string[];
  inferredTypes: Record<string, string>;
  customTypes: Record<string, string>;
  columnExclusions: Record<string, boolean>;
  primaryKey: string | null;
  rows: any[];
}

/**
 * Escapes single quotes in string values for SQL safety.
 */
function escapeSqlString(val: any): string {
  if (val === null || val === undefined) {
    return 'NULL';
  }
  const str = String(val);
  return str.replace(/'/g, "''");
}

/**
 * Sanitize an identifier (table name or column name) to be safe for SQL queries.
 */
export function sanitizeIdentifier(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/^([0-9])/, '_$1')
    .toLowerCase();
}

/**
 * Get quotes for table/column identifiers based on database dialect.
 */
function quoteIdentifier(name: string, dialect: DbDialect): string {
  const sanitized = sanitizeIdentifier(name);
  if (dialect === 'mysql') {
    return `\`${sanitized}\``;
  }
  return `"${sanitized}"`;
}

/**
 * Format value according to the column type for the SQL INSERT statement.
 */
function formatValueForSql(value: any, type: string): string {
  if (value === null || value === undefined || value === '') {
    return 'NULL';
  }

  const upperType = type.toUpperCase();
  
  if (upperType.includes('INT') || upperType.includes('NUM') || upperType.includes('FLOAT') || upperType.includes('REAL') || upperType.includes('DECIMAL')) {
    if (typeof value === 'number') {
      return isNaN(value) ? 'NULL' : String(value);
    }
    const parsed = Number(value);
    return isNaN(parsed) ? 'NULL' : String(parsed);
  }

  if (upperType.includes('BOOL')) {
    if (typeof value === 'boolean') {
      return value ? 'TRUE' : 'FALSE';
    }
    const str = String(value).toLowerCase();
    if (str === 'true' || str === '1' || str === 'yes' || str === 't') {
      return 'TRUE';
    }
    return 'FALSE';
  }

  // MySQL boolean is TINYINT(1) where TRUE is 1, FALSE is 0
  if (upperType === 'TINYINT(1)') {
    const str = String(value).toLowerCase();
    if (str === 'true' || str === '1' || str === 'yes' || str === 't') {
      return '1';
    }
    return '0';
  }

  // Dates or strings need single quotes
  return `'${escapeSqlString(value)}'`;
}

/**
 * Generates CREATE TABLE and INSERT INTO SQL queries.
 */
export function generateSql(options: SqlGeneratorOptions): string {
  const {
    dialect,
    tableName,
    columns,
    inferredTypes,
    customTypes,
    columnExclusions,
    primaryKey,
    rows,
  } = options;

  const activeColumns = columns.filter((col) => !columnExclusions[col]);
  const tableIdentifier = quoteIdentifier(tableName, dialect);

  if (activeColumns.length === 0) {
    return '-- No columns selected for SQL generation.';
  }

  const sqlLines: string[] = [];
  sqlLines.push(`-- SQL Schema Generated for ${dialect.toUpperCase()}`);
  sqlLines.push(`-- Generated on: ${new Date().toISOString()}`);
  sqlLines.push('');

  // Drop table if exists (optional, let's make it easy to overwrite)
  sqlLines.push(`DROP TABLE IF EXISTS ${tableIdentifier};`);
  sqlLines.push('');

  // CREATE TABLE
  sqlLines.push(`CREATE TABLE ${tableIdentifier} (`);

  const columnDefinitions = activeColumns.map((col) => {
    const colIdentifier = quoteIdentifier(col, dialect);
    const resolvedType = customTypes[col] || inferredTypes[col] || 'VARCHAR(255)';
    
    let line = `  ${colIdentifier} ${resolvedType}`;
    
    if (col === primaryKey) {
      line += ' PRIMARY KEY';
    }
    
    return line;
  });

  sqlLines.push(columnDefinitions.join(',\n'));
  sqlLines.push(');');
  sqlLines.push('');

  if (rows.length === 0) {
    sqlLines.push('-- No data rows to insert.');
    return sqlLines.join('\n');
  }

  // INSERT statements
  sqlLines.push(`-- Inserting ${rows.length} rows`);
  
  // To avoid huge SQL files, we can batch or generate them in blocks.
  // We'll generate standard multi-row inserts for Dialects if supported, or individual insert statements.
  const escapedColNames = activeColumns.map((col) => quoteIdentifier(col, dialect)).join(', ');
  
  if (dialect === 'mysql' || dialect === 'postgres' || dialect === 'sqlite') {
    // Standard multi-value INSERT
    const maxBatchSize = 1000;
    for (let i = 0; i < rows.length; i += maxBatchSize) {
      const batch = rows.slice(i, i + maxBatchSize);
      
      sqlLines.push(`INSERT INTO ${tableIdentifier} (${escapedColNames}) VALUES`);
      
      const valueRows = batch.map((row) => {
        const valStrings = activeColumns.map((col) => {
          const rawVal = row[col];
          const resolvedType = customTypes[col] || inferredTypes[col] || 'VARCHAR(255)';
          return formatValueForSql(rawVal, resolvedType);
        });
        return `  (${valStrings.join(', ')})`;
      });

      sqlLines.push(valueRows.join(',\n') + ';');
      sqlLines.push('');
    }
  } else {
    // Single insert statements fallback
    rows.forEach((row) => {
      const valStrings = activeColumns.map((col) => {
        const rawVal = row[col];
        const resolvedType = customTypes[col] || inferredTypes[col] || 'VARCHAR(255)';
        return formatValueForSql(rawVal, resolvedType);
      });
      sqlLines.push(`INSERT INTO ${tableIdentifier} (${escapedColNames}) VALUES (${valStrings.join(', ')});`);
    });
  }

  return sqlLines.join('\n');
}

/**
 * Infer SQL types based on array values for each column.
 */
export function inferSqlTypes(rows: any[], columns: string[], dialect: DbDialect): Record<string, string> {
  const types: Record<string, string> = {};

  columns.forEach((col) => {
    let hasFloat = false;
    let hasInteger = false;
    let hasBoolean = false;
    let hasDate = false;
    let hasString = false;
    let maxLength = 0;
    let totalCount = 0;

    // Check up to 200 rows for typing to avoid freezing browser on huge spreadsheets
    const limit = Math.min(rows.length, 200);
    for (let i = 0; i < limit; i++) {
      const val = rows[i]?.[col];
      if (val === null || val === undefined || val === '') {
        continue;
      }
      
      totalCount++;
      const strVal = String(val).trim();
      maxLength = Math.max(maxLength, strVal.length);

      // Check number
      if (typeof val === 'number') {
        if (Number.isInteger(val)) {
          hasInteger = true;
        } else {
          hasFloat = true;
        }
        continue;
      }

      // If string is boolean
      const lowerVal = strVal.toLowerCase();
      if (lowerVal === 'true' || lowerVal === 'false' || lowerVal === 'yes' || lowerVal === 'no') {
        hasBoolean = true;
        continue;
      }

      // Check numeric string
      if (!isNaN(Number(strVal)) && strVal !== '') {
        if (strVal.includes('.')) {
          hasFloat = true;
        } else {
          hasInteger = true;
        }
        continue;
      }

      // Check date
      const dateNum = Date.parse(strVal);
      // Ensure it's a reasonably valid date and matches date-like format (e.g. has dash or slash or is ISO)
      if (!isNaN(dateNum) && (strVal.includes('-') || strVal.includes('/') || strVal.includes(':') || strVal.length > 8)) {
        hasDate = true;
        continue;
      }

      hasString = true;
    }

    // Default column fallback if empty
    if (totalCount === 0) {
      types[col] = dialect === 'mysql' ? 'VARCHAR(255)' : dialect === 'postgres' ? 'VARCHAR(255)' : 'TEXT';
      return;
    }

    if (hasString) {
      if (maxLength > 255) {
        types[col] = dialect === 'postgres' || dialect === 'sqlite' ? 'TEXT' : 'TEXT';
      } else {
        types[col] = dialect === 'postgres' ? `VARCHAR(${Math.max(50, maxLength)})` : `VARCHAR(${Math.max(50, maxLength)})`;
      }
    } else if (hasDate) {
      types[col] = dialect === 'postgres' ? 'TIMESTAMP' : dialect === 'mysql' ? 'DATETIME' : 'TEXT';
    } else if (hasFloat) {
      types[col] = dialect === 'postgres' ? 'DOUBLE PRECISION' : dialect === 'mysql' ? 'DOUBLE' : 'REAL';
    } else if (hasInteger) {
      types[col] = dialect === 'postgres' ? 'BIGINT' : dialect === 'mysql' ? 'INT' : 'INTEGER';
    } else if (hasBoolean) {
      types[col] = dialect === 'postgres' ? 'BOOLEAN' : dialect === 'mysql' ? 'TINYINT(1)' : 'INTEGER';
    } else {
      types[col] = dialect === 'mysql' ? 'VARCHAR(255)' : 'TEXT';
    }
  });

  return types;
}
