import {expect, type Page} from '@playwright/test';
import type {ComprobanteInfo} from '@helpers/PuntoVenta/busqueda-comprobantes.data';
import {ComprobantesAccionesComponent} from './ComprobantesAccionesComponent';
import {esperarCargaOverlay} from '@utils/wait-helpers';

export class ComprobantesBitacoraComponent {
    constructor(private readonly page: Page) {
    }

    private static readonly BITACORA_POLL = {
        interval: 5_000,
        timeout: 90_000,
    };

    async abrirBitacora(): Promise<void> {
        await this.page.getByText('Bitácora').click();
    }

    async cerrarBitacora(): Promise<void> {
        await this.page.locator('.drape.is-open > .button-close > .icon').click();
    }

    async abrirBitacoraDelPrimerComprobante(): Promise<void> {
        const acciones = new ComprobantesAccionesComponent(this.page);
        await acciones.abrirDropdownPrimerComprobante();
        await this.abrirBitacora();
    }

    private async esperarEntradaBitacora(
        patron: RegExp | string,
        descripcion: string,
        options?: { interval?: number; timeout?: number },
    ): Promise<void> {
        const {interval, timeout} = {
            ...ComprobantesBitacoraComponent.BITACORA_POLL,
            ...options,
        };
        const deadline = Date.now() + timeout;
        const locator = this.page.getByText(patron).first();

        const visible = await locator.isVisible().catch(() => false);
        if (visible) return;

        while (Date.now() < deadline) {
            await new Promise(r => setTimeout(r, interval));

            await this.cerrarBitacora();
            await this.abrirBitacoraDelPrimerComprobante();

            const found = await locator.isVisible().catch(() => false);
            if (found) {
                console.log(`  ✓ Bitácora: "${descripcion}" encontrado tras polling`);
                return;
            }
            console.log(`   Bitácora: esperando "${descripcion}"...`);
        }

        await expect(locator).toBeVisible({
            timeout: 5_000,
        });
    }

    async validarCDRAceptado(): Promise<void> {
        await this.esperarEntradaBitacora(
            /ha sido aceptada/i,
            'CDR Aceptado (SUNAT)',
        );
    }

    async validarDescargoInventarios(): Promise<void> {
        await this.esperarEntradaBitacora(
            /Se descargaron los Inventarios/i,
            'Descargo de Inventarios (Logística)',
        );
    }

    async validarSinDescargoInventarios(): Promise<void> {
        await new Promise(r => setTimeout(r, 10_000));
        await this.cerrarBitacora();
        await this.abrirBitacoraDelPrimerComprobante();
        await expect(
            this.page.getByText(/Se descargaron los Inventarios/i),
        ).not.toBeVisible({timeout: 5_000});
    }

    async validarComprobanteEmitido(estadoSunat: 'EXITOSO' | 'TRANSITORIO' | 'DEFINITIVO' = 'EXITOSO'): Promise<void> {
        await expect(
            this.page.getByText('Comprobante Emitido').first(),
        ).toBeVisible({timeout: 10_000});

        if (estadoSunat === 'EXITOSO') {
            await this.esperarEntradaBitacora(
                /ha sido aceptada/i,
                'CDR Aceptado (SUNAT)',
                {timeout: 15_000},
            );
        }
    }

    async validarComprobanteEmitidonota(): Promise<void> {
        await expect(
            this.page.getByText('Comprobante Emitido').first(),
        ).toBeVisible({timeout: 10_000});
    }

    async validarXMLGenerado(): Promise<void> {
        await this.esperarEntradaBitacora(
            'XML Generado',
            'XML Generado',
            {timeout: 30_000},
        );
    }

    async validarPDFGenerado(): Promise<void> {
        await this.esperarEntradaBitacora(
            'PDF Generado',
            'PDF Generado',
            {timeout: 30_000},
        );
    }

    async validarBitacoraDelPrimerComprobante(eventos: string[]): Promise<void> {
        const {expect} = await import('@playwright/test');
        const acciones = new ComprobantesAccionesComponent(this.page);
        const deadline = Date.now() + 90_000;

        await acciones.abrirAccionesDelPrimerComprobante();
        await this.abrirBitacora();

        while (Date.now() < deadline) {
            await this.page.locator('.drape.is-open').waitFor({state: 'visible', timeout: 5_000});
            await esperarCargaOverlay(this.page);

            const drapeText = await this.page.locator('.drape.is-open').innerText().catch(() => '');
            const faltantes = eventos.filter(e => !drapeText.includes(e));

            if (faltantes.length === 0) {
                await this.cerrarBitacora();
                console.log(`  ✓ Bitácora: [${eventos.join(', ')}]`);
                return;
            }

            console.log(`   Bitácora: esperando [${faltantes.join(', ')}]...`);
            await this.cerrarBitacora();
            await new Promise(r => setTimeout(r, 5_000));
            await acciones.abrirAccionesDelPrimerComprobante();
            await this.abrirBitacora();
        }

        // Último intento con assert para error claro
        for (const evento of eventos) {
            await expect(this.page.locator('.drape.is-open')).toContainText(evento, {timeout: 5_000});
        }
        await this.cerrarBitacora();
    }

    async validarBitacoraContiene(comprobante: ComprobanteInfo, eventos: string[]): Promise<void> {
        const {expect} = await import('@playwright/test');
        const acciones = new ComprobantesAccionesComponent(this.page);
        const deadline = Date.now() + 90_000;

        await acciones.abrirAccionesDeComprobante(comprobante.numeroCompleto);
        await this.abrirBitacora();

        while (Date.now() < deadline) {
            await this.page.locator('.drape.is-open').waitFor({state: 'visible', timeout: 5_000});
            await esperarCargaOverlay(this.page);

            const drapeText = await this.page.locator('.drape.is-open').innerText().catch(() => '');
            const faltantes = eventos.filter(e => !drapeText.includes(e));

            if (faltantes.length === 0) {
                await this.cerrarBitacora();
                console.log(`  ✓ Bitácora: [${eventos.join(', ')}]`);
                return;
            }

            console.log(`   Bitácora: esperando [${faltantes.join(', ')}]...`);
            await this.cerrarBitacora();
            await new Promise(r => setTimeout(r, 5_000));
            await acciones.abrirAccionesDeComprobante(comprobante.numeroCompleto);
            await this.abrirBitacora();
        }

        // Último intento con assert para error claro
        for (const evento of eventos) {
            await expect(this.page.locator('.drape.is-open')).toContainText(evento, {timeout: 5_000});
        }
        await this.cerrarBitacora();
    }
}
