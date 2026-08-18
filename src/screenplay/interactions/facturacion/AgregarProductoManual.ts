import {expect, type Page} from '@playwright/test';
import {ProductoManualTargets} from '@screenplay/targets/facturacion/ProductoManualTargets';

export interface DatosProductoManual {
    nombre: string;
    cantidad: number;
    precioBase: number;
    precioFinal: number;
    guardarEnLista?: boolean;
}

export const AgregarProductoManual = (datos: DatosProductoManual) => {
    const fn = async (page: Page): Promise<void> => {
        await ProductoManualTargets.btnProductoManual(page).click();
        await expect(ProductoManualTargets.textareaNombre(page)).toBeVisible({timeout: 10_000});

        await ProductoManualTargets.textareaNombre(page).fill(datos.nombre);
        await ProductoManualTargets.inputCantidad(page).fill(String(datos.cantidad));

        await ProductoManualTargets.inputPrecioBase(page).click();
        await ProductoManualTargets.inputPrecioBase(page).fill(String(datos.precioBase));

        await ProductoManualTargets.inputPrecioFinal(page).click();
        await ProductoManualTargets.inputPrecioFinal(page).fill(String(datos.precioFinal));

        if (datos.guardarEnLista) {
            const checkbox = ProductoManualTargets.checkboxGuardar(page);
            const isChecked = await checkbox.isChecked();
            if (!isChecked) {
                await checkbox.check({force: true});
            }
        }

        await ProductoManualTargets.btnAgregarProducto(page).click();
        await expect(ProductoManualTargets.textareaNombre(page)).toBeHidden({timeout: 10_000});
    };
    fn.displayName = `Agregar producto manual: ${datos.nombre}`;
    return fn;
};
