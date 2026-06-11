/**
 * CSV Export Utility for MeraShop Admin
 * Converts array of objects to CSV and triggers browser download.
 */

interface CsvColumn {
  key: string;
  label: string;
}

/**
 * Escapes a value for CSV format.
 * Handles commas, double quotes, and newlines.
 */
function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If the value contains a comma, double quote, or newline, wrap it in quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
    // Escape double quotes by doubling them
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Converts an array of objects to a CSV string.
 *
 * @param data - Array of objects to convert
 * @param columns - Column definitions with key and label
 * @returns CSV formatted string
 */
export function generateCSV(data: Record<string, unknown>[], columns: CsvColumn[]): string {
  // Header row
  const header = columns.map((col) => escapeCsvValue(col.label)).join(',');

  // Data rows
  const rows = data.map((row) =>
    columns.map((col) => escapeCsvValue(row[col.key])).join(',')
  );

  return [header, ...rows].join('\n');
}

/**
 * Triggers a CSV file download in the browser.
 *
 * @param data - Array of objects to export
 * @param filename - Name of the file (without extension)
 * @param columns - Column definitions with key and label
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
  columns: CsvColumn[]
): void {
  const csv = generateCSV(data, columns);

  // Add BOM for Excel UTF-8 compatibility
  const bom = '\uFEFF';
  const csvWithBom = bom + csv;

  const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the object URL
  URL.revokeObjectURL(url);
}
