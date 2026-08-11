import type { Page } from '@playwright/test';

/**
 * Targets del módulo Reportes — Resumen de ventas.
 *
 * Selectores VERIFICADOS contra la app real (apply, 2026-08-11, PRD):
 * - `btnDescargar` = texto 'Descargar' exacto → abre el menú de descarga.
 * - `opcionDescargarExcel` = texto 'Descargar Excel' exacto → dispara el
 *   download con nombre `reporte-resumen-ventas.xlsx`.
 * - URL real del reporte: `/punto-venta/reportes/reporte-ventas?vista=resumen-ventas`
 *   (fallback del fixture cuando la navegación por menú no llega al reporte).
 */
export const ReportesTargets = {
    urlResumenVentas: '/punto-venta/reportes/reporte-ventas?vista=resumen-ventas',

    btnDescargar: (page: Page) =>
        page.getByText('Descargar', { exact: true }),

    opcionDescargarExcel: (page: Page) =>
        page.getByText('Descargar Excel', { exact: true }),
};
