import {expect, type Page} from '@playwright/test';

export const CampoObligatorioVisible = (contenedor?: string) => {
    const fn = async (page: Page): Promise<void> => {
        const locator = contenedor
            ? page.locator(contenedor)
            : page.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]');

        await expect(locator).toContainText('Campo obligatorio', {timeout: 10_000});
    };

    fn.displayName = 'Verificar mensaje de campo obligatorio';
    return fn;
};

export const ComprobanteNoEncontrado = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(
            page.getByText(/no se encontró el comprobante con los datos ingresados/i)
        ).toBeVisible({timeout: 10_000});
    };

    fn.displayName = 'Verificar mensaje de comprobante no encontrado';
    return fn;
};

export const ErrorMontoVisible = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(
            page.getByText(/¡Ups! No hay cambios/i
            )
        ).toBeVisible({timeout: 10_000});
    };

    fn.displayName = 'Verificar error de monto en ND';
    return fn;
};

export const GrillaItemsVacia = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(
            page.getByRole('cell').filter({hasText: /no hay ítems agregados/i})
        ).toBeVisible({timeout: 10_000});
    };

    fn.displayName = 'Verificar grilla de ítems vacía';
    return fn;
};

export const ComprobanteVinculadoObligatorio = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(
            page.getByText(/por favor, selecciona un comprobante para continuar/i)
        ).toBeVisible({timeout: 10_000});
    };

    fn.displayName = 'Verificar mensaje de comprobante vinculado obligatorio';
    return fn;
};
export const ErrorDescuentoSinItem = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(
            page.getByText(/¡Ups! No hay cambios/i)
        ).toBeVisible({timeout: 10_000});
        await expect(
            page.getByText(/no se puede realizar la nota de crédito sin antes aplicar al menos un descuento/i)
        ).toBeVisible({timeout: 10_000});
    };

    fn.displayName = 'Verificar error de descuento sin ítem seleccionado';
    return fn;
};

export const ErrorMontoMayorAlDisponible = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(
            page.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]')
        ).toContainText(/El monto debe ser menor a/, {timeout: 10_000});
    };

    fn.displayName = 'Verificar error de monto mayor al disponible';
    return fn;
};

