import {expect, type Page} from '@playwright/test';
import {NotaCreditoTargets} from '@screenplay/targets/notas-credito/NotaCreditoTargets';
import {type MotivoNotaCredito} from '@screenplay/interactions/notas/SeleccionarMotivoNotaCredito';

export interface DatosEditarItemNotaCredito {
    motivo: MotivoNotaCredito;
    nuevoDescuento?: string;
    cantidadBonificar?: string;
    precioBonificacion?: string;
    cantidadDevolver?: string;
    nuevaDescripcion?: string;
}

export const EditarItemNotaCredito = (datos: DatosEditarItemNotaCredito) => {
    return async (page: Page) => {
        const esCorreccionDescripcion =
            datos.motivo === 'Corrección por error en la descripción';

        const btnEditarFila = esCorreccionDescripcion
            ? NotaCreditoTargets.btnEditarItemCorreccionDescripcion(page)
            : NotaCreditoTargets.btnEditarItemComprobante(page);

        const btnAceptarFila = esCorreccionDescripcion
            ? NotaCreditoTargets.btnAceptarItemCorreccionDescripcion(page)
            : NotaCreditoTargets.btnAceptarItemComprobante(page);

        await expect(btnEditarFila).toBeVisible({timeout: 15_000});
        await btnEditarFila.click();

        if (datos.motivo === 'Descuento por ítem' && datos.nuevoDescuento) {
            const input = NotaCreditoTargets.inputDescuentoPorItem(page);
            await input.click();
            await input.fill(datos.nuevoDescuento);
            await expect(input).toHaveValue(datos.nuevoDescuento);
        }

        if (datos.motivo === 'Bonificación' && datos.cantidadBonificar) {
            const input = NotaCreditoTargets.inputCantidadBonificar(page);
            await input.click();
            await input.fill(datos.cantidadBonificar);
            await expect(input).toHaveValue(datos.cantidadBonificar);
        }

        if (datos.motivo === 'Devolución por ítem' && datos.cantidadDevolver) {
            const input = NotaCreditoTargets.inputPrecioDeItem(page);
            await input.click();
            await input.fill(datos.cantidadDevolver);
            await expect(input).toHaveValue(datos.cantidadDevolver);
        }

        if (datos.motivo === 'Corrección por error en la descripción' && datos.nuevaDescripcion) {
            const input = NotaCreditoTargets.inputNuevaDescripcion(page);
            await input.click();
            await input.fill(datos.nuevaDescripcion);
            await expect(input).toHaveValue(datos.nuevaDescripcion);
        }

        await expect(btnAceptarFila).toBeVisible({timeout: 15_000});
        await btnAceptarFila.click();
    };
};