/**
 * Utility for exporting beautifully formatted, Excel-compatible CSV reports
 * for GCTU Attendance Management System.
 */

interface CsvReportConfig {
  title: string;
  courseCode?: string;
  courseName?: string;
  sessionDate?: string;
  venue?: string;
  metaSummary?: Record<string, string | number>;
  headers: string[];
  rows: (string | number | boolean | null | undefined)[][];
  filename: string;
}

/**
 * Properly escapes a cell value for CSV format.
 * Quotes fields containing commas, quotes, or newlines.
 */
function escapeCsvCell(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Formats a student index number / ID so Excel preserves leading zeros.
 */
export function formatStudentIdForExcel(id: string | null | undefined): string {
  if (!id) return '';
  const clean = String(id).trim();
  // Excel formula format ="04221045" forces text representation
  return `="${clean}"`;
}

/**
 * Generates and downloads a clean, professional CSV file formatted for Microsoft Excel.
 */
export function exportExcelCsv(config: CsvReportConfig): void {
  const lines: string[] = [];

  // 1. Institutional Branding & Title
  lines.push('GCTU ATTENDANCE MANAGEMENT SYSTEM');
  lines.push('Ghana Communication Technology University');
  lines.push(`Report: ${config.title}`);
  lines.push(`Generated: ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`);

  // 2. Course & Session Info (if provided)
  if (config.courseCode || config.courseName) {
    lines.push(`Course: ${config.courseCode || ''} — ${config.courseName || ''}`);
  }
  if (config.sessionDate || config.venue) {
    const details = [
      config.sessionDate ? `Date: ${config.sessionDate}` : '',
      config.venue ? `Venue: ${config.venue}` : '',
    ].filter(Boolean).join(' | ');
    lines.push(details);
  }

  // 3. Metadata / Summary KPI Row (if provided)
  if (config.metaSummary && Object.keys(config.metaSummary).length > 0) {
    const summaryStr = Object.entries(config.metaSummary)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' | ');
    lines.push(`Summary: ${summaryStr}`);
  }

  // Blank separator line before data table
  lines.push('');

  // 4. Table Headers
  lines.push(config.headers.map(escapeCsvCell).join(','));

  // 5. Data Rows
  config.rows.forEach((row) => {
    lines.push(row.map(escapeCsvCell).join(','));
  });

  // Prepend UTF-8 Byte Order Mark (\uFEFF) so Excel opens UTF-8 properly on Windows and Mac
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = config.filename.endsWith('.csv') ? config.filename : `${config.filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
