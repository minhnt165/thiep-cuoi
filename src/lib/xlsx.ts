/**
 * Tạo file Excel .xlsx tối giản, không cần thư viện: một bảng tính, dòng tiêu đề
 * in đậm đứng yên khi cuộn, bộ lọc trên tiêu đề, độ rộng cột, số tiền là số thật
 * (định dạng #,##0) và dòng tổng bằng công thức SUM.
 *
 * .xlsx là file zip chứa vài file XML; ở đây zip kiểu "stored" (không nén) cho gọn,
 * file vài trăm dòng vẫn chỉ vài chục KB.
 */

export type Cell = string | number | null | undefined;

export interface SheetSpec {
  /** Tên trang tính (tối đa 31 ký tự, không chứa : \ / ? * [ ]) */
  name: string;
  header: string[];
  rows: Cell[][];
  /** Độ rộng từng cột, đơn vị ký tự */
  widths?: number[];
  /** Chỉ số cột (0-based) là số tiền: định dạng 1.234.567 */
  moneyCols?: number[];
  /** Chỉ số cột cần dòng tổng cuối bảng (SUM) */
  totalCols?: number[];
  /** Chữ ở ô đầu dòng tổng */
  totalLabel?: string;
}

/* ---------- XML ---------- */

function esc(s: string): string {
  return s
    // Ký tự điều khiển không hợp lệ trong XML
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 0 → A, 25 → Z, 26 → AA */
export function colName(i: number): string {
  let s = "";
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

// Kiểu ô trong styles.xml: 0 thường, 1 tiêu đề đậm có nền, 2 số tiền, 3 chữ đậm (dòng tổng), 4 số tiền đậm
const S_HEADER = 1;
const S_MONEY = 2;
const S_BOLD = 3;
const S_MONEY_BOLD = 4;

function cellXml(ref: string, v: Cell, style = 0): string {
  const s = style ? ` s="${style}"` : "";
  if (v === null || v === undefined || v === "") return style ? `<c r="${ref}"${s}/>` : "";
  if (typeof v === "number" && Number.isFinite(v)) return `<c r="${ref}"${s}><v>${v}</v></c>`;
  return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${esc(String(v))}</t></is></c>`;
}

function sheetXml(spec: SheetSpec): string {
  const cols = spec.header.length;
  const money = new Set(spec.moneyCols ?? []);
  const lastCol = colName(cols - 1);
  const lines: string[] = [];

  lines.push(`<row r="1">${spec.header.map((h, c) => cellXml(`${colName(c)}1`, h, S_HEADER)).join("")}</row>`);
  spec.rows.forEach((row, i) => {
    const r = i + 2;
    const cells = Array.from({ length: cols }, (_, c) => cellXml(`${colName(c)}${r}`, row[c], money.has(c) && typeof row[c] === "number" ? S_MONEY : 0));
    lines.push(`<row r="${r}">${cells.join("")}</row>`);
  });

  const lastData = spec.rows.length + 1;
  if (spec.totalCols?.length && spec.rows.length) {
    const r = lastData + 1;
    const totals = new Set(spec.totalCols);
    const cells = Array.from({ length: cols }, (_, c) => {
      const ref = `${colName(c)}${r}`;
      if (totals.has(c)) {
        const style = money.has(c) ? S_MONEY_BOLD : S_BOLD;
        return `<c r="${ref}" s="${style}"><f>SUM(${colName(c)}2:${colName(c)}${lastData})</f></c>`;
      }
      return c === 0 ? cellXml(ref, spec.totalLabel ?? "Tổng", S_BOLD) : "";
    });
    lines.push(`<row r="${r}">${cells.join("")}</row>`);
  }

  const widths = spec.widths ?? [];
  const colsXml = spec.header
    .map((h, c) => `<col min="${c + 1}" max="${c + 1}" width="${widths[c] ?? Math.max(10, h.length + 4)}" customWidth="1"/>`)
    .join("");

  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    // Dòng tiêu đề đứng yên khi cuộn
    `<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>` +
    `<cols>${colsXml}</cols>` +
    `<sheetData>${lines.join("")}</sheetData>` +
    (spec.rows.length ? `<autoFilter ref="A1:${lastCol}${lastData}"/>` : "") +
    `</worksheet>`
  );
}

const STYLES =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
  `<numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0"/></numFmts>` +
  `<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>` +
  `<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>` +
  `<fill><patternFill patternType="solid"><fgColor rgb="FFF1ECE6"/><bgColor indexed="64"/></patternFill></fill></fills>` +
  `<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>` +
  `<border><left/><right/><top/><bottom style="thin"><color rgb="FFC9BFB3"/></bottom><diagonal/></border></borders>` +
  `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
  `<cellXfs count="5">` +
  `<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>` +
  `<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>` +
  `<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>` +
  `<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>` +
  `<xf numFmtId="164" fontId="1" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1"/>` +
  `</cellXfs>` +
  `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>` +
  `</styleSheet>`;

function safeSheetName(name: string): string {
  return name.replace(/[:\\/?*[\]]/g, " ").trim().slice(0, 31) || "Sheet1";
}

/* ---------- Zip (stored) ---------- */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function zip(files: { name: string; data: Uint8Array }[]): Uint8Array {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  // Giờ DOS cố định (1/1/2026 00:00): không cần giờ thật, file giống nhau thì byte giống nhau
  const dosTime = 0;
  const dosDate = ((2026 - 1980) << 9) | (1 << 5) | 1;

  for (const f of files) {
    const name = enc.encode(f.name);
    const crc = crc32(f.data);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true); // tên file UTF-8
    local.setUint16(8, 0, true); // stored
    local.setUint16(10, dosTime, true);
    local.setUint16(12, dosDate, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, f.data.length, true);
    local.setUint32(22, f.data.length, true);
    local.setUint16(26, name.length, true);
    local.setUint16(28, 0, true);
    parts.push(new Uint8Array(local.buffer), name, f.data);

    const cd = new DataView(new ArrayBuffer(46));
    cd.setUint32(0, 0x02014b50, true);
    cd.setUint16(4, 20, true);
    cd.setUint16(6, 20, true);
    cd.setUint16(8, 0x0800, true);
    cd.setUint16(10, 0, true);
    cd.setUint16(12, dosTime, true);
    cd.setUint16(14, dosDate, true);
    cd.setUint32(16, crc, true);
    cd.setUint32(20, f.data.length, true);
    cd.setUint32(24, f.data.length, true);
    cd.setUint16(28, name.length, true);
    cd.setUint32(42, offset, true);
    central.push(new Uint8Array(cd.buffer), name);

    offset += 30 + name.length + f.data.length;
  }

  const cdSize = central.reduce((n, p) => n + p.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, cdSize, true);
  end.setUint32(16, offset, true);

  const all = [...parts, ...central, new Uint8Array(end.buffer)];
  const out = new Uint8Array(all.reduce((n, p) => n + p.length, 0));
  let p = 0;
  for (const a of all) {
    out.set(a, p);
    p += a.length;
  }
  return out;
}

/* ---------- Ghép thành file .xlsx ---------- */

export function buildXlsx(spec: SheetSpec): Uint8Array {
  const enc = new TextEncoder();
  const name = safeSheetName(spec.name);
  const files: [string, string][] = [
    [
      "[Content_Types].xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
        `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
        `<Default Extension="xml" ContentType="application/xml"/>` +
        `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
        `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
        `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
        `</Types>`,
    ],
    [
      "_rels/.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
        `</Relationships>`,
    ],
    [
      "xl/workbook.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
        `<sheets><sheet name="${esc(name)}" sheetId="1" r:id="rId1"/></sheets>` +
        // Bộ lọc tự động cần tên ẩn này để Excel nhận đúng vùng lọc
        (spec.rows.length ? `<definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">'${esc(name.replace(/'/g, "''"))}'!$A$1:$${colName(spec.header.length - 1)}$${spec.rows.length + 1}</definedName></definedNames>` : "") +
        `<calcPr calcId="191029" fullCalcOnLoad="1"/>` +
        `</workbook>`,
    ],
    [
      "xl/_rels/workbook.xml.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
        `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
        `</Relationships>`,
    ],
    ["xl/styles.xml", STYLES],
    ["xl/worksheets/sheet1.xml", sheetXml(spec)],
  ];
  return zip(files.map(([n, x]) => ({ name: n, data: enc.encode(x) })));
}
