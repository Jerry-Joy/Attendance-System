/**
 * Professional Microsoft Excel SpreadsheetML Workbook Generator (.xls)
 * Customized for GCTU Attendance Management System.
 * 
 * Generates beautifully formatted, color-styled Excel workbooks with:
 * - Clear, purpose-driven title banner (e.g. IT224 — SESSION ATTENDANCE REPORT)
 * - Single non-redundant university subtitle with timestamp
 * - Session context and summary turnout metrics
 * - Explicit auto-fitted column widths (never truncated)
 * - Gold/Navy table headers (#F5B41C / #081637)
 * - Color-coded status badges (Green for Present/Eligible, Red for Absent/At-Risk)
 * - Guaranteed leading-zero preservation for Student Index Numbers (e.g. 0421123147)
 */

interface ExcelReportConfig {
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

function escapeXml(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Strips any legacy formula wrappers e.g. ="04221045" -> 04221045
 */
export function formatStudentIdForExcel(id: string | null | undefined): string {
  if (!id) return '';
  return String(id).replace(/^[="]+|["]+$/g, '').trim();
}

/**
 * Generates and triggers download of a styled Microsoft Excel workbook (.xls)
 */
export function exportExcelCsv(config: ExcelReportConfig): void {
  const colCount = Math.max(config.headers.length, 6);

  // Determine intelligent column widths
  const colWidths = config.headers.map((header) => {
    const h = header.toLowerCase();
    if (h === '#' || h === 'no' || h === 'no.') return 45;
    if (h.includes('name')) return 200;
    if (h.includes('id') || h.includes('index')) return 145;
    if (h.includes('time') || h.includes('date')) return 125;
    if (h.includes('status') || h.includes('standing')) return 135;
    if (h.includes('verification') || h.includes('gps')) return 180;
    if (h.includes('rate') || h.includes('%') || h.includes('turnout')) return 115;
    if (h.includes('venue') || h.includes('room') || h.includes('course')) return 160;
    if (h.includes('duration')) return 100;
    return 135;
  });

  const xmlParts: string[] = [];

  xmlParts.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  xmlParts.push(`<?mso-application progid="Excel.Sheet"?>`);
  xmlParts.push(`<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"`);
  xmlParts.push(` xmlns:o="urn:schemas-microsoft-com:office:office"`);
  xmlParts.push(` xmlns:x="urn:schemas-microsoft-com:office:excel"`);
  xmlParts.push(` xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"`);
  xmlParts.push(` xmlns:html="http://www.w3.org/TR/REC-html40">`);

  // Document Properties
  xmlParts.push(` <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">`);
  xmlParts.push(`  <Author>GCTU Attendance System</Author>`);
  xmlParts.push(`  <Company>Ghana Communication Technology University</Company>`);
  xmlParts.push(`  <Created>${new Date().toISOString()}</Created>`);
  xmlParts.push(` </DocumentProperties>`);

  // Styles
  xmlParts.push(` <Styles>`);
  
  // Normal Default
  xmlParts.push(`  <Style ss:ID="Default" ss:Name="Normal">`);
  xmlParts.push(`   <Alignment ss:Vertical="Center"/>`);
  xmlParts.push(`   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#1E293B"/>`);
  xmlParts.push(`  </Style>`);

  // Main Report Title Banner (Purpose-Driven)
  xmlParts.push(`  <Style ss:ID="TitleBanner">`);
  xmlParts.push(`   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>`);
  xmlParts.push(`   <Font ss:FontName="Segoe UI" ss:Size="14" ss:Bold="1" ss:Color="#FFFFFF"/>`);
  xmlParts.push(`   <Interior ss:Color="#081637" ss:Pattern="Solid"/>`);
  xmlParts.push(`  </Style>`);

  // Subtitle Banner (University & Generation Timestamp)
  xmlParts.push(`  <Style ss:ID="SubtitleBanner">`);
  xmlParts.push(`   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>`);
  xmlParts.push(`   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#F5B41C"/>`);
  xmlParts.push(`   <Interior ss:Color="#0F2454" ss:Pattern="Solid"/>`);
  xmlParts.push(`  </Style>`);

  // Meta Section
  xmlParts.push(`  <Style ss:ID="MetaBlock">`);
  xmlParts.push(`   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>`);
  xmlParts.push(`   <Font ss:FontName="Segoe UI" ss:Size="9" ss:Color="#334155"/>`);
  xmlParts.push(`   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>`);
  xmlParts.push(`   <Borders>`);
  xmlParts.push(`    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>`);
  xmlParts.push(`   </Borders>`);
  xmlParts.push(`  </Style>`);

  // Table Headers
  xmlParts.push(`  <Style ss:ID="TableHeader">`);
  xmlParts.push(`   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>`);
  xmlParts.push(`   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>`);
  xmlParts.push(`   <Interior ss:Color="#081637" ss:Pattern="Solid"/>`);
  xmlParts.push(`   <Borders>`);
  xmlParts.push(`    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#F5B41C"/>`);
  xmlParts.push(`    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1E293B"/>`);
  xmlParts.push(`    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1E293B"/>`);
  xmlParts.push(`   </Borders>`);
  xmlParts.push(`  </Style>`);

  // Data Cells
  xmlParts.push(`  <Style ss:ID="CellLeft">`);
  xmlParts.push(`   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>`);
  xmlParts.push(`   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#1E293B"/>`);
  xmlParts.push(`   <Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/></Borders>`);
  xmlParts.push(`  </Style>`);

  xmlParts.push(`  <Style ss:ID="CellCenter">`);
  xmlParts.push(`   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>`);
  xmlParts.push(`   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#1E293B"/>`);
  xmlParts.push(`   <Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/></Borders>`);
  xmlParts.push(`  </Style>`);

  xmlParts.push(`  <Style ss:ID="CellBoldCenter">`);
  xmlParts.push(`   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>`);
  xmlParts.push(`   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#0F172A"/>`);
  xmlParts.push(`   <Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/></Borders>`);
  xmlParts.push(`  </Style>`);

  // Student Index Number Cell (Consolas Mono Font, explicit Text string)
  xmlParts.push(`  <Style ss:ID="CellStudentId">`);
  xmlParts.push(`   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>`);
  xmlParts.push(`   <Font ss:FontName="Consolas" ss:Size="10" ss:Bold="1" ss:Color="#0F172A"/>`);
  xmlParts.push(`   <Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/></Borders>`);
  xmlParts.push(`  </Style>`);

  // Status Styles
  xmlParts.push(`  <Style ss:ID="StatusGreen">`);
  xmlParts.push(`   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>`);
  xmlParts.push(`   <Font ss:FontName="Segoe UI" ss:Size="9" ss:Bold="1" ss:Color="#047857"/>`);
  xmlParts.push(`   <Interior ss:Color="#ECFDF5" ss:Pattern="Solid"/>`);
  xmlParts.push(`   <Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/></Borders>`);
  xmlParts.push(`  </Style>`);

  xmlParts.push(`  <Style ss:ID="StatusRed">`);
  xmlParts.push(`   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>`);
  xmlParts.push(`   <Font ss:FontName="Segoe UI" ss:Size="9" ss:Bold="1" ss:Color="#BE123C"/>`);
  xmlParts.push(`   <Interior ss:Color="#FFF1F2" ss:Pattern="Solid"/>`);
  xmlParts.push(`   <Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FECDD3"/></Borders>`);
  xmlParts.push(`  </Style>`);

  xmlParts.push(`  <Style ss:ID="StatusAmber">`);
  xmlParts.push(`   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>`);
  xmlParts.push(`   <Font ss:FontName="Segoe UI" ss:Size="9" ss:Bold="1" ss:Color="#B45309"/>`);
  xmlParts.push(`   <Interior ss:Color="#FFFBEB" ss:Pattern="Solid"/>`);
  xmlParts.push(`   <Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDE68A"/></Borders>`);
  xmlParts.push(`  </Style>`);

  xmlParts.push(` </Styles>`);

  // Worksheet
  xmlParts.push(` <Worksheet ss:Name="Report">`);
  xmlParts.push(`  <Table>`);

  // Define Columns with exact widths
  colWidths.forEach((w) => {
    xmlParts.push(`   <Column ss:Width="${w}"/>`);
  });

  // Construct Purpose-Driven Main Title
  let mainTitle = config.title.toUpperCase();
  if (config.courseCode && !mainTitle.includes(config.courseCode.toUpperCase())) {
    mainTitle = `${config.courseCode.toUpperCase()} — ${mainTitle}`;
  }

  // 1. Purpose-Driven Main Title Banner
  xmlParts.push(`   <Row ss:Height="28">`);
  xmlParts.push(`    <Cell ss:MergeAcross="${colCount - 1}" ss:StyleID="TitleBanner"><Data ss:Type="String">${escapeXml(mainTitle)}</Data></Cell>`);
  xmlParts.push(`   </Row>`);

  // 2. Official University Subtitle with Generation Date
  const genTime = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  xmlParts.push(`   <Row ss:Height="20">`);
  xmlParts.push(`    <Cell ss:MergeAcross="${colCount - 1}" ss:StyleID="SubtitleBanner"><Data ss:Type="String">Ghana Communication Technology University (GCTU)   •   Generated: ${escapeXml(genTime)}</Data></Cell>`);
  xmlParts.push(`   </Row>`);

  // 3. Course Context Row (if course info provided)
  if (config.courseName || config.sessionDate || config.venue) {
    const details = [
      config.courseName ? `Course: ${escapeXml(config.courseCode || '')} — ${escapeXml(config.courseName)}` : '',
      config.sessionDate ? `Date: ${escapeXml(config.sessionDate)}` : '',
      config.venue ? `Venue: ${escapeXml(config.venue)}` : '',
    ].filter(Boolean).join('   |   ');

    xmlParts.push(`   <Row ss:Height="20">`);
    xmlParts.push(`    <Cell ss:MergeAcross="${colCount - 1}" ss:StyleID="MetaBlock"><Data ss:Type="String">${details}</Data></Cell>`);
    xmlParts.push(`   </Row>`);
  }

  // 4. Summary Metrics Row (if provided)
  if (config.metaSummary && Object.keys(config.metaSummary).length > 0) {
    const summaryTxt = Object.entries(config.metaSummary)
      .map(([k, v]) => `${k}: ${v}`)
      .join('   |   ');
    xmlParts.push(`   <Row ss:Height="20">`);
    xmlParts.push(`    <Cell ss:MergeAcross="${colCount - 1}" ss:StyleID="MetaBlock"><Data ss:Type="String">Summary: ${escapeXml(summaryTxt)}</Data></Cell>`);
    xmlParts.push(`   </Row>`);
  }

  // Blank spacing row before table
  xmlParts.push(`   <Row ss:Height="12"/>`);

  // 5. Table Column Headers
  xmlParts.push(`   <Row ss:Height="24">`);
  config.headers.forEach((h) => {
    xmlParts.push(`    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`);
  });
  xmlParts.push(`   </Row>`);

  // 6. Data Rows
  config.rows.forEach((row) => {
    xmlParts.push(`   <Row ss:Height="20">`);
    row.forEach((cellVal, idx) => {
      const headerName = (config.headers[idx] || '').toLowerCase();
      const rawStr = cellVal === null || cellVal === undefined ? '' : String(cellVal).trim();
      const valStr = formatStudentIdForExcel(rawStr);
      const valLower = valStr.toLowerCase();

      let styleId = 'CellLeft';
      let dataType = 'String';

      // Status Coloring
      if (headerName.includes('status') || headerName.includes('standing') || headerName.includes('verification') || headerName.includes('gps')) {
        if (valLower.includes('present') || valLower.includes('verified') || valLower.includes('eligible') || valLower.includes('good') || valLower === 'yes') {
          styleId = 'StatusGreen';
        } else if (valLower.includes('absent') || valLower.includes('barred') || valLower.includes('critical') || valLower === 'no') {
          styleId = 'StatusRed';
        } else if (valLower.includes('warning') || valLower.includes('review')) {
          styleId = 'StatusAmber';
        } else {
          styleId = 'CellCenter';
        }
      } else if (headerName === '#' || headerName === 'no' || headerName === 'no.') {
        styleId = 'CellCenter';
        if (!isNaN(Number(valStr)) && valStr !== '') dataType = 'Number';
      } else if (headerName.includes('id') || headerName.includes('index')) {
        styleId = 'CellStudentId';
        dataType = 'String'; // String preserves leading zero!
      } else if (headerName.includes('time') || headerName.includes('date') || headerName.includes('duration') || headerName.includes('rate') || headerName.includes('%')) {
        styleId = headerName.includes('rate') ? 'CellBoldCenter' : 'CellCenter';
      } else if (typeof cellVal === 'number') {
        dataType = 'Number';
        styleId = 'CellCenter';
      }

      xmlParts.push(`    <Cell ss:StyleID="${styleId}"><Data ss:Type="${dataType}">${escapeXml(valStr)}</Data></Cell>`);
    });
    xmlParts.push(`   </Row>`);
  });

  xmlParts.push(`  </Table>`);
  xmlParts.push(` </Worksheet>`);
  xmlParts.push(`</Workbook>`);

  const fullXml = xmlParts.join('\r\n');
  const blob = new Blob([fullXml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  // Save as .xls so Microsoft Excel opens it directly with full styling
  const cleanFilename = config.filename.replace(/\.(csv|xls|xlsx)$/i, '');
  link.download = `${cleanFilename}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
