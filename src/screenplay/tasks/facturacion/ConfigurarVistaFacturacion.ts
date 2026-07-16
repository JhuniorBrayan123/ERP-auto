import {expect, type Page} from '@playwright/test';
import {FacturacionTargets} from '@screenplay/targets/facturacion/FacturacionTargets';

export const ConfigurarVistaFacturacion = () => {
    const fn = async (page: Page): Promise<void> => {
        await FacturacionTargets.btnCambiarVista(page).click();
        await expect(FacturacionTargets.opcionVistaFacturacion(page)).toBeVisible({timeout: 10_000});
        await FacturacionTargets.opcionVistaFacturacion(page).click();
        await FacturacionTargets.btnGuardarVista(page).click();

        await expect(FacturacionTargets.mensajeVistaGuardada(page)).toBeVisible({timeout: 10_000});
        await expect(FacturacionTargets.mensajeExito(page)).toBeVisible();


        await FacturacionTargets.btnCerrarModal(page).click();
    };
    fn.displayName = 'Configurar Vista Facturación';
    return fn;
};

export const AsegurarVistaFacturacion = () => {
    const fn = async (page: Page): Promise<void> => {
        const iconoActivo = FacturacionTargets.iconoVistaFacturacionActivo(page);
        const estaActiva = await iconoActivo.isVisible({timeout: 3_000}).catch(() => false);

        if (!estaActiva) {
            await FacturacionTargets.btnCambiarVista(page).click();
            await FacturacionTargets.opcionVistaFacturacion(page).click();
            
            await page.waitForTimeout(500); 
        }


        await expect(iconoActivo).toBeVisible({timeout: 5_000});
    };
    fn.displayName = 'Asegurar Vista Facturación activa';
    return fn;
};
