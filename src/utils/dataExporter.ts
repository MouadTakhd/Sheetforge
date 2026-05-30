import { sanitizeIdentifier } from './sqlGenerator';

/**
 * Escapes fields for CSV output, wrapping in double quotes and escaping inner double quotes.
 */
function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) {
    return '';
  }
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Export rows to CSV format, respecting excluded columns.
 */
export function exportToCsv(
  rows: any[],
  columns: string[],
  columnExclusions: Record<string, boolean>
): string {
  const activeCols = columns.filter((col) => !columnExclusions[col]);
  
  const headerLine = activeCols.map(escapeCsvCell).join(',');
  const rowLines = rows.map((row) =>
    activeCols.map((col) => escapeCsvCell(row[col])).join(',')
  );

  return [headerLine, ...rowLines].join('\n');
}

/**
 * Export rows to JSON with custom options.
 */
export function exportToJson(
  rows: any[],
  columns: string[],
  columnExclusions: Record<string, boolean>,
  format: 'object-array' | 'array-array' | 'keyed-object',
  keyColumn?: string | null
): string {
  const activeCols = columns.filter((col) => !columnExclusions[col]);

  // Clean data to exclude deactivated columns
  const cleanedRows = rows.map((row) => {
    const cleanRow: Record<string, any> = {};
    activeCols.forEach((col) => {
      cleanRow[col] = row[col];
    });
    return cleanRow;
  });

  if (format === 'array-array') {
    const headers = activeCols;
    const values = rows.map((row) => activeCols.map((col) => row[col]));
    return JSON.stringify([headers, ...values], null, 2);
  }

  if (format === 'keyed-object' && keyColumn && activeCols.includes(keyColumn)) {
    const keyedObj: Record<string, any> = {};
    rows.forEach((row) => {
      const keyVal = String(row[keyColumn]);
      const cleanRow: Record<string, any> = {};
      activeCols.forEach((col) => {
        if (col !== keyColumn) {
          cleanRow[col] = row[col];
        }
      });
      keyedObj[keyVal] = cleanRow;
    });
    return JSON.stringify(keyedObj, null, 2);
  }

  // Default: object-array
  return JSON.stringify(cleanedRows, null, 2);
}

/**
 * Escape string for XML node values.
 */
function escapeXmlValue(val: any): string {
  if (val === null || val === undefined) {
    return '';
  }
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Export rows to XML format.
 */
export function exportToXml(
  rows: any[],
  columns: string[],
  columnExclusions: Record<string, boolean>,
  rootElement = 'dataset',
  rowElement = 'row'
): string {
  const activeCols = columns.filter((col) => !columnExclusions[col]);
  const rootTag = sanitizeIdentifier(rootElement) || 'dataset';
  const rowTag = sanitizeIdentifier(rowElement) || 'row';

  const xmlLines: string[] = [];
  xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
  xmlLines.push(`<${rootTag}>`);

  rows.forEach((row) => {
    xmlLines.push(`  <${rowTag}>`);
    activeCols.forEach((col) => {
      const tag = sanitizeIdentifier(col);
      const val = escapeXmlValue(row[col]);
      xmlLines.push(`    <${tag}>${val}</${tag}>`);
    });
    xmlLines.push(`  </${rowTag}>`);
  });

  xmlLines.push(`</${rootTag}>`);
  return xmlLines.join('\n');
}
