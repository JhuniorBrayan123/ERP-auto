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

        const iconoActivo =
            FacturacionTargets
                .iconoVistaFacturacionActivo(page);

        const btnCambiarVista =
            FacturacionTargets
                .btnCambiarVista(page);

        const opcionVista =
            FacturacionTargets
                .opcionVistaFacturacion(page);

        // Primero esperamos que la pantalla esté realmente disponible.
        await expect(btnCambiarVista).toBeVisible({
            timeout: 10_000
        });

        // Aquí SÍ queremos dar hasta 3 segundos
        // para detectar si ya está activa.
        const estaActiva = await iconoActivo
            .waitFor({
                state: 'visible',
                timeout: 3_000
            })
            .then(() => true)
            .catch(() => false);

        if (estaActiva) {
            return;
        }

        await btnCambiarVista.click();

        await expect(opcionVista).toBeVisible({
            timeout: 10_000
        });

        await opcionVista.click();

        // Nada de waitForTimeout(500).
        // Esperamos el resultado real.
        await expect(iconoActivo).toBeVisible({
            timeout: 10_000
        });
    };

    fn.displayName = 'Asegurar Vista Facturación activa';

    return fn;
};
