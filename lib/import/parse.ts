import * as XLSX from "xlsx";

export type ParsedSheet = {
  headers: string[];
  rows: string[][];
};

// Handles both .csv and .xlsx — SheetJS reads either from the same buffer.
function cellToString(cell: unknown): string {
  // Real XLSX date cells (as opposed to CSV text that merely looks like a
  // date) come back as JS Date objects when cellDates is enabled — normalize
  // to a plain YYYY-MM-DD so it matches what z.iso.date() and the CSV path
  // both produce.
  if (cell instanceof Date) {
    return cell.toISOString().slice(0, 10);
  }
  return String(cell ?? "").trim();
}

export function parseSpreadsheet(buffer: Buffer): ParsedSheet {
  // raw: true stops SheetJS from auto-detecting date-like CSV text (e.g.
  // "2028-01-01") and silently rewriting it as an Excel serial number.
  // cellDates: true makes genuine XLSX date cells come back as JS Date
  // objects (handled by cellToString above) instead of serial numbers too.
  const workbook = XLSX.read(buffer, { type: "buffer", raw: true, cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const grid: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  const [headerRow, ...dataRows] = grid;
  const headers = (headerRow ?? []).map((cell) => cellToString(cell));
  const rows = dataRows
    .filter((row) => row.some((cell) => cellToString(cell) !== ""))
    .map((row) => headers.map((_, i) => cellToString(row[i])));

  return { headers, rows };
}
