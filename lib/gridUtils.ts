import { chunk } from './arrayUtils';

export function gridRowChunks<T>(items: T[], perRow: number = 3): T[][] {
  const rows = chunk(items, perRow);
  if (rows.length === 2 && rows[0].length === 1 && rows[1].length === perRow) {
    const flat = [...rows[0], ...rows[1]]; // length perRow+1
    return [flat.slice(0, perRow), flat.slice(perRow)];
  }
  return rows;
}

interface BuildGridOpts {
  gap?: number;
  cellPad?: number;
  perRow?: number;
}

export function buildGridRowsHtml(images: string[], opts: BuildGridOpts = {}): string {
  const { gap = 12, cellPad = 6, perRow = 3 } = opts;
  const rows = gridRowChunks(images, perRow);
  return rows.map((row, rIdx) => {
    const colCount = row.length;
    const cells = row.map(src => {
      const percent = colCount === 3 ? '33.333%' : (colCount === 2 ? '50%' : '100%');
      return `<td align="center" valign="top" style="padding:0 ${cellPad}px 0 ${cellPad}px;width:${percent};">`+
        `<img src="${src}" alt="Product image" style="display:block;width:100%;height:auto;border:0;outline:0;text-decoration:none;-ms-interpolation-mode:bicubic;" />`+
        `</td>`;
    }).join('');
    const rowTable = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0;padding:0;"><tr>${cells}</tr></table>`;
    const spacer = rIdx === rows.length - 1 ? '' : `<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr><td style=\"height:${gap}px;font-size:0;line-height:${gap}px;\">&nbsp;</td></tr></table>`;
    return rowTable + spacer;
  }).join('');
}
