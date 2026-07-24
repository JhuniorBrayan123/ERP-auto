import type {Page} from '@playwright/test';
import {ClientePage} from '@pages/PuntoVenta/ClientePage';
import type {DatosCliente} from '@app-types/emision.types';

export interface DatosClienteCE {
    documento: string;
    nombre: string;
    direccion: string;
    telefono: string;
    email: string;
    textoSelector: string;
}

async function cerrarModalSiEsVisible(page: Page): Promise<void> {
    const modal = page.locator('[class*="modal"], [class*="Modal"], [class*="overlay"], [class*="Overlay"]')
        .filter({hasText: 'Nuevo Cliente'})
        .first();
    const visible = await modal.isVisible().catch(() => false);
    if (visible) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
    }
}

export async function asegurarClienteExtranjeria(
    page: Page,
    datosCE: DatosClienteCE
): Promise<DatosCliente & { textoSelector: string }> {
    const clientePage = new ClientePage(page);
    await clientePage.buscarCliente(datosCE.documento);
    await page.waitForTimeout(500);
    const cardCliente = page.locator('.card-entidad-cliente')
        .filter({hasText: datosCE.textoSelector})
        .first();
    const existe = await cardCliente.isVisible().catch(() => false);

    if (existe) {

        await cardCliente.click();
        return {
            tipoDocumento: 'Carnet Extranjeria',
            documento: datosCE.documento,
            nombre: datosCE.nombre,
            textoSelector: datosCE.textoSelector,
        };
    }

    // 3. No apareció en resultados → cerrar dropdown e intentar crear
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    await clientePage.crearClienteExtranjeria({
        documento: datosCE.documento,
        nombre: datosCE.nombre,
        direccion: datosCE.direccion,
        telefono: datosCE.telefono,
        email: datosCE.email,
    });

    // 4. Esperar respuesta del POST de creación
    const responseOk = await page.waitForResponse(
        r => r.url().includes('clientes') && r.request().method() === 'POST',
        {timeout: 10000}
    ).then(r => r.ok()).catch(() => false);

    await page.waitForTimeout(800);

    // 5. Si el sistema dijo "ya esta registrado", cerrar modal y seleccionar existente
    if (!responseOk) {
        const yaRegistrado = page.getByText('ya esta registrado');
        if (await yaRegistrado.isVisible().catch(() => false)) {
            await cerrarModalSiEsVisible(page);
        }

        // Buscar de nuevo y seleccionar el cliente existente
        await clientePage.buscarCliente(datosCE.documento);
        await page.waitForTimeout(500);
        await page.locator('.card-entidad-cliente')
            .filter({hasText: datosCE.textoSelector})
            .first()
            .click();
    }

    return {
        tipoDocumento: 'Carnet Extranjeria',
        documento: datosCE.documento,
        nombre: datosCE.nombre,
        textoSelector: datosCE.textoSelector,
    };
}
