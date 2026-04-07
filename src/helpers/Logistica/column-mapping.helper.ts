import { type Page } from '@playwright/test';

/**
 * Mapeo de columnas del wizard masivo (creación o actualización).
 * Centraliza la lógica para no duplicarla entre Page Objects.
 */

function stripAccents(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

function buildAccentTolerantRegex(text: string): RegExp {
  const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tolerant = escaped
    .replace(/[aáà]/gi, '[aáà]')
    .replace(/[eéè]/gi, '[eéè]')
    .replace(/[iíì]/gi, '[iíì]')
    .replace(/[oóò]/gi, '[oóò]')
    .replace(/[uúù]/gi, '[uúù]')
    .replace(/[nñ]/gi, '[nñ]');
  return new RegExp(tolerant, 'i');
}

/** Espera la tabla de asignación con dropdowns en encabezados. */
export async function waitForColumnAssignmentStep(page: Page): Promise<void> {
  await page
    .locator('th .v-select-header-small-arrow')
    .first()
    .waitFor({ state: 'visible', timeout: 15_000 });
}

/**
 * Mapea una columna del Excel al campo del sistema por encabezado de archivo.
 * Usa la fila de mapeo con `.v-select-header-small-arrow`; índice interno solo
 * para acotar el `th` correcto (evitar strict mode con la fila de preview).
 */
export async function mapColumnByFileHeader(
  page: Page,
  fileHeader: string,
  targetField: string,
): Promise<void> {
  const mappingTable = page.locator('table').filter({
    has: page.locator('th .v-select-header-small-arrow'),
  });

  const targetNormalized = stripAccents(fileHeader);

  const colIndex = await mappingTable.evaluate((tableEl, target) => {
    const normalize = (s: string) =>
      s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .trim();

    const mappingRow = Array.from(tableEl.querySelectorAll('tr')).find(
      (tr) => tr.querySelector('th .v-select-header-small-arrow'),
    );
    if (!mappingRow) return -1;

    const tryCells = (row: HTMLTableRowElement) => {
      const rowCells = row.querySelectorAll('td, th');
      for (let c = 0; c < rowCells.length; c++) {
        const n = normalize(rowCells[c].textContent ?? '');
        if (n === target || n.startsWith(`${target} `)) {
          return c + 1;
        }
      }
      return -1;
    };

    const fromMapping = tryCells(mappingRow as HTMLTableRowElement);
    if (fromMapping > 0) return fromMapping;

    const rows = tableEl.querySelectorAll('tr');
    for (const row of rows) {
      if (row === mappingRow) continue;
      const rowCells = row.querySelectorAll('td, th');
      for (let c = 0; c < rowCells.length; c++) {
        if (normalize(rowCells[c].textContent ?? '') === target) {
          return c + 1;
        }
      }
    }
    return -1;
  }, targetNormalized);

  if (colIndex <= 0) {
    return;
  }

  const mappingHeaderRow = mappingTable.locator('tr').filter({
    has: page.locator('th .v-select-header-small-arrow'),
  }).first();
  const thLocator = mappingHeaderRow.locator(`th:nth-child(${colIndex})`);
  const currentText = await thLocator.textContent({ timeout: 3_000 });
  const curNorm = stripAccents(currentText ?? '');
  const targetNorm = stripAccents(targetField);

  // Solo consideramos "ya mapeado" cuando el encabezado ya refleja el campo destino.
  // Si el encabezado muestra el header del archivo (p. ej. DESCRIPCION) eso NO garantiza
  // que esté mapeado al campo correcto (p. ej. Nombre) y debemos permitir remapeo.
  if (curNorm.startsWith(targetNorm)) {
    return;
  }

  await thLocator.locator('.v-select-header-small-arrow').click({ timeout: 5_000 });

  const optionRegex = buildAccentTolerantRegex(targetField);

  await page
    .locator('.v-select-base-options.is-open')
    .locator('.v-text.v-p.regular.ellipsis.text-align-left')
    .filter({ hasText: optionRegex })
    .first()
    .click({ timeout: 5_000 });

  const updatedText = await thLocator.textContent({ timeout: 3_000 });
  const updNorm = stripAccents(updatedText ?? '');
  if (!updNorm.startsWith(targetNorm) && !updNorm.startsWith(targetNormalized)) {
    throw new Error(
      `Mapeo de columna falló: "${fileHeader}" → "${targetField}". ` +
        `Encabezado: "${(updatedText ?? '').trim()}"`,
    );
  }
}
