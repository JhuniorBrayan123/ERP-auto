import { expect, type Page } from '@playwright/test';
import { ProveedoresTargets } from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';


export const AbrirNotaAdicionalProveedor = () => {
    const fn = async (page: Page): Promise<void> => {
        const tab = ProveedoresTargets.tabNotaAdicional(page);
        await expect(tab).toBeVisible({ timeout: 5_000 });
        await tab.click();
        await page.waitForTimeout(300);
    };
    fn.displayName = 'Abrir pestaña Nota adicional (proveedor)';
    return fn;
};


export const LlenarNotaAdicionalProveedor = (nota: string) => {
    const fn = async (page: Page): Promise<void> => {
        const textarea = ProveedoresTargets.inputNotaAdicional(page);
        await expect(textarea).toBeVisible({ timeout: 5_000 });
        await textarea.click();
        await textarea.fill(nota);
    };
    fn.displayName = `Llenar nota adicional → "${nota}"`;
    return fn;
};


export const GuardarNotaAdicionalProveedor = () => {
    const fn = async (page: Page): Promise<void> => {
        const btn = ProveedoresTargets.btnGuardarNota(page);
        await expect(btn).toBeEnabled({ timeout: 5_000 });
        await btn.click();
        await page.waitForTimeout(500);
    };
    fn.displayName = 'Guardar nota adicional (proveedor)';
    return fn;
};
