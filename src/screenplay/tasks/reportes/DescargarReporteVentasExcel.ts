import { expect, type Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { ReportesTargets } from '@screenplay/targets/reportes/ReportesTargets';

export interface DescargaReporteResultado {
    nombreArchivo: string;
    rutaTemporal: string;
}

/**
 * Descarga el Reporte de Ventas (Resumen de ventas) en Excel:
 * - abre el menú de descarga y espera el evento 'download' (30s).
 * - valida la extensión con regex tolerante /\.xlsx?$/i (patrón CC-03).
 * - guarda el archivo en temp (fuera del repo) para la validación de contenido.
 */
export const DescargarReporteVentasExcel = () => {
    const fn = async (page: Page): Promise<DescargaReporteResultado> => {
        await ReportesTargets.btnDescargar(page).click();

        const [download] = await Promise.all([
            page.waitForEvent('download', { timeout: 30_000 }),
            ReportesTargets.opcionDescargarExcel(page).click(),
        ]);

        const nombreArchivo = download.suggestedFilename();
        expect(nombreArchivo).toMatch(/\.xlsx?$/i);

        const dirTemp = path.join(os.tmpdir(), 'erp2-reportes');
        fs.mkdirSync(dirTemp, { recursive: true });
        const rutaTemporal = path.join(dirTemp, `re01-${Date.now()}-${nombreArchivo}`);
        await download.saveAs(rutaTemporal);

        return { nombreArchivo, rutaTemporal };
    };

    fn.displayName = 'Descargar Reporte de Ventas en Excel';
    return fn;
};
