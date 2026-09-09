import {expect, type Locator, type Page} from '@playwright/test';
import {esperarCargaOverlay} from "@utils/wait-helpers";
import type {ComprobanteInfo} from '@helpers/PuntoVenta/busqueda-comprobantes.data';

export class ComprobantesGridComponent {
    constructor(private readonly page: Page) {
    }

    obtenerFilaPorNumero(numeroCompleto: string): Locator {
        const partes = numeroCompleto.split('-');
        if (partes.length >= 2) {
            const correlativo = partes[1].replace(/^0+/, '');
            // Correlativo real con dígitos → buscar por él (ej: "200" en "F001-00000200")
            if (correlativo) {
                return this.page.locator('tr').filter({hasText: correlativo}).first();
            }

            const serie = partes[0];
            if (serie && serie !== '0') {
                return this.page.locator('tr').filter({hasText: serie}).first();
            }
        }

        return this.page.locator('tbody tr').first();
    }

    async validarSinResultados(): Promise<void> {
        await expect(
            this.page.getByRole('cell').filter({hasText: /no encontramos resultados/i}).first(),
        ).toBeVisible({timeout: 10_000});
    }

    async obtenerColumnasVisibles(): Promise<string[]> {
        const headers = await this.page.locator('thead th').all();
        const textos: string[] = [];
        for (const th of headers) {
            const texto = (await th.textContent())?.trim() ?? '';
            if (texto) textos.push(texto);
        }
        return textos;
    }

    async obtenerValoresColumna(nombreColumna: string): Promise<string[]> {
        const headers = await this.page.locator('thead th').all();
        let colIndex = -1;
        for (let i = 0; i < headers.length; i++) {
            const texto = (await headers[i].textContent())?.trim() ?? '';
            if (texto.toLowerCase().includes(nombreColumna.toLowerCase())) {
                colIndex = i;
                break;
            }
        }
        if (colIndex === -1) throw new Error(`Columna "${nombreColumna}" no encontrada en la grilla`);
        const celdas = await this.page.locator(`tbody tr td:nth-child(${colIndex + 1})`).all();
        const valores: string[] = [];
        for (const celda of celdas) {
            valores.push((await celda.textContent())?.trim() ?? '');
        }
        return valores;
    }

    /**
     * Igual a obtenerValoresColumna pero con coincidencia EXACTA (o prefijo exacto)
     * del encabezado, para evitar falsos positivos con la celda combinada
     * "Otros campos..." del grid, cuyo texto incluye los nombres de TODAS las
     * columnas configurables (entre ellas "Facturado" / "Referencia de venta").
     *
     * DOM discovery 13-Ago-2026: la columna "Facturado" (IdsFacturados) debe estar
     * ACTIVA para que exista un `th` con texto exacto "Facturado"; si no está
     * visible, este método lanza un error informativo (no silencioso).
     */
    async obtenerValoresColumnaExacta(nombreColumna: string): Promise<string[]> {
        const headers = await this.page.locator('thead th').all();
        const normalizado = nombreColumna.trim().toLowerCase();

        let colIndex = -1;
        for (let i = 0; i < headers.length; i++) {
            const texto = (await headers[i].textContent())?.trim() ?? '';
            if (texto.toLowerCase() === normalizado) {
                colIndex = i;
                break;
            }
        }
        if (colIndex === -1) {
            for (let i = 0; i < headers.length; i++) {
                const texto = (await headers[i].textContent())?.trim() ?? '';
                if (texto.toLowerCase().startsWith(normalizado)) {
                    colIndex = i;
                    break;
                }
            }
        }
        if (colIndex === -1) {
            throw new Error(
                `Columna "${nombreColumna}" no encontrada en la grilla. ` +
                '¿Está activa en la configuración de columnas? (campoId IdsFacturados)',
            );
        }
        const celdas = await this.page.locator(`tbody tr td:nth-child(${colIndex + 1})`).all();
        const valores: string[] = [];
        for (const celda of celdas) {
            valores.push((await celda.textContent())?.trim() ?? '');
        }
        return valores;
    }

    async obtenerIdentificadoresPrimeraPagina(): Promise<string[]> {
        const filas = await this.page.locator('tbody tr').all();
        const ids: string[] = [];
        for (const fila of filas) {
            const serie = await fila.locator('td').nth(3).textContent() ?? '';
            const correlativo = await fila.locator('td').nth(4).textContent() ?? '';
            if (serie.trim() && correlativo.trim()) {
                ids.push(`${serie.trim()}-${correlativo.trim()}`);
            }
        }
        return ids;
    }

    async ordenarPorColumna(nombreColumna: string): Promise<void> {
        const header = this.page.locator('thead th').filter({hasText: nombreColumna}).first();
        await header.click();
        await esperarCargaOverlay(this.page);
    }

    get btnSiguiente(): Locator {
        return this.page.getByText('Siguiente').first();
    }

    async irAPaginaSiguiente(): Promise<boolean> {
        const habilitado = await this.btnSiguiente.isEnabled({timeout: 5_000}).catch(() => false);
        if (!habilitado) return false;
        await this.btnSiguiente.click();
        await esperarCargaOverlay(this.page);
        return true;
    }

    estadoDe(comprobante: ComprobanteInfo) {
        const row = this.obtenerFilaPorNumero(comprobante.numeroCompleto);
        return row.locator('.label-estado-comprobante span').first();
    }

    
    obtenerCeldasDeEstado(numeroCompleto: string): Locator {
        const row = this.obtenerFilaPorNumero(numeroCompleto);
        return row.locator('.label-estado-comprobante span');
    }

    
    async obtenerCeldaSunat(numeroCompleto: string): Promise<Locator> {
        const row = this.obtenerFilaPorNumero(numeroCompleto);
        const headers = await this.page.locator('thead th').all();
        let colIndex = -1;
        for (let i = 0; i < headers.length; i++) {
            const texto = (await headers[i].textContent())?.trim() ?? '';
            if (texto.toUpperCase().includes('SUNAT')) {
                colIndex = i;
                break;
            }
        }
        if (colIndex === -1) {
            throw new Error(
                'ComprobantesGridComponent: no se encontró una columna con encabezado "SUNAT" en la grilla',
            );
        }
        return row.locator('td').nth(colIndex + 1);
    }
}
