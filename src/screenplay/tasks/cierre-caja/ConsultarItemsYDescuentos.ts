import { expect, type Page } from '@playwright/test';
import { CierreCajaTargets } from '@screenplay/targets/cierre-caja/CierreCajaTargets';
import { ItemsVendidosTargets, DescuentosTargets } from '@screenplay/targets/cierre-caja/ItemsVendidosTargets';


export const ConsultarItemsVendidos = () => {
    const fn = async (page: Page): Promise<void> => {
        await CierreCajaTargets.tabItemsVendidos(page).click();
        await expect(
            ItemsVendidosTargets.inputBuscarItem(page)
        ).toBeVisible({ timeout: 10_000 });
    };
    fn.displayName = 'Consultar pestaña Items Vendidos';
    return fn;
};


export const BuscarItemVendido = (codigoODescripcion: string) => {
    const fn = async (page: Page): Promise<void> => {
        const input = ItemsVendidosTargets.inputBuscarItem(page);
        await input.click();
        await input.fill(codigoODescripcion);
        await input.press('Enter');

        
        await expect(page.getByText(codigoODescripcion, { exact: false }).nth(1)).toBeVisible({ timeout: 10_000 });
    };

    fn.displayName = `Buscar ítem vendido: "${codigoODescripcion}"`;
    return fn;
};


export const ConsultarDescuentos = () => {
    const fn = async (page: Page): Promise<void> => {
        await CierreCajaTargets.tabDescuentos(page).click();
        await expect(
            DescuentosTargets.btnFiltrosAvanzados(page)
        ).toBeVisible({ timeout: 10_000 });
    };
    fn.displayName = 'Consultar pestaña Descuentos';
    return fn;
};


export const BuscarDescuentoPorCorrelativo = (correlativo: string) => {
    const fn = async (page: Page): Promise<void> => {
        await DescuentosTargets.btnFiltrosAvanzados(page).click();

        const inputCorrelativo = DescuentosTargets.inputCorrelativo(page);
        await inputCorrelativo.click();
        await inputCorrelativo.fill(correlativo);
        await inputCorrelativo.press('Enter');
    };

    fn.displayName = `Buscar descuento por correlativo: ${correlativo}`;
    return fn;
};


export const DescargarCierreCajaExcel = () => {
    const fn = async (page: Page): Promise<string> => {
        await CierreCajaTargets.tabResumenCaja(page).click();
        await CierreCajaTargets.btnDescargar(page).click();

        const [download] = await Promise.all([
            page.waitForEvent('download', { timeout: 30_000 }),
            CierreCajaTargets.opcionDescargarExcel(page).click(),
        ]);

        const fileName = download.suggestedFilename();
        expect(fileName).toMatch(/\.xlsx?$/i);
        return fileName;
    };

    fn.displayName = 'Descargar Excel de Cierre de Caja';
    return fn;
};


export const DescargarCierreCajaPDF = () => {
    const fn = async (page: Page): Promise<string> => {
        await CierreCajaTargets.btnDescargar(page).click();

        const [download] = await Promise.all([
            page.waitForEvent('download', { timeout: 30_000 }),
            CierreCajaTargets.opcionDescargarPDF(page).click(),
        ]);

        const fileName = download.suggestedFilename();
        expect(fileName).toMatch(/\.pdf$/i);
        return fileName;
    };

    fn.displayName = 'Descargar PDF de Cierre de Caja';
    return fn;
};
